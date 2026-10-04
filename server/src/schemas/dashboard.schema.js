const { z } = require('zod');
const { rangoQuery, idParam, texto, medioPago } = require('./comunes');

/**
 * Esquemas de la agenda y del registro de atención.
 *
 * Ninguno recibe `barberiaId`: esa siempre sale del JWT. Y `barberoId`, cuando
 * llega, es apenas una sugerencia: el controlador la descarta si quien pregunta
 * no es administrador.
 */

const agendaQuerySchema = z.object({
  ...rangoQuery,
  // Cadena vacía o 'todos' significan "sin filtro de barbero".
  barberoId: z
    .union([idParam, z.literal(''), z.literal('todos')])
    .optional()
    .transform((valor) => (valor === '' || valor === 'todos' ? undefined : valor)),
});

/**
 * Registro de una atención sin cita.
 *
 * `servicios` viaja como arreglo de ids y el servicio lo convierte a la lista
 * separada por comas que espera `FIND_IN_SET` dentro de `sp_registrar_atencion`.
 * Se valida que sean enteros positivos porque esa lista entra a la consulta
 * como texto: dejar pasar cualquier cadena sería abrirle la puerta a basura.
 */
const crearAtencionSchema = z.object({
  nombreCliente: texto(80, 'El nombre del cliente'),
  servicios: z
    .array(idParam, { error: 'Debes seleccionar al menos un servicio.' })
    .min(1, 'Debes seleccionar al menos un servicio.')
    .max(20, 'No puedes registrar más de 20 servicios en una misma atención.'),
  medioPago,
});

/**
 * Cambio de estado de una cita.
 *
 * La `fecha` no es decorativa: es la que permite verificar, con
 * `sp_agenda_barberia`, que la cita realmente pertenece a quien la quiere
 * tocar. Sin ella habría que confiar en el id que manda el cliente.
 *
 * `medioPago` es obligatorio únicamente al finalizar: el trigger de ingreso
 * lo hereda de la cita, así que si llega vacío cuando el estado es
 * 'finalizada', el movimiento se crearía sin método de cobro válido.
 */
const estadoCitaSchema = z
  .object({
    estado: z.enum(['pendiente', 'confirmada', 'en_proceso', 'finalizada', 'cancelada', 'no_asistio'], {
      error: 'Ese no es un estado válido para una cita.',
    }),
    fecha: z
      .string({ error: 'La fecha de la cita es obligatoria.' })
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD.'),
    motivo: z.string().trim().max(255, 'El motivo no puede superar 255 caracteres.').optional(),
    medioPago: medioPago.optional(),
  })
  .refine(
    (datos) => datos.estado !== 'finalizada' || datos.medioPago !== undefined,
    { message: 'El medio de pago es obligatorio al finalizar una cita.', path: ['medioPago'] },
  );

const idParamsSchema = z.object({ id: idParam });

module.exports = {
  agendaQuerySchema,
  crearAtencionSchema,
  estadoCitaSchema,
  idParamsSchema,
};
