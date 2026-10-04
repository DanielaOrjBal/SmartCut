import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { colors, fontSizes, radii, shadows, spacing } from '../../../../core/theme/tokens';
import { EncabezadoPantalla } from '../../../../core/components/EncabezadoPantalla';
import { SelectorPeriodo } from '../../../../core/components/SelectorPeriodo';
import { EsqueletoLista } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { EstadoVacio } from '../../../../core/components/EstadoVacio';
import {
  ETIQUETAS_TRIMESTRE,
  PERIODOS_FINANZAS,
  desplazarReferencia,
  etiquetaDeRango,
  nombreMesPorNumero,
  rangoDePeriodo,
  type Periodo,
} from '../../../../core/utils/fechas';
import type { ParametrosPeriodo } from '../../domain/finanzas';
import { TarjetaResumenFinanciero } from '../components/TarjetaResumenFinanciero';
import { GraficaIngresosEgresos } from '../components/GraficaIngresosEgresos';
import { GraficaComparacionBarberos } from '../components/GraficaComparacionBarberos';
import { GraficaGastosAnuales } from '../components/GraficaGastosAnuales';
import { ListaMovimientos } from '../components/ListaMovimientos';
import { ModalRegistrarMovimiento } from '../components/ModalRegistrarMovimiento';
import { ModalAnularMovimiento } from '../components/ModalAnularMovimiento';
import { useResumenFinanciero } from '../hooks/useResumenFinanciero';
import { useMovimientos } from '../hooks/useMovimientos';
import { useInformeMensual } from '../hooks/useInformeMensual';
import { generarInformePDF } from '../../data/pdf/generarInformePDF';
import { ETIQUETA_TIPO_PLURAL, TIPOS_MOVIMIENTO, type Movimiento, type TipoMovimiento } from '../../domain/finanzas';
import { TarjetaCajaHoy } from '../../../caja/presentation/components/TarjetaCajaHoy';
import { ModalAbrirCaja } from '../../../caja/presentation/components/ModalAbrirCaja';
import { ModalCerrarCaja } from '../../../caja/presentation/components/ModalCerrarCaja';
import { useEstadoCaja } from '../../../caja/presentation/hooks/useEstadoCaja';
import { SelectorYMetricasBarbero } from '../components/SelectorYMetricasBarbero';
import type { AppDrawerScreenProps } from '../../../../app/navigation/types';

const HOY = new Date();

// Primer día del mes actual y del trimestre actual como referencias iniciales
const REF_MES_INICIAL = new Date(HOY.getFullYear(), HOY.getMonth(), 1);
const REF_TRIMESTRE_INICIAL = new Date(HOY.getFullYear(), Math.floor(HOY.getMonth() / 3) * 3, 1);

type PeriodoFinanzas = 'mes' | 'trimestre' | 'anio';

/**
 * Finanzas del administrador: resumen con variación, las tres gráficas de la
 * Tarea 6, movimientos filtrables con anulación, registro de movimientos
 * manuales y el informe mensual en PDF.
 */
