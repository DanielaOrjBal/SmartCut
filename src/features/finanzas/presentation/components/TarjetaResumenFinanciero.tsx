import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formatearCOP, formatearPorcentaje } from '../../../../core/utils/moneda';
import type { ResumenFinanciero } from '../../domain/finanzas';

type Props = {
  resumen: ResumenFinanciero;
};

/**
 * Ingresos, gastos, compras, comisiones y utilidad del período, con la
 * variación frente al período anterior. La variación se oculta por completo
 * cuando el backend la devuelve en `null` — utilidad anterior en cero o
 * negativa no da un porcentaje que signifique algo.
 */
export function TarjetaResumenFinanciero({ resumen }: Props) {
  const { periodo, variacion } = resumen;

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.filaUtilidad}>
        <View>
          <Text style={estilos.etiquetaUtilidad}>Utilidad del período</Text>
          <Text style={estilos.valorUtilidad}>{formatearCOP(periodo.utilidad)}</Text>
        </View>
        {variacion !== null && (
          <View
            style={[
              estilos.insigniaVariacion,
              variacion.tendencia === 'alza'
                ? estilos.insigniaAlza
                : variacion.tendencia === 'baja'
                  ? estilos.insigniaBaja
                  : estilos.insigniaEstable,
            ]}
          >
            <Feather
              name={
                variacion.tendencia === 'alza'
                  ? 'trending-up'
                  : variacion.tendencia === 'baja'
                    ? 'trending-down'
                    : 'minus'
              }
              size={12}
              color={
                variacion.tendencia === 'alza'
                  ? '#16A34A'
                  : variacion.tendencia === 'baja'
                    ? colors.danger
                    : colors.textMuted
              }
            />
            <Text
              style={[
                estilos.textoVariacion,
                {
                  color:
                    variacion.tendencia === 'alza'
                      ? '#16A34A'
                      : variacion.tendencia === 'baja'
                        ? colors.danger
                        : colors.textMuted,
                },
              ]}
            >
              {formatearPorcentaje(variacion.utilidad)} vs. período anterior
            </Text>
          </View>
        )}
      </View>

      <View style={estilos.grilla}>
        <Cifra etiqueta="Ingresos" valor={periodo.ingresos} color={colors.accent} />
        <Cifra etiqueta="Gastos" valor={periodo.gastos} color={colors.danger} />
        <Cifra etiqueta="Compras" valor={periodo.compras} color={colors.danger} />
        <Cifra etiqueta="Comisiones pagadas" valor={periodo.comisiones} color={colors.primary} />
      </View>
    </View>
  );
}

function Cifra({ etiqueta, valor, color }: { etiqueta: string; valor: number; color: string }) {
  return (
    <View style={estilos.cifra}>
      <Text style={estilos.cifraEtiqueta}>{etiqueta}</Text>
      <Text style={[estilos.cifraValor, { color }]}>{formatearCOP(valor)}</Text>
    </View>
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
  filaUtilidad: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  etiquetaUtilidad: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  valorUtilidad: {
    fontSize: fontSizes.titleLarge,
    fontWeight: '700',
    color: colors.navy,
    marginTop: 2,
  },
  insigniaVariacion: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  insigniaAlza: { backgroundColor: '#DCFCE7' },
  insigniaBaja: { backgroundColor: '#FEE2E2' },
  insigniaEstable: { backgroundColor: colors.border },
  textoVariacion: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cifra: { width: '48%', marginBottom: spacing.sm },
  cifraEtiqueta: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
  cifraValor: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    marginTop: 2,
  },
});
