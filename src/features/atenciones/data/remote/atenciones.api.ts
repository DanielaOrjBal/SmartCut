import { apiClient } from '../../../../core/api/client';
import type { AtencionRegistrada, NuevaAtencion } from '../../domain/atencion';

/**
 * POST /api/atenciones
 *
 * Siempre a nombre de quien envía la petición: no se manda `barberoId`, el
 * backend lo toma del JWT. Es la única fuente de datos reales mientras no
 * exista la web pública de reservas.
 */
export function registrarAtencion(
  atencion: NuevaAtencion,
): Promise<{ atencion: AtencionRegistrada }> {
  return apiClient.post('/atenciones', atencion);
}
