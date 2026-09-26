import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { formStyles } from '../theme/formStyles';

type Props = {
  texto: string;
  onPress: () => void;
  /** El botón se deshabilita si el paso no es válido. */
  deshabilitado?: boolean;
  /** Muestra spinner y bloquea el botón, para evitar el doble envío. */
  cargando?: boolean;
};

export function BotonPrimario({ texto, onPress, deshabilitado = false, cargando = false }: Props) {
  const bloqueado = deshabilitado || cargando;

  return (
    <TouchableOpacity
      style={[formStyles.button, bloqueado && formStyles.buttonDeshabilitado]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={bloqueado}
      accessibilityRole="button"
      accessibilityState={{ disabled: bloqueado, busy: cargando }}
    >
      {cargando && <ActivityIndicator color={colors.surface} style={{ marginRight: spacing.sm }} />}
      <Text style={formStyles.buttonText}>{texto}</Text>
    </TouchableOpacity>
  );
}
