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
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    // Se mantiene configurable para cambiar de modelo sin desplegar código.
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 15_000,
  },
  googlePlaces: {
    apiKey: process.env.GOOGLE_PLACES_KEY || '',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'SmartCut <reservas@smartcut.co>',
  },
  web: {
    // URL base de la web pública (para generar los enlaces de cancelar/reprogramar)
    baseUrl: process.env.WEB_BASE_URL || 'http://localhost:5173',
  },
  // Orígenes permitidos en CORS. En .env se separan por coma:
  // ALLOWED_ORIGINS=http://localhost:5173,exp://192.168.1.10:8081
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
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
  if (!process.env.SMTP_USER) faltantes.push('SMTP_USER');
  if (!process.env.SMTP_PASS) faltantes.push('SMTP_PASS');
  return faltantes;
}

module.exports = { config, validarConfig };
