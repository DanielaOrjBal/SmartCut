const { verificarToken } = require('../utils/jwt');
const { AppError } = require('../utils/AppError');

/**
 * Exige un JWT válido en `Authorization: Bearer <token>` y deja el contenido
 * en req.usuario = { idBarbero, idBarberia, esAdmin, correo }.
 *
 * Todo lo que dependa de quién eres se lee de aquí, NUNCA del cuerpo de la
 * petición: el token está firmado, el body lo escribe el cliente.
 */
function autenticar(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const [esquema, token] = encabezado.split(' ');

  if (esquema !== 'Bearer' || !token) {
    throw new AppError('Necesitas iniciar sesión para continuar.', 401);
  }

  const datos = verificarToken(token);
  req.usuario = {
    idBarbero: Number(datos.idBarbero),
    idBarberia: Number(datos.idBarberia),
    esAdmin: Boolean(datos.esAdmin),
    correo: datos.correo,
  };

  next();
}

/** Se monta después de `autenticar`. Protege la gestión del equipo. */
function soloAdmin(req, res, next) {
  if (!req.usuario || !req.usuario.esAdmin) {
    throw new AppError('Solo el administrador de la barbería puede hacer esto.', 403);
  }
  next();
}

module.exports = { autenticar, soloAdmin };
