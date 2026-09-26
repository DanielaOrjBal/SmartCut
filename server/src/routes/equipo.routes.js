const { Router } = require('express');

const { validar } = require('../middlewares/validar');
const { autenticar, soloAdmin } = require('../middlewares/autenticar');
const {
  registrarAusenciaSchema,
  cambiarEstadoSchema,
  cambiarComisionSchema,
  equipoQuerySchema,
} = require('../schemas/equipo.schema');
const { idParamsSchema } = require('../schemas/dashboard.schema');
const equipoController = require('../controllers/equipo.controller');

const router = Router();

// Todo lo de este archivo cuelga de /api/equipo y es exclusivo del admin.
router.use(autenticar, soloAdmin);

router.get('/', validar(equipoQuerySchema, 'query'), equipoController.listarEquipo);

router.get(
  '/:id',
  validar(idParamsSchema, 'params'),
  validar(equipoQuerySchema, 'query'),
  equipoController.detalleBarbero,
);

router.post(
  '/:id/ausencias',
  validar(idParamsSchema, 'params'),
  validar(registrarAusenciaSchema),
  equipoController.registrarAusencia,
);

router.patch(
  '/:id/estado',
  validar(idParamsSchema, 'params'),
  validar(cambiarEstadoSchema),
  equipoController.cambiarEstado,
);

router.patch(
  '/:id/comision',
  validar(idParamsSchema, 'params'),
  validar(cambiarComisionSchema),
  equipoController.cambiarComision,
);

module.exports = router;
