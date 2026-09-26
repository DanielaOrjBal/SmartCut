import { apiClient } from '../../../../core/api/client';
import { construirQuery } from '../../../../core/utils/query';
import type {
  Categoria,
  EgresosPorCategoriaResultado,
  GastoMensual,
  InformeMensual,
  Movimiento,
  MovimientosResultado,
  NuevoMovimiento,
  ParametrosPeriodo,
  RankingResultado,
  ResumenFinanciero,
  SerieFinanciera,
  TipoMovimiento,
} from '../../domain/finanzas';

function queryPeriodo(parametros: ParametrosPeriodo): string {
  return construirQuery({
    periodo: parametros.periodo,
    desde: parametros.desde,
    hasta: parametros.hasta,
  });
}

/** GET /api/finanzas/resumen — solo admin. */
export function obtenerResumen(parametros: ParametrosPeriodo): Promise<ResumenFinanciero> {
  return apiClient.get(`/finanzas/resumen${queryPeriodo(parametros)}`);
}

/**
 * GET /api/finanzas/serie
 *
 * `barberoId` es una sugerencia para el admin; a un barbero se le ignora en
 * el backend y siempre recibe su propia comisión.
 */
export function obtenerSerie(
  parametros: ParametrosPeriodo & { barberoId?: number },
): Promise<SerieFinanciera> {
  const query = construirQuery({
    periodo: parametros.periodo,
    desde: parametros.desde,
    hasta: parametros.hasta,
    barberoId: parametros.barberoId,
  });
  return apiClient.get(`/finanzas/serie${query}`);
}

/**
 * GET /api/finanzas/ranking
 *
 * Para un barbero, el backend ya recorta la respuesta a su propia fila con su
 * `posicion`: no hace falta filtrar nada en el cliente.
 */
export function obtenerRanking(parametros: ParametrosPeriodo): Promise<RankingResultado> {
  return apiClient.get(`/finanzas/ranking${queryPeriodo(parametros)}`);
}

/** GET /api/finanzas/gastos-anuales — solo admin. Sin parámetros: siempre últimos 12 meses. */
export function obtenerGastosAnuales(): Promise<{ meses: GastoMensual[] }> {
  return apiClient.get('/finanzas/gastos-anuales');
}

/** GET /api/finanzas/egresos-categoria — solo admin. */
export function obtenerEgresosPorCategoria(
  parametros: ParametrosPeriodo,
): Promise<EgresosPorCategoriaResultado> {
  return apiClient.get(`/finanzas/egresos-categoria${queryPeriodo(parametros)}`);
}

/** GET /api/finanzas/movimientos — solo admin, filtrable por tipo. */
export function listarMovimientos(
  parametros: ParametrosPeriodo & { tipo?: TipoMovimiento },
): Promise<MovimientosResultado> {
  const query = construirQuery({
    periodo: parametros.periodo,
    desde: parametros.desde,
    hasta: parametros.hasta,
    tipo: parametros.tipo,
  });
  return apiClient.get(`/finanzas/movimientos${query}`);
}

/** GET /api/finanzas/mis-movimientos — del barbero en sesión, siempre tipo ingreso. */
export function listarMisMovimientos(parametros: ParametrosPeriodo): Promise<MovimientosResultado> {
  return apiClient.get(`/finanzas/mis-movimientos${queryPeriodo(parametros)}`);
}

/** POST /api/finanzas/movimientos — solo admin. */
export function registrarMovimiento(
  movimiento: NuevoMovimiento,
): Promise<{ movimiento: { idMovimiento: number } }> {
  return apiClient.post('/finanzas/movimientos', movimiento);
}

export type AnularMovimientoRequest = {
  idMovimiento: number;
  /** La fecha del movimiento (no la de hoy): confirma que es de esta barbería. */
  fecha: string;
  motivo: string;
};

/** PATCH /api/finanzas/movimientos/:id/anular — solo admin, motivo obligatorio. */
export function anularMovimiento({
  idMovimiento,
  fecha,
  motivo,
}: AnularMovimientoRequest): Promise<{ movimiento: Movimiento; mensaje: string }> {
  return apiClient.patch(`/finanzas/movimientos/${idMovimiento}/anular`, { fecha, motivo });
}

/** GET /api/finanzas/categorias — solo admin. */
export function listarCategorias(tipo?: TipoMovimiento): Promise<{ categorias: Categoria[] }> {
  const query = construirQuery({ tipo });
  return apiClient.get(`/finanzas/categorias${query}`);
}

/** POST /api/finanzas/categorias — solo admin. Las siete por defecto no se pueden eliminar. */
export function crearCategoria(datos: {
  nombre: string;
  tipo: TipoMovimiento;
}): Promise<{ categoria: Categoria }> {
  return apiClient.post('/finanzas/categorias', datos);
}

/** GET /api/finanzas/informe?anio&mes — solo admin. Datos para el PDF con expo-print. */
export function obtenerInformeMensual(anio: number, mes: number): Promise<{ informe: InformeMensual }> {
  return apiClient.get(`/finanzas/informe${construirQuery({ anio, mes })}`);
}
