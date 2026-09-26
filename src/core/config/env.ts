import { Platform } from 'react-native';

/**
 * ⚠️ ESTE ES EL ÚNICO LUGAR QUE DEBES EDITAR PARA PROBAR EN UN CELULAR REAL.
 *
 * Déjalo en cadena vacía para que la baseURL se resuelva automáticamente
 * según la plataforma (emulador Android / simulador iOS).
 *
 * Si vas a probar con Expo Go en un dispositivo físico, escribe aquí la IP
 * LAN de tu PC — la misma que Metro muestra al arrancar (exp://192.168.x.x)
 * y que obtienes con `ipconfig` en Windows (IPv4 del adaptador Wi-Fi).
 * El celular y el PC deben estar en la misma red.
 *
 *   export const LAN_IP = '192.168.1.10';
 */
export const LAN_IP = '';

/** Puerto en el que escucha el servidor Express (server/.env → PORT) */
export const API_PORT = 4000;

/**
 * Host del backend según dónde corra la app:
 *
 *  - Dispositivo físico (Expo Go): la IP LAN del PC. No hay otra forma,
 *    para el celular "localhost" es el propio celular.
 *  - Emulador Android: 10.0.2.2 es el alias que apunta al localhost de la
 *    máquina anfitriona. 127.0.0.1 dentro del emulador es el emulador mismo.
 *  - Simulador iOS y web: comparten red con el host, localhost funciona directo.
 */
function resolveHost(): string {
  if (LAN_IP.trim().length > 0) {
    return LAN_IP.trim();
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export const BASE_URL = `http://${resolveHost()}:${API_PORT}/api`;

/** Milisegundos antes de abortar una petición que no responde */
export const REQUEST_TIMEOUT_MS = 15000;
