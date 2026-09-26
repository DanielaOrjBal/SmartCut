import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

type Props = {
  onPress: () => void;
};

/**
 * Ícono de hamburguesa que abre el drawer lateral. Vive en la esquina
 * superior izquierda de cada pantalla, dentro del encabezado propio de cada
 * una — el drawer se monta con `headerShown: false` porque todas las
 * pantallas de la app ya construyen su propio encabezado a mano.
 */
export function BotonAbrirMenu({ onPress }: Props) {
  return (
    <TouchableOpacity
      style={estilos.boton}
      activeOpacity={0.7}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel="Abrir menú"
    >
      <Feather name="menu" size={22} color={colors.navy} />
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  boton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
