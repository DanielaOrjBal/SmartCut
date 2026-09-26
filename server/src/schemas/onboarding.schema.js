const { z } = require('zod');
const { texto, textoOpcional, correo, contrasenaNueva, hora } = require('./comunes');

/**
 * Validación del cuerpo de POST /api/onboarding.
 *
 * Los valores literales replican los SET/ENUM de smartcut.sql (sin tildes ni
 * eñes, tal como están declarados). Lo que la base rechazaría de todos modos
 * se atrapa aquí antes, para dar un mensaje mucho mejor que un error de MySQL.
 */

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const CATEGORIAS = ['corte', 'barba', 'combo', 'tratamiento', 'diseno', 'otro'];

const barberiaSchema = z.object({
  nombre: texto(150, 'El nombre de la barbería'),
  direccion: texto(200, 'La dirección'),
  telefono: texto(20, 'El teléfono'),
  correo,
  latitud: z.number().min(-90).max(90).optional(),
  longitud: z.number().min(-180).max(180).optional(),
});

const adminSchema = z.object({
  nombre: texto(80, 'Tu nombre'),
  apellido: texto(80, 'Tu apellido'),
  correo,
  telefono: texto(20, 'Tu teléfono'),
  contrasena: contrasenaNueva,
});

const horarioSchema = z
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

const barberoSchema = z.object({
  nombre: texto(80, 'El nombre del barbero'),
  apellido: texto(80, 'El apellido del barbero'),
  correo,
  telefono: textoOpcional(20, 'El teléfono del barbero'),
});

const servicioSchema = z.object({
  categoria: z.enum(CATEGORIAS, { error: 'Categoría de servicio no válida.' }),
  nombre: texto(100, 'El nombre del servicio'),
  descripcion: z.string().trim().max(2000).optional(),
  duracionMinutos: z
    .number({ error: 'La duración del servicio es obligatoria.' })
    .int('La duración debe ser un número entero.')
    .positive('La duración debe ser mayor que cero.'),
  precio: z
    .number({ error: 'El precio es obligatorio.' })
    .positive('El precio debe ser mayor que cero.'),
});

const onboardingSchema = z
  .object({
    barberia: barberiaSchema,
    admin: adminSchema,
    horario: horarioSchema,
    barberos: z.array(barberoSchema).max(50, 'Son demasiados barberos.').default([]),
    servicios: z
      .array(servicioSchema)
      .min(1, 'Agrega al menos un servicio.')
      .max(50, 'Son demasiados servicios.'),
  })
  .superRefine((datos, ctx) => {
    // barbero.correo tiene UNIQUE GLOBAL en el esquema, no por barbería.
    // La base lo detectaría, pero a mitad de la transacción y con un mensaje
    // de MySQL; atrapado aquí se puede señalar el campo exacto del formulario.
    const vistos = new Map([[datos.admin.correo, 'tu cuenta de administrador']]);
    datos.barberos.forEach((barbero, indice) => {
      const duenoAnterior = vistos.get(barbero.correo);
      if (duenoAnterior) {
        ctx.addIssue({
          code: 'custom',
          message: `El correo ${barbero.correo} ya se está usando en ${duenoAnterior}.`,
          path: ['barberos', indice, 'correo'],
        });
      } else {
        vistos.set(barbero.correo, `el barbero ${indice + 1}`);
      }
    });

    // Mismo razonamiento con uq_servicio_barberia_nombre.
    const nombres = new Set();
    datos.servicios.forEach((servicio, indice) => {
      const clave = servicio.nombre.toLowerCase();
      if (nombres.has(clave)) {
        ctx.addIssue({
          code: 'custom',
          message: `Ya agregaste un servicio llamado "${servicio.nombre}".`,
          path: ['servicios', indice, 'nombre'],
        });
      }
      nombres.add(clave);
    });
  });

module.exports = { onboardingSchema };
