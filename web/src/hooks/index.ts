import { useQuery, useMutation } from '@tanstack/react-query';
import { barberias } from '../lib/api/barberias';
import { listarSlots } from '../lib/api/disponibilidad';
import { buscarPorCorreo } from '../lib/api/clientes';
import { reservas } from '../lib/api/reservas';

export function useBarberias() {
  return useQuery({
    queryKey: ['barberias'],
    queryFn: barberias.listar,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBarberia(id: number | null) {
  return useQuery({
    queryKey: ['barberia', id],
    queryFn: () => barberias.obtener(id!),
    enabled: id !== null,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBarberos(idBarberia: number | null) {
  return useQuery({
    queryKey: ['barberos', idBarberia],
    queryFn: () => barberias.barberos(idBarberia!),
    enabled: idBarberia !== null,
    staleTime: 5 * 60 * 1000,
  });
}

export function useServicios(idBarberia: number | null) {
  return useQuery({
    queryKey: ['servicios', idBarberia],
    queryFn: () => barberias.servicios(idBarberia!),
    enabled: idBarberia !== null,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDisponibilidad(params: {
  idBarbero: number | null;
  fecha: string;
  duracion: number;
}) {
  return useQuery({
    queryKey: ['disponibilidad', params.idBarbero, params.fecha, params.duracion],
    queryFn: () =>
      listarSlots({
        idBarbero: params.idBarbero!,
        fecha: params.fecha,
        duracion: params.duracion,
      }),
    enabled: params.idBarbero !== null && params.fecha !== '' && params.duracion > 0,
    staleTime: 0, // disponibilidad siempre fresca
  });
}

export function useClientePorCorreo(correo: string) {
  return useQuery({
    queryKey: ['cliente', correo],
    queryFn: () => buscarPorCorreo(correo),
    enabled: correo.length > 5 && correo.includes('@'),
    staleTime: 30 * 1000,
  });
}

export function useReservaPorToken(
  token: string,
  operacion: 'cancelar' | 'reprogramar',
) {
  return useQuery({
    queryKey: ['reserva-token', token, operacion],
    queryFn: () => reservas.consultar(token, operacion),
    enabled: token.length === 64,
    retry: false,
  });
}

export function useCrearReserva() {
  return useMutation({ mutationFn: reservas.crear, retry: false });
}

export function useCancelarReserva() {
  return useMutation({ mutationFn: (token: string) => reservas.cancelar(token) });
}

export function useReprogramarReserva() {
  return useMutation({
    mutationFn: ({ token, fecha, horaInicio }: { token: string; fecha: string; horaInicio: string }) =>
      reservas.reprogramar(token, { fecha, horaInicio }),
  });
}
