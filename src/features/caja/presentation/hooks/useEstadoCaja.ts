import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as cajaApi from '../../data/remote/caja.api';
import type { EstadoCajaHoy } from '../../domain/caja';

/** Estado de la caja de hoy con desglose de movimientos. Solo admin. */
export function useEstadoCaja(): EstadoApi<EstadoCajaHoy> {
  return useApi(() => cajaApi.obtenerEstadoCajaHoy(), []);
}
