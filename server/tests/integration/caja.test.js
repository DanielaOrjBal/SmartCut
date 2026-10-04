/**
 * Tests de integración — rutas de caja (Fase 2).
 *
 * Todas las rutas de caja son exclusivas del administrador.
 * Los tests verifican validación y control de acceso sin necesitar DB.
 */
process.env.JWT_SECRET = 'secreto-de-prueba-fase5';

const request = require('supertest');
const app = require('../../src/app');
const { tokenAdmin, tokenBarbero, bearer } = require('../helpers');

// ─── Control de acceso ────────────────────────────────────────────────────────
describe('Caja — control de acceso', () => {
  const ENDPOINTS = [
    ['GET',  '/api/caja/hoy'],
    ['POST', '/api/caja/abrir'],
    ['POST', '/api/caja/cerrar'],
    ['GET',  '/api/caja/historial'],
  ];

  test.each(ENDPOINTS)('sin token: %s %s → 401', async (metodo, ruta) => {
    const res = await request(app)[metodo.toLowerCase()](ruta);
    expect(res.status).toBe(401);
  });

  test.each(ENDPOINTS)('barbero: %s %s → 403', async (metodo, ruta) => {
    const res = await request(app)
      [metodo.toLowerCase()](ruta)
      .set('Authorization', bearer(tokenBarbero()));
    expect(res.status).toBe(403);
  });
});

// ─── POST /api/caja/abrir ─────────────────────────────────────────────────────
describe('POST /api/caja/abrir', () => {
  test('sin cuerpo → 400', async () => {
    const res = await request(app)
      .post('/api/caja/abrir')
      .set('Authorization', bearer(tokenAdmin()))
      .send({});
    expect(res.status).toBe(400);
  });

  test('montoApertura negativo → 400', async () => {
    const res = await request(app)
      .post('/api/caja/abrir')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ montoApertura: -1 });
    expect(res.status).toBe(400);
  });

  test('montoApertura 0 es válido (sin error de validación) → no 401/403', async () => {
    const res = await request(app)
      .post('/api/caja/abrir')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ montoApertura: 0 });
    // 200, 400 de regla de negocio (SP via SIGNAL 45000) o 500 de DB son aceptables.
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  test('montoApertura positivo → no 401/403 (puede ser 200, 400 de negocio o 500 de DB)', async () => {
    const res = await request(app)
      .post('/api/caja/abrir')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ montoApertura: 50000 });
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

// ─── POST /api/caja/cerrar ────────────────────────────────────────────────────
describe('POST /api/caja/cerrar', () => {
  test('sin cuerpo → 400', async () => {
    const res = await request(app)
      .post('/api/caja/cerrar')
      .set('Authorization', bearer(tokenAdmin()))
      .send({});
    expect(res.status).toBe(400);
  });

  test('montoCierre negativo → 400', async () => {
    const res = await request(app)
      .post('/api/caja/cerrar')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ montoCierre: -100 });
    expect(res.status).toBe(400);
  });

  test('montoCierre 0 es válido (sin error de validación) → no 401/403', async () => {
    const res = await request(app)
      .post('/api/caja/cerrar')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ montoCierre: 0 });
    // 200, 400 de regla de negocio (SP via SIGNAL 45000) o 500 de DB son aceptables.
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

// ─── GET /api/caja/hoy ────────────────────────────────────────────────────────
describe('GET /api/caja/hoy', () => {
  test('admin autenticado → no 401/403', async () => {
    const res = await request(app)
      .get('/api/caja/hoy')
      .set('Authorization', bearer(tokenAdmin()));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

// ─── GET /api/caja/historial ──────────────────────────────────────────────────
describe('GET /api/caja/historial', () => {
  test('admin autenticado → no 401/403', async () => {
    const res = await request(app)
      .get('/api/caja/historial')
      .set('Authorization', bearer(tokenAdmin()));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  test('parámetros extra son ignorados → no 401/403', async () => {
    const res = await request(app)
      .get('/api/caja/historial?pagina=1')
      .set('Authorization', bearer(tokenAdmin()));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
