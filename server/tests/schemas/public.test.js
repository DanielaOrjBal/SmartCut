/**
 * Tests unitarios de los esquemas de validación del módulo público.
 * No necesitan base de datos ni conexiones externas.
 */

const { z } = require('zod');

// Reproducimos los mismos esquemas del controlador para probar sus reglas
const correoSchema = z.string().email('Correo electrónico inválido.').toLowerCase().trim();

const fechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD.');

const horaSchema = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'La hora debe tener formato HH:MM o HH:MM:SS.');

const reservaBodySchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio.').trim(),
  apellido: z.string().trim().optional(),
  correo: correoSchema,
  telefono: z.string().trim().optional(),
  idCliente: z.coerce.number().int().positive().optional(),
  idBarberia: z.coerce.number().int().positive('Selecciona una barbería.'),
  idBarbero: z.coerce.number().int().positive('Selecciona un barbero.'),
  fecha: fechaSchema,
  horaInicio: horaSchema,
  serviciosIds: z
    .array(z.coerce.number().int().positive())
    .min(1, 'Selecciona al menos un servicio.'),
});

const disponibilidadSchema = z.object({
  idBarbero: z.coerce.number().int().positive('idBarbero es obligatorio.'),
  fecha: fechaSchema,
  duracion: z.coerce.number().int().positive('La duración debe ser un número positivo.'),
});

// ─── correoSchema ────────────────────────────────────────────────────────────

describe('correoSchema', () => {
  test('acepta un correo válido y lo normaliza a minúsculas', () => {
    const r = correoSchema.safeParse('Usuario@Gmail.COM');
    expect(r.success).toBe(true);
    expect(r.data).toBe('usuario@gmail.com');
  });

  test('rechaza cadena sin @', () => {
    expect(correoSchema.safeParse('noemail').success).toBe(false);
  });

  test('rechaza cadena vacía', () => {
    expect(correoSchema.safeParse('').success).toBe(false);
  });
});

// ─── fechaSchema ─────────────────────────────────────────────────────────────

describe('fechaSchema', () => {
  test('acepta formato YYYY-MM-DD', () => {
    expect(fechaSchema.safeParse('2026-01-15').success).toBe(true);
  });

  test('rechaza formato DD/MM/YYYY', () => {
    expect(fechaSchema.safeParse('15/01/2026').success).toBe(false);
  });

  test('rechaza cadena vacía', () => {
    expect(fechaSchema.safeParse('').success).toBe(false);
  });

  test('rechaza YYYY-M-D (sin cero)', () => {
    expect(fechaSchema.safeParse('2026-1-5').success).toBe(false);
  });
});

// ─── horaSchema ──────────────────────────────────────────────────────────────

describe('horaSchema', () => {
  test('acepta HH:MM', () => {
    expect(horaSchema.safeParse('09:30').success).toBe(true);
  });

  test('acepta HH:MM:SS', () => {
    expect(horaSchema.safeParse('09:30:00').success).toBe(true);
  });

  test('rechaza H:MM (sin cero inicial)', () => {
    expect(horaSchema.safeParse('9:30').success).toBe(false);
  });

  test('rechaza cadena vacía', () => {
    expect(horaSchema.safeParse('').success).toBe(false);
  });
});

// ─── reservaBodySchema ───────────────────────────────────────────────────────

describe('reservaBodySchema', () => {
  const base = {
    nombre: 'Carlos',
    correo: 'carlos@example.com',
    idBarberia: 1,
    idBarbero: 2,
    fecha: '2026-11-20',
    horaInicio: '10:00',
    serviciosIds: [3, 5],
  };

  test('acepta cuerpo completo válido', () => {
    const r = reservaBodySchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  test('correo se normaliza a minúsculas', () => {
    const r = reservaBodySchema.safeParse({ ...base, correo: 'CARLOS@EXAMPLE.COM' });
    expect(r.success).toBe(true);
    expect(r.data.correo).toBe('carlos@example.com');
  });

  test('serviciosIds vacío → error', () => {
    const r = reservaBodySchema.safeParse({ ...base, serviciosIds: [] });
    expect(r.success).toBe(false);
    expect(r.error.issues[0].message).toBe('Selecciona al menos un servicio.');
  });

  test('nombre vacío → error', () => {
    const r = reservaBodySchema.safeParse({ ...base, nombre: '' });
    expect(r.success).toBe(false);
  });

  test('idBarberia negativo → error', () => {
    const r = reservaBodySchema.safeParse({ ...base, idBarberia: -1 });
    expect(r.success).toBe(false);
  });

  test('fecha con formato incorrecto → error', () => {
    const r = reservaBodySchema.safeParse({ ...base, fecha: '20/11/2026' });
    expect(r.success).toBe(false);
  });

  test('horaInicio inválida → error', () => {
    const r = reservaBodySchema.safeParse({ ...base, horaInicio: '9:00' });
    expect(r.success).toBe(false);
  });

  test('idCliente es opcional', () => {
    const sinId = { ...base };
    delete sinId.idCliente;
    expect(reservaBodySchema.safeParse(sinId).success).toBe(true);
  });

  test('idCliente válido se coerce correctamente', () => {
    const r = reservaBodySchema.safeParse({ ...base, idCliente: '42' });
    expect(r.success).toBe(true);
    expect(r.data.idCliente).toBe(42);
  });

  test('serviciosIds con strings numéricos se coercen a números', () => {
    const r = reservaBodySchema.safeParse({ ...base, serviciosIds: ['3', '5'] });
    expect(r.success).toBe(true);
    expect(r.data.serviciosIds).toEqual([3, 5]);
  });
});

// ─── disponibilidadSchema ────────────────────────────────────────────────────

describe('disponibilidadSchema (query params)', () => {
  const base = { idBarbero: '2', fecha: '2026-11-20', duracion: '30' };

  test('acepta parámetros válidos y coerce strings a números', () => {
    const r = disponibilidadSchema.safeParse(base);
    expect(r.success).toBe(true);
    expect(r.data.idBarbero).toBe(2);
    expect(r.data.duracion).toBe(30);
  });

  test('idBarbero faltante → error', () => {
    const { idBarbero: _, ...sinId } = base;
    expect(disponibilidadSchema.safeParse(sinId).success).toBe(false);
  });

  test('duracion cero → error', () => {
    expect(disponibilidadSchema.safeParse({ ...base, duracion: '0' }).success).toBe(false);
  });

  test('fecha inválida → error', () => {
    expect(disponibilidadSchema.safeParse({ ...base, fecha: 'hoy' }).success).toBe(false);
  });
});
