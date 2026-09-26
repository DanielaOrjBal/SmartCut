import type { Perfil } from '../../features/auth/domain/auth';

export type StackActivo = 'cargando' | 'onboarding' | 'auth' | 'cambioObligatorio' | 'app';

export type EntradaDecision = {
  cargando: boolean;
  token: string | null;
  perfil: Perfil | null;
  onboardingCompleto: boolean;
  /**
   * true mientras alguien registra una barbería NUEVA desde el botón de
   * "Registrar mi barbería" del login, en un dispositivo donde ya se había
   * completado el onboarding antes (de otra barbería). Sin esto no habría
   * forma de volver a onboarding una vez `onboardingCompleto` queda en true:
   * esa marca es permanente por diseño.
   */
  forzarRegistro: boolean;
};

/**
 * Única fuente de verdad sobre qué stack se muestra.
 *
 * Se mantiene como función pura (sin hooks ni JSX) para poder probar las
 * seis ramas sin montar la app:
 *
 *   restaurando la sesión                              → 'cargando'
 *   sin token y sin marca de onboarding                → 'onboarding'
 *   sin token, onboarding hecho, sin forzar registro   → 'auth'
 *   sin token, onboarding hecho, forzando un registro  → 'onboarding'
 *   con token y debeCambiarContrasena === true         → 'cambioObligatorio'
 *   con token y sin obligación de cambio               → 'app'
 */
export function decidirStack({
  cargando,
  token,
  perfil,
  onboardingCompleto,
  forzarRegistro,
}: EntradaDecision): StackActivo {
  if (cargando) {
    return 'cargando';
  }

  // Token y perfil viajan juntos: uno sin el otro no es una sesión utilizable.
  const haySesion = token !== null && perfil !== null;

  if (haySesion) {
    return perfil.debeCambiarContrasena ? 'cambioObligatorio' : 'app';
  }

  return onboardingCompleto && !forzarRegistro ? 'auth' : 'onboarding';
}
