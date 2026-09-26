import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as finanzasApi from '../../data/remote/finanzas.api';
import type { EgresosPorCategoriaResultado, ParametrosPeriodo } from '../../domain/finanzas';

/** Desglose de gastos y compras por categoría en un período. Solo admin. */
export function useEgresosPorCategoria(
  parametros: ParametrosPeriodo,
): EstadoApi<EgresosPorCategoriaResultado> {
  return useApi(
    () => finanzasApi.obtenerEgresosPorCategoria(parametros),
    [parametros.periodo, parametros.desde, parametros.hasta],
  );
}
