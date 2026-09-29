import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { colors, fontSizes, radii, shadows, spacing } from '../../../../core/theme/tokens';
import { formatearCOP } from '../../../../core/utils/moneda';
import { formatearUltimoAcceso } from '../../../../core/utils/fechas';
import { Esqueleto, EsqueletoLista } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { EstadoVacio } from '../../../../core/components/EstadoVacio';
import { BotonAbrirMenu } from '../../../../core/components/BotonAbrirMenu';
import { usePerfil } from '../hooks/usePerfil';
import { useResumenBarbero } from '../hooks/useResumenBarbero';
import { useAgenda } from '../../../agenda/presentation/hooks/useAgenda';
import { AccionRegistrarAtencion } from '../../../atenciones/presentation/components/AccionRegistrarAtencion';
import { TarjetaMetrica, estilosGrillaTarjetas } from './TarjetaMetrica';
import { FilaCita } from '../../../agenda/presentation/components/FilaCita';

type Props = {
  /**
   * Se omite cuando este componente se embebe dentro de otra pantalla que ya
   * tiene su propio botón de menú visible en todo momento — la capa "Mi
   * trabajo" del administrador, cuyo hamburguesa vive en `DashboardAdminScreen`
   * junto al conmutador. La pantalla de Inicio del barbero sí lo pasa: es la
   * única forma de llegar al resto de las secciones desde ahí.
   */
  onAbrirMenu?: () => void;
  onVerPublicaciones?: () => void;
};

/**
 * Inicio del barbero: encabezado, cuatro tarjetas y las citas de hoy.
 *
 * Se reutiliza TAL CUAL en dos lugares: la pantalla de Inicio del barbero, y
 * la capa "Mi trabajo" del administrador — en los dos casos las cifras y las
 * citas son las de quien tiene la sesión abierta, porque así lo decide el
 * backend a partir del JWT. Por eso este componente no recibe ningún id por
 * prop: los pide él mismo.
 */
