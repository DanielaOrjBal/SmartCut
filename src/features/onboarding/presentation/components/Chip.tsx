import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';

type Props = {
  texto: string;
  activo: boolean;
  onPress: () => void;
  /** Chip cuadrado, para las iniciales de los días (L M X J V S D). */
  compacto?: boolean;
};

export function Chip({ texto, activo, onPress, compacto = false }: Props) {
  return (
    <TouchableOpacity
      style={[
        estilos.chip,
        compacto && estilos.chipCompacto,
        activo ? estilos.chipActivo : estilos.chipInactivo,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
    >
      <Text style={[estilos.texto, activo ? estilos.textoActivo : estilos.textoInactivo]}>
        {texto}
      </Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  chip: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipCompacto: {
    width: 42,
    height: 42,
    paddingHorizontal: 0,
    borderRadius: radii.md,
  },
  chipActivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipInactivo: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  texto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
  },
  textoActivo: {
    color: colors.surface,
  },
  textoInactivo: {
    color: colors.textSecondary,
  },
});
