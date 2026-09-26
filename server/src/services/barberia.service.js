const { pool } = require('../config/db');
const { filas } = require('../utils/sp');
const { AppError } = require('../utils/AppError');

/**
 * Datos de la barbería, para Configuración.
 *
 * No existe un procedimiento para "obtener una barbería por id" en uso
 * autenticado —`sp_perfil_usuario` no trae teléfono ni horario—, así que se
 * reutiliza `sp_listar_barberias_publicas` (la que alimentaría la futura web
 * de reservas) y se filtra en Node a la propia barbería. Es de solo lectura,
 * no escribe nada, así que reutilizar una consulta pensada para el público no
 * tiene ningún efecto secundario.
 *
 * Solo aplica si la barbería ya terminó el onboarding y está activa —que es
 * justo el estado en el que cualquier barbería con sesiones abiertas debe
 * estar—, condición que ya impone ese mismo procedimiento.
 */
async function obtenerBarberia(idBarberia) {
  const [resultado] = await pool.query('CALL sp_listar_barberias_publicas()');
  const fila = filas(resultado).find((f) => Number(f.id_barberia) === idBarberia);

  if (fila === undefined) {
    throw new AppError('No encontramos los datos de tu barbería.', 404);
  }

  return {
    idBarberia: Number(fila.id_barberia),
    nombre: fila.nombre,
    direccion: fila.direccion,
    telefono: fila.telefono,
    // Columna SET de MySQL: llega como 'lunes,martes,...' ya separada por comas.
    diasAtencion: typeof fila.dias_atencion === 'string' ? fila.dias_atencion.split(',') : [],
    horaApertura: fila.hora_apertura,
    horaCierre: fila.hora_cierre,
  };
}

/** Configura el horario de atención. Mismo procedimiento que usa el onboarding. */
async function actualizarHorario({ idBarberia, dias, horaApertura, horaCierre, duracionTurno }) {
  await pool.query('CALL sp_configurar_horario(?, ?, ?, ?, ?)', [
    idBarberia,
    dias.join(','),
    horaApertura,
    horaCierre,
    duracionTurno,
  ]);

  return obtenerBarberia(idBarberia);
}

module.exports = { obtenerBarberia, actualizarHorario };
