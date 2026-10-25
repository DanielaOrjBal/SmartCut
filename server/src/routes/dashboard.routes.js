const { Router } = require('express');

const { autenticar, soloAdmin } = require('../middlewares/autenticar');
const { validar } = require('../middlewares/validar');
const { actualizarPerfilSchema } = require('../schemas/dashboard.schema');
const dashboardController = require('../controllers/dashboard.controller');

const router = Router();

// GET /api/dashboard/barbero  — resumen del usuario en sesión
router.get('/barbero', autenticar, dashboardController.resumenBarbero);

// GET /api/dashboard/barberia — métricas globales de la barbería, solo admin
router.get('/barberia', autenticar, soloAdmin, dashboardController.resumenBarberia);

// GET /api/dashboard/perfil — datos de sesión del usuario autenticado
router.get('/perfil', autenticar, dashboardController.obtenerPerfil);

// PATCH /api/dashboard/perfil — actualiza nombre, apellido y teléfono del usuario
router.patch('/perfil', autenticar, validar(actualizarPerfilSchema), dashboardController.actualizarPerfil);

// GET /api/dashboard/servicios — catálogo activo de la barbería (para registro de atención)
router.get('/servicios', autenticar, dashboardController.listarServicios);

module.exports = router;
