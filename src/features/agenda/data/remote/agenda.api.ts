import { apiClient } from '../../../../core/api/client';
import { construirQuery } from '../../../../core/utils/query';
import type { AgendaParametros, AgendaResultado, Cita, EstadoCita } from '../../domain/agenda';

/**
 * GET /api/agenda
 *
 * `barberoId` es apenas una sugerencia: si quien pregunta no es admin, el
 * backend la ignora y fuerza la suya. No hace falta repetir esa regla aquí.
 */
export function listarAgenda(parametros: AgendaParametros): Promise<AgendaResultado> {
  const query = construirQuery({
    periodo: parametros.periodo,
    desde: parametros.desde,
    hasta: parametros.hasta,
    barberoId: parametros.barberoId,
  });
  return apiClient.get(`/agenda${query}`);
}

export type CambiarEstadoCitaRequest = {
  idCita: number;
  estado: EstadoCita;
  /** La fecha de la cita, no la de hoy: es lo que permite ubicarla en el backend. */
  fecha: string;
  motivo?: string;
};

/** PATCH /api/citas/:id/estado */
export function cambiarEstadoCita({
  idCita,
  estado,
  fecha,
  motivo,
}: CambiarEstadoCitaRequest): Promise<{ cita: Cita }> {
  return apiClient.patch(`/citas/${idCita}/estado`, { estado, fecha, motivo });
}
