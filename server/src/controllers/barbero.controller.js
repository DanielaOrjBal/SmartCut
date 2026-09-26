const barberoService = require('../services/barbero.service');
const { AppError } = require('../utils/AppError');

/** POST /api/barberos — JWT + soloAdmin */
async function crearBarbero(req, res) {
  const barbero = await barberoService.crearBarbero({
    idBarberia: req.usuario.idBarberia,
    barbero: req.body,
  });

  res.status(201).json({ barbero });
}

/** GET /api/barberia/:id/barberos — JWT + soloAdmin */
async function listarBarberos(req, res) {
  // Ser admin no basta: hay que ser admin DE ESTA barbería. Sin esta
  // comprobación, cualquier dueño podría listar el equipo de otro negocio.
  if (req.params.id !== req.usuario.idBarberia) {
    throw new AppError('No puedes consultar el equipo de otra barbería.', 403);
  }

  const barberos = await barberoService.listarBarberos(req.usuario.idBarberia);
  res.json({ barberos });
}

module.exports = { crearBarbero, listarBarberos };
