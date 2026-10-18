import { http } from '../http';
import type { SlotDisponible } from '../../types';

export function listarSlots(params: {
  idBarbero: number;
  fecha: string;
  duracion: number;
}): Promise<SlotDisponible[]> {
  const qs = new URLSearchParams({
    idBarbero: String(params.idBarbero),
    fecha: params.fecha,
    duracion: String(params.duracion),
  });
  return http.get<SlotDisponible[]>(`/public/disponibilidad?${qs}`);
}
