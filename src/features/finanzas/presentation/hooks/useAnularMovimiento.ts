import { useMutacion, type EstadoMutacion } from '../../../../core/hooks/useMutacion';
import * as finanzasApi from '../../data/remote/finanzas.api';
import type { Movimiento } from '../../domain/finanzas';

/** Anulación de un movimiento. El motivo es obligatorio, nunca se borra ni se edita. */
export function useAnularMovimiento(): EstadoMutacion<
  finanzasApi.AnularMovimientoRequest,
  { movimiento: Movimiento; mensaje: string }
> {
  return useMutacion(finanzasApi.anularMovimiento);
}
