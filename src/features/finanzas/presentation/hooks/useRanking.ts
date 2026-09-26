import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as finanzasApi from '../../data/remote/finanzas.api';
import type { ParametrosPeriodo, RankingResultado } from '../../domain/finanzas';

/**
 * Comparación de barberos.
 *
 * El recorte a "solo mi fila" para el barbero ya lo hizo el backend: este
 * hook sirve igual para la pantalla del admin (tabla completa) y la del
 * barbero (una fila y su posición).
 */
export function useRanking(parametros: ParametrosPeriodo): EstadoApi<RankingResultado> {
  return useApi(
    () => finanzasApi.obtenerRanking(parametros),
    [parametros.periodo, parametros.desde, parametros.hasta],
  );
}
