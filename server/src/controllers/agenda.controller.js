const agendaService = require('../services/agenda.service');
const { resolverPeriodo } = require('../utils/periodo');
const { AppError } = require('../utils/AppError');

/**
 * Decide qué barbero se consulta.
 *
 * Si quien pregunta NO es administrador, se descarta lo que haya llegado en la
 * URL y se fuerza su propio id. Un barbero no puede ver la agenda de otro
 * aunque manipule la dirección: el filtro no depende de lo que él mande, sino
 * de lo que dice su token firmado.
 *
 * El administrador sí elige: un id concreto, o `undefined` para ver a todos.
 */
function resolverBarberoFiltrado(usuario, barberoIdDeLaConsulta) {
  return usuario.esAdmin ? (barberoIdDeLaConsulta ?? null) : usuario.idBarbero;
}

/** GET /api/agenda?periodo|desde&hasta&barberoId — requiere JWT */
async function listarAgenda(req, res) {
  const { periodo, desde, hasta, barberoId } = req.queryValidada;
  const rango = resolverPeriodo(periodo, desde, hasta);

  const citas = await agendaService.listarAgenda({
    idBarberia: req.usuario.idBarberia,
    idBarbero: resolverBarberoFiltrado(req.usuario, barberoId),
    desde: rango.desde,
    hasta: rango.hasta,
  });

  res.json({ rango, citas });
}

/**
 * POST /api/atenciones — requiere JWT
 *
 * La atención SIEMPRE se registra a nombre de quien la envía. No se acepta un
 * `barberoId` en el cuerpo: nadie factura por otro.
 */
async function registrarAtencion(req, res) {
  const atencion = await agendaService.registrarAtencion({
    idBarbero: req.usuario.idBarbero,
    nombreCliente: req.body.nombreCliente,
    servicios: req.body.servicios,
  });

  res.status(201).json({ atencion });
}

/**
 * PATCH /api/citas/:id/estado — requiere JWT
 *
 * El administrador puede consultar la agenda completa, pero NO ejecutar
 * acciones sobre las citas de otros barberos: cada quien maneja las suyas. Por
 * eso la comprobación de pertenencia se hace siempre contra el id del token,
 * sea admin o no.
 */
async function cambiarEstadoCita(req, res) {
  const { estado, fecha, motivo } = req.body;

  const cita = await agendaService.buscarCitaDelDia({
    idBarberia: req.usuario.idBarberia,
    idBarbero: req.usuario.idBarbero,
    idCita: req.params.id,
    fecha,
  });

  if (cita === null) {
    throw new AppError('Esa cita no existe o no es tuya.', 404);
  }

  const actualizada = await agendaService.cambiarEstadoCita({
    cita,
    estado,
    motivo,
    esAdmin: req.usuario.esAdmin,
  });

  res.json({ cita: actualizada });
}

module.exports = { listarAgenda, registrarAtencion, cambiarEstadoCita };
