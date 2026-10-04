const { GoogleGenAI } = require('@google/genai');
const { config } = require('./env');
const { AppError } = require('../utils/AppError');

/**
 * Gemini solo se inicializa en el backend. La app móvil jamás conoce la clave.
 * La creación diferida permite arrancar y probar el resto de la API sin una
 * clave configurada.
 */
function obtenerClienteGemini() {
  if (!config.gemini.apiKey) {
    throw new AppError(
      'El asistente financiero no está configurado. Agrega GEMINI_API_KEY en server/.env.',
      503,
    );
  }

  return new GoogleGenAI({ apiKey: config.gemini.apiKey });
}

module.exports = { obtenerClienteGemini };
