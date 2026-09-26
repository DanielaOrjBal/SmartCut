import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formatearCOP, formatearCOPCorto } from '../../../../core/utils/moneda';
import { formatearFechaCorta, formatearFechaLarga, nombreDelMes } from '../../../../core/utils/fechas';
import { conAlfa, OPACIDAD_ATENUADA } from '../../../../core/utils/color';
import { Esqueleto } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { EstadoVacio } from '../../../../core/components/EstadoVacio';
import { useSerieFinanciera } from '../hooks/useSerieFinanciera';
import type { ParametrosPeriodo } from '../../domain/finanzas';

type Props = {
  parametros: ParametrosPeriodo;
};

const ANCHO_BARRA = 14;

/** '2026-09-07' o '2026-09' según la granularidad, a un rótulo legible en el panel. */
function etiquetaLarga(clave: string, granularidad: 'dia' | 'mes'): string {
  return granularidad === 'mes' ? nombreDelMes(clave) : formatearFechaLarga(clave);
}

/**
 * Ingresos contra egresos del período, en barras agrupadas e interactivas.
 *
 * Tocar cualquiera de las dos barras de un día (o mes) selecciona EL PAR
 * completo: se resaltan sus dos barras y el resto del gráfico se atenúa, y el
 * panel de abajo muestra ingresos, egresos y el neto de ese punto. Tocar fuera
 * de una barra deselecciona.
 *
 * Muestra la facturación completa del negocio (nunca la comisión de un
 * barbero en particular): es la gráfica de "Mi negocio", así que
 * `useSerieFinanciera` se llama sin `barberoId`.
 */
export function GraficaIngresosEgresos({ parametros }: Props) {
  const serie = useSerieFinanciera(parametros);
  const { width } = useWindowDimensions();
  const [seleccionado, setSeleccionado] = useState<number | null>(null);

  const puntos = serie.data?.puntos ?? [];
  const granularidad = serie.data?.granularidad ?? 'dia';

  // El período cambió (nuevo rango recibido): el índice seleccionado del
  // período anterior ya no significa nada, podría ni siquiera existir en la
  // nueva serie.
  useEffect(() => {
    setSeleccionado(null);
  }, [serie.data?.rango.desde, serie.data?.rango.hasta]);

  const datos = useMemo(() => {
    const formatearEtiqueta = granularidad === 'mes' ? nombreDelMes : formatearFechaCorta;

    return puntos.flatMap((punto, indice) => {
      const activo = seleccionado === null || seleccionado === indice;
      const colorIngreso = activo ? colors.accent : conAlfa(colors.accent, OPACIDAD_ATENUADA);
      const colorEgreso = activo ? colors.danger : conAlfa(colors.danger, OPACIDAD_ATENUADA);

      return [
        {
          value: punto.ingresos,
          label: formatearEtiqueta(punto.clave).slice(0, 6),
          frontColor: colorIngreso,
          spacing: 2,
          barWidth: ANCHO_BARRA,
          labelTextStyle: estilos.etiquetaEje,
          onPress: () => setSeleccionado((previo) => (previo === indice ? null : indice)),
        },
        {
          value: punto.egresos,
          frontColor: colorEgreso,
          spacing: 18,
          barWidth: ANCHO_BARRA,
          onPress: () => setSeleccionado((previo) => (previo === indice ? null : indice)),
        },
      ];
    });
  }, [puntos, granularidad, seleccionado]);

  const anchoGrafica = Math.max(width - spacing.screen * 2 - 40, datos.length * 22);
  const puntoSeleccionado = seleccionado !== null ? (puntos[seleccionado] ?? null) : null;

  return (
    <Pressable
      style={estilos.tarjeta}
      onPress={() => setSeleccionado(null)}
      accessibilityRole="none"
    >
      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>Ingresos vs. egresos</Text>
        <View style={estilos.leyenda}>
          <View style={estilos.leyendaItem}>
            <View style={[estilos.punto, { backgroundColor: colors.accent }]} />
            <Text style={estilos.leyendaTexto}>Ingresos</Text>
          </View>
          <View style={estilos.leyendaItem}>
            <View style={[estilos.punto, { backgroundColor: colors.danger }]} />
            <Text style={estilos.leyendaTexto}>Egresos</Text>
          </View>
        </View>
      </View>

      {serie.loading && serie.data === null ? (
        <Esqueleto alto={200} radio={radii.md} />
      ) : serie.error !== null ? (
        <EstadoError mensaje={serie.error} onReintentar={serie.refetch} />
      ) : puntos.every((punto) => punto.ingresos === 0 && punto.egresos === 0) ? (
        <EstadoVacio
          icono="bar-chart-2"
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

          {puntoSeleccionado !== null && (
            <View style={estilos.panel}>
              <Text style={estilos.panelTitulo}>
                {etiquetaLarga(puntoSeleccionado.clave, granularidad)}
              </Text>
              <View style={estilos.panelFila}>
                <Text style={[estilos.panelEtiqueta, { color: colors.accent }]}>Ingresos</Text>
                <Text style={estilos.panelValor}>{formatearCOP(puntoSeleccionado.ingresos)}</Text>
              </View>
              <View style={estilos.panelFila}>
                <Text style={[estilos.panelEtiqueta, { color: colors.danger }]}>Egresos</Text>
                <Text style={estilos.panelValor}>{formatearCOP(puntoSeleccionado.egresos)}</Text>
              </View>
              <View style={[estilos.panelFila, estilos.panelFilaNeto]}>
                <Text style={estilos.panelEtiquetaNeto}>Neto</Text>
                <Text style={estilos.panelValorNeto}>
                  {formatearCOP(puntoSeleccionado.ingresos - puntoSeleccionado.egresos)}
                </Text>
              </View>
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
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
  },
  leyenda: { flexDirection: 'row' },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  leyendaTexto: {
    fontSize: 11,
    color: colors.textMuted,
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
  panelTitulo: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
    textTransform: 'capitalize',
  },
  panelFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  panelFilaNeto: {
    marginTop: 4,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  panelEtiqueta: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
  },
  panelValor: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.text,
  },
  panelEtiquetaNeto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
  },
  panelValorNeto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
  },
});
