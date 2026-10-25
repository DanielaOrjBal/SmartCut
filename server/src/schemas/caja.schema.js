const { z } = require('zod');
const { rangoQuery, monto, textoOpcional } = require('./comunes');

/**
 * Monto de apertura / cierre: puede ser 0 (caja arranca sin fondo o
 * sin efectivo al cerrar). Por eso no se usa el validador `monto` del
 * módulo de finanzas que exige positivo estricto.
 */
const montoCaja = z.coerce
  .number({ error: 'El monto es obligatorio.' })
  .min(0, 'El monto no puede ser negativo.')
  .max(99_999_999_999.99, 'El monto es demasiado grande.');

const abrirCajaSchema = z.object({
  montoApertura: montoCaja,
  observacion: textoOpcional(500, 'La observación'),
});

const cerrarCajaSchema = z.object({
  montoCierre: montoCaja,
  observacion: textoOpcional(500, 'La observación de cierre'),
});

const cajaHistorialQuerySchema = z.object({ ...rangoQuery });

module.exports = { abrirCajaSchema, cerrarCajaSchema, cajaHistorialQuerySchema };
