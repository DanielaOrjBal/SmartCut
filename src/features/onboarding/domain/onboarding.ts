/**
 * Modelos del onboarding.
 *
 * Los valores literales salen directamente del esquema (smartcut.sql):
 *   barberia.dias_atencion → SET('lunes',...,'domingo')
 *   servicio.categoria     → ENUM('corte','barba','combo','tratamiento','diseno','otro')
 *
 * Ojo: sin tildes ni eñes, porque así están declarados en la base de datos.
 */

export const DIAS_SEMANA = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];

export const CATEGORIAS_SERVICIO = [
  'corte',
  'barba',
  'combo',
  'tratamiento',
  'diseno',
  'otro',
] as const;

export type CategoriaServicio = (typeof CATEGORIAS_SERVICIO)[number];

/** Opciones de duración de turno que ofrece el paso de horario */
export const DURACIONES_TURNO = [15, 30, 45, 60] as const;

export type DatosBarberia = {
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
  latitud?: number;
  longitud?: number;
};

export type DatosAdmin = {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  contrasena: string;
};

export type DatosHorario = {
  dias: DiaSemana[];
  /** Formato 'HH:MM:SS', que es lo que espera el tipo TIME de MySQL */
  horaApertura: string;
  horaCierre: string;
  duracionTurno: number;
};

export type DatosBarbero = {
  nombre: string;
  apellido: string;
  /** Obligatorio: es el usuario con el que el barbero inicia sesión */
  correo: string;
  telefono: string;
};

export type DatosServicio = {
  categoria: CategoriaServicio;
  nombre: string;
  /** Opcional: si no se escribe, viaja como null y el SP la guarda en NULL */
  descripcion?: string;
  duracionMinutos: number;
  precio: number;
};

/** Todo lo que el onboarding acumula en memoria antes del único POST */
export type OnboardingState = {
  barberia: DatosBarberia;
  admin: DatosAdmin;
  horario: DatosHorario;
  barberos: DatosBarbero[];
  servicios: DatosServicio[];
};

/** Cuerpo exacto que recibe POST /api/onboarding */
export type OnboardingPayload = OnboardingState;

/**
 * Credencial provisional de un barbero recién creado.
 * El backend la devuelve UNA SOLA VEZ; después solo queda el hash.
 */
export type CredencialProvisional = {
  idBarbero: number;
  nombre: string;
  /** El backend también lo devuelve, para poder mostrar el nombre completo. */
  apellido?: string;
  correo: string;
  contrasenaProvisional: string;
};

export type OnboardingResponse = {
  idBarberia: number;
  admin: {
    idBarbero: number;
    correo: string;
  };
  barberos: CredencialProvisional[];
};
