const { Router } = require('express');

const onboardingRoutes = require('./onboarding.routes');
const authRoutes = require('./auth.routes');
const barberoRoutes = require('./barbero.routes');
const dashboardRoutes = require('./dashboard.routes');
const agendaRoutes = require('./agenda.routes');
const finanzasRoutes = require('./finanzas.routes');
const asistenteRoutes = require('./asistente.routes');
const cajaRoutes = require('./caja.routes');
const equipoRoutes = require('./equipo.routes');
const barberiaRoutes = require('./barberia.routes');
const publicRoutes = require('./public.routes');
const placesRoutes = require('./places.routes');

const router = Router();

/** Sirve para comprobar desde el celular que la BASE_URL es la correcta. */
router.get('/salud', (req, res) => {
  res.json({ estado: 'ok', servicio: 'smartcut-api' });
});

// Rutas públicas (sin autenticación) para la web de reservas
router.use('/public', publicRoutes);

// Proxy de Google Places: sin auth porque se usa durante el onboarding
router.use('/places', placesRoutes);

router.use('/onboarding', onboardingRoutes);
router.use('/auth', authRoutes);

router.use('/barberos', barberoRoutes);
router.use('/barberia', barberiaRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', agendaRoutes);

router.use('/finanzas', finanzasRoutes);
router.use('/asistente', asistenteRoutes);
router.use('/caja', cajaRoutes);
router.use('/equipo', equipoRoutes);

module.exports = router;
