const finanzasService = require('../services/finanzas.service');

/** GET /api/finanzas/resumen?periodo — JWT + soloAdmin */
async function resumen(req, res) {
  const { periodo, desde, hasta } = req.queryValidada;
  const datos = await finanzasService.resumen({
    idBarberia: req.usuario.idBarberia,
    periodo,
    desde,
    hasta,
  });
  res.json(datos);
}

/**
 * GET /api/finanzas/serie?desde&hasta&barberoId — requiere JWT
 *
 * Misma regla que la agenda: si no eres admin, el `barberoId` de la URL se
 * ignora y se usa el tuyo. Y eso no es solo una restricción de acceso: cuando
 * `sp_serie_ingresos_diarios` recibe un barbero, devuelve su COMISIÓN en vez
 * de la facturación, que es justo la cifra que le corresponde ver.
 */
async function serie(req, res) {
  const { periodo, desde, hasta, barberoId } = req.queryValidada;
  const idBarbero = req.usuario.esAdmin ? (barberoId ?? null) : req.usuario.idBarbero;

  const datos = await finanzasService.serie({
    idBarberia: req.usuario.idBarberia,
    idBarbero,
    periodo,
    desde,
    hasta,
  });
  res.json(datos);
}

/**
 * GET /api/finanzas/ranking?desde&hasta — requiere JWT
 *
 * Al barbero se le devuelve solo su fila, con su posición y el total. El
 * recorte lo hace el servicio antes de responder: los nombres y las cifras de
 * sus compañeros nunca salen del servidor.
 */
async function ranking(req, res) {
  const { periodo, desde, hasta } = req.queryValidada;
  const datos = await finanzasService.ranking({
    idBarberia: req.usuario.idBarberia,
    idBarbero: req.usuario.idBarbero,
    esAdmin: req.usuario.esAdmin,
    periodo,
    desde,
    hasta,
  });
  res.json(datos);
}

/** GET /api/finanzas/gastos-anuales — JWT + soloAdmin */
async function gastosAnuales(req, res) {
  const meses = await finanzasService.gastosAnuales(req.usuario.idBarberia);
  res.json({ meses });
}

/** GET /api/finanzas/egresos-categoria?desde&hasta — JWT + soloAdmin */
async function egresosPorCategoria(req, res) {
  const { periodo, desde, hasta } = req.queryValidada;
  const datos = await finanzasService.egresosPorCategoria({
    idBarberia: req.usuario.idBarberia,
    periodo,
    desde,
    hasta,
  });
  res.json(datos);
}

/** GET /api/finanzas/movimientos?desde&hasta&tipo — JWT + soloAdmin */
async function listarMovimientos(req, res) {
  const { periodo, desde, hasta, tipo } = req.queryValidada;
  const datos = await finanzasService.listarMovimientos({
    idBarberia: req.usuario.idBarberia,
    periodo,
    desde,
    hasta,
    tipo,
  });
  res.json(datos);
}

/**
 * GET /api/finanzas/mis-movimientos?desde&hasta — requiere JWT
 *
 * La versión del barbero: sus atenciones del período con el monto cobrado y su
 * comisión. El id sale del token y el tipo queda fijo en 'ingreso', así que por
 * esta ruta no hay forma de asomarse a los gastos del negocio ni a lo de otro.
 */
async function misMovimientos(req, res) {
  const { periodo, desde, hasta } = req.queryValidada;
  const datos = await finanzasService.listarMovimientos({
    idBarberia: req.usuario.idBarberia,
    idBarbero: req.usuario.idBarbero,
    periodo,
    desde,
    hasta,
    tipo: 'ingreso',
  });
  res.json(datos);
}

/** POST /api/finanzas/movimientos — JWT + soloAdmin */
async function registrarMovimiento(req, res) {
  const movimiento = await finanzasService.registrarMovimiento({
    idBarberia: req.usuario.idBarberia,
    idRegistradoPor: req.usuario.idBarbero,
    movimiento: req.body,
  });
  res.status(201).json({ movimiento });
}

/** PATCH /api/finanzas/movimientos/:id/anular — JWT + soloAdmin */
async function anularMovimiento(req, res) {
  const movimiento = await finanzasService.anularMovimiento({
    idBarberia: req.usuario.idBarberia,
    idMovimiento: req.params.id,
    fecha: req.body.fecha,
    motivo: req.body.motivo,
  });
  res.json({ movimiento, mensaje: 'El movimiento quedó anulado.' });
}

/** GET /api/finanzas/categorias?tipo — JWT + soloAdmin */
async function listarCategorias(req, res) {
  const categorias = await finanzasService.listarCategorias({
    idBarberia: req.usuario.idBarberia,
    tipo: req.queryValidada.tipo,
  });
  res.json({ categorias });
}

/** POST /api/finanzas/categorias — JWT + soloAdmin */
async function crearCategoria(req, res) {
  const categoria = await finanzasService.crearCategoria({
    idBarberia: req.usuario.idBarberia,
    nombre: req.body.nombre,
    tipo: req.body.tipo,
  });
  res.status(201).json({ categoria });
}

/** GET /api/finanzas/informe?anio&mes — JWT + soloAdmin */
async function informeMensual(req, res) {
  const informe = await finanzasService.informeMensual({
    idBarberia: req.usuario.idBarberia,
    anio: req.queryValidada.anio,
    mes: req.queryValidada.mes,
  });
  res.json({ informe });
}

module.exports = {
  resumen,
  serie,
  ranking,
  gastosAnuales,
  egresosPorCategoria,
  listarMovimientos,
  misMovimientos,
  registrarMovimiento,
  anularMovimiento,
  listarCategorias,
  crearCategoria,
  informeMensual,
};
