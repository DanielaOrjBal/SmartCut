const { Router } = require('express');

const { validar } = require('../middlewares/validar');
const { autenticar, soloAdmin } = require('../middlewares/autenticar');
const { crearBarberoSchema, barberiaIdParamsSchema } = require('../schemas/barbero.schema');
const barberoController = require('../controllers/barbero.controller');

const router = Router();

router.post(
  '/barberos',
  autenticar,
  soloAdmin,
  validar(crearBarberoSchema),
  barberoController.crearBarbero,
);

router.get(
  '/barberia/:id/barberos',
  autenticar,
  soloAdmin,
  validar(barberiaIdParamsSchema, 'params'),
  barberoController.listarBarberos,
);

module.exports = router;
