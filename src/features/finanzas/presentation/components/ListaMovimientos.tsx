import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formatearCOP } from '../../../../core/utils/moneda';
import { formatearFechaCorta } from '../../../../core/utils/fechas';
import type { Movimiento, TipoMovimiento } from '../../domain/finanzas';

type Props = {
  movimientos: Movimiento[];
  /** El barbero solo consulta; solo el admin puede anular. */
  onAnular?: (movimiento: Movimiento) => void;
};

const ICONO_POR_TIPO: Record<TipoMovimiento, ComponentProps<typeof Feather>['name']> = {
  ingreso: 'arrow-down-circle',
  gasto: 'arrow-up-circle',
  compra: 'shopping-bag',
};

const COLOR_POR_TIPO: Record<TipoMovimiento, string> = {
  ingreso: '#16A34A',
  gasto: colors.danger,
  compra: colors.danger,
};

/** Lista de movimientos financieros. La usan tanto el admin como el barbero (sus propios ingresos). */
export function ListaMovimientos({ movimientos, onAnular }: Props) {
  return (
    <View>
      {movimientos.map((movimiento) => {
        const anulado = movimiento.estado === 'anulado';
        return (
          <View
            key={movimiento.idMovimiento}
            style={[estilos.fila, anulado && estilos.filaAnulada]}
          >
            <View
              style={[
                estilos.icono,
                { backgroundColor: anulado ? colors.border : `${COLOR_POR_TIPO[movimiento.tipo]}1A` },
              ]}
            >
              <Feather
                name={ICONO_POR_TIPO[movimiento.tipo]}
                size={18}
                color={anulado ? colors.placeholder : COLOR_POR_TIPO[movimiento.tipo]}
              />
            </View>

            <View style={estilos.info}>
              <Text style={[estilos.categoria, anulado && estilos.textoAnulado]} numberOfLines={1}>
                {movimiento.categoria}
              </Text>
              <Text style={estilos.detalle} numberOfLines={1}>
                {formatearFechaCorta(movimiento.fecha.slice(0, 10))}
                {movimiento.descripcion !== null && movimiento.descripcion.length > 0
                  ? ` · ${movimiento.descripcion}`
                  : ''}
              </Text>
              {anulado && <Text style={estilos.avisoAnulado}>Anulado</Text>}
            </View>

            <View style={estilos.montos}>
              <Text style={[estilos.monto, anulado && estilos.textoAnulado]}>
                {formatearCOP(movimiento.monto)}
              </Text>
              {movimiento.montoComision !== null && (
                <Text style={estilos.comision}>Comisión {formatearCOP(movimiento.montoComision)}</Text>
              )}
            </View>

            {onAnular !== undefined && !anulado && (
              <TouchableOpacity
                style={estilos.botonAnular}
                onPress={() => onAnular(movimiento)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Anular movimiento"
              >
                <Feather name="slash" size={16} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  filaAnulada: { opacity: 0.6 },
  icono: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: { flex: 1 },
  categoria: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.text,
  },
  detalle: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  avisoAnulado: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
    marginTop: 2,
  },
  textoAnulado: { textDecorationLine: 'line-through' },
  montos: { alignItems: 'flex-end', marginLeft: spacing.sm },
  monto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.text,
  },
  comision: {
    fontSize: 10,
    color: colors.accent,
    marginTop: 1,
  },
  botonAnular: {
    marginLeft: spacing.sm,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
