const { Router } = require('express');

const { validar } = require('../middlewares/validar');
const { autenticar, soloAdmin } = require('../middlewares/autenticar');
const { crearBarberoSchema } = require('../schemas/barbero.schema');
const barberoController = require('../controllers/barbero.controller');

const router = Router();

// POST /api/barberos
router.post(
  '/',
  autenticar,
  soloAdmin,
  validar(crearBarberoSchema),
  barberoController.crearBarbero,
);

module.exports = router;
