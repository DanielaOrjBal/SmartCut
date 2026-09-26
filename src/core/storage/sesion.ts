import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Persistencia de la sesión.
 *
 * Reparto a propósito:
 *   - Token JWT y perfil → expo-secure-store (Keychain en iOS, Keystore en
 *     Android). El token es la credencial: no va en almacenamiento plano.
 *   - Marca de "onboarding completado" → AsyncStorage. No es secreta y solo
 *     sirve para decidir si la app abre en el onboarding o en el login.
 *
 * Nota de plataforma: expo-secure-store NO existe en web (docs de SDK 54).
 * Ahí se cae a AsyncStorage para que `npx expo start --web` no reviente; ese
 * respaldo NO es almacenamiento seguro, pero web no es el objetivo del proyecto.
 */

const CLAVE_TOKEN = 'smartcut.token';
const CLAVE_PERFIL = 'smartcut.perfil';
const CLAVE_ONBOARDING = 'smartcut.onboardingCompleto';

const HAY_ALMACEN_SEGURO = Platform.OS !== 'web';

async function guardarSeguro(clave: string, valor: string): Promise<void> {
  if (HAY_ALMACEN_SEGURO) {
    await SecureStore.setItemAsync(clave, valor);
    return;
  }
  await AsyncStorage.setItem(clave, valor);
}

async function leerSeguro(clave: string): Promise<string | null> {
  if (HAY_ALMACEN_SEGURO) {
    return SecureStore.getItemAsync(clave);
  }
  return AsyncStorage.getItem(clave);
}

async function borrarSeguro(clave: string): Promise<void> {
  if (HAY_ALMACEN_SEGURO) {
    await SecureStore.deleteItemAsync(clave);
    return;
  }
  await AsyncStorage.removeItem(clave);
}

export async function guardarSesion(token: string, perfil: unknown): Promise<void> {
  await guardarSeguro(CLAVE_TOKEN, token);
  await guardarSeguro(CLAVE_PERFIL, JSON.stringify(perfil));
}

export async function leerToken(): Promise<string | null> {
  return leerSeguro(CLAVE_TOKEN);
}

/** Devuelve el perfil guardado, o null si no hay o quedó corrupto. */
export async function leerPerfil<T>(): Promise<T | null> {
  const crudo = await leerSeguro(CLAVE_PERFIL);
  if (crudo === null) {
    return null;
  }
  try {
    return JSON.parse(crudo) as T;
  } catch {
    return null;
  }
}

export async function borrarSesion(): Promise<void> {
  await borrarSeguro(CLAVE_TOKEN);
  await borrarSeguro(CLAVE_PERFIL);
}

export async function marcarOnboardingCompleto(): Promise<void> {
  await AsyncStorage.setItem(CLAVE_ONBOARDING, 'true');
}

export async function onboardingEstaCompleto(): Promise<boolean> {
  return (await AsyncStorage.getItem(CLAVE_ONBOARDING)) === 'true';
}
