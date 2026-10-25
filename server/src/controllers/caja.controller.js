const cajaService = require('../services/caja.service');
const { resolverPeriodo } = require('../utils/periodo');

/** POST /api/caja/abrir — solo admin */
async function abrirCaja(req, res) {
  const { montoApertura, observacion } = req.body;

  const caja = await cajaService.abrirCaja({
    idBarberia: req.usuario.idBarberia,
    idBarbero: req.usuario.idBarbero,
    montoApertura,
    observacion,
  });

  res.status(201).json({ caja });
}

/** POST /api/caja/cerrar — solo admin */
async function cerrarCaja(req, res) {
  const { montoCierre, observacion } = req.body;

  const caja = await cajaService.cerrarCaja({
    idBarberia: req.usuario.idBarberia,
    idBarbero: req.usuario.idBarbero,
    montoCierre,
    observacion,
  });

  res.json({ caja });
}

/** GET /api/caja/hoy — solo admin */
async function estadoCajaHoy(req, res) {
  const estado = await cajaService.estadoCajaHoy({
    idBarberia: req.usuario.idBarberia,
  });

  res.json(estado);
}

/** GET /api/caja/historial — solo admin */
async function historialCaja(req, res) {
  const { periodo, desde, hasta } = req.queryValidada;

  const resultado = await cajaService.historialCaja({
    idBarberia: req.usuario.idBarberia,
    periodo,
    desde,
    hasta,
  });

  res.json(resultado);
}

module.exports = { abrirCaja, cerrarCaja, estadoCajaHoy, historialCaja };