export function InicioBarbero({ onAbrirMenu, onVerPublicaciones }: Props) {
  const perfil = usePerfil();
  const resumen = useResumenBarbero();

  // El `barberoId` explícito no cambia nada para un barbero (el backend lo
  // ignora y usa el suyo de todos modos), pero es indispensable cuando quien
  // mira es el administrador en "Mi trabajo": sin él, `/api/agenda` le
  // devolvería la agenda de TODA la barbería en vez de solo la suya. Se
  // espera a que el perfil cargue para no disparar esa petición con un id
  // todavía indefinido.
  const agendaHoy = useAgenda(
    { periodo: 'dia', barberoId: perfil.data?.idBarbero },
    { habilitado: perfil.data !== null },
  );

  const [refrescando, setRefrescando] = useState(false);

  async function refrescarTodo() {
    setRefrescando(true);
    try {
      await Promise.all([resumen.refetch(), perfil.refetch(), agendaHoy.refetch()]);
    } finally {
      setRefrescando(false);
    }
  }

  // Si el barbero finalizó o canceló una cita desde la Agenda y vuelve aquí,
  // estas tarjetas no se habrían enterado: el drawer no desmonta las
  // pantallas al navegar entre ellas. Recargar al recuperar el foco es lo que
  // de verdad cumple "refresca el dashboard después" para cualquier cambio
  // que haya ocurrido en otra pantalla, no solo el registro de atención.
  useFocusEffect(
    useCallback(() => {
      resumen.refetch();
      agendaHoy.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const nombreCompleto =
    perfil.data === null ? '' : `${perfil.data.nombre} ${perfil.data.apellido ?? ''}`.trim();
  const ultimoAcceso = formatearUltimoAcceso(perfil.data?.fechaUltimoAcceso ?? null);

  const cargandoEncabezado = perfil.loading && perfil.data === null;
  const cargandoTarjetas = resumen.loading && resumen.data === null;
  const cargandoCitas = agendaHoy.loading && agendaHoy.data === null;

  const citas = agendaHoy.data?.citas ?? [];
  const r = resumen.data;

  const sinNingunDato =
    r !== null &&
    r.citasHoy === 0 &&
    r.finalizadasHoy === 0 &&
    r.comisionMes === 0 &&
    r.serviciosMes === 0 &&
    agendaHoy.data !== null &&
    citas.length === 0;

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={estilos.contenedor}>
        <ScrollView
          contentContainerStyle={estilos.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={refrescarTodo}
              tintColor={colors.primary}
            />
          }
        >
          <View style={estilos.filaEncabezado}>
            {onAbrirMenu !== undefined && (
              <View style={estilos.hamburguesa}>
                <BotonAbrirMenu onPress={onAbrirMenu} />
              </View>
            )}
            <View style={estilos.encabezado}>
              {cargandoEncabezado ? (
                <>
                  <Esqueleto ancho="60%" alto={22} />
                  <Esqueleto ancho="40%" alto={14} estilo={estilos.espacioChico} />
                </>
              ) : perfil.error !== null ? (
                <Text style={estilos.saludo}>Hola</Text>
              ) : (
                <>
                  <Text style={estilos.saludo}>Hola, {nombreCompleto}</Text>
                  <Text style={estilos.subtitulo}>{perfil.data?.barberia.nombre ?? ''}</Text>
                  {ultimoAcceso !== null && (
                    <Text style={estilos.ultimoAcceso}>Último ingreso: {ultimoAcceso}</Text>
                  )}
                </>
              )}
            </View>
          </View>

          {perfil.error !== null && (
            <EstadoError mensaje={perfil.error} onReintentar={perfil.refetch} />
          )}

          {sinNingunDato ? (
            <EstadoVacio
              icono="bar-chart-2"
              mensaje="Vaya, aún no tienes suficientes datos para analizarlos. Toca el botón + para registrar tu primera atención."
            />
          ) : (
            <>
              {cargandoTarjetas ? (
                <View style={estilosGrillaTarjetas.grilla}>
                  <Esqueleto ancho="48%" alto={92} estilo={estilos.espacioTarjeta} />
                  <Esqueleto ancho="48%" alto={92} estilo={estilos.espacioTarjeta} />
                  <Esqueleto ancho="48%" alto={92} estilo={estilos.espacioTarjeta} />
                  <Esqueleto ancho="48%" alto={92} estilo={estilos.espacioTarjeta} />
                </View>
              ) : resumen.error !== null ? (
                <EstadoError mensaje={resumen.error} onReintentar={resumen.refetch} />
              ) : r !== null ? (
                <View style={estilosGrillaTarjetas.grilla}>
                  <TarjetaMetrica icono="calendar" etiqueta="Citas hoy" valor={String(r.citasHoy)} />
                  <TarjetaMetrica
                    icono="check-circle"
                    etiqueta="Finalizadas hoy"
                    valor={String(r.finalizadasHoy)}
                  />
                  <TarjetaMetrica
                    icono="dollar-sign"
                    etiqueta="Ingresos del mes"
                    valor={formatearCOP(r.comisionMes)}
                  />
                  <TarjetaMetrica
                    icono="scissors"
                    etiqueta="Servicios del mes"
                    valor={String(r.serviciosMes)}
                  />
                </View>
              ) : null}

              <Text style={estilos.tituloSeccion}>Citas de hoy</Text>

              {cargandoCitas ? (
                <EsqueletoLista filas={3} />
              ) : agendaHoy.error !== null ? (
                <EstadoError mensaje={agendaHoy.error} onReintentar={agendaHoy.refetch} />
              ) : citas.length === 0 ? (
                <EstadoVacio
                  icono="calendar"
                  mensaje="Vaya, para el día de hoy no tienes citas agendadas."
                />
              ) : (
                <View>
                  {citas.map((cita) => (
                    <FilaCita key={cita.idCita} cita={cita} />
                  ))}
                </View>
              )}

              {onVerPublicaciones !== undefined && (
                <Pressable
                  style={({ pressed }) => [
                    estilos.tarjetaPublicaciones,
                    pressed && estilos.tarjetaPublicacionesPresionada,
                  ]}
                  onPress={onVerPublicaciones}
                >
                  <View style={estilos.iconoContenedor}>
                    <Feather name="globe" size={24} color={colors.primary} />
                  </View>
                  <View style={estilos.textoContenedor}>
                    <Text style={estilos.tarjetaTitulo}>Ver publicaciones públicas</Text>
                    <Text style={estilos.tarjetaSubtitulo}>
                      Consulta información desde un servicio web
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={colors.placeholder}
                    style={estilos.chevron}
                  />
                </Pressable>
              )}
            </>
          )}
        </ScrollView>

        <AccionRegistrarAtencion
          onRegistrada={() => {
            resumen.refetch();
            agendaHoy.refetch();
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  contenedor: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  filaEncabezado: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  hamburguesa: { marginRight: spacing.sm, marginTop: 2 },
  encabezado: { flex: 1 },
  saludo: {
    fontSize: fontSizes.titleLarge,
    fontWeight: 'bold',
    color: colors.navy,
  },
  subtitulo: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ultimoAcceso: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  espacioChico: { marginTop: 8 },
  espacioTarjeta: { marginBottom: spacing.md, borderRadius: 12 },
  tituloSeccion: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  tarjetaPublicaciones: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadows.card,
  },
  tarjetaPublicacionesPresionada: {
    opacity: 0.88,
  },
  iconoContenedor: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: '#FBF4E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  textoContenedor: {
    flex: 1,
  },
  tarjetaTitulo: {
    fontSize: fontSizes.button,
    fontWeight: '700',
    color: colors.navy,
  },
  tarjetaSubtitulo: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  chevron: {
    marginLeft: spacing.md,
  },
});
