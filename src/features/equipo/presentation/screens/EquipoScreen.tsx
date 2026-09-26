import React, { useCallback, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { colors, shadows, spacing } from '../../../../core/theme/tokens';
import { EncabezadoPantalla } from '../../../../core/components/EncabezadoPantalla';
import { SelectorPeriodo } from '../../../../core/components/SelectorPeriodo';
import { EsqueletoLista } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { EstadoVacio } from '../../../../core/components/EstadoVacio';
import type { Periodo } from '../../../../core/utils/fechas';
import { useEquipo } from '../hooks/useEquipo';
import { FilaBarbero } from '../components/FilaBarbero';
import { ModalDetalleBarbero } from '../components/ModalDetalleBarbero';
import { ModalRegistrarAusencia } from '../components/ModalRegistrarAusencia';
import { ModalAgregarBarbero } from '../components/ModalAgregarBarbero';
import type { AppDrawerScreenProps } from '../../../../app/navigation/types';

/** Solo admin. Lista del equipo, con acceso al detalle, ausencias, estado y comisión. */
export function EquipoScreen({ navigation }: AppDrawerScreenProps<'Equipo'>) {
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [idDetalle, setIdDetalle] = useState<number | null>(null);
  const [ausencia, setAusencia] = useState<{ idBarbero: number; nombre: string } | null>(null);
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);

  const equipo = useEquipo({ periodo });

  useFocusEffect(
    useCallback(() => {
      equipo.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodo]),
  );

  const barberos = equipo.data?.barberos ?? [];

  function abrirAusenciaDesdeDetalle(idBarbero: number) {
    const barbero = barberos.find((b) => b.idBarbero === idBarbero);
    setIdDetalle(null);
    setAusencia({ idBarbero, nombre: barbero?.nombre ?? '' });
  }

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <EncabezadoPantalla titulo="Equipo" onAbrirMenu={() => navigation.openDrawer()}>
        <SelectorPeriodo valor={periodo} onCambiar={setPeriodo} />
      </EncabezadoPantalla>

      <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false}>
        {equipo.loading && equipo.data === null ? (
          <EsqueletoLista filas={4} />
        ) : equipo.error !== null ? (
          <EstadoError mensaje={equipo.error} onReintentar={equipo.refetch} />
        ) : barberos.length === 0 ? (
          <EstadoVacio
            icono="users"
            mensaje="Aún no has registrado barberos en tu equipo."
            accion={{ texto: 'Agregar barbero', onPress: () => setModalAgregarVisible(true) }}
          />
        ) : (
          <View>
            {barberos.map((barbero) => (
              <FilaBarbero
                key={barbero.idBarbero}
                barbero={barbero}
                onPress={() => setIdDetalle(barbero.idBarbero)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={estilos.fab}
        activeOpacity={0.85}
        onPress={() => setModalAgregarVisible(true)}
        accessibilityLabel="Agregar barbero"
      >
        <Feather name="user-plus" size={24} color={colors.surface} />
      </TouchableOpacity>

      <ModalDetalleBarbero
        idBarbero={idDetalle}
        parametros={{ periodo }}
        onClose={() => setIdDetalle(null)}
        onRegistrarAusencia={abrirAusenciaDesdeDetalle}
        onCambiado={() => equipo.refetch()}
      />

      <ModalRegistrarAusencia
        idBarbero={ausencia?.idBarbero ?? null}
        nombreBarbero={ausencia?.nombre ?? ''}
        onClose={() => setAusencia(null)}
        onRegistrada={() => equipo.refetch()}
      />

      <ModalAgregarBarbero
        visible={modalAgregarVisible}
        onClose={() => setModalAgregarVisible(false)}
        onCreado={() => equipo.refetch()}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.screen, paddingBottom: 100 },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
});
