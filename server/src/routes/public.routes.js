const { Router } = require('express');
const ctrl = require('../controllers/public.controller');
const { reservaLimiter } = require('../middlewares/rateLimiter');

const router = Router();

// Barberías
router.get('/barberias',           ctrl.listarBarberias);
router.get('/barberias/:id',       ctrl.obtenerBarberia);
router.get('/barberias/:id/barberos',  ctrl.listarBarberos);
router.get('/barberias/:id/servicios', ctrl.listarServicios);

// Disponibilidad: GET /api/public/disponibilidad?idBarbero=&fecha=&duracion=
router.get('/disponibilidad', ctrl.listarDisponibilidad);

// Clientes: GET /api/public/clientes/buscar?correo=
router.get('/clientes/buscar', ctrl.buscarCliente);

// Reservas
router.post('/reservas', reservaLimiter, ctrl.crearReserva);

// Consultar resumen antes de ejecutar la operación (para mostrar en pantalla)
router.get('/reservas/:token/:operacion', ctrl.consultarReserva);

// Ejecutar la operación
router.post('/reservas/:token/cancelar',     ctrl.cancelarReserva);
router.post('/reservas/:token/reprogramar',  ctrl.reprogramarReserva);

module.exports = router;
