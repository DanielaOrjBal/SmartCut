import type { Feather } from '@expo/vector-icons';

/** Nombre válido de ícono de la familia Feather */
export type IconoFeather = keyof typeof Feather.glyphMap;

export type WelcomeFeature = {
  id: string;
  icon: IconoFeather;
  text: string;
};

/**
 * Forma de data/local/welcome-info.json.
 * El contador de pasos ya no vive aquí: lo calcula <OnboardingHeader />.
 */
export type WelcomeInfo = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: WelcomeFeature[];
  buttonText: string;
};
