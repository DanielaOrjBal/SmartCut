const rateLimit = require('express-rate-limit');

/**
 * Mensaje de error uniforme para respuestas de rate limit.
 * Express-rate-limit v7 llama a handler cuando se supera el límite;
 * aquí se devuelve el mismo formato { mensaje } que usa el resto de la API.
 */
function handlerLimite(req, res) {
  res.status(429).json({ mensaje: 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.' });
}

/** Login: 5 intentos por IP cada 15 minutos. Evita fuerza bruta. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: handlerLimite,
});

/** Reservas públicas: 10 solicitudes por IP por minuto. Evita spam de citas. */
const reservaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: handlerLimite,
});

/** General: 60 solicitudes por IP por minuto para el resto de rutas. */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: handlerLimite,
});

module.exports = { loginLimiter, reservaLimiter, generalLimiter };
