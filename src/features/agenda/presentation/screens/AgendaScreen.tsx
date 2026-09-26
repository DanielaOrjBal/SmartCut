import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { EncabezadoPantalla } from '../../../../core/components/EncabezadoPantalla';
import { SelectorPeriodo } from '../../../../core/components/SelectorPeriodo';
import { Esqueleto, EsqueletoLista } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { EstadoVacio } from '../../../../core/components/EstadoVacio';
import {
  aISO,
  desplazarReferencia,
  etiquetaDeRango,
  formatearFechaLarga,
  rangoDePeriodo,
  type Periodo,
} from '../../../../core/utils/fechas';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { useEquipo } from '../../../equipo/presentation/hooks/useEquipo';
import { useAgenda } from '../hooks/useAgenda';
import { FilaCita } from '../components/FilaCita';
import { LeyendaEstados } from '../components/LeyendaEstados';
import { FiltroBarbero } from '../components/FiltroBarbero';
import { DetalleCita } from '../components/DetalleCita';
import type { Cita } from '../../domain/agenda';
import type { AppDrawerScreenProps } from '../../../../app/navigation/types';

/** Agrupa las citas por día, en el mismo orden en que llegan (ya vienen por fecha y hora). */
function agruparPorDia(citas: Cita[]): Array<{ fecha: string; citas: Cita[] }> {
  const grupos: Array<{ fecha: string; citas: Cita[] }> = [];
  for (const cita of citas) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo !== undefined && ultimo.fecha === cita.fecha) {
      ultimo.citas.push(cita);
    } else {
      grupos.push({ fecha: cita.fecha, citas: [cita] });
    }
  }
  return grupos;
}

/**
 * Agenda de citas.
 *
 * El barbero solo ve la suya (el backend se la fuerza, aunque manipule la
 * URL). El administrador ve la agenda global con un filtro extra de barbero,
 * y solo puede actuar sobre las citas que son literalmente suyas — el mismo
 * criterio que ya aplica el backend en `/api/citas/:id/estado`.
 */
export function AgendaScreen({ navigation }: AppDrawerScreenProps<'Agenda'>) {
  const { perfil } = useAuth();
  const esAdmin = perfil?.esAdmin ?? false;

  const [periodo, setPeriodo] = useState<Periodo>('dia');
  const [referencia, setReferencia] = useState(new Date());
  const [barberoIdFiltro, setBarberoIdFiltro] = useState<number | undefined>(undefined);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  const { desde, hasta } = rangoDePeriodo(periodo, referencia);

  const equipo = useEquipo({}, { habilitado: esAdmin });
  const agenda = useAgenda({ desde, hasta, barberoId: esAdmin ? barberoIdFiltro : undefined });

  useFocusEffect(
    useCallback(() => {
      agenda.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [desde, hasta, barberoIdFiltro]),
  );

  const citas = agenda.data?.citas ?? [];
  const grupos = useMemo(() => agruparPorDia(citas), [citas]);

  function navegar(pasos: 1 | -1) {
    setReferencia((previa) => desplazarReferencia(periodo, previa, pasos));
  }

  function cambiarPeriodo(nuevo: Periodo) {
    setPeriodo(nuevo);
    // Al cambiar de período se vuelve a "hoy" dentro del nuevo tamaño de
    // ventana: navegar desde una fecha que quedó en medio del rango anterior
    // podría llevar a un rango que ya no tiene nada que ver con el que se
    // estaba mirando.
    setReferencia(new Date());
  }

  const opcionesBarbero = (equipo.data?.barberos ?? []).map((b) => ({
    idBarbero: b.idBarbero,
    nombre: `${b.nombre} ${b.apellido ?? ''}`.trim(),
  }));

  const puedeActuarSobre = (cita: Cita) => cita.idBarbero === perfil?.idBarbero;

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <EncabezadoPantalla titulo="Agenda" onAbrirMenu={() => navigation.openDrawer()} />

      <View style={estilos.filtros}>
        <SelectorPeriodo valor={periodo} onCambiar={cambiarPeriodo} />

        <View style={estilos.navegacionFecha}>
          <TouchableOpacity
            onPress={() => navegar(-1)}
            style={estilos.flecha}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="chevron-left" size={20} color={colors.navy} />
          </TouchableOpacity>
          <Text style={estilos.rango}>{etiquetaDeRango(periodo, referencia)}</Text>
          <TouchableOpacity
            onPress={() => navegar(1)}
            style={estilos.flecha}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="chevron-right" size={20} color={colors.navy} />
          </TouchableOpacity>
        </View>

        {esAdmin && (
          <FiltroBarbero
            opciones={opcionesBarbero}
            valor={barberoIdFiltro}
            onCambiar={setBarberoIdFiltro}
          />
        )}

        <LeyendaEstados />
      </View>

      <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false}>
        {agenda.loading && agenda.data === null ? (
          <EsqueletoLista filas={4} />
        ) : agenda.error !== null ? (
          <EstadoError mensaje={agenda.error} onReintentar={agenda.refetch} />
        ) : citas.length === 0 ? (
          <EstadoVacio icono="calendar" mensaje="No hay citas registradas en este período." />
        ) : (
          grupos.map((grupo) => (
            <View key={grupo.fecha} style={estilos.grupo}>
              <Text style={estilos.tituloGrupo}>{formatearEncabezadoDia(grupo.fecha)}</Text>
              {grupo.citas.map((cita) => (
                <FilaCita
                  key={cita.idCita}
                  cita={cita}
                  mostrarBarbero={esAdmin}
                  onPress={() => setCitaSeleccionada(cita)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <DetalleCita
        cita={citaSeleccionada}
        puedeActuar={citaSeleccionada !== null && puedeActuarSobre(citaSeleccionada)}
        onClose={() => setCitaSeleccionada(null)}
        onCambiado={() => agenda.refetch()}
      />
    </SafeAreaView>
  );
}

/** 'lunes, 7 de septiembre' salvo que sea hoy, que se marca explícito. */
function formatearEncabezadoDia(iso: string): string {
  return iso === aISO(new Date()) ? `Hoy · ${formatearFechaLarga(iso)}` : formatearFechaLarga(iso);
}

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  filtros: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.sm,
  },
  navegacionFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  flecha: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rango: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
    marginHorizontal: spacing.md,
    textTransform: 'capitalize',
  },
  scroll: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 40,
  },
  grupo: { marginBottom: spacing.md },
  tituloGrupo: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'capitalize',
    marginBottom: spacing.sm,
  },
});
