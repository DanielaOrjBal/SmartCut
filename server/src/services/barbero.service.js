const { pool } = require('../config/db');
const { hashear, generarProvisional } = require('../utils/password');
const { primeraFila, filas, oNulo } = require('../utils/sp');
const { AppError } = require('../utils/AppError');
const { encolarCorreo } = require('../queues/emailQueue');

/**
 * Alta de un barbero una vez terminado el onboarding.
 * Misma mecánica de clave provisional: se devuelve UNA sola vez.
 *
 * idBarberia viene del JWT, no del cuerpo.
 */
async function crearBarbero({ idBarberia, barbero }) {
  const contrasenaProvisional = generarProvisional();
  const hash = await hashear(contrasenaProvisional);

  const [[rowBarberia], [resultado]] = await Promise.all([
    pool.query('SELECT nombre FROM barberia WHERE id_barberia = ?', [idBarberia]),
    pool.query('CALL sp_crear_barbero_provisional(?, ?, ?, ?, ?, ?)', [
      idBarberia,
      barbero.nombre,
      oNulo(barbero.apellido),
      barbero.correo,
      hash,
      oNulo(barbero.telefono),
    ]),
  ]);

  const fila = primeraFila(resultado);
  if (!fila || fila.id_barbero === undefined) {
    throw new AppError('No se pudo crear al barbero. Intenta de nuevo.', 500);
  }

  const nombreBarberia = rowBarberia?.[0]?.nombre ?? 'tu barbería';

  try {
    await encolarCorreo('credenciales_barbero', {
      nombre: barbero.nombre,
      apellido: barbero.apellido ?? null,
      correo: barbero.correo,
      contrasenaProvisional,
      nombreBarberia,
    });
  } catch (emailErr) {
    console.error('[barbero] No se pudo encolar correo de credenciales:', emailErr.message);
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
