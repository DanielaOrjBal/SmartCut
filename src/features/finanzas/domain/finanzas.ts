import type { Periodo } from '../../../core/utils/fechas';
import type { RangoFechas } from '../../agenda/domain/agenda';

export type ParametrosPeriodo = {
  periodo?: Periodo;
  desde?: string;
  hasta?: string;
};

/** Los tres tipos de `movimiento_financiero.tipo` y `categoria_movimiento.tipo`. */
export const TIPOS_MOVIMIENTO = ['ingreso', 'gasto', 'compra'] as const;
export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number];

// -------------------------------------------------------------- resumen ---

/**
 * Cifras de un período. `comisiones` es lo que se les pagó a los barberos
 * (`monto_comision`), no lo que ellos facturaron: no se resta de `ingresos`
 * para dar `utilidad`, la utilidad ya viene calculada aparte por el backend
 * como ingresos menos gastos y compras.
 */
export type CifrasPeriodo = {
  ingresos: number;
  gastos: number;
  compras: number;
  utilidad: number;
  comisiones: number;
};

export type Variacion = {
  utilidad: number;
  tendencia: 'alza' | 'baja' | 'estable';
} | null;

export type ResumenFinanciero = {
  rango: RangoFechas;
  rangoAnterior: RangoFechas;
  periodo: CifrasPeriodo;
  anterior: { utilidad: number };
  variacion: Variacion;
};

// --------------------------------------------------------------- series ---

export type PuntoSerie = {
  /** 'YYYY-MM-DD' si `granularidad` es 'dia', 'YYYY-MM' si es 'mes'. */
  clave: string;
  ingresos: number;
  egresos: number;
};

export type SerieFinanciera = {
  rango: RangoFechas;
  granularidad: 'dia' | 'mes';
  /** true cuando `ingresos` es la comisión de un barbero y no la facturación. */
  esComision: boolean;
  puntos: PuntoSerie[];
};

// -------------------------------------------------------------- ranking ---

export type FilaRanking = {
  idBarbero: number;
  barbero: string;
  porcentajeComision: number;
  citasAtendidas: number;
  facturacion: number;
  comision: number;
};

/**
 * Al administrador le llega `barberos` completo. A un barbero le llega SOLO
 * su fila (o vacío si no tuvo actividad en el rango) más `posicion`, que es
 * `null` para el admin porque no tiene sentido preguntarse su propia posición
 * frente a sí mismo.
 */
export type RankingResultado = {
  rango: RangoFechas;
  barberos: FilaRanking[];
  total: number;
  posicion?: number | null;
};

// --------------------------------------------------------- gastos anuales ---

/** Un mes de `sp_gastos_mensuales_anio`, con el rubro que más pesó. */
export type GastoMensual = {
  /** 'YYYY-MM' */
  periodo: string;
  totalEgresos: number;
  categoriaMayor: string | null;
  montoCategoriaMayor: number;
};

// --------------------------------------------------------- egresos ---

export type EgresoPorCategoria = {
  idCategoria: number;
  nombre: string;
  tipo: TipoMovimiento;
  total: number;
  movimientos: number;
};

export type EgresosPorCategoriaResultado = {
  rango: RangoFechas;
  categorias: EgresoPorCategoria[];
};

// ----------------------------------------------------------- movimientos ---

export type Movimiento = {
  idMovimiento: number;
  idBarbero: number | null;
  tipo: TipoMovimiento;
  idCategoria: number;
  categoria: string;
  monto: number;
  montoComision: number | null;
  porcentajeAplicado: number | null;
  cantidad: number | null;
  unidadMedida: string | null;
  descripcion: string | null;
  idCita: number | null;
  origen: 'manual' | 'automatico';
  estado: 'activo' | 'anulado';
  /** 'YYYY-MM-DD HH:mm:ss' */
  fecha: string;
};

export type MovimientosResultado = {
  rango: RangoFechas;
  movimientos: Movimiento[];
};

export type NuevoMovimiento = {
  tipo: TipoMovimiento;
  categoriaId: number;
  monto: number;
  /** 'YYYY-MM-DD'. Ingreso: solo hoy. Gasto o compra: hoy o pasado, nunca futuro. */
  fecha: string;
  descripcion?: string;
  /** Solo tiene sentido en 'compra'. */
  cantidad?: number;
  unidadMedida?: string;
};

// ------------------------------------------------------------ categorías ---

export type Categoria = {
  idCategoria: number;
  nombre: string;
  tipo: TipoMovimiento;
  activa: boolean;
};

// -------------------------------------------------------------- informe ---

export type InformeMensual = {
  barberia: { nombre: string; direccion: string | null; telefono: string | null };
  periodo: { anio: number; mes: number; desde: string; hasta: string };
  totales: {
    ingresos: number;
    gastos: number;
    compras: number;
    comisiones: number;
    utilidad: number;
  };
  citasFinalizadas: number;
  egresosPorCategoria: EgresoPorCategoria[];
};
