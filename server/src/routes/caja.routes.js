const { Router } = require('express');
const { validar } = require('../middlewares/validar');
const { autenticar, soloAdmin } = require('../middlewares/autenticar');
const { abrirCajaSchema, cerrarCajaSchema, cajaHistorialQuerySchema } = require('../schemas/caja.schema');
const cajaController = require('../controllers/caja.controller');

const router = Router();

// Todas las rutas de caja son exclusivas del administrador.
router.use(autenticar, soloAdmin);

router.post('/abrir',  validar(abrirCajaSchema),  cajaController.abrirCaja);
router.post('/cerrar', validar(cerrarCajaSchema),  cajaController.cerrarCaja);
router.get('/hoy',                                 cajaController.estadoCajaHoy);
router.get('/historial', validar(cajaHistorialQuerySchema, 'query'), cajaController.historialCaja);

module.exports = router;
