const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const { AppError } = require('./AppError');

/**
 * Firma el token de sesión.
 * @param {{ idBarbero: number, idBarberia: number, esAdmin: boolean }} payload
 */
function firmarToken(payload) {
  if (!config.jwt.secret) {
    throw new Error('JWT_SECRET no está configurado en server/.env');
  }
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

/**
 * Verifica y decodifica el token. Lanza AppError 401 si no sirve, para que
 * el middleware `autenticar` no tenga que interpretar los errores de la librería.
 */
function verificarToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Tu sesión expiró. Inicia sesión de nuevo.', 401);
    }
    throw new AppError('Sesión inválida. Inicia sesión de nuevo.', 401);
  }
}

module.exports = { firmarToken, verificarToken };
