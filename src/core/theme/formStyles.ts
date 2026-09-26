import { StyleSheet } from 'react-native';
import { colors, fontSizes, radii, shadows, spacing } from './tokens';

/**
 * Estilos de formulario compartidos por todas las features.
 *
 * Tomados tal cual del diseño que ya existía en BarbershopRegisterstyles.ts.
 * No se rediseña nada: solo se deja de duplicar.
 */
export const formStyles = StyleSheet.create({
  label: {
    fontSize: fontSizes.label,
    fontWeight: '700',
    color: colors.placeholder,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: fontSizes.body,
    color: colors.text,
    ...shadows.input,
  },
  inputConError: {
    borderColor: colors.danger,
  },
  mensajeError: {
    fontSize: fontSizes.caption,
    color: colors.danger,
    marginTop: 6,
  },
  button: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 18,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.button,
    marginBottom: spacing.lg,
  },
  buttonDeshabilitado: {
    backgroundColor: colors.placeholder,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.surface,
    fontSize: fontSizes.button,
    fontWeight: 'bold',
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
});
