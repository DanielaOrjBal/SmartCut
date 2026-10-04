import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as finanzasApi from '../../data/remote/finanzas.api';
import type { MetricasBarbero, ParametrosPeriodo } from '../../domain/finanzas';

/** Métricas de un barbero específico. Solo el admin puede llamar este hook con un id ajeno. */
export function useMetricasBarbero(
  idBarbero: number | null,
  parametros: ParametrosPeriodo,
): EstadoApi<MetricasBarbero> {
  return useApi(
    () =>
      idBarbero !== null
        ? finanzasApi.obtenerMetricasBarbero(idBarbero, parametros)
        : Promise.resolve(null as unknown as MetricasBarbero),
    [idBarbero, parametros.periodo, parametros.desde, parametros.hasta],
  );
}
