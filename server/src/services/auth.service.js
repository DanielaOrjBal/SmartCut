const { pool } = require('../config/db');
const { comparar, compararSenuelo, hashear } = require('../utils/password');
const { firmarToken } = require('../utils/jwt');
const { primeraFila } = require('../utils/sp');
const { AppError } = require('../utils/AppError');

/**
 * Un único mensaje para "el correo no existe" y "la contraseña es incorrecta".
 * Distinguirlos le diría a cualquiera qué correos están registrados.
 */
const CREDENCIALES_INVALIDAS = 'Correo o contraseña incorrectos.';

/** Arma el perfil que viaja a la app. Nunca incluye contrasena_hash. */
function construirPerfil(fila) {
  return {
    idBarbero: Number(fila.id_barbero),
    idBarberia: Number(fila.barberia_id),
    nombre: fila.nombre,
    apellido: fila.apellido,
    correo: fila.correo,
    esAdmin: Boolean(fila.es_admin),
    debeCambiarContrasena: Boolean(fila.debe_cambiar_contrasena),
    estado: fila.estado,
    nombreBarberia: fila.nombre_barberia,
    onboardingCompleto: Boolean(fila.onboarding_completo),
  };
}

/** Lee las credenciales por correo. La BD nunca valida contraseñas. */
async function obtenerCredenciales(correo) {
  const [resultado] = await pool.query('CALL sp_obtener_credenciales(?)', [correo]);
  return primeraFila(resultado);
}

async function login({ correo, contrasena }) {
  const fila = await obtenerCredenciales(correo);

  if (!fila) {
    // Se compara igual contra un señuelo para que este camino tarde lo mismo
    // que el de un correo que sí existe.
    await compararSenuelo();
    throw new AppError(CREDENCIALES_INVALIDAS, 401);
  }

  const coincide = await comparar(contrasena, fila.contrasena_hash);
  if (!coincide) {
    throw new AppError(CREDENCIALES_INVALIDAS, 401);
  }

  // Se revisa DESPUÉS de validar la contraseña: así no se le informa del
  // estado de la cuenta a quien no demostró ser su dueño.
  if (fila.estado === 'incapacitado') {
    throw new AppError(
      'Tu cuenta está marcada como incapacitada. Habla con el administrador de la barbería para reactivarla.',
      403,
    );
  }

  await pool.query('CALL sp_registrar_acceso(?)', [Number(fila.id_barbero)]);

  const perfil = construirPerfil(fila);
  const token = firmarToken({
    idBarbero: perfil.idBarbero,
    idBarberia: perfil.idBarberia,
    esAdmin: perfil.esAdmin,
    // El correo va en el token porque sp_obtener_credenciales solo busca por
    // correo: sin esto, cambiar la contraseña exigiría una consulta extra
    // solo para averiguar el correo del id que ya viene firmado.
    correo: perfil.correo,
  });

  return { token, perfil };
}

async function cambiarContrasena({ idBarbero, correo, contrasenaActual, contrasenaNueva }) {
  const fila = await obtenerCredenciales(correo);

  if (!fila || Number(fila.id_barbero) !== idBarbero) {
    throw new AppError('Tu sesión ya no es válida. Inicia sesión de nuevo.', 401);
  }

  const coincide = await comparar(contrasenaActual, fila.contrasena_hash);
  if (!coincide) {
    throw new AppError('La contraseña actual no es correcta.', 400);
  }

  // La comparación literal ya la hizo zod, pero si la nueva coincide con el
  // hash guardado también es la misma clave aunque el texto difiera.
  const esLaMisma = await comparar(contrasenaNueva, fila.contrasena_hash);
  if (esLaMisma) {
    throw new AppError('La nueva contraseña debe ser distinta de la actual.', 400);
  }

  // Baja debe_cambiar_contrasena a 0.
  await pool.query('CALL sp_cambiar_contrasena(?, ?)', [idBarbero, await hashear(contrasenaNueva)]);

  return { ...construirPerfil(fila), debeCambiarContrasena: false };
}

module.exports = { login, cambiarContrasena };
