/**
 * Convierte un valor a número. Devuelve 0 si el resultado no es finito.
 * Centralizado aquí para que gemini.service y caja.service compartan la misma lógica.
 */
function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

module.exports = { numero };
