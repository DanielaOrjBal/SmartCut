/**
 * Tokens de diseño de SmartCut.
 *
 * Todos los valores están extraídos del código que ya existía
 * (WelcomeScreen, BarbershopRegisterScreen, FeatureCard, SplashScreen).
 * No es una paleta nueva: es la que ya se venía usando, centralizada.
 */

export const colors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  primary: '#C49A45', // dorado, botones principales
  navy: '#0A192F', // títulos
  accent: '#14B8A6', // barra de progreso
  textMuted: '#6B7280',
  border: '#F3F4F6',
  placeholder: '#9CA3AF',
  danger: '#DC2626',

  // Complementarios que también estaban en uso en las pantallas actuales
  text: '#1F2937', // texto de inputs y tarjetas
  textSecondary: '#4B5563', // texto del recuadro de mapa
  borderStrong: '#E5E7EB', // borde de inputs y pista de la barra de progreso
  info: '#0284C7', // rótulo "PASO n DE n"
  splashBackground: '#FFFDF9', // fondo del splash animado
  shadow: '#000000',
} as const;

/**
 * Los seis estados de `cita.estado` del esquema, cada uno con su color.
 *
 * Se usan en agenda, listas y detalles SIEMPRE a través de este mapa: el color
 * es parte del significado del estado, no una decisión de cada pantalla.
 *
 * `cancelada` y `no_asistio` son rojo y naranja a propósito. Los dos terminan
 * sin cobrar, pero de un vistazo hay que poder distinguir a quien avisó de
 * quien simplemente no llegó.
 *
 * `en_proceso` reutiliza el `accent` del tema; los otros cinco son los únicos
 * colores nuevos que entran a la paleta.
 */
export const estadoCitaColors = {
  pendiente: '#D97706', // amarillo/ámbar — agendada, sin confirmar
  confirmada: '#2563EB', // azul — confirmada
  en_proceso: colors.accent, // turquesa — atendiéndose ahora
  finalizada: '#16A34A', // verde — atendida y cobrada
  cancelada: colors.danger, // rojo — cancelada
  no_asistio: '#EA580C', // naranja — el cliente no llegó
} as const;

/**
 * Fondo suave de cada estado, para las píldoras y el borde de las tarjetas.
 * Son los mismos tonos al 12 % de opacidad, precalculados: React Native no
 * admite `color-mix` ni variables CSS.
 */
export const estadoCitaFondos = {
  pendiente: '#FEF3C7',
  confirmada: '#DBEAFE',
  en_proceso: '#CCFBF1',
  finalizada: '#DCFCE7',
  cancelada: '#FEE2E2',
  no_asistio: '#FFEDD5',
} as const;

/** Etiqueta legible de cada estado, para mostrarle al usuario. */
export const estadoCitaEtiquetas = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  en_proceso: 'En proceso',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
  no_asistio: 'No asistió',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  /** Margen lateral estándar de todas las pantallas */
  screen: 24,
} as const;

export const radii = {
  sm: 2, // extremos de la barra de progreso
  md: 8,
  lg: 12, // inputs, tarjetas y botones
} as const;

export const fontSizes = {
  label: 11, // rótulos de formulario en mayúsculas
  caption: 12,
  small: 14,
  body: 15,
  button: 16,
  title: 24,
  titleLarge: 26,
} as const;

export const fontWeights = {
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Sombra dorada de los botones principales */
export const shadows = {
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
} as const;
