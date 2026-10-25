import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as finanzasApi from '../../data/remote/finanzas.api';
import type { MetricasBarbero, ParametrosPeriodo } from '../../domain/finanzas';

/** Métricas del barbero en sesión: resumen, desglose por medio de pago y por servicio. */
export function useMisMetricas(parametros: ParametrosPeriodo): EstadoApi<MetricasBarbero> {
  return useApi(
    () => finanzasApi.obtenerMisMetricas(parametros),
    [parametros.periodo, parametros.desde, parametros.hasta],
  );
}
