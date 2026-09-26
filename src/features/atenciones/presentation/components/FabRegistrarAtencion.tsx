import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, shadows, spacing } from '../../../../core/theme/tokens';

type Props = {
  onPress: () => void;
};

/**
 * Botón de acción flotante de la pantalla de Inicio.
 *
 * Visible para el barbero y para el administrador en su capa "Mi trabajo": en
 * los dos casos abre el mismo modal de registro de atención.
 */
export function FabRegistrarAtencion({ onPress }: Props) {
  return (
    <TouchableOpacity
      style={estilos.fab}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Registrar atención"
    >
      <Feather name="plus" size={26} color={colors.surface} />
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
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
