import { Platform, StyleSheet } from 'react-native';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';

/** Estructura compartida por Login y CambiarContraseña. */
export const authStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  encabezado: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: spacing.xl,
  },
  titulo: {
    fontSize: fontSizes.titleLarge,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  formulario: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  /** Franja roja con el mensaje que devolvió el servidor. */
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  errorTexto: {
    flex: 1,
    fontSize: fontSizes.small,
    color: colors.danger,
    marginLeft: spacing.sm,
    lineHeight: 19,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  avisoTexto: {
    flex: 1,
    fontSize: fontSizes.caption,
    color: '#92400E',
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  enlace: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  enlaceTexto: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
