/** Estado posible de una caja diaria. */
export type EstadoCaja = 'abierta' | 'cerrada';

/** Fila de caja_diaria mapeada por el backend. */
export type CajaDia = {
  id: number;
  barberia_id: number;
  /** 'YYYY-MM-DD' */
  fecha: string;
  estado: EstadoCaja;
  montoApertura: number;
  montoCierre: number | null;
  observacionApertura: string | null;
  observacionCierre: string | null;
  abierPor: number;
  cerradaPor: number | null;
  nombreAbierPor: string | null;
  nombreCerradaPor: string | null;
  abierAt: string;
  cerradaAt: string | null;
};

/** Desglose de movimientos del día por medio de pago. */
export type DesgloseCaja = {
  ingEfectivo: number;
  ingTarjeta: number;
  ingNequi: number;
  ingPse: number;
  ingBreB: number;
  totalIngresos: number;
  totalEgresos: number;
};

/** Respuesta completa de GET /api/caja/hoy */
export type EstadoCajaHoy = {
  /** 'YYYY-MM-DD' en hora Bogotá */
  fecha: string;
  /** null si no se abrió caja hoy */
  caja: CajaDia | null;
  desglose: DesgloseCaja;
  /** null si no hay caja; monto_apertura + ing_efectivo - egresos */
  saldoEsperadoEfectivo: number | null;
};

/** Un registro en GET /api/caja/historial */
export type FilaHistorialCaja = CajaDia & {
  totalIngresos: number;
  totalEgresos: number;
};

export type HistorialCajaResultado = {
  rango: { desde: string; hasta: string };
  cajas: FilaHistorialCaja[];
};

export type AbrirCajaRequest = {
  montoApertura: number;
  observacion?: string;
};

export type CerrarCajaRequest = {
  montoCierre: number;
  observacion?: string;
};
