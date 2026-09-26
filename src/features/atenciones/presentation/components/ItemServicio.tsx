import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formatearCOP } from '../../../../core/utils/moneda';
import type { Servicio } from '../../../dashboard/domain/dashboard';

type Props = {
  servicio: Servicio;
  seleccionado: boolean;
  onPress: () => void;
};

/** Minutos a texto corto: 45 → "45 min", 90 → "1 h 30 min". */
export function formatearDuracion(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

/** Una fila del catálogo en el modal de registro de atención. Toca para marcar/desmarcar. */
export function ItemServicio({ servicio, seleccionado, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[estilos.fila, seleccionado && estilos.filaSeleccionada]}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: seleccionado }}
    >
      <View style={[estilos.casilla, seleccionado && estilos.casillaMarcada]}>
        {seleccionado && <Feather name="check" size={14} color={colors.surface} />}
      </View>

      <View style={estilos.info}>
        <Text style={estilos.nombre}>{servicio.nombre}</Text>
        <Text style={estilos.detalle}>{formatearDuracion(servicio.duracionMinutos)}</Text>
      </View>

      <Text style={estilos.precio}>{formatearCOP(servicio.precio)}</Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  filaSeleccionada: {
    borderColor: colors.primary,
    backgroundColor: '#FBF4E7',
  },
  casilla: {
    width: 22,
    height: 22,
    borderRadius: radii.sm + 2,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  casillaMarcada: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  info: { flex: 1 },
  nombre: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
  },
  detalle: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  precio: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.text,
  },
});
