const { z } = require('zod');
const { texto, textoOpcional, correo, idParam } = require('./comunes');

/**
 * Alta de un barbero después del onboarding.
 *
 * Ojo: aquí NO se recibe la barbería. Se toma del JWT, para que un admin no
 * pueda crear barberos dentro de una barbería que no es la suya.
 */
const crearBarberoSchema = z.object({
  nombre: texto(80, 'El nombre del barbero'),
  apellido: texto(80, 'El apellido del barbero'),
  correo,
  telefono: textoOpcional(20, 'El teléfono del barbero'),
});

const barberiaIdParamsSchema = z.object({ id: idParam });

module.exports = { crearBarberoSchema, barberiaIdParamsSchema };
