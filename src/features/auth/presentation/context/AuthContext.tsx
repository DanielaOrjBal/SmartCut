import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from '../../../../core/api/client';
import {
  borrarSesion,
  guardarSesion,
  leerPerfil,
  leerToken,
  marcarOnboardingCompleto as marcarEnAlmacen,
  onboardingEstaCompleto,
} from '../../../../core/storage/sesion';
import * as authApi from '../../data/remote/auth.api';
import type { Perfil } from '../../domain/auth';

type AuthContextValor = {
  /** true mientras se restaura la sesión guardada; evita parpadeos de pantalla. */
  cargando: boolean;
  token: string | null;
  perfil: Perfil | null;
  onboardingCompleto: boolean;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  cambiarContrasena: (contrasenaActual: string, contrasenaNueva: string) => Promise<void>;
  /** La llama la última pantalla del onboarding para que la app pase al login. */
  completarOnboarding: () => Promise<void>;
  /**
   * La lee `decidirStack` para volver a mostrar el onboarding aunque
   * `onboardingCompleto` ya sea true — es lo que usa el botón "Registrar mi
   * barbería" del login.
   */
  forzarRegistro: boolean;
  /** La llama el login para que una barbería nueva pueda registrarse sin desinstalar la app. */
  iniciarRegistroNuevo: () => void;
  /** La llama el primer paso del onboarding para volver al login sin completar el registro. */
  cancelarRegistroNuevo: () => void;
};

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [onboardingCompleto, setOnboardingCompleto] = useState(false);
  // Nunca se persiste: si alguien cierra la app a mitad de un registro nuevo,
  // al reabrirla debe volver a ver el login de siempre, no quedar atrapado
  // de nuevo en el onboarding.
  const [forzarRegistro, setForzarRegistro] = useState(false);

  // Al arrancar se restaura lo que haya guardado. Es lo que decide qué stack
  // se muestra, así que hasta que termine no se renderiza ninguna navegación.
  useEffect(() => {
    let vigente = true;

    const restaurar = async () => {
      try {
        const [tokenGuardado, perfilGuardado, hechoOnboarding] = await Promise.all([
          leerToken(),
          leerPerfil<Perfil>(),
          onboardingEstaCompleto(),
        ]);

        if (!vigente) {
          return;
        }

        // Token sin perfil (o al revés) es una sesión inservible: se descarta.
        if (tokenGuardado !== null && perfilGuardado !== null) {
          setAuthToken(tokenGuardado);
          setToken(tokenGuardado);
          setPerfil(perfilGuardado);
        } else if (tokenGuardado !== null || perfilGuardado !== null) {
          await borrarSesion();
        }

        setOnboardingCompleto(hechoOnboarding);
      } finally {
        if (vigente) {
          setCargando(false);
        }
      }
    };

    void restaurar();
    return () => {
      vigente = false;
    };
  }, []);

  const iniciarSesion = useCallback(async (correo: string, contrasena: string) => {
    const respuesta = await authApi.login({ correo, contrasena });

    setAuthToken(respuesta.token);
    await guardarSesion(respuesta.token, respuesta.perfil);

    setToken(respuesta.token);
    setPerfil(respuesta.perfil);

    // Si alguien inicia sesión es porque su barbería ya existe: la marca evita
    // que la app vuelva a abrir en el onboarding tras reinstalar o cerrar sesión.
    if (!respuesta.perfil.onboardingCompleto) {
      return;
    }
    await marcarEnAlmacen();
    setOnboardingCompleto(true);
  }, []);

  const cerrarSesion = useCallback(async () => {
    setAuthToken(null);
    await borrarSesion();
    setToken(null);
    setPerfil(null);
  }, []);

  const cambiarContrasena = useCallback(
    async (contrasenaActual: string, contrasenaNueva: string) => {
      const respuesta = await authApi.cambiarContrasena({ contrasenaActual, contrasenaNueva });

      setPerfil(respuesta.perfil);
      if (token !== null) {
        // El token sigue siendo válido: sus claims no cambiaron.
        await guardarSesion(token, respuesta.perfil);
      }
    },
    [token],
  );

  const completarOnboarding = useCallback(async () => {
    await marcarEnAlmacen();
    setOnboardingCompleto(true);
    // Si esta era una barbería nueva registrada desde el login, ya terminó:
    // sin esto, decidirStack seguiría devolviendo 'onboarding' en un ciclo.
    setForzarRegistro(false);
  }, []);

  const iniciarRegistroNuevo = useCallback(() => {
    setForzarRegistro(true);
  }, []);

  const cancelarRegistroNuevo = useCallback(() => {
    setForzarRegistro(false);
  }, []);

  const valor = useMemo<AuthContextValor>(
    () => ({
      cargando,
      token,
      perfil,
      onboardingCompleto,
      iniciarSesion,
      cerrarSesion,
      cambiarContrasena,
      completarOnboarding,
      forzarRegistro,
      iniciarRegistroNuevo,
      cancelarRegistroNuevo,
    }),
    [
      cargando,
      token,
      perfil,
      onboardingCompleto,
      iniciarSesion,
      cerrarSesion,
      cambiarContrasena,
      completarOnboarding,
      forzarRegistro,
      iniciarRegistroNuevo,
      cancelarRegistroNuevo,
    ],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValor {
  const contexto = useContext(AuthContext);
  if (contexto === null) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return contexto;
}
