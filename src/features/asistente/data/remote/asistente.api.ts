import { apiClient } from '../../../../core/api/client';

export function consultarAsistente(pregunta: string): Promise<{ respuesta: string }> {
  return apiClient.post('/asistente', { pregunta });
}
