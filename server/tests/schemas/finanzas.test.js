/**
 * Tests de los schemas financieros (Fases 1 y 3).
 */
const {
  crearMovimientoSchema,
  anularMovimientoSchema,
} = require('../../src/schemas/finanzas.schema');

describe('crearMovimientoSchema', () => {
  const base = { tipo: 'gasto', categoriaId: 3, monto: 200000, fecha: '2026-09-01' };

  test('valida un gasto mínimo válido', () => {
    const resultado = crearMovimientoSchema.parse(base);
    expect(resultado.tipo).toBe('gasto');
    expect(resultado.monto).toBe(200000);
  });

  test('rechaza tipo fuera del enum', () => {
    expect(() => crearMovimientoSchema.parse({ ...base, tipo: 'donacion' })).toThrow();
  });

  test('rechaza monto 0', () => {
    expect(() => crearMovimientoSchema.parse({ ...base, monto: 0 })).toThrow();
  });

  test('rechaza monto negativo', () => {
    expect(() => crearMovimientoSchema.parse({ ...base, monto: -500 })).toThrow();
  });

  test('rechaza fecha con formato incorrecto', () => {
    expect(() =>
      crearMovimientoSchema.parse({ ...base, fecha: '01/09/2026' }),
    ).toThrow();
  });

  test('acepta compra con cantidad y unidad', () => {
    const resultado = crearMovimientoSchema.parse({
      tipo: 'compra',
      categoriaId: 6,
      monto: 50000,
      fecha: '2026-09-10',
      cantidad: 5,
      unidadMedida: 'unidades',
    });
    expect(resultado.cantidad).toBe(5);
    expect(resultado.unidadMedida).toBe('unidades');
  });
});

describe('anularMovimientoSchema', () => {
  const base = { fecha: '2026-09-07', motivo: 'Se registró por error' };

  test('valida anulación correcta', () => {
    const resultado = anularMovimientoSchema.parse(base);
    expect(resultado.motivo).toBe('Se registró por error');
  });

  test('rechaza si falta el motivo', () => {
    expect(() => anularMovimientoSchema.parse({ fecha: '2026-09-07' })).toThrow();
  });

  test('rechaza motivo vacío', () => {
    expect(() =>
      anularMovimientoSchema.parse({ fecha: '2026-09-07', motivo: '  ' }),
    ).toThrow();
  });

  test('rechaza si falta la fecha', () => {
    expect(() =>
      anularMovimientoSchema.parse({ motivo: 'Error de registro' }),
    ).toThrow();
  });
});
