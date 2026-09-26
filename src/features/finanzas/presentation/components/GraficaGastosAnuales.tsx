import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formatearCOP, formatearCOPCorto } from '../../../../core/utils/moneda';
import { nombreDelMes, nombreMesCorto } from '../../../../core/utils/fechas';
import { conAlfa, OPACIDAD_ATENUADA } from '../../../../core/utils/color';
import { Esqueleto } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { EstadoVacio } from '../../../../core/components/EstadoVacio';
import { useGastosAnuales } from '../hooks/useGastosAnuales';
import type { GastoMensual } from '../../domain/finanzas';

const ANCHO_BARRA = 18;

/** Índice del mes con mayor gasto, o null si los doce están en cero. */
function indiceDelMayorGasto(meses: GastoMensual[]): number | null {
  let mejorIndice: number | null = null;
  let mejorValor = 0;
  meses.forEach((mes, indice) => {
    if (mes.totalEgresos > mejorValor) {
      mejorValor = mes.totalEgresos;
      mejorIndice = indice;
    }
  });
  return mejorIndice;
}

/**
 * Gastos de los últimos 12 meses. Solo para el administrador.
 *
 * Dos comportamientos que la pide el docente y no son negociables:
 *  1. El mes con mayor gasto se resalta SOLO, sin que el usuario toque nada.
 *  2. El detalle no se queda en el total del mes: señala el rubro concreto
 *     que más pesó, con `categoria_mayor` y `monto_categoria_mayor`.
 */
export function GraficaGastosAnuales() {
  const gastos = useGastosAnuales();
  const { width } = useWindowDimensions();
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [autoSeleccionoYa, setAutoSeleccionoYa] = useState(false);

  const meses = gastos.data ?? [];
  const hayDatos = meses.some((mes) => mes.totalEgresos > 0);

  // Se resalta automáticamente el mes más costoso apenas llegan los datos, una
  // sola vez: si el usuario ya tocó otra barra, un refetch no debe quitarle
  // su selección para imponerle de nuevo la del mayor gasto.
  useEffect(() => {
    if (gastos.data === null || autoSeleccionoYa) {
      return;
    }
    setSeleccionado(indiceDelMayorGasto(gastos.data));
    setAutoSeleccionoYa(true);
  }, [gastos.data, autoSeleccionoYa]);

  const datos = useMemo(
    () =>
      meses.map((mes, indice) => {
        const activo = seleccionado === null || seleccionado === indice;
        return {
          value: mes.totalEgresos,
          label: nombreMesCorto(mes.periodo),
          frontColor: activo ? colors.danger : conAlfa(colors.danger, OPACIDAD_ATENUADA),
          barWidth: ANCHO_BARRA,
          labelTextStyle: estilos.etiquetaEje,
          onPress: () => setSeleccionado((previo) => (previo === indice ? null : indice)),
        };
      }),
    [meses, seleccionado],
  );

  const anchoGrafica = Math.max(width - spacing.screen * 2 - 40, datos.length * 28);
  const mesSeleccionado = seleccionado !== null ? (meses[seleccionado] ?? null) : null;

  return (
    <Pressable
      style={estilos.tarjeta}
      onPress={() => setSeleccionado(null)}
      accessibilityRole="none"
    >
      <Text style={estilos.titulo}>Gastos de los últimos 12 meses</Text>

      {gastos.loading && gastos.data === null ? (
        <Esqueleto alto={210} radio={radii.md} />
      ) : gastos.error !== null ? (
        <EstadoError mensaje={gastos.error} onReintentar={gastos.refetch} />
      ) : !hayDatos ? (
        <EstadoVacio
          icono="trending-down"
          mensaje="Vaya, aún no tienes suficientes datos para analizarlos. Registra atenciones o movimientos para ver tus gráficas."
        />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={datos}
              width={anchoGrafica}
              height={190}
              noOfSections={4}
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor={colors.border}
              hideRules
              yAxisTextStyle={estilos.etiquetaEje}
              formatYLabel={(valor: string) => formatearCOPCorto(Number(valor))}
              isAnimated
            />
          </ScrollView>

          {mesSeleccionado !== null && (
            <View style={estilos.panel}>
              {mesSeleccionado.totalEgresos === 0 || mesSeleccionado.categoriaMayor === null ? (
                <Text style={estilos.panelTexto}>
                  No hubo gastos ni compras registrados en {nombreDelMes(mesSeleccionado.periodo)}.
                </Text>
              ) : (
                <Text style={estilos.panelTexto}>
                  El gasto más alto de {nombreDelMes(mesSeleccionado.periodo)} fue{' '}
                  <Text style={estilos.panelResaltado}>{mesSeleccionado.categoriaMayor}</Text>,
                  con{' '}
                  <Text style={estilos.panelResaltado}>
                    {formatearCOP(mesSeleccionado.montoCategoriaMayor)}
                  </Text>{' '}
                  de {formatearCOP(mesSeleccionado.totalEgresos)} totales.
                </Text>
              )}
            </View>
          )}
        </>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
  },
  etiquetaEje: {
    fontSize: 10,
    color: colors.textMuted,
  },
  panel: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  panelTexto: {
    fontSize: fontSizes.small,
    color: colors.text,
    lineHeight: 20,
  },
  panelResaltado: {
    fontWeight: '700',
    color: colors.navy,
  },
});
