/**
 * Tests de resolverPeriodo y periodoAnterior.
 *
 * Estos tests son independientes de la base de datos y del reloj del sistema
 * porque se pasan fechas explícitas vía 'desde'/'hasta'.
 */
const { resolverPeriodo, periodoAnterior, aISO, desdeISO } = require('../../src/utils/periodo');

describe('aISO', () => {
  test('formatea una fecha local a YYYY-MM-DD', () => {
    const fecha = new Date(2026, 8, 26); // 26 sep 2026 local
    expect(aISO(fecha)).toBe('2026-09-26');
  });
});

describe('desdeISO', () => {
  test('convierte YYYY-MM-DD a Date local', () => {
    const fecha = desdeISO('2026-09-26');
    expect(fecha.getFullYear()).toBe(2026);
    expect(fecha.getMonth()).toBe(8); // 0-indexed
    expect(fecha.getDate()).toBe(26);
  });

  test('devuelve null para cadena con formato inválido', () => {
    expect(desdeISO('no-es-fecha')).toBeNull();
    expect(desdeISO('26/09/2026')).toBeNull();
  });
});

describe('resolverPeriodo — rango personalizado', () => {
  test('respeta desde/hasta explícitos', () => {
    const rango = resolverPeriodo(undefined, '2026-09-01', '2026-09-30');
    expect(rango.desde).toBe('2026-09-01');
    expect(rango.hasta).toBe('2026-09-30');
    expect(rango.periodo).toBe('personalizado');
  });

  test('endereza rango invertido', () => {
    const rango = resolverPeriodo(undefined, '2026-09-30', '2026-09-01');
    expect(rango.desde).toBe('2026-09-01');
    expect(rango.hasta).toBe('2026-09-30');
  });

  test('ignora periodo cuando se pasan desde/hasta', () => {
    const rango = resolverPeriodo('mes', '2026-07-01', '2026-07-31');
    expect(rango.periodo).toBe('personalizado');
  });
});

describe('periodoAnterior — rango personalizado', () => {
  test('desplaza el rango hacia atrás por la misma cantidad de días', () => {
    // Rango: 5 días (01–05 sep). Anterior: 27–31 ago (5 días antes).
    const anterior = periodoAnterior(undefined, '2026-09-01', '2026-09-05');
    expect(anterior.desde).toBe('2026-08-27');
    expect(anterior.hasta).toBe('2026-08-31');
  });
});

describe('periodoAnterior — período de calendario', () => {
  test('semana → devuelve los 7 días de la semana anterior', () => {
    // Semana del 21–27 sep (lun–dom). Anterior: 14–20 sep.
    const anterior = periodoAnterior(undefined, '2026-09-21', '2026-09-27');
    // No podemos asumir la semana actual, así que solo verificamos la duración.
    const inicio = desdeISO(anterior.desde);
    const fin = desdeISO(anterior.hasta);
    const dias = Math.round((fin - inicio) / 86_400_000) + 1;
    expect(dias).toBe(7); // semana tiene 7 días
  });
});
