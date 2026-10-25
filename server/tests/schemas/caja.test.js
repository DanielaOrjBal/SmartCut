/**
 * Tests del schema de caja diaria (Fase 2).
 * Regla clave: montoCaja admite 0 (a diferencia de `monto` de finanzas).
 */
const { abrirCajaSchema, cerrarCajaSchema } = require('../../src/schemas/caja.schema');

describe('abrirCajaSchema', () => {
  test('acepta monto 0 — caja sin fondo inicial', () => {
    const resultado = abrirCajaSchema.parse({ montoApertura: 0 });
    expect(resultado.montoApertura).toBe(0);
  });

  test('acepta monto positivo con observación', () => {
    const resultado = abrirCajaSchema.parse({
      montoApertura: 50000,
      observacion: 'Fondo inicial del día',
    });
    expect(resultado.montoApertura).toBe(50000);
    expect(resultado.observacion).toBe('Fondo inicial del día');
  });

  test('rechaza monto negativo', () => {
    expect(() => abrirCajaSchema.parse({ montoApertura: -1 })).toThrow();
  });

  test('observacion es opcional', () => {
    const resultado = abrirCajaSchema.parse({ montoApertura: 10000 });
    expect(resultado.observacion).toBeUndefined();
  });

  test('observacion no puede superar 500 caracteres', () => {
    expect(() =>
      abrirCajaSchema.parse({ montoApertura: 0, observacion: 'x'.repeat(501) }),
    ).toThrow();
  });
});

describe('cerrarCajaSchema', () => {
  test('acepta montoCierre 0 — caja cerrada sin efectivo', () => {
    const resultado = cerrarCajaSchema.parse({ montoCierre: 0 });
    expect(resultado.montoCierre).toBe(0);
  });

  test('rechaza si falta montoCierre', () => {
    expect(() => cerrarCajaSchema.parse({})).toThrow();
  });

  test('coerce string numérico', () => {
    const resultado = cerrarCajaSchema.parse({ montoCierre: '75000' });
    expect(resultado.montoCierre).toBe(75000);
  });
});
