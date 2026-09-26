import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';
import { fuerzaContrasena } from '../validacion/campos';

type Props = {
  contrasena: string;
};

const COLOR_POR_PUNTAJE: Record<1 | 2 | 3 | 4, string> = {
  1: colors.danger,
  2: '#F59E0B',
  3: colors.accent,
  4: '#059669',
};

/** Cuatro barritas que se van llenando según la fuerza de la contraseña. */
export function IndicadorFuerza({ contrasena }: Props) {
  const { puntaje, etiqueta } = fuerzaContrasena(contrasena);

  if (puntaje === 0) {
    return null;
  }

  const color = COLOR_POR_PUNTAJE[puntaje];

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.barras}>
        {[1, 2, 3, 4].map((nivel) => (
          <View
            key={nivel}
            style={[estilos.barra, { backgroundColor: nivel <= puntaje ? color : colors.borderStrong }]}
          />
        ))}
      </View>
      <Text style={[estilos.etiqueta, { color }]}>{etiqueta}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 18,
  },
  barras: {
    flexDirection: 'row',
    flex: 1,
    marginRight: spacing.md,
  },
  barra: {
    flex: 1,
    height: 4,
    borderRadius: radii.sm,
    marginRight: 4,
  },
  etiqueta: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    minWidth: 52,
    textAlign: 'right',
  },
});
