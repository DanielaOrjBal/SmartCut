import { useMutacion, type EstadoMutacion } from '../../../../core/hooks/useMutacion';
import * as agendaApi from '../../data/remote/agenda.api';
import type { Cita } from '../../domain/agenda';

/**
 * Confirmar, iniciar, finalizar, cancelar o marcar que no asistió.
 *
 * No hace falta refrescar el dashboard desde aquí: la pantalla que llama a
 * `ejecutar` decide cuándo volver a pedir sus propios datos (el resumen y la
 * lista de citas), típicamente en el `.then()` de la llamada.
 */
export function useCambiarEstadoCita(): EstadoMutacion<
  agendaApi.CambiarEstadoCitaRequest,
  { cita: Cita }
> {
  return useMutacion(agendaApi.cambiarEstadoCita);
}
