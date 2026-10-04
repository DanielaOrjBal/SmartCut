import { useMutacion, type EstadoMutacion } from '../../../../core/hooks/useMutacion';
import * as cajaApi from '../../data/remote/caja.api';
import type { CajaDia, CerrarCajaRequest } from '../../domain/caja';

export function useCerrarCaja(): EstadoMutacion<CerrarCajaRequest, { caja: CajaDia }> {
  return useMutacion(cajaApi.cerrarCaja);
}
