import { apiClient } from '../../../../core/api/client';
import type { PerfilUsuario, ResumenBarbero, ResumenBarberia, Servicio } from '../../domain/dashboard';

/** GET /api/dashboard/barbero — siempre el resumen de quien pregunta. */
export function obtenerResumenBarbero(): Promise<{ resumen: ResumenBarbero }> {
  return apiClient.get('/dashboard/barbero');
}

/** GET /api/dashboard/barberia — solo admin. */
export function obtenerResumenBarberia(): Promise<{ resumen: ResumenBarberia }> {
  return apiClient.get('/dashboard/barberia');
}

/** GET /api/perfil */
export function obtenerPerfil(): Promise<{ perfil: PerfilUsuario }> {
  return apiClient.get('/perfil');
}

/** GET /api/servicios — catálogo activo, para el modal de registro de atención. */
export function listarServicios(): Promise<{ servicios: Servicio[] }> {
  return apiClient.get('/servicios');
}
