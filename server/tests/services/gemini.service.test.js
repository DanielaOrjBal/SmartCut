/**
 * Tests de las funciones puras de gemini.service.js.
 *
 * Solo se prueba `construirInstruccionSistema` (antes: construirInstruccion).
 * La función ya no recibe la pregunta del usuario porque el fix anti-inyección
 * la separa: instrucción del sistema → config.systemInstruction,
 * pregunta del usuario → contents. Ambas van a la API por canales distintos.
 *
 * `consultarAsistente` y `obtenerContextoFinanciero` requieren DB + API Key
 * y se cubren con tests de integración por separado.
 */
const { construirInstruccionSistema } = require('../../src/services/gemini.service');

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

describe('construirInstruccionSistema', () => {
  test('no incluye input del usuario en la instrucción del sistema (anti-inyección)', () => {
    // La pregunta viaja en `contents`, nunca en `systemInstruction`.
    // Si la pregunta apareciese aquí, un admin podría sobrescribir las reglas.
    const instruccion = construirInstruccionSistema(contextoCompleto);
    expect(instruccion).not.toContain('¿Cuál barbero facturó más?');
  });

  test('declara solo lectura — no puede modificar nada', () => {
    const instruccion = construirInstruccionSistema(contextoCompleto);
    expect(instruccion.toLowerCase()).toContain('solo lectura');
  });

  test('incluye cifras del resumen financiero', () => {
    const instruccion = construirInstruccionSistema(contextoCompleto);
    // Cualquier representación de 500000 (con o sin separador de miles)
    expect(instruccion).toMatch(/500[.,]?000/);
  });

  test('incluye nombres de barberos del top', () => {
    const instruccion = construirInstruccionSistema(contextoCompleto);
    expect(instruccion).toContain('Sebastian Trujillo');
    expect(instruccion).toContain('Karoll Orjuela');
  });

  test('incluye categorías de egreso', () => {
    const instruccion = construirInstruccionSistema(contextoCompleto);
    expect(instruccion).toContain('Arriendo');
    expect(instruccion).toContain('Servicios públicos');
  });

  test('con contexto vacío informa que no hay datos de facturación', () => {
    const instruccion = construirInstruccionSistema(contextoVacio);
    expect(instruccion.toLowerCase()).toContain('sin datos');
  });

  test('con egresos vacíos informa que no hay egresos', () => {
    const instruccion = construirInstruccionSistema(contextoVacio);
    expect(instruccion.toLowerCase()).toContain('sin egresos');
  });

  test('nunca contiene la clave de API', () => {
    // Garantía de que GEMINI_API_KEY no se filtra al prompt bajo ninguna circunstancia.
    process.env.GEMINI_API_KEY = 'clave-ultra-secreta-de-prueba';
    const instruccion = construirInstruccionSistema(contextoCompleto);
    expect(instruccion).not.toContain('clave-ultra-secreta-de-prueba');
    delete process.env.GEMINI_API_KEY;
  });

  test('indica que responde en español', () => {
    const instruccion = construirInstruccionSistema(contextoCompleto);
    expect(instruccion.toLowerCase()).toContain('español');
  });
});
