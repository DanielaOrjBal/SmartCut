const { Router } = require('express');

const { validar } = require('../middlewares/validar');
const { autenticar, soloAdmin } = require('../middlewares/autenticar');
const {
  resumenQuerySchema,
  serieQuerySchema,
  movimientosQuerySchema,
  crearMovimientoSchema,
  anularMovimientoSchema,
  categoriasQuerySchema,
  crearCategoriaSchema,
  informeQuerySchema,
} = require('../schemas/finanzas.schema');
const { idParamsSchema } = require('../schemas/dashboard.schema');
const finanzasController = require('../controllers/finanzas.controller');

const router = Router();

// Todo lo de este archivo cuelga de /api/finanzas.

router.get(
  '/resumen',
  autenticar,
  soloAdmin,
  validar(resumenQuerySchema, 'query'),
  finanzasController.resumen,
);

// Sin soloAdmin: el barbero también la consulta, pero el controlador le fuerza
// su propio id y el procedimiento le devuelve comisión en vez de facturación.
router.get('/serie', autenticar, validar(serieQuerySchema, 'query'), finanzasController.serie);

// Tampoco lleva soloAdmin: al barbero se le recorta la respuesta a su fila.
router.get(
  '/ranking',
  autenticar,
  validar(resumenQuerySchema, 'query'),
  finanzasController.ranking,
);

router.get('/gastos-anuales', autenticar, soloAdmin, finanzasController.gastosAnuales);

router.get(
  '/egresos-categoria',
  autenticar,
  soloAdmin,
  validar(resumenQuerySchema, 'query'),
  finanzasController.egresosPorCategoria,
);

router.get(
  '/movimientos',
  autenticar,
  soloAdmin,
  validar(movimientosQuerySchema, 'query'),
  finanzasController.listarMovimientos,
);

// La lista del barbero: sus propias atenciones con monto y comisión.
router.get(
  '/mis-movimientos',
  autenticar,
  validar(resumenQuerySchema, 'query'),
  finanzasController.misMovimientos,
);

router.post(
  '/movimientos',
  autenticar,
  soloAdmin,
  validar(crearMovimientoSchema),
  finanzasController.registrarMovimiento,
);

// Los movimientos no se editan ni se borran: solo se anulan, y con motivo.
router.patch(
  '/movimientos/:id/anular',
  autenticar,
  soloAdmin,
  validar(idParamsSchema, 'params'),
  validar(anularMovimientoSchema),
  finanzasController.anularMovimiento,
);

router.get(
  '/categorias',
  autenticar,
  soloAdmin,
  validar(categoriasQuerySchema, 'query'),
  finanzasController.listarCategorias,
);

router.post(
  '/categorias',
  autenticar,
  soloAdmin,
  validar(crearCategoriaSchema),
  finanzasController.crearCategoria,
);

router.get(
  '/informe',
  autenticar,
  soloAdmin,
  validar(informeQuerySchema, 'query'),
  finanzasController.informeMensual,
);

module.exports = router;
