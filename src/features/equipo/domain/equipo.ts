import type { EstadoBarbero } from '../../auth/domain/auth';
import type { ParametrosPeriodo } from '../../finanzas/domain/finanzas';
import type { RangoFechas } from '../../agenda/domain/agenda';

export type BarberoEquipo = {
  idBarbero: number;
  nombre: string;
  apellido: string | null;
  correo: string;
  telefono: string | null;
  esAdmin: boolean;
  estado: EstadoBarbero;
  fechaIngreso: string;
  fechaUltimoAcceso: string | null;
  /** true si todavía tiene la clave provisional: nunca activó su cuenta. */
  pendienteActivacion: boolean;
  porcentajeComision: number;
  citasAtendidas: number;
  facturacion: number;
  comision: number;
};

export type EquipoResultado = {
  rango: RangoFechas;
  barberos: BarberoEquipo[];
};

export type DetalleBarberoResultado = {
  rango: RangoFechas;
  barbero: BarberoEquipo;
};

export type ParametrosEquipo = ParametrosPeriodo;

export type NuevaAusencia = {
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;
  motivo?: string;
  /** true cancela automáticamente (por trigger) las citas futuras del barbero. */
  esIncapacidad: boolean;
};

export type AusenciaRegistrada = {
  idAusencia: number | null;
  esIncapacidad: boolean;
  citasCanceladas: boolean;
  estadoBarbero: EstadoBarbero;
};

export type CambioEstadoResultado = {
  idBarbero: number;
  estado: EstadoBarbero;
  citasCanceladas: boolean;
};

export type CambioComisionResultado = {
  idBarbero: number;
  porcentajeComision: number;
};

/** Alta de barbero: mismo flujo de credenciales provisionales del onboarding. */
export type NuevoBarbero = {
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
};

export type BarberoCreado = {
  idBarbero: number;
  nombre: string;
  apellido: string;
  correo: string;
  /** Se devuelve UNA sola vez: la pantalla debe mostrarla y advertir que no se repite. */
  contrasenaProvisional: string;
};
