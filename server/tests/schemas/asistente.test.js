/**
 * Tests del schema del asistente Gemini (Fase 4).
 * Garantiza que el endpoint rechaza preguntas vacías, muy largas o sin formato.
 */
const { preguntaSchema } = require('../../src/schemas/asistente.schema');

describe('preguntaSchema', () => {
  test('acepta pregunta válida', () => {
    const resultado = preguntaSchema.parse({ pregunta: '¿Cuál fue el ingreso del mes?' });
    expect(resultado.pregunta).toBe('¿Cuál fue el ingreso del mes?');
  });

  test('recorta espacios iniciales y finales', () => {
    const resultado = preguntaSchema.parse({ pregunta: '  ¿Cuántos cortes se hicieron?  ' });
    expect(resultado.pregunta).toBe('¿Cuántos cortes se hicieron?');
  });

  test('rechaza pregunta vacía', () => {
    expect(() => preguntaSchema.parse({ pregunta: '' })).toThrow();
    expect(() => preguntaSchema.parse({ pregunta: '   ' })).toThrow();
  });

  test('rechaza pregunta sin el campo', () => {
    expect(() => preguntaSchema.parse({})).toThrow();
  });

  test('rechaza pregunta que supera 500 caracteres', () => {
    expect(() =>
      preguntaSchema.parse({ pregunta: 'a'.repeat(501) }),
    ).toThrow();
  });

  test('acepta pregunta de exactamente 500 caracteres', () => {
    const resultado = preguntaSchema.parse({ pregunta: 'a'.repeat(500) });
    expect(resultado.pregunta).toHaveLength(500);
  });
});
