/**
 * Tests de integración — rutas públicas (/api/public/*).
 *
 * Objetivo:
 *  1. Confirmar que NINGUNA ruta pública exige autenticación (nunca 401/403).
 *  2. Comprobar que la validación de entrada devuelve 400 con los campos incorrectos.
 *  3. Verificar que las operaciones de token responden 410 cuando el token no existe.
 *
 * No se requiere base de datos: los errores de validación se producen antes del
 * acceso al pool; los errores de token (410) se producen cuando la BD devuelve
 * resultado vacío, lo que supertest/Express maneja como AppError sin crashing.
 */
process.env.JWT_SECRET = 'secreto-de-prueba-tests';

const request = require('supertest');
const app = require('../../src/app');

// ─── 1. Sin token → ninguna ruta pública exige 401/403 ───────────────────────

describe('Rutas públicas — accesibles sin autenticación', () => {
  const RUTAS_PUBLICAS = [
    ['GET',  '/api/public/barberias'],
    ['GET',  '/api/public/barberias/1'],
    ['GET',  '/api/public/barberias/1/barberos'],
    ['GET',  '/api/public/barberias/1/servicios'],
    ['GET',  '/api/public/disponibilidad'],
    ['GET',  '/api/public/clientes/buscar'],
    ['POST', '/api/public/reservas'],
    ['GET',  '/api/public/reservas/sometoken/cancelar'],
    ['GET',  '/api/public/reservas/sometoken/reprogramar'],
    ['POST', '/api/public/reservas/sometoken/cancelar'],
    ['POST', '/api/public/reservas/sometoken/reprogramar'],
  ];

  test.each(RUTAS_PUBLICAS)('%s %s → nunca 401 ni 403', async (metodo, ruta) => {
    const res = await request(app)[metodo.toLowerCase()](ruta);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

// ─── 2. Validación de entrada ────────────────────────────────────────────────

describe('GET /api/public/barberias/:id — validación de id', () => {
  test('id "abc" → 400', async () => {
    const res = await request(app).get('/api/public/barberias/abc');
    expect(res.status).toBe(400);
  });

  test('id "-1" → 400', async () => {
    const res = await request(app).get('/api/public/barberias/-1');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/public/disponibilidad — validación de query params', () => {
  test('sin parámetros → 400', async () => {
    const res = await request(app).get('/api/public/disponibilidad');
    expect(res.status).toBe(400);
  });

  test('duracion cero → 400', async () => {
    const res = await request(app)
      .get('/api/public/disponibilidad')
      .query({ idBarbero: 1, fecha: '2026-11-20', duracion: 0 });
    expect(res.status).toBe(400);
  });

  test('fecha con formato incorrecto → 400', async () => {
    const res = await request(app)
      .get('/api/public/disponibilidad')
      .query({ idBarbero: 1, fecha: '20/11/2026', duracion: 30 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/public/clientes/buscar — validación de correo', () => {
  test('sin correo → 400', async () => {
    const res = await request(app).get('/api/public/clientes/buscar');
    expect(res.status).toBe(400);
  });

  test('correo malformado → 400', async () => {
    const res = await request(app)
      .get('/api/public/clientes/buscar')
      .query({ correo: 'no-es-correo' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/public/reservas — validación de cuerpo', () => {
  const base = {
    nombre: 'Carlos',
    correo: 'carlos@example.com',
    idBarberia: 1,
    idBarbero: 2,
    fecha: '2026-11-20',
    horaInicio: '10:00',
    serviciosIds: [3],
  };

  test('cuerpo vacío → 400', async () => {
    const res = await request(app).post('/api/public/reservas').send({});
    expect(res.status).toBe(400);
  });

  test('serviciosIds vacío → 400', async () => {
    const res = await request(app)
      .post('/api/public/reservas')
      .send({ ...base, serviciosIds: [] });
    expect(res.status).toBe(400);
  });

  test('correo inválido → 400', async () => {
    const res = await request(app)
      .post('/api/public/reservas')
      .send({ ...base, correo: 'noesuncorreo' });
    expect(res.status).toBe(400);
  });

  test('nombre vacío → 400', async () => {
    const res = await request(app)
      .post('/api/public/reservas')
      .send({ ...base, nombre: '' });
    expect(res.status).toBe(400);
  });

  test('fecha con formato incorrecto → 400', async () => {
    const res = await request(app)
      .post('/api/public/reservas')
      .send({ ...base, fecha: '20/11/2026' });
    expect(res.status).toBe(400);
  });

  test('horaInicio sin cero inicial → 400', async () => {
    const res = await request(app)
      .post('/api/public/reservas')
      .send({ ...base, horaInicio: '9:00' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/public/reservas/:token/reprogramar — validación de cuerpo', () => {
  const TOKEN_FALSO = 'a'.repeat(64);

  test('sin fecha ni hora → 400', async () => {
    const res = await request(app)
      .post(`/api/public/reservas/${TOKEN_FALSO}/reprogramar`)
      .send({});
    expect(res.status).toBe(400);
  });

  test('fecha incorrecta → 400', async () => {
    const res = await request(app)
      .post(`/api/public/reservas/${TOKEN_FALSO}/reprogramar`)
      .send({ fecha: '2026/11/20', horaInicio: '10:00' });
    expect(res.status).toBe(400);
  });
});

// ─── 3. Token inexistente → 410 ──────────────────────────────────────────────

describe('Operaciones con token inexistente', () => {
  const TOKEN_INEXISTENTE = 'f'.repeat(64);

  test('GET /reservas/:token/cancelar con token inválido → 410', async () => {
    const res = await request(app)
      .get(`/api/public/reservas/${TOKEN_INEXISTENTE}/cancelar`);
    expect(res.status).toBe(410);
  });

  test('GET /reservas/:token/reprogramar con token inválido → 410', async () => {
    const res = await request(app)
      .get(`/api/public/reservas/${TOKEN_INEXISTENTE}/reprogramar`);
    expect(res.status).toBe(410);
  });

  test('POST /reservas/:token/cancelar con token inválido → 410', async () => {
    const res = await request(app)
      .post(`/api/public/reservas/${TOKEN_INEXISTENTE}/cancelar`);
    expect(res.status).toBe(410);
  });
});

// ─── 4. Operación inválida → 400 ─────────────────────────────────────────────

describe('GET /api/public/reservas/:token/:operacion — operación inválida', () => {
  test('operación "eliminar" no reconocida → 400', async () => {
    const res = await request(app)
      .get('/api/public/reservas/sometoken/eliminar');
    expect(res.status).toBe(400);
  });
});
