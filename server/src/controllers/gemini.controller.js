const geminiService = require('../services/gemini.service');

/** POST /api/asistente — autenticado y exclusivo del administrador. */
async function consultar(req, res) {
  const resultado = await geminiService.consultarAsistente({
    idBarberia: req.usuario.idBarberia,
    pregunta: req.body.pregunta,
  });

  res.json(resultado);
}

module.exports = { consultar };
