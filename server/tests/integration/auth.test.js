/**
 * Tests de integración — autenticación y control de acceso.
 * Verifica que las reglas de JWT y roles se apliquen en todas las rutas
 * de las Fases 1–4 sin necesidad de base de datos (los errores de auth
 * se lanzan antes de que el controlador llame al pool).
 */
process.env.JWT_SECRET = 'secreto-de-prueba-fase5';

const request = require('supertest');
const app = require('../../src/app');
const { tokenAdmin, tokenBarbero, bearer } = require('../helpers');

// Rutas solo-admin de las 4 fases
const RUTAS_SOLO_ADMIN = [
  ['GET',  '/api/finanzas/resumen'],
  ['GET',  '/api/finanzas/movimientos'],
  ['POST', '/api/finanzas/movimientos'],
  ['GET',  '/api/finanzas/egresos-categoria'],
  ['GET',  '/api/finanzas/informe'],
  ['GET',  '/api/caja/hoy'],
  ['POST', '/api/caja/abrir'],
  ['POST', '/api/caja/cerrar'],
  ['GET',  '/api/caja/historial'],
  ['POST', '/api/asistente'],
];

// Rutas accesibles para cualquier barbero autenticado
const RUTAS_AUTENTICADAS = [
  ['GET', '/api/finanzas/serie'],
  ['GET', '/api/finanzas/ranking'],
  ['GET', '/api/finanzas/mis-movimientos'],
  ['GET', '/api/finanzas/mis-metricas'],
];

describe('Sin token — todas las rutas protegidas devuelven 401', () => {
  test.each([...RUTAS_SOLO_ADMIN, ...RUTAS_AUTENTICADAS])(
    '%s %s',
    async (metodo, ruta) => {
      const res = await request(app)[metodo.toLowerCase()](ruta);
      expect(res.status).toBe(401);
    },
  );
});

describe('Barbero sin rol admin — rutas solo-admin devuelven 403', () => {
  test.each(RUTAS_SOLO_ADMIN)('%s %s', async (metodo, ruta) => {
    const res = await request(app)
      [metodo.toLowerCase()](ruta)
      .set('Authorization', bearer(tokenBarbero()));
    expect(res.status).toBe(403);
  });
});

describe('Admin — rutas autenticadas son accesibles (no 401/403)', () => {
  test.each(RUTAS_AUTENTICADAS)('%s %s', async (metodo, ruta) => {
    const res = await request(app)
      [metodo.toLowerCase()](ruta)
      .set('Authorization', bearer(tokenAdmin()));
    // Puede ser 200, 400 (validación) o 5xx (DB no disponible),
    // pero nunca 401 ni 403.
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
