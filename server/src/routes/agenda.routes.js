const { Router } = require('express');

const { validar } = require('../middlewares/validar');
const { autenticar } = require('../middlewares/autenticar');
const {
  agendaQuerySchema,
  crearAtencionSchema,
  estadoCitaSchema,
  idParamsSchema,
} = require('../schemas/dashboard.schema');
const agendaController = require('../controllers/agenda.controller');

const router = Router();

// GET /api/agenda
router.get(
  '/agenda',
  autenticar,
  validar(agendaQuerySchema, 'query'),
  agendaController.listarAgenda,
);

// POST /api/atenciones
router.post(
  '/atenciones',
  autenticar,
  validar(crearAtencionSchema),
  agendaController.registrarAtencion,
);

// PATCH /api/citas/:id/estado
router.patch(
  '/citas/:id/estado',
  autenticar,
  validar(idParamsSchema, 'params'),
  validar(estadoCitaSchema),
  agendaController.cambiarEstadoCita,
);

module.exports = router;
