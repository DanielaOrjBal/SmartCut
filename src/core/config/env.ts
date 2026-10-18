import { Platform } from 'react-native';

/**
 * URL del backend en producción (APK/AAB).
 *
 * Se lee desde la variable de entorno EXPO_PUBLIC_API_URL, que se define
 * en el archivo .env.local (desarrollo local) o en las variables de entorno
 * del perfil de EAS Build (producción), sin necesidad de recompilar la app
 * al cambiar de servidor.
 *
 * Mientras no esté definida, la app resuelve la URL automáticamente según
 * la plataforma — útil durante el desarrollo con Expo Go o el emulador.
 *
 * Para desarrollo en celular físico (Expo Go):
 *   Crea un archivo .env.local en la raíz con:
 *   EXPO_PUBLIC_API_URL=http://192.168.x.x:4000/api
 *   (usa la IP LAN de tu PC que muestra Metro al arrancar)
 */
const API_URL_ENV = process.env.EXPO_PUBLIC_API_URL ?? '';

/** Puerto local del servidor Express — solo se usa si API_URL_ENV está vacía */
export const API_PORT = 4000;

/**
 * Host local según plataforma (solo aplica cuando no hay EXPO_PUBLIC_API_URL):
 *  - Emulador Android: 10.0.2.2 apunta al localhost del PC anfitrión.
 *  - Simulador iOS y web: localhost funciona directo.
 */
function resolveUrlLocal(): string {
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${host}:${API_PORT}/api`;
}

export const BASE_URL =
  API_URL_ENV.trim().length > 0 ? API_URL_ENV.trim() : resolveUrlLocal();

/** Milisegundos antes de abortar una petición que no responde */
export const REQUEST_TIMEOUT_MS = 15000;
