import { apiClient } from '../../../../core/api/client';
import type {
  AbrirCajaRequest,
  CajaDia,
  CerrarCajaRequest,
  EstadoCajaHoy,
  HistorialCajaResultado,
} from '../../domain/caja';

/** POST /api/caja/abrir */
export function abrirCaja(datos: AbrirCajaRequest): Promise<{ caja: CajaDia }> {
  return apiClient.post('/caja/abrir', datos);
}

/** POST /api/caja/cerrar */
export function cerrarCaja(datos: CerrarCajaRequest): Promise<{ caja: CajaDia }> {
  return apiClient.post('/caja/cerrar', datos);
}

/** GET /api/caja/hoy */
export function obtenerEstadoCajaHoy(): Promise<EstadoCajaHoy> {
  return apiClient.get('/caja/hoy');
}

/** GET /api/caja/historial */
export function obtenerHistorialCaja(periodo?: string): Promise<HistorialCajaResultado> {
  const query = periodo ? `?periodo=${periodo}` : '';
  return apiClient.get(`/caja/historial${query}`);
}
