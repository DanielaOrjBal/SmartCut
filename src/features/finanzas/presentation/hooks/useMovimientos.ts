import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as finanzasApi from '../../data/remote/finanzas.api';
import type { MovimientosResultado, ParametrosPeriodo, TipoMovimiento } from '../../domain/finanzas';

/** Lista de movimientos del negocio, filtrable por tipo. Solo admin. */
export function useMovimientos(
  parametros: ParametrosPeriodo & { tipo?: TipoMovimiento },
): EstadoApi<MovimientosResultado> {
  return useApi(
    () => finanzasApi.listarMovimientos(parametros),
    [parametros.periodo, parametros.desde, parametros.hasta, parametros.tipo],
  );
}

/**
 * La versión del barbero: sus propias atenciones con monto y comisión.
 * El backend ya la fuerza a `tipo: 'ingreso'` y a su propio id.
 */
export function useMisMovimientos(parametros: ParametrosPeriodo): EstadoApi<MovimientosResultado> {
  return useApi(
    () => finanzasApi.listarMisMovimientos(parametros),
    [parametros.periodo, parametros.desde, parametros.hasta],
  );
}
