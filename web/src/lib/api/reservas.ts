import { http } from '../http';
import type { Reserva } from '../../types';

export interface CrearReservaPayload {
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  idCliente?: number;
  idBarberia: number;
  idBarbero: number;
  fecha: string;
  horaInicio: string;
  serviciosIds: number[];
}

export const reservas = {
  crear: (payload: CrearReservaPayload) =>
    http.post<Reserva>('/public/reservas', payload),

  consultar: (token: string, operacion: 'cancelar' | 'reprogramar') =>
    http.get<Reserva>(`/public/reservas/${token}/${operacion}`),

  cancelar: (token: string) =>
    http.post<Reserva>(`/public/reservas/${token}/cancelar`, {}),

  reprogramar: (token: string, payload: { fecha: string; horaInicio: string }) =>
    http.post<Reserva>(`/public/reservas/${token}/reprogramar`, payload),
};
