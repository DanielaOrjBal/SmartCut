import { useApi, type EstadoApi, type OpcionesApi } from '../../../../core/hooks/useApi';
import * as agendaApi from '../../data/remote/agenda.api';
import type { AgendaParametros, AgendaResultado } from '../../domain/agenda';

/**
 * Agenda de citas.
 *
 * Sirve tanto para el barbero (su propia agenda) como para el administrador
 * (la global, con o sin filtro de barbero): la diferencia la resuelve el
 * backend según el JWT y el `barberoId` que se le mande.
 */
export function useAgenda(
  parametros: AgendaParametros,
  opciones?: OpcionesApi,
): EstadoApi<AgendaResultado> {
  return useApi(
    () => agendaApi.listarAgenda(parametros),
    [parametros.periodo, parametros.desde, parametros.hasta, parametros.barberoId],
    opciones,
  );
}
