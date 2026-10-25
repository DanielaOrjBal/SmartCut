import { useMutacion, type EstadoMutacion } from '../../../../core/hooks/useMutacion';
import * as cajaApi from '../../data/remote/caja.api';
import type { AbrirCajaRequest, CajaDia } from '../../domain/caja';

export function useAbrirCaja(): EstadoMutacion<AbrirCajaRequest, { caja: CajaDia }> {
  return useMutacion(cajaApi.abrirCaja);
}
