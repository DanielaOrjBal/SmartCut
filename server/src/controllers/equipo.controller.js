const equipoService = require('../services/equipo.service');

/** GET /api/equipo?periodo — JWT + soloAdmin */
async function listarEquipo(req, res) {
  const { periodo, desde, hasta } = req.queryValidada;
  const datos = await equipoService.listarEquipo({
    idBarberia: req.usuario.idBarberia,
    periodo,
    desde,
    hasta,
  });
  res.json(datos);
}

/** GET /api/equipo/:id?periodo — JWT + soloAdmin */
async function detalleBarbero(req, res) {
  const { periodo, desde, hasta } = req.queryValidada;
  const datos = await equipoService.detalleBarbero({
    idBarberia: req.usuario.idBarberia,
    idBarbero: req.params.id,
    periodo,
    desde,
    hasta,
  });
  res.json(datos);
}

/**
 * POST /api/equipo/:id/ausencias — JWT + soloAdmin
 *
 * Con `esIncapacidad: true` el servicio además pasa al barbero a estado
 * 'incapacitado', que es lo que hace que un trigger cancele sus citas futuras.
 */
async function registrarAusencia(req, res) {
  const ausencia = await equipoService.registrarAusencia({
    idBarberia: req.usuario.idBarberia,
    idBarbero: req.params.id,
    ausencia: req.body,
  });
  res.status(201).json({ ausencia });
}

/** PATCH /api/equipo/:id/estado — JWT + soloAdmin */
async function cambiarEstado(req, res) {
  const barbero = await equipoService.cambiarEstado({
    idBarberia: req.usuario.idBarberia,
    idBarbero: req.params.id,
    estado: req.body.estado,
  });
  res.json({ barbero });
}

/** PATCH /api/equipo/:id/comision — JWT + soloAdmin */
async function cambiarComision(req, res) {
  const barbero = await equipoService.cambiarComision({
    idBarberia: req.usuario.idBarberia,
    idBarbero: req.params.id,
    porcentaje: req.body.porcentaje,
  });
  res.json({ barbero });
}

module.exports = {
  listarEquipo,
  detalleBarbero,
  registrarAusencia,
  cambiarEstado,
  cambiarComision,
};
