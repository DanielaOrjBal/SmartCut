import { useApi, type EstadoApi, type OpcionesApi } from '../../../../core/hooks/useApi';
import * as equipoApi from '../../data/remote/equipo.api';
import type { DetalleBarberoResultado, ParametrosEquipo } from '../../domain/equipo';

/**
 * Detalle de un barbero: sus datos, comisión y desempeño del período. Solo
 * admin. `opciones.habilitado` evita pedirlo con un id inválido mientras el
 * modal de detalle está cerrado.
 */
export function useDetalleBarbero(
  idBarbero: number,
  parametros: ParametrosEquipo,
  opciones?: OpcionesApi,
): EstadoApi<DetalleBarberoResultado> {
  return useApi(
    () => equipoApi.obtenerDetalleBarbero(idBarbero, parametros),
    [idBarbero, parametros.periodo, parametros.desde, parametros.hasta],
    opciones,
  );
}
