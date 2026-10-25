import { apiClient } from '../../../../core/api/client';
import type { BarberiaInfo, NuevoHorario, ActualizarPerfilPayload } from '../../domain/configuracion';
import type { PerfilUsuario } from '../../../dashboard/domain/dashboard';

/** GET /api/barberia — solo admin. */
export function obtenerBarberia(): Promise<{ barberia: BarberiaInfo }> {
  return apiClient.get('/barberia');
}

/** PATCH /api/barberia/horario — solo admin. Mismo `sp_configurar_horario` del onboarding. */
export function actualizarHorario(horario: NuevoHorario): Promise<{ barberia: BarberiaInfo }> {
  return apiClient.patch('/barberia/horario', horario);
}

/** PATCH /api/dashboard/perfil — nombre, apellido y teléfono del usuario en sesión. */
export function actualizarPerfil(datos: ActualizarPerfilPayload): Promise<{ perfil: PerfilUsuario }> {
  return apiClient.patch('/dashboard/perfil', datos);
}
