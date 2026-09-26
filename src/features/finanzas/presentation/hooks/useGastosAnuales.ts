import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as finanzasApi from '../../data/remote/finanzas.api';
import type { GastoMensual } from '../../domain/finanzas';

/** Gastos de los últimos 12 meses, uno por mes, con el rubro que más pesó. Solo admin. */
export function useGastosAnuales(): EstadoApi<GastoMensual[]> {
  return useApi(() => finanzasApi.obtenerGastosAnuales().then((respuesta) => respuesta.meses), []);
}
