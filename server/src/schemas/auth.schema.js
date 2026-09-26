const { z } = require('zod');
const { correo, contrasenaNueva } = require('./comunes');

/**
 * En el login NO se exige longitud mínima: la clave provisional de un barbero
 * tiene 8 caracteres y una contraseña vieja podría ser más corta. Si no sirve,
 * que falle la autenticación, no la validación — así tampoco se filtra cuál es
 * la política de contraseñas antes de iniciar sesión.
 */
const loginSchema = z.object({
  correo,
  contrasena: z.string({ error: 'La contraseña es obligatoria.' }).min(1, 'Escribe tu contraseña.'),
});

const cambiarContrasenaSchema = z
  .object({
    contrasenaActual: z
      .string({ error: 'La contraseña actual es obligatoria.' })
      .min(1, 'Escribe tu contraseña actual.'),
    contrasenaNueva,
  })
  .refine((datos) => datos.contrasenaActual !== datos.contrasenaNueva, {
    message: 'La nueva contraseña debe ser distinta de la actual.',
    path: ['contrasenaNueva'],
  });

module.exports = { loginSchema, cambiarContrasenaSchema };
