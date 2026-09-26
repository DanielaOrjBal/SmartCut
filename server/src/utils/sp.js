/**
 * Ayudas para leer lo que devuelven los CALL a procedimientos almacenados.
 *
 * mysql2 no devuelve siempre la misma forma, y esto está VERIFICADO contra la
 * base real, no asumido:
 *
 *   CALL con SELECT (sp_crear_barberia_con_admin, sp_crear_servicio, ...)
 *     → [ [fila, ...], ResultSetHeader ]
 *
 *   CALL sin SELECT (sp_configurar_horario, sp_registrar_acceso, ...)
 *     → ResultSetHeader          ← ¡NO es un array!
 *
 * Por eso un `resultado[0][0]` a ciegas revienta con los del segundo grupo.
 * Estas funciones recorren el resultado buscando el primer conjunto de filas.
 */

/** Primera fila del primer conjunto de resultados no vacío, o null. */
function primeraFila(resultado) {
  if (!Array.isArray(resultado)) {
    return null;
  }
  for (const conjunto of resultado) {
    if (Array.isArray(conjunto) && conjunto.length > 0) {
      return conjunto[0];
    }
  }
  return null;
}

/** Primer conjunto de filas (puede venir vacío), o []. */
function filas(resultado) {
  if (!Array.isArray(resultado)) {
    return [];
  }
  for (const conjunto of resultado) {
    if (Array.isArray(conjunto)) {
      return conjunto;
    }
  }
  return [];
}

/** Convierte '' y undefined en null, que es lo que espera la base. */
function oNulo(valor) {
  if (valor === undefined || valor === null) {
    return null;
  }
  if (typeof valor === 'string' && valor.trim().length === 0) {
    return null;
  }
  return valor;
}

module.exports = { primeraFila, filas, oNulo };
