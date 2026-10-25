const { Router } = require('express');

const { validar } = require('../middlewares/validar');
const { autenticar, soloAdmin } = require('../middlewares/autenticar');
const { actualizarHorarioSchema } = require('../schemas/barberia.schema');
const { barberiaIdParamsSchema } = require('../schemas/barbero.schema');
const barberiaController = require('../controllers/barberia.controller');
const barberoController = require('../controllers/barbero.controller');

const router = Router();

// Todo lo de este archivo cuelga de /api/barberia y es exclusivo del admin:
// el barbero no ve ni edita nada de la barbería desde Configuración.
router.use(autenticar, soloAdmin);

router.get('/', barberiaController.obtenerBarberia);
router.get('/:id/barberos', validar(barberiaIdParamsSchema, 'params'), barberoController.listarBarberos);
router.patch('/horario', validar(actualizarHorarioSchema), barberiaController.actualizarHorario);

module.exports = router;