export function FinanzasAdminScreen({ navigation }: AppDrawerScreenProps<'Finanzas'>) {
  const [periodo, setPeriodo] = useState<PeriodoFinanzas>('mes');
  const [refMes, setRefMes] = useState<Date>(REF_MES_INICIAL);
  const [refTrimestre, setRefTrimestre] = useState<Date>(REF_TRIMESTRE_INICIAL);
  const [filtroTipo, setFiltroTipo] = useState<TipoMovimiento | undefined>(undefined);
  const [modalRegistrarVisible, setModalRegistrarVisible] = useState(false);
  const [movimientoAAnular, setMovimientoAAnular] = useState<Movimiento | null>(null);
  const [modalAbrirCajaVisible, setModalAbrirCajaVisible] = useState(false);
  const [modalCerrarCajaVisible, setModalCerrarCajaVisible] = useState(false);

  const [anioInforme, setAnioInforme] = useState(HOY.getFullYear());
  const [mesInforme, setMesInforme] = useState(HOY.getMonth() + 1);
  const [errorInforme, setErrorInforme] = useState<string | null>(null);

  // Parámetros que se envían al backend según el período seleccionado.
  // Para mes y trimestre se usan desde/hasta explícitos para apuntar al período
  // navegado (no siempre el actual). Para año el servidor calcula el rango.
  const parametrosPeriodo: ParametrosPeriodo =
    periodo === 'mes'
      ? rangoDePeriodo('mes', refMes)
      : periodo === 'trimestre'
        ? rangoDePeriodo('trimestre', refTrimestre)
        : { periodo: 'anio' as Periodo };

  const resumen = useResumenFinanciero(parametrosPeriodo);
  const movimientos = useMovimientos({ ...parametrosPeriodo, tipo: filtroTipo });
  const informe = useInformeMensual();
  const estadoCaja = useEstadoCaja();

  useFocusEffect(
    useCallback(() => {
      resumen.refetch();
      movimientos.refetch();
      estadoCaja.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodo, refMes, refTrimestre, filtroTipo]),
  );

  function refrescarTodo() {
    resumen.refetch();
    movimientos.refetch();
    estadoCaja.refetch();
  }

  function moverMes(pasos: 1 | -1) {
    setRefMes((prev) => desplazarReferencia('mes', prev, pasos));
  }

  function moverTrimestre(pasos: 1 | -1) {
    setRefTrimestre((prev) => desplazarReferencia('trimestre', prev, pasos));
  }

  function cambiarPeriodo(nuevo: Periodo) {
    if (nuevo === 'mes' || nuevo === 'trimestre' || nuevo === 'anio') {
      setPeriodo(nuevo);
    }
  }

  async function descargarInforme() {
    setErrorInforme(null);
    try {
      const datos = await informe.ejecutar({ anio: anioInforme, mes: mesInforme });
      await generarInformePDF(datos);
    } catch (error) {
      setErrorInforme(
        error instanceof Error ? error.message : 'No se pudo generar el informe. Intenta de nuevo.',
      );
    }
  }

  function moverMesInforme(pasos: 1 | -1) {
    let mes = mesInforme + pasos;
    let anio = anioInforme;
    if (mes > 12) {
      mes = 1;
      anio += 1;
    } else if (mes < 1) {
      mes = 12;
      anio -= 1;
    }
    setMesInforme(mes);
    setAnioInforme(anio);
    setErrorInforme(null);
  }

  const lista = movimientos.data?.movimientos ?? [];

  const etiquetaMes = etiquetaDeRango('mes', refMes);
  const numTrimestre = Math.floor(refTrimestre.getMonth() / 3);
  const etiquetaTrimestre = `T${numTrimestre + 1}: ${ETIQUETAS_TRIMESTRE[numTrimestre]} ${refTrimestre.getFullYear()}`;

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <EncabezadoPantalla titulo="Finanzas" onAbrirMenu={() => navigation.openDrawer()}>
      </EncabezadoPantalla>

      <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false}>
        {/* Bloque 1: caja del día */}
        <Text style={estilos.tituloSeccion}>Caja del día</Text>
        {estadoCaja.loading && estadoCaja.data === null ? (
          <EsqueletoLista filas={1} />
        ) : estadoCaja.error !== null ? (
          <EstadoError mensaje={estadoCaja.error} onReintentar={estadoCaja.refetch} />
        ) : estadoCaja.data !== null ? (
          <TarjetaCajaHoy
            estado={estadoCaja.data}
            cargando={estadoCaja.loading}
            onAbrirCaja={() => setModalAbrirCajaVisible(true)}
            onCerrarCaja={() => setModalCerrarCajaVisible(true)}
          />
        ) : null}


        {/* Bloque 1b: resumen */}
        <SelectorPeriodo valor={periodo} onCambiar={cambiarPeriodo} opciones={PERIODOS_FINANZAS} centrado/>
        {periodo === 'mes' && (
          <View style={estilos.navegadorPeriodo}>
            <TouchableOpacity style={estilos.flechaNavegador} onPress={() => moverMes(-1)}>
              <Feather name="chevron-left" size={20} color={colors.navy} />
            </TouchableOpacity>
            <Text style={estilos.textoNavegador}>{etiquetaMes}</Text>
            <TouchableOpacity style={estilos.flechaNavegador} onPress={() => moverMes(1)}>
              <Feather name="chevron-right" size={20} color={colors.navy} />
            </TouchableOpacity>
          </View>
        )}
        {periodo === 'trimestre' && (
          <View style={estilos.navegadorPeriodo}>
            <TouchableOpacity style={estilos.flechaNavegador} onPress={() => moverTrimestre(-1)}>
              <Feather name="chevron-left" size={20} color={colors.navy} />
            </TouchableOpacity>
            <Text style={estilos.textoNavegador}>{etiquetaTrimestre}</Text>
            <TouchableOpacity style={estilos.flechaNavegador} onPress={() => moverTrimestre(1)}>
              <Feather name="chevron-right" size={20} color={colors.navy} />
            </TouchableOpacity>
          </View>
        )}
        {resumen.loading && resumen.data === null ? (
          <EsqueletoLista filas={2} />
        ) : resumen.error !== null ? (
          <EstadoError mensaje={resumen.error} onReintentar={resumen.refetch} />
        ) : resumen.data !== null ? (
          <TarjetaResumenFinanciero resumen={resumen.data} />
        ) : null}
        {/* Bloque 1c: métricas por barbero */}
        <Text style={estilos.tituloSeccion}>Métricas por barbero</Text>
        <SelectorYMetricasBarbero parametros={parametrosPeriodo} />

        {/* Bloque 2: gráficas */}
        <Text style={estilos.tituloSeccion}>Gráficas</Text>
        <GraficaIngresosEgresos parametros={parametrosPeriodo} />
        <GraficaComparacionBarberos parametros={parametrosPeriodo} />
        <GraficaGastosAnuales />

        {/* Informe mensual en PDF */}
        <View style={estilos.tarjetaInforme}>
          <Text style={estilos.tituloInforme}>Informe mensual</Text>
          <View style={estilos.selectorMes}>
            <TouchableOpacity style={estilos.flechaMes} onPress={() => moverMesInforme(-1)}>
              <Feather name="chevron-left" size={20} color={colors.navy} />
            </TouchableOpacity>
            <Text style={estilos.mesTexto}>
              {nombreMesPorNumero(mesInforme)} de {anioInforme}
            </Text>
            <TouchableOpacity style={estilos.flechaMes} onPress={() => moverMesInforme(1)}>
              <Feather name="chevron-right" size={20} color={colors.navy} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[estilos.botonInforme, informe.cargando && estilos.botonDeshabilitado]}
            onPress={() => {
              void descargarInforme();
            }}
            disabled={informe.cargando}
          >
            {informe.cargando ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Feather name="download" size={16} color={colors.surface} />
            )}
            <Text style={estilos.botonInformeTexto}>
              {informe.cargando ? 'Generando…' : 'Descargar informe en PDF'}
            </Text>
          </TouchableOpacity>
          {errorInforme !== null && <Text style={estilos.errorInforme}>{errorInforme}</Text>}
        </View>

        {/* Bloque 3: movimientos */}
        <View style={estilos.filaTituloMovimientos}>
          <Text style={estilos.tituloSeccion}>Movimientos</Text>
        </View>
        <View style={estilos.chipsFiltro}>
          <ChipFiltro
            texto="Todos"
            activo={filtroTipo === undefined}
            onPress={() => setFiltroTipo(undefined)}
          />
          {TIPOS_MOVIMIENTO.map((tipo) => (
            <ChipFiltro
              key={tipo}
              texto={ETIQUETA_TIPO_PLURAL[tipo]}
              activo={filtroTipo === tipo}
              onPress={() => setFiltroTipo(tipo)}
            />
          ))}
        </View>

        {movimientos.loading && movimientos.data === null ? (
          <EsqueletoLista filas={4} />
        ) : movimientos.error !== null ? (
          <EstadoError mensaje={movimientos.error} onReintentar={movimientos.refetch} />
        ) : lista.length === 0 ? (
          <EstadoVacio
            icono="list"
            mensaje="No hay movimientos registrados en este período."
          />
        ) : (
          <ListaMovimientos movimientos={lista} onAnular={setMovimientoAAnular} />
        )}
      </ScrollView>

      <TouchableOpacity
        style={estilos.fab}
        activeOpacity={0.85}
        onPress={() => setModalRegistrarVisible(true)}
        accessibilityLabel="Registrar movimiento"
      >
        <Feather name="plus" size={26} color={colors.surface} />
      </TouchableOpacity>

      <ModalRegistrarMovimiento
        visible={modalRegistrarVisible}
        onClose={() => setModalRegistrarVisible(false)}
        onRegistrado={refrescarTodo}
      />

      <ModalAnularMovimiento
        movimiento={movimientoAAnular}
        onClose={() => setMovimientoAAnular(null)}
        onAnulado={refrescarTodo}
      />

      <ModalAbrirCaja
        visible={modalAbrirCajaVisible}
        onClose={() => setModalAbrirCajaVisible(false)}
        onAbierta={() => {
          setModalAbrirCajaVisible(false);
          estadoCaja.refetch();
        }}
      />

      {estadoCaja.data !== null &&
        estadoCaja.data.caja !== null &&
        estadoCaja.data.caja.estado === 'abierta' &&
        estadoCaja.data.saldoEsperadoEfectivo !== null && (
          <ModalCerrarCaja
            visible={modalCerrarCajaVisible}
            caja={estadoCaja.data.caja}
            desglose={estadoCaja.data.desglose}
            saldoEsperadoEfectivo={estadoCaja.data.saldoEsperadoEfectivo}
            onClose={() => setModalCerrarCajaVisible(false)}
            onCerrada={() => {
              setModalCerrarCajaVisible(false);
              estadoCaja.refetch();
            }}
          />
        )}
    </SafeAreaView>
  );
}

function ChipFiltro({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[estilos.chip, activo && estilos.chipActivo]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>{texto}</Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.screen, paddingBottom: 100 },
  tituloSeccion: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  navegadorPeriodo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  flechaNavegador: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  textoNavegador: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
    marginHorizontal: spacing.md,
    textTransform: 'capitalize',
    minWidth: 160,
    textAlign: 'center',
  },
  tarjetaInforme: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  tituloInforme: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  selectorMes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  flechaMes: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  mesTexto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
    marginHorizontal: spacing.md,
    textTransform: 'capitalize',
  },
  botonInforme: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radii.lg,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonInformeTexto: {
    color: colors.surface,
    fontSize: fontSizes.small,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  errorInforme: {
    fontSize: fontSizes.caption,
    color: colors.danger,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  filaTituloMovimientos: { marginTop: spacing.sm },
  chipsFiltro: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActivo: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipTexto: { fontSize: fontSizes.caption, fontWeight: '700', color: colors.textSecondary },
  chipTextoActivo: { color: colors.surface },
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
