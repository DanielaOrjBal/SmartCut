import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as finanzasApi from '../../data/remote/finanzas.api';
import type { ParametrosPeriodo, SerieFinanciera } from '../../domain/finanzas';

/**
 * Serie de ingresos contra egresos.
 *
 * `barberoId` solo tiene efecto para el administrador que filtra por un
 * barbero puntual; para un barbero en su propia pantalla de Finanzas se puede
 * omitir sin riesgo, porque el backend igual le fuerza el suyo.
 */
export function useSerieFinanciera(
  parametros: ParametrosPeriodo & { barberoId?: number },
): EstadoApi<SerieFinanciera> {
  return useApi(
    () => finanzasApi.obtenerSerie(parametros),
    [parametros.periodo, parametros.desde, parametros.hasta, parametros.barberoId],
  );
}
