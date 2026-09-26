import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';

type Props = {
  icono?: ComponentProps<typeof Feather>['name'];
  mensaje: string;
  accion?: { texto: string; onPress: () => void };
};

/**
 * Estado vacío de cualquier pantalla con datos.
 *
 * Los mensajes de esta fase empiezan todos con "Vaya, ..." o describen
 * directamente la ausencia ("No hay citas registradas en este período."),
 * tal como los pide cada pantalla — este componente no inventa el texto, solo
 * le da la forma visual común.
 */
export function EstadoVacio({ icono = 'inbox', mensaje, accion }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Feather name={icono} size={32} color={colors.placeholder} />
      <Text style={estilos.mensaje}>{mensaje}</Text>
      {accion !== undefined && (
        <TouchableOpacity style={estilos.boton} activeOpacity={0.8} onPress={accion.onPress}>
          <Text style={estilos.botonTexto}>{accion.texto}</Text>
        </TouchableOpacity>
      )}
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
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
  },
  botonTexto: {
    color: colors.surface,
    fontSize: fontSizes.caption,
    fontWeight: '700',
  },
});
