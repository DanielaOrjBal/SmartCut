const { z } = require('zod');
const { rangoQuery, idParam, texto, textoOpcional, fecha, monto } = require('./comunes');

/** Los tres tipos de `movimiento_financiero.tipo` y de `categoria_movimiento.tipo`. */
const tipoMovimiento = z.enum(['ingreso', 'gasto', 'compra'], {
  error: 'El tipo debe ser ingreso, gasto o compra.',
});

const resumenQuerySchema = z.object({ ...rangoQuery });

const serieQuerySchema = z.object({
  ...rangoQuery,
  barberoId: z
    .union([idParam, z.literal(''), z.literal('todos')])
    .optional()
    .transform((valor) => (valor === '' || valor === 'todos' ? undefined : valor)),
});

const movimientosQuerySchema = z.object({
  ...rangoQuery,
  tipo: z
    .union([tipoMovimiento, z.literal(''), z.literal('todos')])
    .optional()
    .transform((valor) => (valor === '' || valor === 'todos' ? undefined : valor)),
});

/**
 * Registro de un movimiento manual.
 *
 * Las tres reglas de fecha (ingreso solo hoy, gasto y compra nunca a futuro,
 * y solo el admin registra) las valida `sp_registrar_movimiento` y devuelve el
 * mensaje en español. Aquí NO se duplican: si se copiaran, tarde o temprano
 * una de las dos copias quedaría desactualizada y la app mostraría un mensaje
 * distinto al que la base considera cierto. La app sí las aplica antes de
 * enviar, pero como ayuda de interfaz, no como validación.
 */
const crearMovimientoSchema = z.object({
  tipo: tipoMovimiento,
  categoriaId: idParam,
  monto,
  fecha,
  descripcion: textoOpcional(255, 'La descripción'),
  cantidad: z.coerce
    .number()
    .positive('La cantidad debe ser mayor que cero.')
    .max(99_999_999, 'La cantidad es demasiado grande.')
    .optional(),
  unidadMedida: textoOpcional(20, 'La unidad de medida'),
});

/**
 * Anulación de un movimiento.
 *
 * El motivo es obligatorio: un movimiento no se borra ni se edita —lo impiden
 * `trg_movimiento_bloquear_delete` y `trg_movimiento_solo_anulacion`—, así que
 * lo único que queda es explicar por qué dejó de contar.
 *
 * La `fecha` es la del movimiento, y sirve para comprobar con
 * `sp_listar_movimientos` que pertenece a esta barbería: `sp_anular_movimiento`
 * recibe solo el id y no verifica de quién es, así que sin esto un admin podría
 * anular el movimiento de otro negocio escribiendo su id a mano.
 */
const anularMovimientoSchema = z.object({
  motivo: texto(255, 'El motivo de la anulación'),
  fecha,
});

const categoriasQuerySchema = z.object({
  tipo: z
    .union([tipoMovimiento, z.literal(''), z.literal('todas')])
    .optional()
    .transform((valor) => (valor === '' || valor === 'todas' ? undefined : valor)),
});

const crearCategoriaSchema = z.object({
  nombre: texto(50, 'El nombre de la categoría'),
  tipo: tipoMovimiento,
});

const informeQuerySchema = z.object({
  anio: z.coerce
    .number({ error: 'El año es obligatorio.' })
    .int('El año no es válido.')
    .min(2020, 'El año no es válido.')
    .max(2100, 'El año no es válido.'),
  mes: z.coerce
    .number({ error: 'El mes es obligatorio.' })
    .int('El mes no es válido.')
    .min(1, 'El mes no es válido.')
    .max(12, 'El mes no es válido.'),
});

module.exports = {
  tipoMovimiento,
  resumenQuerySchema,
  serieQuerySchema,
  movimientosQuerySchema,
  crearMovimientoSchema,
  anularMovimientoSchema,
  categoriasQuerySchema,
  crearCategoriaSchema,
  informeQuerySchema,
};
