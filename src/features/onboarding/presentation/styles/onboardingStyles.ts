import { StyleSheet } from 'react-native';
import { colors, fontSizes, spacing } from '../../../../core/theme/tokens';

/**
 * Estructura común de los 7 pasos: fondo, scroll, bloque de títulos y pie.
 * Los estilos de formulario (label, input, botón, tarjeta) viven en
 * core/theme/formStyles.ts porque también los usan Login y CambiarContraseña.
 */
export const onboardingStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    // SafeAreaView con edges=['top','bottom'] ya aplica los insets correctos
  },
  scrollContainer: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  titleContainer: {
    marginBottom: spacing.xl,
  },
  stepIndicator: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.info,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  skipButton: {
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    color: colors.textMuted,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
});
