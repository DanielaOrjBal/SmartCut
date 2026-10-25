import { http } from '../http';
import type { ClienteEncontrado } from '../../types';

export function buscarPorCorreo(correo: string): Promise<ClienteEncontrado | null> {
  const qs = new URLSearchParams({ correo });
  return http.get<ClienteEncontrado | null>(`/public/clientes/buscar?${qs}`);
}
