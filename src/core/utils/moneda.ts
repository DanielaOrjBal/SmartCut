/**
 * Formato de moneda colombiana.
 *
 * El peso colombiano no usa decimales en el día a día: nadie cobra $25.000,50
 * por un corte. Por eso se redondea siempre y el separador de miles es punto,
 * como se escribe en Colombia ($25.000, no $25,000).
 *
 * `Intl.NumberFormat` no se usa a propósito: en Android el motor de JS de
 * React Native se compila sin los datos de configuración regional completos, y
 * 'es-CO' cae silenciosamente a la configuración de Estados Unidos, que
 * devolvería "$25,000". El formato se arma a mano para que sea idéntico en
 * las dos plataformas.
 *
 * ÚSALO EN TODAS PARTES. Nada de `toFixed` suelto.
 */
export function formatearCOP(valor: number | null | undefined): string {
  const numero = typeof valor === 'number' && Number.isFinite(valor) ? valor : 0;
  const signo = numero < 0 ? '-' : '';
  const entero = Math.round(Math.abs(numero)).toString();

  // Agrupa de a tres desde la derecha: 1234567 → 1.234.567
  const conPuntos = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${signo}$${conPuntos}`;
}

/**
 * Versión corta para los ejes de las gráficas, donde no cabe la cifra entera.
 * 1.850.000 → "$1,9 M"; 25.000 → "$25 k".
 */
export function formatearCOPCorto(valor: number | null | undefined): string {
  const numero = typeof valor === 'number' && Number.isFinite(valor) ? valor : 0;
  const absoluto = Math.abs(numero);
  const signo = numero < 0 ? '-' : '';

  if (absoluto >= 1_000_000) {
    const millones = (absoluto / 1_000_000).toFixed(1).replace('.', ',');
    return `${signo}$${millones.replace(',0', '')} M`;
  }
  if (absoluto >= 1000) {
    return `${signo}$${Math.round(absoluto / 1000)} k`;
  }
  return formatearCOP(numero);
}

/** Porcentaje con un decimal y signo explícito: "+18,4 %" / "-6,2 %". */
export function formatearPorcentaje(valor: number): string {
  const signo = valor > 0 ? '+' : '';
  return `${signo}${valor.toFixed(1).replace('.', ',')} %`;
}
