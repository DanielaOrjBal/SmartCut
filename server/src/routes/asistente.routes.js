const { Router } = require('express');
const { autenticar, soloAdmin } = require('../middlewares/autenticar');
const { validar } = require('../middlewares/validar');
const { preguntaSchema } = require('../schemas/asistente.schema');
const geminiController = require('../controllers/gemini.controller');

const router = Router();

router.post('/', autenticar, soloAdmin, validar(preguntaSchema), geminiController.consultar);

module.exports = router;
