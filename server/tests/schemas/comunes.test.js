/**
 * Tests de los validadores compartidos (comunes.js).
 * Cubre: monto, montoCaja, medioPago, fecha, correo, idParam.
 */
const { z } = require('zod');
const {
  monto,
  fecha,
  correo,
  idParam,
  medioPago,
} = require('../../src/schemas/comunes');

describe('monto', () => {
  test('acepta número positivo', () => {
    expect(monto.parse(50000)).toBe(50000);
    expect(monto.parse('25000')).toBe(25000);
  });

  test('rechaza cero', () => {
    expect(() => monto.parse(0)).toThrow();
  });

  test('rechaza negativo', () => {
    expect(() => monto.parse(-1)).toThrow();
  });

  test('rechaza string no numérico', () => {
    expect(() => monto.parse('abc')).toThrow();
  });
});

describe('fecha', () => {
  test('acepta AAAA-MM-DD', () => {
    expect(fecha.parse('2026-09-26')).toBe('2026-09-26');
  });

  test('rechaza formato incorrecto', () => {
    expect(() => fecha.parse('26-09-2026')).toThrow();
    expect(() => fecha.parse('2026/09/26')).toThrow();
    expect(() => fecha.parse('hoy')).toThrow();
  });
});

describe('correo', () => {
  test('normaliza a minúsculas', () => {
    expect(correo.parse('ADMIN@SMARTCUT.COM')).toBe('admin@smartcut.com');
  });

  test('rechaza correo inválido', () => {
    expect(() => correo.parse('noesuncorreo')).toThrow();
    expect(() => correo.parse('')).toThrow();
  });
});

describe('idParam', () => {
  test('convierte string numérico a número entero', () => {
    expect(idParam.parse('42')).toBe(42);
    expect(idParam.parse(5)).toBe(5);
  });

  test('rechaza cero y negativos', () => {
    expect(() => idParam.parse(0)).toThrow();
    expect(() => idParam.parse(-1)).toThrow();
  });

  test('rechaza string no numérico', () => {
    expect(() => idParam.parse('abc')).toThrow();
  });
});

describe('medioPago', () => {
  const VALIDOS = ['efectivo', 'tarjeta', 'nequi', 'pse', 'bre_b'];

  test.each(VALIDOS)('acepta "%s"', (valor) => {
    expect(medioPago.parse(valor)).toBe(valor);
  });

  test('rechaza valor fuera del enum', () => {
    expect(() => medioPago.parse('bitcoin')).toThrow();
    expect(() => medioPago.parse('')).toThrow();
  });
});
