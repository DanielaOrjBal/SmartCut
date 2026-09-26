import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formatearCOP, formatearCOPCorto } from '../../../../core/utils/moneda';
import { conAlfa, OPACIDAD_ATENUADA } from '../../../../core/utils/color';
import { Esqueleto } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { EstadoVacio } from '../../../../core/components/EstadoVacio';
import { useRanking } from '../hooks/useRanking';
import type { ParametrosPeriodo } from '../../domain/finanzas';

type Props = {
  parametros: ParametrosPeriodo;
};

/** Solo el primer nombre: en barras horizontales angostas, el apellido no cabe. */
function primerNombre(nombreCompleto: string): string {
  return nombreCompleto.trim().split(/\s+/)[0] ?? nombreCompleto;
}

/**
 * Comparación de barberos por facturación del período, en barras horizontales
 * e interactivas. Es una vista exclusiva del administrador: `useRanking` sin
 * recorte, la tabla completa.
 */
export function GraficaComparacionBarberos({ parametros }: Props) {
  const ranking = useRanking(parametros);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const barberos = ranking.data?.barberos ?? [];

  useEffect(() => {
    setSeleccionado(null);
  }, [ranking.data?.rango.desde, ranking.data?.rango.hasta]);

  const datos = useMemo(
    () =>
      barberos.map((fila, indice) => {
        const activo = seleccionado === null || seleccionado === indice;
        return {
          value: fila.facturacion,
          label: primerNombre(fila.barbero),
          frontColor: activo ? colors.primary : conAlfa(colors.primary, OPACIDAD_ATENUADA),
          labelTextStyle: estilos.etiquetaEje,
          onPress: () => setSeleccionado((previo) => (previo === indice ? null : indice)),
        };
      }),
    [barberos, seleccionado],
  );

  const altoGrafica = Math.max(barberos.length * 44, 60);
  const filaSeleccionada = seleccionado !== null ? (barberos[seleccionado] ?? null) : null;

  return (
    <Pressable
      style={estilos.tarjeta}
      onPress={() => setSeleccionado(null)}
      accessibilityRole="none"
    >
      <Text style={estilos.titulo}>Comparación de barberos</Text>

      {ranking.loading && ranking.data === null ? (
        <Esqueleto alto={160} radio={radii.md} />
      ) : ranking.error !== null ? (
        <EstadoError mensaje={ranking.error} onReintentar={ranking.refetch} />
      ) : barberos.length === 0 || barberos.every((fila) => fila.facturacion === 0) ? (
        <EstadoVacio
          icono="users"
          mensaje="Vaya, aún no tienes suficientes datos para analizarlos. Registra atenciones o movimientos para ver tus gráficas."
        />
      ) : (
        <>
          <BarChart
            data={datos}
            horizontal
            height={altoGrafica}
            barWidth={22}
            spacing={22}
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules
            hideYAxisText
            labelWidth={72}
            xAxisLabelTextStyle={estilos.etiquetaEje}
            formatYLabel={(valor: string) => formatearCOPCorto(Number(valor))}
            noOfSections={3}
            isAnimated
          />

          {filaSeleccionada !== null && (
            <View style={estilos.panel}>
              <Text style={estilos.panelTitulo}>{filaSeleccionada.barbero}</Text>
              <View style={estilos.panelFila}>
                <Text style={estilos.panelEtiqueta}>Facturación</Text>
                <Text style={estilos.panelValor}>
                  {formatearCOP(filaSeleccionada.facturacion)}
                </Text>
              </View>
              <View style={estilos.panelFila}>
                <Text style={estilos.panelEtiqueta}>Su comisión</Text>
                <Text style={[estilos.panelValor, { color: colors.accent }]}>
                  {formatearCOP(filaSeleccionada.comision)}
                </Text>
              </View>
              <View style={estilos.panelFila}>
                <Text style={estilos.panelEtiqueta}>Citas atendidas</Text>
                <Text style={estilos.panelValor}>{filaSeleccionada.citasAtendidas}</Text>
              </View>
              <View style={estilos.panelFila}>
                <Text style={estilos.panelEtiqueta}>% de comisión</Text>
                <Text style={estilos.panelValor}>{filaSeleccionada.porcentajeComision} %</Text>
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
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  panelTitulo: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  panelFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  panelEtiqueta: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
  panelValor: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.text,
  },
});
