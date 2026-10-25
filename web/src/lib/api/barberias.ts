import { http } from '../http';
import type { Barberia, Barbero, Servicio } from '../../types';

export const barberias = {
  listar: () => http.get<Barberia[]>('/public/barberias'),
  obtener: (id: number) => http.get<Barberia>(`/public/barberias/${id}`),
  barberos: (id: number) => http.get<Barbero[]>(`/public/barberias/${id}/barberos`),
  servicios: (id: number) => http.get<Servicio[]>(`/public/barberias/${id}/servicios`),
};
