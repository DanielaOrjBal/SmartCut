const { Router } = require('express');

const onboardingRoutes = require('./onboarding.routes');
const authRoutes = require('./auth.routes');
const barberoRoutes = require('./barbero.routes');
const dashboardRoutes = require('./dashboard.routes');
const finanzasRoutes = require('./finanzas.routes');
const equipoRoutes = require('./equipo.routes');
const barberiaRoutes = require('./barberia.routes');

const router = Router();

/** Sirve para comprobar desde el celular que la BASE_URL es la correcta. */
router.get('/salud', (req, res) => {
  res.json({ estado: 'ok', servicio: 'smartcut-api' });
});

router.use('/onboarding', onboardingRoutes);
router.use('/auth', authRoutes);

router.use('/finanzas', finanzasRoutes);
router.use('/equipo', equipoRoutes);
// GET /api/barberia y PATCH /api/barberia/horario. No choca con
// GET /api/barberia/:id/barberos de barberoRoutes: distinto método o distinto
// número de segmentos.
router.use('/barberia', barberiaRoutes);

// Estas dos montan en la raíz porque agrupan rutas de bases distintas:
// barberoRoutes  → POST /api/barberos y GET /api/barberia/:id/barberos
// dashboardRoutes → /api/dashboard/*, /api/perfil, /api/servicios,
//                   /api/agenda, /api/atenciones y /api/citas/:id/estado
router.use('/', barberoRoutes);
router.use('/', dashboardRoutes);

module.exports = router;
