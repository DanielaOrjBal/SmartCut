/** Estados posibles de barbero.estado en el esquema. */
export type EstadoBarbero = 'activo' | 'incapacitado' | 'inactivo';

/**
 * Perfil que devuelve el backend al iniciar sesión.
 * Nunca incluye el hash de la contraseña.
 */
export type Perfil = {
  idBarbero: number;
  idBarberia: number;
  nombre: string;
  apellido: string | null;
  correo: string;
  esAdmin: boolean;
  /** Si es true, la app obliga a cambiar la clave antes de dejar entrar. */
  debeCambiarContrasena: boolean;
  estado: EstadoBarbero;
  nombreBarberia: string;
  onboardingCompleto: boolean;
};

export type LoginRequest = {
  correo: string;
  contrasena: string;
};

export type LoginResponse = {
  token: string;
  perfil: Perfil;
};

export type CambiarContrasenaRequest = {
  contrasenaActual: string;
  contrasenaNueva: string;
};

export type CambiarContrasenaResponse = {
  mensaje: string;
  perfil: Perfil;
};
