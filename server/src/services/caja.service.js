const { pool } = require('../config/db');
const { primeraFila, filas, oNulo } = require('../utils/sp');
const { aISO } = require('../utils/periodo');
const { resolverPeriodo } = require('../utils/periodo');

/**
 * 'YYYY-MM-DD' de hoy en hora Bogotá.
 * periodo.js trabaja con process.env.TZ = 'America/Bogota', así que
 * `new Date()` ya refleja la hora local correcta.
 */
function hoyBogota() {
  return aISO(new Date());
}

function numero(valor) {
  const n = Number(valor);
  return Number.isNaN(n) ? 0 : n;
}

function mapearCaja(fila) {
  if (!fila) return null;
  return {
    id: fila.id,
    barberia_id: fila.barberia_id,
    fecha: typeof fila.fecha === 'string' ? fila.fecha : aISO(new Date(fila.fecha)),
    estado: fila.estado,
    montoApertura: numero(fila.monto_apertura),
    montoCierre: fila.monto_cierre !== null ? numero(fila.monto_cierre) : null,
    observacionApertura: fila.observacion_apertura ?? null,
    observacionCierre: fila.observacion_cierre ?? null,
    abierPor: fila.abierta_por,
    cerradaPor: fila.cerrada_por ?? null,
    nombreAbierPor: fila.nombre_abierta_por ?? null,
    nombreCerradaPor: fila.nombre_cerrada_por ?? null,
    abierAt: fila.abierta_at,
    cerradaAt: fila.cerrada_at ?? null,
  };
}

function mapearDesglose(fila) {
  const ingEfectivo = numero(fila?.ing_efectivo);
  const ingTarjeta = numero(fila?.ing_tarjeta);
  const ingNequi = numero(fila?.ing_nequi);
  const ingPse = numero(fila?.ing_pse);
  const ingBreB = numero(fila?.ing_bre_b);
  const totalIngresos = numero(fila?.total_ingresos);
  const totalEgresos = numero(fila?.total_egresos);

  return {
    ingEfectivo,
    ingTarjeta,
    ingNequi,
    ingPse,
    ingBreB,
    totalIngresos,
    totalEgresos,
  };
}

/**
 * Abre la caja del día para la barbería.
 * La fecha la determina el SP en hora Bogotá.
 */
async function abrirCaja({ idBarberia, idBarbero, montoApertura, observacion }) {
  const [resultado] = await pool.query('CALL sp_abrir_caja(?, ?, ?, ?)', [
    idBarberia,
    idBarbero,
    montoApertura,
    oNulo(observacion),
  ]);
  return mapearCaja(primeraFila(resultado));
}

/**
 * Cierra la caja abierta de hoy.
 * El SP rechaza con SIGNAL si no hay caja abierta.
 */
async function cerrarCaja({ idBarberia, idBarbero, montoCierre, observacion }) {
  const [resultado] = await pool.query('CALL sp_cerrar_caja(?, ?, ?, ?)', [
    idBarberia,
    idBarbero,
    montoCierre,
    oNulo(observacion),
  ]);
  return mapearCaja(primeraFila(resultado));
}

/**
 * Estado de la caja de hoy + desglose de movimientos del día.
 *
 * sp_estado_caja_dia devuelve DOS conjuntos de resultados:
 *   resultado[0] → fila de caja_diaria (puede ser vacío)
 *   resultado[1] → desglose con COALESCE (siempre devuelve una fila)
 */
async function estadoCajaHoy({ idBarberia }) {
  const fecha = hoyBogota();
  const [resultado] = await pool.query('CALL sp_estado_caja_dia(?, ?)', [idBarberia, fecha]);

  const cajaFila = Array.isArray(resultado[0]) ? resultado[0][0] ?? null : null;
  const desgloseFila = Array.isArray(resultado[1]) ? resultado[1][0] ?? null : null;

  const caja = mapearCaja(cajaFila);
  const desglose = mapearDesglose(desgloseFila);

  // Saldo esperado en efectivo = fondo_inicial + ingresos_efectivo - egresos
  // Solo calculable si hay caja abierta
  const saldoEsperadoEfectivo =
    caja !== null
      ? caja.montoApertura + desglose.ingEfectivo - desglose.totalEgresos
      : null;

  return { fecha, caja, desglose, saldoEsperadoEfectivo };
}

/**
 * Historial de cajas en un rango de fechas.
 */
async function historialCaja({ idBarberia, periodo, desde, hasta }) {
  const rango = resolverPeriodo(periodo, desde, hasta);
  const [resultado] = await pool.query('CALL sp_historial_caja(?, ?, ?)', [
    idBarberia,
    rango.desde,
    rango.hasta,
  ]);

  const registros = filas(resultado).map((fila) => ({
    ...mapearCaja(fila),
    totalIngresos: numero(fila.total_ingresos),
    totalEgresos: numero(fila.total_egresos),
  }));

  return { rango, cajas: registros };
}

module.exports = { abrirCaja, cerrarCaja, estadoCajaHoy, historialCaja };
