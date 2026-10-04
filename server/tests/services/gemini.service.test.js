/**
 * Tests de las funciones puras de gemini.service.js (Fase 4).
 *
 * Solo se prueban `construirInstruccion` y las reglas del prompt:
 * - Solo lectura declarado
 * - Datos del contexto presentes
 * - Nunca llega la GEMINI_API_KEY al cuerpo del prompt
 *
 * `consultarAsistente` y `obtenerContextoFinanciero` requieren DB + API Key
 * y se cubren con tests de integración por separado.
 */
const { construirInstruccion } = require('../../src/services/gemini.service');

const contextoCompleto = {
  periodo: 'últimos 30 días',
  resumen: { ingresos: 500000, egresos: 120000, utilidad: 380000 },
  topBarberos: [
    { nombre: 'Sebastian Trujillo', facturacion: 300000, citasAtendidas: 12 },
    { nombre: 'Karoll Orjuela', facturacion: 200000, citasAtendidas: 8 },
  ],
  topCategoriasEgreso: [
    { categoria: 'Arriendo', total: 80000 },
    { categoria: 'Servicios públicos', total: 40000 },
  ],
};

const contextoVacio = {
  periodo: 'últimos 30 días',
  resumen: { ingresos: 0, egresos: 0, utilidad: 0 },
  topBarberos: [],
  topCategoriasEgreso: [],
};

describe('construirInstruccion', () => {
  test('incluye la pregunta del administrador en el prompt', () => {
    const prompt = construirInstruccion(contextoCompleto, '¿Cuál barbero facturó más?');
    expect(prompt).toContain('¿Cuál barbero facturó más?');
  });

  test('declara solo lectura — no puede modificar nada', () => {
    const prompt = construirInstruccion(contextoCompleto, 'Borra el último movimiento');
    expect(prompt.toLowerCase()).toContain('solo lectura');
  });

  test('incluye cifras del resumen financiero', () => {
    const prompt = construirInstruccion(contextoCompleto, 'resumen');
    // Cualquier representación de 500000 (con o sin separador de miles)
    expect(prompt).toMatch(/500[.,]?000/);
  });

  test('incluye nombres de barberos del top', () => {
    const prompt = construirInstruccion(contextoCompleto, 'resumen');
    expect(prompt).toContain('Sebastian Trujillo');
    expect(prompt).toContain('Karoll Orjuela');
  });

  test('incluye categorías de egreso', () => {
    const prompt = construirInstruccion(contextoCompleto, 'gastos');
    expect(prompt).toContain('Arriendo');
    expect(prompt).toContain('Servicios públicos');
  });

  test('con contexto vacío informa que no hay datos de facturación', () => {
    const prompt = construirInstruccion(contextoVacio, '¿quién facturó más?');
    expect(prompt.toLowerCase()).toContain('sin datos');
  });

  test('con egresos vacíos informa que no hay egresos', () => {
    const prompt = construirInstruccion(contextoVacio, '¿cuáles son los gastos?');
    expect(prompt.toLowerCase()).toContain('sin egresos');
  });

  test('nunca contiene la clave de API', () => {
    // Garantía de que GEMINI_API_KEY no se filtra al prompt bajo ninguna circunstancia.
    process.env.GEMINI_API_KEY = 'clave-ultra-secreta-de-prueba';
    const prompt = construirInstruccion(contextoCompleto, 'cualquier pregunta');
    expect(prompt).not.toContain('clave-ultra-secreta-de-prueba');
    delete process.env.GEMINI_API_KEY;
  });

  test('indica que responde en español', () => {
    const prompt = construirInstruccion(contextoCompleto, 'pregunta');
    expect(prompt.toLowerCase()).toContain('español');
  });
});
