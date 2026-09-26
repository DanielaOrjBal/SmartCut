const { Router } = require('express');

const { validar } = require('../middlewares/validar');
const { autenticar } = require('../middlewares/autenticar');
const { loginSchema, cambiarContrasenaSchema } = require('../schemas/auth.schema');
const authController = require('../controllers/auth.controller');

const router = Router();

router.post('/login', validar(loginSchema), authController.login);

router.post(
  '/cambiar-contrasena',
  autenticar,
  validar(cambiarContrasenaSchema),
  authController.cambiarContrasena,
);

module.exports = router;
