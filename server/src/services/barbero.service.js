const { pool } = require('../config/db');
const { hashear, generarProvisional } = require('../utils/password');
const { primeraFila, filas, oNulo } = require('../utils/sp');
const { AppError } = require('../utils/AppError');

/**
 * Alta de un barbero una vez terminado el onboarding.
 * Misma mecánica de clave provisional: se devuelve UNA sola vez.
 *
 * idBarberia viene del JWT, no del cuerpo.
 */
async function crearBarbero({ idBarberia, barbero }) {
  const contrasenaProvisional = generarProvisional();
  const hash = await hashear(contrasenaProvisional);

  const [resultado] = await pool.query('CALL sp_crear_barbero_provisional(?, ?, ?, ?, ?, ?)', [
    idBarberia,
    barbero.nombre,
    oNulo(barbero.apellido),
    barbero.correo,
    hash,
    oNulo(barbero.telefono),
  ]);

  const fila = primeraFila(resultado);
  if (!fila || fila.id_barbero === undefined) {
    throw new AppError('No se pudo crear al barbero. Intenta de nuevo.', 500);
  }

  return {
    idBarbero: Number(fila.id_barbero),
    nombre: barbero.nombre,
    apellido: barbero.apellido,
    correo: barbero.correo,
    contrasenaProvisional,
  };
}

async function listarBarberos(idBarberia) {
  const [resultado] = await pool.query('CALL sp_listar_barberos(?)', [idBarberia]);

  return filas(resultado).map((fila) => ({
    idBarbero: Number(fila.id_barbero),
    nombre: fila.nombre,
    apellido: fila.apellido,
    correo: fila.correo,
    telefono: fila.telefono,
    esAdmin: Boolean(fila.es_admin),
    estado: fila.estado,
    fechaIngreso: fila.fecha_ingreso,
    fechaUltimoAcceso: fila.fecha_ultimo_acceso,
    // debe_cambiar_contrasena = 1 significa que todavía tiene la clave
    // provisional, es decir, que nunca ha activado su cuenta.
    pendienteActivacion: Boolean(fila.debe_cambiar_contrasena),
  }));
}

module.exports = { crearBarbero, listarBarberos };
