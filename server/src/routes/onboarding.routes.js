const { Router } = require('express');

const { validar } = require('../middlewares/validar');
const { onboardingSchema } = require('../schemas/onboarding.schema');
const onboardingController = require('../controllers/onboarding.controller');

const router = Router();

router.post('/', validar(onboardingSchema), onboardingController.crearOnboarding);

module.exports = router;
