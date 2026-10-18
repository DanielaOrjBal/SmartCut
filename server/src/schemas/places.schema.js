const { z } = require('zod');

const inputSchema = z
  .string()
  .min(2, 'El texto de búsqueda debe tener al menos 2 caracteres.')
  .max(200);

const placeIdSchema = z
  .string()
  .min(1, 'El place_id es obligatorio.')
  .max(300);

const coordsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90, 'Latitud inválida.'),
  lng: z.coerce.number().min(-180).max(180, 'Longitud inválida.'),
});

module.exports = { inputSchema, placeIdSchema, coordsSchema };
