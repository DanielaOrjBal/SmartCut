import { apiClient } from '../../../../core/api/client';
import type { BarberiaInfo, NuevoHorario } from '../../domain/configuracion';

/** GET /api/barberia — solo admin. */
export function obtenerBarberia(): Promise<{ barberia: BarberiaInfo }> {
  return apiClient.get('/barberia');
}

/** PATCH /api/barberia/horario — solo admin. Mismo `sp_configurar_horario` del onboarding. */
export function actualizarHorario(horario: NuevoHorario): Promise<{ barberia: BarberiaInfo }> {
  return apiClient.patch('/barberia/horario', horario);
}
