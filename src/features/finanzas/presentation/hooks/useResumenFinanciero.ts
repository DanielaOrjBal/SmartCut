import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as finanzasApi from '../../data/remote/finanzas.api';
import type { ParametrosPeriodo, ResumenFinanciero } from '../../domain/finanzas';

/** Resumen del período con la comparación contra el anterior. Solo admin. */
export function useResumenFinanciero(parametros: ParametrosPeriodo): EstadoApi<ResumenFinanciero> {
  return useApi(
    () => finanzasApi.obtenerResumen(parametros),
    [parametros.periodo, parametros.desde, parametros.hasta],
  );
}
