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

const ANCHO_BARRA = 20;

/**
 * La comisión del barbero en el período, en barras interactivas.
 *
 * `useSerieFinanciera` sin `barberoId`: el backend igual fuerza el suyo y le
 * devuelve la comisión (no la facturación) en el campo `ingresos`, que es
 * justo la cifra que le corresponde ver.
 */
export function GraficaComisionBarbero({ parametros }: Props) {
  const serie = useSerieFinanciera(parametros);
  const { width } = useWindowDimensions();
  const [seleccionado, setSeleccionado] = useState<number | null>(null);

  const puntos = serie.data?.puntos ?? [];
  const granularidad = serie.data?.granularidad ?? 'dia';

  useEffect(() => {
    setSeleccionado(null);
  }, [serie.data?.rango.desde, serie.data?.rango.hasta]);

  const totalAcumulado = puntos.reduce((suma, punto) => suma + punto.ingresos, 0);

  const datos = useMemo(() => {
    const formatearEtiqueta = granularidad === 'mes' ? nombreDelMes : formatearFechaCorta;
    return puntos.map((punto, indice) => {
      const activo = seleccionado === null || seleccionado === indice;
      return {
        value: punto.ingresos,
        label: formatearEtiqueta(punto.clave).slice(0, 6),
        frontColor: activo ? colors.accent : conAlfa(colors.accent, OPACIDAD_ATENUADA),
        barWidth: ANCHO_BARRA,
        labelTextStyle: estilos.etiquetaEje,
        onPress: () => setSeleccionado((previo) => (previo === indice ? null : indice)),
      };
    });
  }, [puntos, granularidad, seleccionado]);

  const anchoGrafica = Math.max(width - spacing.screen * 2 - 40, datos.length * 26);
  const puntoSeleccionado = seleccionado !== null ? (puntos[seleccionado] ?? null) : null;

  return (
    <Pressable style={estilos.tarjeta} onPress={() => setSeleccionado(null)} accessibilityRole="none">
      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>Tu comisión en el período</Text>
        <Text style={estilos.total}>{formatearCOP(totalAcumulado)}</Text>
      </View>

      {serie.loading && serie.data === null ? (
        <Esqueleto alto={190} radio={radii.md} />
      ) : serie.error !== null ? (
        <EstadoError mensaje={serie.error} onReintentar={serie.refetch} />
      ) : puntos.every((punto) => punto.ingresos === 0) ? (
        <EstadoVacio
          icono="bar-chart-2"
          mensaje="Vaya, aún no tienes suficientes datos para analizarlos. Registra una atención para ver tu comisión aquí."
        />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={datos}
              width={anchoGrafica}
              height={180}
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
              <Text style={estilos.panelFecha}>
                {granularidad === 'mes'
                  ? nombreDelMes(puntoSeleccionado.clave)
                  : formatearFechaLarga(puntoSeleccionado.clave)}
              </Text>
              <Text style={estilos.panelValor}>{formatearCOP(puntoSeleccionado.ingresos)}</Text>
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
  encabezado: { marginBottom: spacing.md },
  titulo: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
  },
  total: {
    fontSize: fontSizes.titleLarge,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 4,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelFecha: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
    textTransform: 'capitalize',
  },
  panelValor: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.accent,
  },
});
