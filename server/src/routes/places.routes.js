const { Router } = require('express');
const { autocomplete, details, staticmap } = require('../controllers/places.controller');

const router = Router();

// Sin autenticar: el onboarding ocurre antes de que el admin tenga cuenta.
// La key de Google nunca sale del servidor, así que el riesgo es bajo.
router.get('/autocomplete', autocomplete);
router.get('/details', details);
router.get('/staticmap', staticmap);

module.exports = router;
