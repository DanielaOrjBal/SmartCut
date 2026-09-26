const authService = require('../services/auth.service');

/** POST /api/auth/login */
async function login(req, res) {
  const resultado = await authService.login(req.body);
  res.json(resultado);
}

/** POST /api/auth/cambiar-contrasena — requiere JWT */
async function cambiarContrasena(req, res) {
  const perfil = await authService.cambiarContrasena({
    idBarbero: req.usuario.idBarbero,
    correo: req.usuario.correo,
    contrasenaActual: req.body.contrasenaActual,
    contrasenaNueva: req.body.contrasenaNueva,
  });

  res.json({ mensaje: 'Tu contraseña se actualizó correctamente.', perfil });
}

module.exports = { login, cambiarContrasena };
