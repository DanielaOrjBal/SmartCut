const { z } = require('zod');

/** Validadores reutilizados por varios esquemas. */

const texto = (max, etiqueta) =>
  z
    .string({ error: `${etiqueta} es obligatorio.` })
    .trim()
    .min(1, `${etiqueta} es obligatorio.`)
    .max(max, `${etiqueta} no puede superar ${max} caracteres.`);

const textoOpcional = (max, etiqueta) =>
  z.string().trim().max(max, `${etiqueta} no puede superar ${max} caracteres.`).optional();

/**
 * Correo normalizado a minúsculas. La columna usa utf8mb4_unicode_ci, que ya
 * es insensible a mayúsculas, así que normalizar evita sorpresas al comparar.
 */
const correo = z
  .string({ error: 'El correo es obligatorio.' })
  .trim()
  .toLowerCase()
  .max(150, 'El correo no puede superar 150 caracteres.')
  .pipe(z.email('Escribe un correo válido.'));

/**
 * Contraseña nueva. El tope de 72 no es capricho: bcrypt ignora todo lo que
 * pase de 72 bytes, así que aceptar más daría una falsa sensación de seguridad.
 */
const contrasenaNueva = z
  .string({ error: 'La contraseña es obligatoria.' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(72, 'La contraseña no puede superar 72 caracteres.');

/** Acepta 'HH:MM' o 'HH:MM:SS' y normaliza al TIME de MySQL ('HH:MM:SS'). */
const hora = z
  .string({ error: 'La hora es obligatoria.' })
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Usa el formato HH:MM en 24 horas.')
  .transform((valor) => (valor.length === 5 ? `${valor}:00` : valor));

/**
 * Fecha en 'YYYY-MM-DD'. Se valida con expresión regular y NO con
 * `z.coerce.date()`: esa convierte a un Date en UTC, y una fecha de Bogotá
 * reconstruida desde UTC se corre al día anterior a partir de las 7 p.m.
 * Aquí la cadena se conserva tal cual, que es lo que espera un DATE de MySQL.
 */
const fecha = z
  .string({ error: 'La fecha es obligatoria.' })
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD.');

const fechaOpcional = fecha.optional();

/** Los cinco períodos que resuelve `resolverPeriodo` en el servidor. */
const periodo = z.enum(['dia', 'semana', 'mes', 'trimestre', 'anio']).optional();

/**
 * Parámetros de rango que comparten todos los endpoints con período.
 * `desde`/`hasta` mandan sobre `periodo`; lo resuelve `resolverPeriodo`.
 */
const rangoQuery = {
  periodo,
  desde: fechaOpcional,
  hasta: fechaOpcional,
};

/** Monto en pesos. Positivo, porque `chk_movimiento_monto` exige monto > 0. */
const monto = z.coerce
  .number({ error: 'El monto es obligatorio.' })
  .positive('El monto debe ser mayor que cero.')
  .max(99_999_999_999.99, 'El monto es demasiado grande.');

/** Id que llega por la URL: siempre es string, hay que convertirlo. */
const idParam = z.coerce
  .number({ error: 'Identificador no válido.' })
  .int('Identificador no válido.')
  .positive('Identificador no válido.');

module.exports = {
  texto,
  textoOpcional,
  correo,
  contrasenaNueva,
  hora,
  idParam,
  fecha,
  fechaOpcional,
  periodo,
  rangoQuery,
  monto,
};
