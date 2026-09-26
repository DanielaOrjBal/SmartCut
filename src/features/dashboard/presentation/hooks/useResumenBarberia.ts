import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as dashboardApi from '../../data/remote/dashboard.api';
import type { ResumenBarberia } from '../../domain/dashboard';

/** Tarjetas de "Mi negocio" del administrador. */
export function useResumenBarberia(): EstadoApi<ResumenBarberia> {
  return useApi(
    () => dashboardApi.obtenerResumenBarberia().then((respuesta) => respuesta.resumen),
    [],
  );
}
