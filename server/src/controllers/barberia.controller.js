const barberiaService = require('../services/barberia.service');

/** GET /api/barberia — JWT + soloAdmin */
async function obtenerBarberia(req, res) {
  const barberia = await barberiaService.obtenerBarberia(req.usuario.idBarberia);
  res.json({ barberia });
}

/** PATCH /api/barberia/horario — JWT + soloAdmin */
async function actualizarHorario(req, res) {
  const barberia = await barberiaService.actualizarHorario({
    idBarberia: req.usuario.idBarberia,
    ...req.body,
  });
  res.json({ barberia });
}

module.exports = { obtenerBarberia, actualizarHorario };
