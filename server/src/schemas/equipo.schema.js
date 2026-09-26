const { z } = require('zod');
const { rangoQuery, fecha, hora, textoOpcional } = require('./comunes');

/**
 * Ausencia o incapacidad de un barbero.
 *
 * Sin horas es día completo: así lo modela `ausencia_barbero`, cuyas columnas
 * `hora_inicio` y `hora_fin` son NULL por defecto.
 *
 * `esIncapacidad` no viaja a la tabla — no existe esa columna. Le dice al
 * servicio que además hay que pasar al barbero a estado 'incapacitado', que es
 * lo que hace saltar a `trg_barbero_incapacidad_cancela_citas` y cancela sus
 * citas futuras. Una ausencia normal no cancela nada.
 */
const registrarAusenciaSchema = z
  .object({
    fechaInicio: fecha,
    fechaFin: fecha,
    horaInicio: hora.optional(),
    horaFin: hora.optional(),
    motivo: textoOpcional(255, 'El motivo'),
    esIncapacidad: z.coerce.boolean().default(false),
  })
  .refine((datos) => datos.fechaFin >= datos.fechaInicio, {
    error: 'La fecha de fin no puede ser anterior a la de inicio.',
    path: ['fechaFin'],
  })
  .refine(
    (datos) =>
      // O ninguna hora, o las dos: media ausencia sin hora de fin no significa nada.
      (datos.horaInicio === undefined) === (datos.horaFin === undefined),
    { error: 'Indica la hora de inicio y la de fin, o deja ambas vacías.', path: ['horaFin'] },
  )
  .refine(
    (datos) =>
      datos.horaInicio === undefined ||
      datos.horaFin === undefined ||
      datos.fechaInicio !== datos.fechaFin ||
      datos.horaFin > datos.horaInicio,
    { error: 'La hora de fin debe ser posterior a la de inicio.', path: ['horaFin'] },
  );

const cambiarEstadoSchema = z.object({
  estado: z.enum(['activo', 'incapacitado', 'inactivo'], {
    error: 'El estado debe ser activo, incapacitado o inactivo.',
  }),
});

/**
 * La comisión va de 0 a 100. El rango también lo defiende la base con
 * `chk_barbero_comision`, pero atajarlo aquí evita un viaje a MySQL solo para
 * recibir un error de restricción que no está redactado para el usuario.
 */
const cambiarComisionSchema = z.object({
  porcentaje: z.coerce
    .number({ error: 'El porcentaje de comisión es obligatorio.' })
    .min(0, 'La comisión no puede ser menor que 0 %.')
    .max(100, 'La comisión no puede ser mayor que 100 %.'),
});

const equipoQuerySchema = z.object({ ...rangoQuery });

module.exports = {
  registrarAusenciaSchema,
  cambiarEstadoSchema,
  cambiarComisionSchema,
  equipoQuerySchema,
};
