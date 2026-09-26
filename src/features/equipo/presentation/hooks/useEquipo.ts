import { useApi, type EstadoApi, type OpcionesApi } from '../../../../core/hooks/useApi';
import * as equipoApi from '../../data/remote/equipo.api';
import type { EquipoResultado, ParametrosEquipo } from '../../domain/equipo';

/**
 * Lista del equipo con su desempeño del período. Solo admin.
 *
 * `opciones.habilitado` sirve para pantallas que solo necesitan esta lista
 * cuando quien mira es administrador (p. ej. el filtro de barbero en la
 * Agenda): un barbero pidiéndola de todos modos recibiría un 403, así que ni
 * se dispara la petición.
 */
export function useEquipo(
  parametros: ParametrosEquipo,
  opciones?: OpcionesApi,
): EstadoApi<EquipoResultado> {
  return useApi(
    () => equipoApi.listarEquipo(parametros),
    [parametros.periodo, parametros.desde, parametros.hasta],
    opciones,
  );
}
