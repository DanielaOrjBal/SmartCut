/**
 * Tests de integración — rutas de finanzas (Fases 1 y 3).
 *
 * No requieren base de datos real: verifican validación de esquemas,
 * control de acceso y contratos de respuesta (errores 400/401/403).
 * Los 200 reales se omiten para no depender de un MySQL en CI.
 */
process.env.JWT_SECRET = 'secreto-de-prueba-fase5';

const request = require('supertest');
const app = require('../../src/app');
const { tokenAdmin, tokenBarbero, bearer } = require('../helpers');

// ─── Resumen (solo admin) ────────────────────────────────────────────────────
describe('GET /api/finanzas/resumen', () => {
  test('sin token → 401', async () => {
    const res = await request(app).get('/api/finanzas/resumen');
    expect(res.status).toBe(401);
  });

  test('barbero → 403', async () => {
    const res = await request(app)
      .get('/api/finanzas/resumen')
      .set('Authorization', bearer(tokenBarbero()));
    expect(res.status).toBe(403);
  });

  test('admin con periodo inválido → 400', async () => {
    const res = await request(app)
      .get('/api/finanzas/resumen?periodo=anual')
      .set('Authorization', bearer(tokenAdmin()));
    expect(res.status).toBe(400);
  });

  test('admin con periodo válido → no 401/403', async () => {
    const res = await request(app)
      .get('/api/finanzas/resumen?periodo=mes')
      .set('Authorization', bearer(tokenAdmin()));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

// ─── Serie (admin y barbero) ─────────────────────────────────────────────────
describe('GET /api/finanzas/serie', () => {
  test('sin token → 401', async () => {
    const res = await request(app).get('/api/finanzas/serie');
    expect(res.status).toBe(401);
  });

  test('barbero autenticado → no 401/403', async () => {
    const res = await request(app)
      .get('/api/finanzas/serie?periodo=semana')
      .set('Authorization', bearer(tokenBarbero()));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  test('admin autenticado → no 401/403', async () => {
    const res = await request(app)
      .get('/api/finanzas/serie?periodo=mes')
      .set('Authorization', bearer(tokenAdmin()));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

// ─── Movimientos (solo admin) ────────────────────────────────────────────────
describe('POST /api/finanzas/movimientos', () => {
  test('sin token → 401', async () => {
    const res = await request(app).post('/api/finanzas/movimientos').send({});
    expect(res.status).toBe(401);
  });

  test('barbero → 403', async () => {
    const res = await request(app)
      .post('/api/finanzas/movimientos')
      .set('Authorization', bearer(tokenBarbero()))
      .send({ tipo: 'egreso', monto: 5000, concepto: 'Prueba', medioPago: 'efectivo' });
    expect(res.status).toBe(403);
  });

  test('admin con cuerpo vacío → 400', async () => {
    const res = await request(app)
      .post('/api/finanzas/movimientos')
      .set('Authorization', bearer(tokenAdmin()))
      .send({});
    expect(res.status).toBe(400);
  });

  test('admin con monto negativo → 400', async () => {
    const res = await request(app)
      .post('/api/finanzas/movimientos')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ tipo: 'egreso', monto: -500, concepto: 'Prueba', medioPago: 'efectivo' });
    expect(res.status).toBe(400);
  });

  test('admin con tipo inválido → 400', async () => {
    const res = await request(app)
      .post('/api/finanzas/movimientos')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ tipo: 'gasto', monto: 5000, concepto: 'Prueba', medioPago: 'efectivo' });
    expect(res.status).toBe(400);
  });
});

// ─── Mis métricas (cualquier autenticado) ────────────────────────────────────
describe('GET /api/finanzas/mis-metricas', () => {
  test('sin token → 401', async () => {
    const res = await request(app).get('/api/finanzas/mis-metricas');
    expect(res.status).toBe(401);
  });

  test('barbero autenticado → no 401/403', async () => {
    const res = await request(app)
      .get('/api/finanzas/mis-metricas')
      .set('Authorization', bearer(tokenBarbero()));
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

// ─── Métricas de un barbero (solo admin) ─────────────────────────────────────
describe('GET /api/finanzas/barbero/:id/metricas', () => {
  test('sin token → 401', async () => {
    const res = await request(app).get('/api/finanzas/barbero/12/metricas');
    expect(res.status).toBe(401);
  });

  test('barbero → 403', async () => {
    const res = await request(app)
      .get('/api/finanzas/barbero/12/metricas')
      .set('Authorization', bearer(tokenBarbero()));
    expect(res.status).toBe(403);
  });

  test('id no numérico → 400', async () => {
    const res = await request(app)
      .get('/api/finanzas/barbero/abc/metricas')
      .set('Authorization', bearer(tokenAdmin()));
    expect(res.status).toBe(400);
  });
});

// ─── Anular movimiento — no se puede borrar, solo anular con motivo ──────────
describe('PATCH /api/finanzas/movimientos/:id/anular', () => {
  test('sin motivo → 400', async () => {
    const res = await request(app)
      .patch('/api/finanzas/movimientos/1/anular')
      .set('Authorization', bearer(tokenAdmin()))
      .send({});
    expect(res.status).toBe(400);
  });

  test('motivo muy corto → 400', async () => {
    const res = await request(app)
      .patch('/api/finanzas/movimientos/1/anular')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ motivo: 'ok' });
    expect(res.status).toBe(400);
  });

  test('barbero → 403', async () => {
    const res = await request(app)
      .patch('/api/finanzas/movimientos/1/anular')
      .set('Authorization', bearer(tokenBarbero()))
      .send({ motivo: 'Motivo suficientemente largo para pasar validación' });
    expect(res.status).toBe(403);
  });
});
