const { Router } = require('express');

const { validar } = require('../middlewares/validar');
const { autenticar, soloAdmin } = require('../middlewares/autenticar');
const {
  agendaQuerySchema,
  crearAtencionSchema,
  estadoCitaSchema,
  idParamsSchema,
} = require('../schemas/dashboard.schema');
const dashboardController = require('../controllers/dashboard.controller');
const agendaController = require('../controllers/agenda.controller');

const router = Router();

// ------------------------------------------------------------- dashboards ---

router.get('/dashboard/barbero', autenticar, dashboardController.resumenBarbero);
router.get('/dashboard/barberia', autenticar, soloAdmin, dashboardController.resumenBarberia);

router.get('/perfil', autenticar, dashboardController.obtenerPerfil);

// Catálogo para el modal de registro de atención. No está en la tabla original
// de endpoints, pero sin él ese modal no tendría servicios que ofrecer.
router.get('/servicios', autenticar, dashboardController.listarServicios);

// ----------------------------------------------------------------- agenda ---

router.get(
  '/agenda',
  autenticar,
  validar(agendaQuerySchema, 'query'),
  agendaController.listarAgenda,
);

router.post(
  '/atenciones',
  autenticar,
  validar(crearAtencionSchema),
  agendaController.registrarAtencion,
);

// Tampoco figura en la tabla, pero la agenda sin acciones no sirve de nada:
// confirmar, iniciar, finalizar, cancelar y marcar que no asistió pasan aquí.
router.patch(
  '/citas/:id/estado',
  autenticar,
  validar(idParamsSchema, 'params'),
  validar(estadoCitaSchema),
  agendaController.cambiarEstadoCita,
);

module.exports = router;
