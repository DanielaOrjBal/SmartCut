const onboardingService = require('../services/onboarding.service');

/**
 * POST /api/onboarding
 *
 * Recibe TODO el onboarding en una sola petición: la app acumula los 7 pasos
 * en memoria y solo aquí toca la red.
 *
 * Sin try/catch a propósito: Express 5 reenvía el rechazo de una función async
 * al errorHandler, que ya traduce los SIGNAL y los duplicados de MySQL.
 */
async function crearOnboarding(req, res) {
  const resultado = await onboardingService.crearOnboarding(req.body);
  res.status(201).json(resultado);
}

module.exports = { crearOnboarding };
