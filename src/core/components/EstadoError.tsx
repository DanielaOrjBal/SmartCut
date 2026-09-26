import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';

type Props = {
  mensaje: string;
  onReintentar: () => void;
};

/**
 * Estado de error de cualquier pantalla con datos.
 *
 * El mensaje es el que ya viene redactado en español desde el backend (los
 * SIGNAL de los procedimientos, o el mensaje genérico del `apiClient` cuando
 * no hay red): se muestra tal cual, sin envolverlo en un texto genérico que
 * le reste información al usuario.
 */
export function EstadoError({ mensaje, onReintentar }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Feather name="alert-triangle" size={28} color={colors.danger} />
      <Text style={estilos.mensaje}>{mensaje}</Text>
      <TouchableOpacity style={estilos.boton} activeOpacity={0.8} onPress={onReintentar}>
        <Feather name="refresh-cw" size={14} color={colors.surface} />
        <Text style={estilos.botonTexto}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  mensaje: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
  },
  botonTexto: {
    color: colors.surface,
    fontSize: fontSizes.caption,
    fontWeight: '700',
    marginLeft: 6,
  },
});
