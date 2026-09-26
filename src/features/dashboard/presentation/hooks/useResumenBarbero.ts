import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as dashboardApi from '../../data/remote/dashboard.api';
import type { ResumenBarbero } from '../../domain/dashboard';

/**
 * Tarjetas de Inicio del barbero.
 *
 * La usa tanto la pantalla de Inicio del barbero como la capa "Mi trabajo"
 * del administrador: en los dos casos el resumen es el de quien tiene la
 * sesión abierta, porque así lo decide el backend a partir del JWT.
 */
export function useResumenBarbero(): EstadoApi<ResumenBarbero> {
  return useApi(() => dashboardApi.obtenerResumenBarbero().then((respuesta) => respuesta.resumen), []);
}
