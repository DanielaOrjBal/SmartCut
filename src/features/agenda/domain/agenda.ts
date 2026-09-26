import type { Periodo } from '../../../core/utils/fechas';

/** Los seis estados de `cita.estado`. */
export const ESTADOS_CITA = [
  'pendiente',
  'confirmada',
  'en_proceso',
  'finalizada',
  'cancelada',
  'no_asistio',
] as const;

export type EstadoCita = (typeof ESTADOS_CITA)[number];

/** Una cita tal como la devuelve `sp_agenda_barberia`. */
export type Cita = {
  idCita: number;
  numeroTicket: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoCita;
  montoTotal: number;
  cliente: string;
  idBarbero: number;
  barbero: string;
  /** Nombres de servicios ya unidos con ', ' — así los devuelve el SP. */
  servicios: string;
};

export type RangoFechas = { desde: string; hasta: string };

export type AgendaParametros = {
  periodo?: Periodo;
  desde?: string;
  hasta?: string;
  /** Solo tiene efecto para el administrador; a un barbero se le ignora. */
  barberoId?: number;
};

export type AgendaResultado = {
  rango: RangoFechas;
  citas: Cita[];
};

/**
 * Las acciones válidas desde cada estado actual, en el orden en que se
 * ofrecen en el detalle de la cita.
 *
 * `pendiente` y `confirmada` pueden además marcarse `no_asistio`: el cliente
 * no llegó, se sepa o no que había confirmado.
 */
export const TRANSICIONES_CITA: Record<EstadoCita, EstadoCita[]> = {
  pendiente: ['confirmada', 'cancelada', 'no_asistio'],
  confirmada: ['en_proceso', 'cancelada', 'no_asistio'],
  en_proceso: ['finalizada', 'cancelada'],
  finalizada: [],
  cancelada: [],
  no_asistio: [],
};

export const ETIQUETA_ACCION_CITA: Record<EstadoCita, string> = {
  pendiente: 'Marcar pendiente',
  confirmada: 'Confirmar',
  en_proceso: 'Iniciar atención',
  finalizada: 'Finalizar',
  cancelada: 'Cancelar',
  no_asistio: 'Marcar que no asistió',
};
