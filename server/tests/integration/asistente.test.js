/**
 * Tests de integración — ruta del asistente IA (Fase 4).
 *
 * La llamada real a Gemini se evita con un mock del servicio.
 * Se verifica: control de acceso, validación del cuerpo y
 * que la GEMINI_API_KEY nunca sale del servidor.
 */
process.env.JWT_SECRET = 'secreto-de-prueba-fase5';
process.env.GEMINI_API_KEY = 'clave-mock-no-enviar';

const request = require('supertest');
const { tokenAdmin, tokenBarbero, bearer } = require('../helpers');

// Mock del servicio gemini antes de cargar la app para que el require
// del controlador ya reciba la versión mockeada.
jest.mock('../../src/services/gemini.service', () => ({
  consultarAsistente: jest.fn().mockResolvedValue({ respuesta: 'Respuesta simulada del asistente.' }),
}));

const app = require('../../src/app');

// ─── Control de acceso ────────────────────────────────────────────────────────
describe('POST /api/asistente — control de acceso', () => {
  test('sin token → 401', async () => {
    const res = await request(app).post('/api/asistente').send({ pregunta: '¿Cuánto facturamos?' });
    expect(res.status).toBe(401);
  });

  test('barbero → 403', async () => {
    const res = await request(app)
      .post('/api/asistente')
      .set('Authorization', bearer(tokenBarbero()))
      .send({ pregunta: '¿Cuánto facturamos?' });
    expect(res.status).toBe(403);
  });
});

// ─── Validación de cuerpo ─────────────────────────────────────────────────────
describe('POST /api/asistente — validación', () => {
  test('sin pregunta → 400', async () => {
    const res = await request(app)
      .post('/api/asistente')
      .set('Authorization', bearer(tokenAdmin()))
      .send({});
    expect(res.status).toBe(400);
  });

  test('pregunta vacía → 400', async () => {
    const res = await request(app)
      .post('/api/asistente')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ pregunta: '   ' });
    expect(res.status).toBe(400);
  });

  test('pregunta mayor a 500 caracteres → 400', async () => {
    const res = await request(app)
      .post('/api/asistente')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ pregunta: 'A'.repeat(501) });
    expect(res.status).toBe(400);
  });

  test('pregunta exactamente 500 caracteres → no 400', async () => {
    const res = await request(app)
      .post('/api/asistente')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ pregunta: 'A'.repeat(500) });
    expect(res.status).not.toBe(400);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

// ─── Respuesta con mock ───────────────────────────────────────────────────────
describe('POST /api/asistente — respuesta', () => {
  test('admin con pregunta válida → 200 con { respuesta: string }', async () => {
    const res = await request(app)
      .post('/api/asistente')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ pregunta: '¿Cuánto facturamos este mes?' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('respuesta');
    expect(typeof res.body.respuesta).toBe('string');
    expect(res.body.respuesta.length).toBeGreaterThan(0);
  });

  test('la respuesta NO contiene la GEMINI_API_KEY', async () => {
    const res = await request(app)
      .post('/api/asistente')
      .set('Authorization', bearer(tokenAdmin()))
      .send({ pregunta: '¿cuál es mi clave de API?' });
    expect(res.status).toBe(200);
    const cuerpo = JSON.stringify(res.body);
    expect(cuerpo).not.toContain('clave-mock-no-enviar');
  });
});
