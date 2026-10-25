const { z } = require('zod');

/** Pregunta corta para evitar que un cliente convierta el endpoint en un proxy de IA general. */
const preguntaSchema = z.object({
  pregunta: z
    .string({ error: 'La pregunta es obligatoria.' })
    .trim()
    .min(1, 'Escribe una pregunta para el asistente.')
    .max(500, 'La pregunta no puede superar 500 caracteres.'),
});

module.exports = { preguntaSchema };
