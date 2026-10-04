/**
 * Utilidades compartidas entre los tests de integración.
 */
process.env.TZ = 'America/Bogota';
process.env.JWT_SECRET = 'secreto-de-prueba-fase5';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/** Genera un JWT de administrador para los tests. */
function tokenAdmin(idBarberia = 4, idBarbero = 11) {
  return jwt.sign(
    { idBarbero, idBarberia, esAdmin: true, correo: 'danielaorjbal@gmail.com' },
    JWT_SECRET,
    { expiresIn: '1h' },
  );
}

/** Genera un JWT de barbero (no admin) para los tests. */
function tokenBarbero(idBarberia = 4, idBarbero = 12) {
  return jwt.sign(
    { idBarbero, idBarberia, esAdmin: false, correo: 'juansetrujillo28@gmail.com' },
    JWT_SECRET,
    { expiresIn: '1h' },
  );
}

/** Cabecera Authorization lista para supertest. */
function bearer(token) {
  return `Bearer ${token}`;
}

module.exports = { tokenAdmin, tokenBarbero, bearer };
