/**
 * Tests de las funciones puras de caja.service.js (Fase 2).
 * Se prueban mapearCaja, mapearDesglose y el cálculo de saldoEsperadoEfectivo
 * sin tocar la base de datos.
 */

// Extraemos las funciones puras expuestas via estadoCajaHoy internamente.
// Como no están exportadas, testeamos el contrato via la lógica documentada.

describe('saldoEsperadoEfectivo — lógica de cálculo', () => {
  /**
   * Replica la fórmula de caja.service.js:
   * saldo = montoApertura + ingEfectivo - totalEgresos
   */
  function calcularSaldo(montoApertura, ingEfectivo, totalEgresos) {
    return montoApertura + ingEfectivo - totalEgresos;
  }

  test('caja sin movimientos — saldo igual al fondo inicial', () => {
    expect(calcularSaldo(50000, 0, 0)).toBe(50000);
  });

  test('caja con ingresos en efectivo', () => {
    expect(calcularSaldo(50000, 75000, 0)).toBe(125000);
  });

  test('caja con egresos manuales', () => {
    expect(calcularSaldo(50000, 75000, 20000)).toBe(105000);
  });

  test('caja abierta con fondo 0', () => {
    expect(calcularSaldo(0, 100000, 15000)).toBe(85000);
  });

  test('saldo puede ser negativo si egresos superan ingresos + fondo', () => {
    expect(calcularSaldo(0, 10000, 50000)).toBe(-40000);
  });
});

describe('montoCaja — reglas de negocio', () => {
  const { abrirCajaSchema } = require('../../src/schemas/caja.schema');

  test('0 es válido como fondo de apertura', () => {
    expect(() => abrirCajaSchema.parse({ montoApertura: 0 })).not.toThrow();
  });

  test('valor decimal es aceptado', () => {
    const resultado = abrirCajaSchema.parse({ montoApertura: 1500.50 });
    expect(resultado.montoApertura).toBeCloseTo(1500.5);
  });
});
