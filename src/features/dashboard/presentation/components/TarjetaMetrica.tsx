import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { colors, fontSizes, radii, shadows, spacing } from '../../../../core/theme/tokens';

type Props = {
  icono: ComponentProps<typeof Feather>['name'];
  etiqueta: string;
  valor: string;
};

/** Una de las cuatro tarjetas de la rejilla 2×2 de Inicio. */
export function TarjetaMetrica({ icono, etiqueta, valor }: Props) {
  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.icono}>
        <Feather name={icono} size={18} color={colors.primary} />
      </View>
      <Text style={estilos.valor} numberOfLines={1} adjustsFontSizeToFit>
        {valor}
      </Text>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
    </View>
  );
}

export const estilosGrillaTarjetas = StyleSheet.create({
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

const estilos = StyleSheet.create({
  tarjeta: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  icono: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: '#FBF4E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  valor: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.navy,
  },
  etiqueta: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
