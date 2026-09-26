import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerScreenProps } from '@react-navigation/drawer';

/** Los 7 pasos del onboarding, en orden. */
export type OnboardingStackParamList = {
  Bienvenida: undefined;
  DatosBarberia: undefined;
  CuentaAdmin: undefined;
  Horario: undefined;
  Equipo: undefined;
  Servicios: undefined;
  Resumen: undefined;
};

/**
 * Login y cambio de contraseña. Nunca se montan a la vez: cuando el cambio es
 * obligatorio, CambiarContrasena es la ÚNICA pantalla del stack, así que no
 * hay a dónde volver ni forma de saltársela.
 */
export type AuthStackParamList = {
  Login: undefined;
  CambiarContrasena: undefined;
};

/**
 * El drawer lateral de la app ya logueada. Un mismo `Inicio` sirve para los
 * dos roles (cada uno renderiza su propia pantalla); `Equipo` solo se
 * registra para el administrador, así que un barbero ni siquiera tiene la
 * ruta disponible, no solo oculta en el menú.
 */
export type AppDrawerParamList = {
  Inicio: undefined;
  Agenda: undefined;
  Equipo: undefined;
  Finanzas: undefined;
  Configuracion: undefined;
};

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type AppDrawerScreenProps<T extends keyof AppDrawerParamList> = DrawerScreenProps<
  AppDrawerParamList,
  T
>;
