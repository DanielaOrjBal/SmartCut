const path = require('node:path');

// Se resuelve la ruta contra este archivo y no contra process.cwd(), para que
// el .env se encuentre igual se arranque desde server/ o desde la raíz.
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: Number(process.env.PORT) || 4000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '??',
    database: process.env.DB_NAME || 'smartcut',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

/**
 * Avisa temprano de la configuración que falta. Sin JWT_SECRET el login
 * fallaría recién al primer intento de sesión, que es muy tarde para darse
 * cuenta; mejor gritarlo al arrancar.
 */
function validarConfig() {
  const faltantes = [];
  if (!process.env.JWT_SECRET) faltantes.push('JWT_SECRET');
  if (!process.env.DB_NAME) faltantes.push('DB_NAME');
  return faltantes;
}

module.exports = { config, validarConfig };
