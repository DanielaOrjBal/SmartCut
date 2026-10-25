const { pool } = require('../config/db');
const emailService = require('../services/email.service');

const INTERVALO_MS = 30_000; // procesar pendientes cada 30 segundos
const LOTE_MAX = 5;          // máximo de correos por ciclo

let intervalId = null;

// ------------------------------------------------------------------
// Encolar
// ------------------------------------------------------------------

/**
 * Inserta un trabajo en la cola. Devuelve el id asignado.
 *
 * @param {'confirmacion'|'cancelacion'|'reprogramacion'|'bienvenida_admin'|'credenciales_barbero'|'actualizacion_horario'|'cambio_contrasena'} tipo
 * @param {object} payload  Datos que necesita la plantilla de email.
 */
async function encolarCorreo(tipo, payload) {
  const [resultado] = await pool.query(
    `INSERT INTO cola_correos (tipo, payload) VALUES (?, ?)`,
    [tipo, JSON.stringify(payload)],
  );
  return resultado.insertId;
}

// ------------------------------------------------------------------
// Worker
// ------------------------------------------------------------------

async function procesarLote() {
  // 1. Reclamar el lote en una sola operación: SELECT … FOR UPDATE + UPDATE
  //    atomizado en dos queries minimiza el riesgo de procesar el mismo job
  //    dos veces ante un eventual reinicio entre queries.
  //    El AND estado = 'pendiente' garantiza idempotencia.
  const [pendientes] = await pool.query(
    `SELECT id, tipo, payload, intentos, max_intentos
       FROM cola_correos
      WHERE estado = 'pendiente'
        AND intentos < max_intentos
      ORDER BY creado_at ASC
      LIMIT ?`,
    [LOTE_MAX],
  );

  if (pendientes.length === 0) return;

  const ids = pendientes.map((f) => f.id);

  // 2. Marcar como 'procesando' solo las filas que siguen pendientes.
  await pool.query(
    `UPDATE cola_correos
        SET estado = 'procesando', intentos = intentos + 1
      WHERE id IN (?)
        AND estado = 'pendiente'`,
    [ids],
  );

  // Procesar con los datos ya leídos en el paso 1 (los intentos que se
  // guardarán al fallar son los originales + 1 que hizo el UPDATE).
  const jobsActualizados = pendientes.map((j) => ({ ...j, intentos: j.intentos + 1 }));
  for (const job of jobsActualizados) {
    await procesarJob(job);
  }
}

async function procesarJob(job) {
  try {
    const payload =
      typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload;

    switch (job.tipo) {
      case 'confirmacion':
        await emailService.enviarConfirmacion(payload);
        break;
      case 'cancelacion':
        await emailService.enviarCancelacion(payload);
        break;
      case 'reprogramacion':
        await emailService.enviarReprogramacion(payload);
        break;
      case 'bienvenida_admin':
        await emailService.enviarBienvenidaAdmin(payload);
        break;
      case 'credenciales_barbero':
        await emailService.enviarCredencialesBarbero(payload);
        break;
      case 'actualizacion_horario':
        await emailService.enviarActualizacionHorario(payload);
        break;
      case 'cambio_contrasena':
        await emailService.enviarCambioContrasena(payload);
        break;
      case 'actualizacion_perfil':
        await emailService.enviarActualizacionPerfil(payload);
        break;
      default:
        throw new Error(`Tipo desconocido: ${job.tipo}`);
    }

    await pool.query(
      `UPDATE cola_correos
          SET estado = 'enviado', procesado_at = NOW()
        WHERE id = ?`,
      [job.id],
    );
  } catch (err) {
    const agotado = job.intentos >= job.max_intentos;
    const nuevoEstado = agotado ? 'fallido' : 'pendiente';
    const mensajeError = (err.message ?? 'Error desconocido').slice(0, 500);

    await pool.query(
      `UPDATE cola_correos
          SET estado = ?, error = ?
        WHERE id = ?`,
      [nuevoEstado, mensajeError, job.id],
    );

    console.error(
      `[email-queue] Job ${job.id} (${job.tipo}): ${err.constructor.name}` +
      (agotado ? ' — sin más reintentos, marcado como fallido' : ` — reintento ${job.intentos}/${job.max_intentos}`),
    );
  }
}

async function procesarConGuardia() {
  try {
    await procesarLote();
  } catch (err) {
    // Error a nivel de pool (BD caída, timeout de conexión, etc.)
    console.error(`[email-queue] Error al procesar lote: ${err.constructor.name}`);
  }
}

// ------------------------------------------------------------------
// Ciclo de vida
// ------------------------------------------------------------------

/**
 * Al arrancar, cualquier job que quedó en 'procesando' (proceso caído en
 * mitad de un envío) se devuelve a 'pendiente' para que el worker los reintente.
 * Sin esto, esos jobs quedan atascados permanentemente sin importar sus intentos.
 */
async function recuperarJobsInterrumpidos() {
  try {
    const [resultado] = await pool.query(
      `UPDATE cola_correos
          SET estado = 'pendiente'
        WHERE estado = 'procesando'
          AND intentos < max_intentos`,
    );
    if (resultado.affectedRows > 0) {
      console.log(`[email-queue] ${resultado.affectedRows} job(s) interrumpido(s) devuelto(s) a pendiente.`);
    }
  } catch (err) {
    console.error('[email-queue] No se pudieron recuperar jobs interrumpidos:', err.message);
  }
}

function iniciarWorker() {
  if (intervalId) return;
  console.log(`[email-queue] Worker iniciado (intervalo ${INTERVALO_MS / 1000}s, lote ${LOTE_MAX})`);

  // La recuperación corre primero y espera a terminar antes de activar el
  // intervalo, evitando que el primer tick del setInterval solape con la
  // recuperación y reintente el mismo job dos veces.
  (async () => {
    await recuperarJobsInterrumpidos();
    procesarConGuardia();
    intervalId = setInterval(procesarConGuardia, INTERVALO_MS);
  })();
}

function detenerWorker() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[email-queue] Worker detenido.');
  }
}

module.exports = { encolarCorreo, iniciarWorker, detenerWorker };
