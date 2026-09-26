const dashboardService = require('../services/dashboard.service');

/**
 * Sin try/catch a propósito: Express 5 reenvía el rechazo de una función async
 * al errorHandler, que ya traduce los SIGNAL de los procedimientos.
 */

/**
 * GET /api/dashboard/barbero — requiere JWT
 *
 * Siempre devuelve el resumen de QUIEN PREGUNTA. El administrador lo usa para
 * su capa "Mi trabajo", donde ve sus propias cifras de atención igual que
 * cualquier barbero.
 */
async function resumenBarbero(req, res) {
  const resumen = await dashboardService.resumenBarbero(req.usuario.idBarbero);
  res.json({ resumen });
}

/** GET /api/dashboard/barberia — JWT + soloAdmin */
async function resumenBarberia(req, res) {
  const resumen = await dashboardService.resumenBarberia(req.usuario.idBarberia);
  res.json({ resumen });
}

/** GET /api/perfil — requiere JWT */
async function obtenerPerfil(req, res) {
  const perfil = await dashboardService.perfil(req.usuario.idBarbero);
  res.json({ perfil });
}

/** GET /api/servicios — requiere JWT. Alimenta el modal de registro de atención. */
async function listarServicios(req, res) {
  const servicios = await dashboardService.listarServicios(req.usuario.idBarberia);
  res.json({ servicios });
}

module.exports = { resumenBarbero, resumenBarberia, obtenerPerfil, listarServicios };
