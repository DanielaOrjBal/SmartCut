import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as dashboardApi from '../../data/remote/dashboard.api';
import type { Servicio } from '../../domain/dashboard';

/** Catálogo activo de servicios, para el modal de registro de atención. */
export function useServicios(): EstadoApi<Servicio[]> {
  return useApi(() => dashboardApi.listarServicios().then((respuesta) => respuesta.servicios), []);
}
