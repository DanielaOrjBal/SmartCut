import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';

type Props = {
  /** Paso actual, empezando en 1. */
  step: number;
  total: number;
};

/**
 * Logo + contador + barra de progreso.
 *
 * Antes esto estaba copiado en WelcomeScreen y BarbershopRegisterScreen con
 * los flex quemados (0.16/0.84 y 0.33/0.67, que además no correspondían a
 * ningún paso real). Aquí el avance se calcula: flex = step / total.
 */
export function OnboardingHeader({ step, total }: Props) {
  const avance = Math.min(Math.max(step / total, 0), 1);

  return (
    <View>
      <View style={estilos.header}>
        <Image
          source={require('../../../../../assets/images/logo-smartcut.png')}
          style={estilos.headerLogo}
          resizeMode="contain"
        />
        <Text style={estilos.stepText}>
          {step} / {total}
        </Text>
      </View>

      <View style={estilos.progressBarContainer}>
        <View style={[estilos.progressBarActive, { flex: avance }]} />
        <View style={[estilos.progressBarInactive, { flex: 1 - avance }]} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  headerLogo: {
    width: 30,
    height: 40,
  },
  stepText: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
    fontWeight: '500',
    letterSpacing: 1,
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 3,
    width: '100%',
    marginBottom: spacing.xl,
  },
  progressBarActive: {
    backgroundColor: colors.accent,
    borderTopLeftRadius: radii.sm,
    borderBottomLeftRadius: radii.sm,
  },
  progressBarInactive: {
    backgroundColor: colors.borderStrong,
    borderTopRightRadius: radii.sm,
    borderBottomRightRadius: radii.sm,
  },
});
