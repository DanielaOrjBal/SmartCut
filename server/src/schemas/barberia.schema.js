const { z } = require('zod');
const { hora } = require('./comunes');

/** Mismos 7 valores del SET de smartcut.sql, sin tildes ni eñes. */
const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

/**
 * Configurar el horario desde Configuración.
 *
 * Idéntico en forma al `horarioSchema` del onboarding (mismo `sp_configurar_horario`
 * de por medio): se repite aquí en vez de importarlo cruzado entre features del
 * backend, para que cada ruta dependa solo de sus propios esquemas.
 */
const actualizarHorarioSchema = z
  .object({
    dias: z
      .array(z.enum(DIAS, { error: 'Día de atención no válido.' }))
      .min(1, 'Selecciona al menos un día de atención.')
      .max(7),
    horaApertura: hora,
    horaCierre: hora,
    duracionTurno: z
      .number({ error: 'La duración del turno es obligatoria.' })
      .int('La duración del turno debe ser un número entero.')
      .positive('La duración del turno debe ser mayor que cero.')
      .max(240, 'La duración del turno no puede superar 240 minutos.'),
  })
  .refine((h) => h.horaCierre > h.horaApertura, {
    message: 'La hora de cierre debe ser posterior a la de apertura.',
    path: ['horaCierre'],
  })
  .refine((h) => new Set(h.dias).size === h.dias.length, {
    message: 'Hay días repetidos en el horario.',
    path: ['dias'],
  });

module.exports = { actualizarHorarioSchema };
