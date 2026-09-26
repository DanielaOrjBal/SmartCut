import React, { useCallback, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { colors, fontSizes, spacing } from '../../../../core/theme/tokens';
import { EncabezadoPantalla } from '../../../../core/components/EncabezadoPantalla';
import { SelectorPeriodo } from '../../../../core/components/SelectorPeriodo';
import { EsqueletoLista } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { EstadoVacio } from '../../../../core/components/EstadoVacio';
import type { Periodo } from '../../../../core/utils/fechas';
import { GraficaComisionBarbero } from '../components/GraficaComisionBarbero';
import { TarjetaPosicionRanking } from '../components/TarjetaPosicionRanking';
import { ListaMovimientos } from '../components/ListaMovimientos';
import { useRanking } from '../hooks/useRanking';
import { useMisMovimientos } from '../hooks/useMovimientos';
import type { AppDrawerScreenProps } from '../../../../app/navigation/types';

/**
 * Finanzas del barbero: solo sus propios ingresos por servicios prestados.
 * Nunca ve la facturación del negocio ni las cifras de sus compañeros.
 */
export function FinanzasBarberoScreen({ navigation }: AppDrawerScreenProps<'Finanzas'>) {
  const [periodo, setPeriodo] = useState<Periodo>('mes');

  const ranking = useRanking({ periodo });
  const movimientos = useMisMovimientos({ periodo });

  useFocusEffect(
    useCallback(() => {
      ranking.refetch();
      movimientos.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodo]),
  );

  const lista = movimientos.data?.movimientos ?? [];

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <EncabezadoPantalla titulo="Finanzas" onAbrirMenu={() => navigation.openDrawer()}>
        <SelectorPeriodo valor={periodo} onCambiar={setPeriodo} />
      </EncabezadoPantalla>

      <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false}>
        <GraficaComisionBarbero parametros={{ periodo }} />

        {ranking.data !== null && <TarjetaPosicionRanking ranking={ranking.data} />}

        <Text style={estilos.tituloSeccion}>Tus atenciones</Text>
        {movimientos.loading && movimientos.data === null ? (
          <EsqueletoLista filas={4} />
        ) : movimientos.error !== null ? (
          <EstadoError mensaje={movimientos.error} onReintentar={movimientos.refetch} />
        ) : lista.length === 0 ? (
          <EstadoVacio
            icono="dollar-sign"
            mensaje="Vaya, aún no tienes suficientes datos para analizarlos. Registra una atención para verla aquí."
          />
        ) : (
          <ListaMovimientos movimientos={lista} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.screen, paddingBottom: 40 },
  tituloSeccion: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
