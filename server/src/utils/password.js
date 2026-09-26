const bcrypt = require('bcrypt');
const crypto = require('node:crypto');

const RONDAS = 10;

/**
 * Hashea una contraseña. SIEMPRE en el servidor, nunca en la app: si el
 * cliente enviara el hash, ese hash *sería* la contraseña y bastaría con
 * robarlo de la base de datos para entrar.
 */
async function hashear(textoPlano) {
  return bcrypt.hash(textoPlano, RONDAS);
}

/** Compara la contraseña en texto plano contra el hash almacenado. */
async function comparar(textoPlano, hash) {
  return bcrypt.compare(textoPlano, hash);
}

/**
 * Clave provisional para un barbero recién creado: 8 caracteres hex.
 * Se devuelve en texto plano UNA sola vez, en la respuesta del onboarding,
 * para que el dueño se la entregue. Después solo queda el hash.
 */
function generarProvisional() {
  return crypto.randomBytes(4).toString('hex');
}

/**
 * Hash de una contraseña aleatoria que nadie conoce, generado al arrancar.
 * Sirve de señuelo: ver más abajo.
 */
const HASH_SENUELO = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), RONDAS);

/**
 * Gasta el mismo tiempo que una comparación real, sin comparar nada útil.
 *
 * Si el login respondiera 401 al instante cuando el correo no existe, pero se
 * demorara los ~80 ms de bcrypt cuando sí existe, esa diferencia de tiempo
 * revelaría qué correos están registrados — justo lo que el 401 genérico
 * intenta ocultar. Con esto ambos caminos tardan lo mismo.
 */
async function compararSenuelo() {
  await bcrypt.compare('contrasena-que-no-existe', HASH_SENUELO);
}

module.exports = { hashear, comparar, generarProvisional, compararSenuelo };
