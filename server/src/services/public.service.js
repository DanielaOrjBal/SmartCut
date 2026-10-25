const crypto = require('node:crypto');
const { pool } = require('../config/db');
const { primeraFila, filas, oNulo } = require('../utils/sp');
const { AppError } = require('../utils/AppError');
const { config } = require('../config/env');
const { encolarCorreo } = require('../queues/emailQueue');

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/** Convierte el campo SET de MySQL 'lunes,martes,...' en array. */
function diasArray(raw) {
  return typeof raw === 'string' ? raw.split(',') : [];
}

/** Genera un token aleatorio seguro de 32 bytes en hex (64 chars). */
function generarToken() {
  return crypto.randomBytes(32).toString('hex');
}

/** SHA-256 del token en claro → lo que se almacena en BD. */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Crea los dos tokens (cancelar + reprogramar) para una cita recién
 * agendada o reprogramada, los persiste en BD usando la conexión recibida
 * (siempre dentro de una transacción activa) y devuelve las URLs para el correo.
 */
async function crearTokensYUrls(idCita, conexion) {
  const tokenCancelar = generarToken();
  const tokenReprogramar = generarToken();

  await Promise.all([
    conexion.query('CALL sp_crear_token_reserva(?, ?, ?, ?)', [
      idCita, hashToken(tokenCancelar), 'cancelar', 72,
    ]),
    conexion.query('CALL sp_crear_token_reserva(?, ?, ?, ?)', [
      idCita, hashToken(tokenReprogramar), 'reprogramar', 72,
    ]),
  ]);

  const base = config.web.baseUrl;
  return {
    urlCancelar: `${base}/reserva/${tokenCancelar}/cancelar`,
    urlReprogramar: `${base}/reserva/${tokenReprogramar}/reprogramar`,
  };
}

// ------------------------------------------------------------------
// Barberías
// ------------------------------------------------------------------

async function listarBarberias() {
  const [resultado] = await pool.query('CALL sp_listar_barberias_publicas()');
  return filas(resultado).map((f) => ({
    idBarberia: Number(f.id_barberia),
    nombre: f.nombre,
    direccion: f.direccion,
    telefono: f.telefono,
    latitud: f.latitud ? Number(f.latitud) : null,
    longitud: f.longitud ? Number(f.longitud) : null,
    diasAtencion: diasArray(f.dias_atencion),
    horaApertura: f.hora_apertura,
    horaCierre: f.hora_cierre,
    duracionTurnoMinutos: Number(f.duracion_turno_minutos),
  }));
}

async function obtenerBarberia(idBarberia) {
  const [resultado] = await pool.query('CALL sp_detalle_barberia_publica(?)', [idBarberia]);
  const fila = primeraFila(resultado);
  if (!fila) throw new AppError('Barbería no encontrada.', 404);
  return {
    idBarberia: Number(fila.id_barberia),
    nombre: fila.nombre,
    direccion: fila.direccion,
    telefono: fila.telefono,
    correo: fila.correo,
    latitud: fila.latitud ? Number(fila.latitud) : null,
    longitud: fila.longitud ? Number(fila.longitud) : null,
    diasAtencion: diasArray(fila.dias_atencion),
    horaApertura: fila.hora_apertura,
    horaCierre: fila.hora_cierre,
    duracionTurnoMinutos: Number(fila.duracion_turno_minutos),
  };
}

// ------------------------------------------------------------------
// Barberos y servicios de una barbería
// ------------------------------------------------------------------

async function listarBarberos(idBarberia) {
  const [resultado] = await pool.query('CALL sp_listar_barberos_publicos(?)', [idBarberia]);
  return filas(resultado).map((f) => ({
    idBarbero: Number(f.id_barbero),
    nombre: f.nombre,
    apellido: f.apellido,
  }));
}

async function listarServicios(idBarberia) {
  const [resultado] = await pool.query('CALL sp_listar_servicios_publicos(?)', [idBarberia]);
  return filas(resultado).map((f) => ({
    idServicio: Number(f.id_servicio),
    categoria: f.categoria,
    nombre: f.nombre,
    descripcion: f.descripcion,
    duracionMinutos: Number(f.duracion_minutos),
    precio: Number(f.precio),
  }));
}

// ------------------------------------------------------------------
// Disponibilidad
// ------------------------------------------------------------------

async function listarSlots(idBarbero, fecha, duracionMinutos) {
  const [resultado] = await pool.query('CALL sp_listar_slots_disponibles(?, ?, ?)', [
    idBarbero, fecha, duracionMinutos,
  ]);
  return filas(resultado).map((f) => ({
    horaInicio: f.hora_inicio,
    horaFin: f.hora_fin,
  }));
}

// ------------------------------------------------------------------
// Clientes
// ------------------------------------------------------------------

async function buscarClientePorCorreo(correo) {
  const [resultado] = await pool.query('CALL sp_buscar_cliente_correo(?)', [
    correo.toLowerCase().trim(),
  ]);
  const fila = primeraFila(resultado);
  if (!fila) return null;
  return {
    idCliente: Number(fila.id_cliente),
    nombre: fila.nombre,
    apellido: fila.apellido,
    telefono: fila.telefono,
    correo: fila.correo,
  };
}

async function crearCliente({ nombre, apellido, correo, telefono }) {
  const [resultado] = await pool.query('CALL sp_crear_cliente_web(?, ?, ?, ?)', [
    nombre.trim(),
    oNulo(apellido),
    correo.toLowerCase().trim(),
    oNulo(telefono),
  ]);
  const fila = primeraFila(resultado);
  if (!fila) throw new AppError('No se pudo crear el cliente.', 500);
  return {
    idCliente: Number(fila.id_cliente),
    nombre: fila.nombre,
    apellido: fila.apellido,
    correo: fila.correo,
    telefono: fila.telefono,
  };
}

// ------------------------------------------------------------------
// Reservas
// ------------------------------------------------------------------

async function crearReserva({ idBarberia, idCliente, idBarbero, fecha, horaInicio, serviciosIds }) {
  const serviciosCsv = serviciosIds.join(',');
  const conexion = await pool.getConnection();

  let cita;
  let urlCancelar;
  let urlReprogramar;

  try {
    await conexion.beginTransaction();

    const [resultado] = await conexion.query('CALL sp_agendar_cita_web(?, ?, ?, ?, ?, ?)', [
      idBarberia, idCliente, idBarbero, fecha, horaInicio, serviciosCsv,
    ]);
    cita = primeraFila(resultado);
    if (!cita) throw new AppError('No se pudo crear la reserva.', 500);

    ({ urlCancelar, urlReprogramar } = await crearTokensYUrls(Number(cita.id_cita), conexion));

    await conexion.commit();
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }

  // El correo va fuera de la transacción y se delega a la cola.
  // Si falla el INSERT en cola_correos el error se loguea pero no revierte la cita.
  try {
    await encolarCorreo('confirmacion', { cita, urlCancelar, urlReprogramar });
  } catch (e) {
    console.error(`[email-queue] No se pudo encolar confirmación — cita ${Number(cita.id_cita)}: ${e.constructor.name}`);
  }

  return {
    idCita: Number(cita.id_cita),
    numeroTicket: cita.numero_ticket,
    fecha: cita.fecha,
    horaInicio: cita.hora_inicio,
    horaFin: cita.hora_fin,
    montoTotal: Number(cita.monto_total),
    duracionTotalMinutos: Number(cita.duracion_total_minutos),
    barberia: cita.barberia,
    barberiaId: Number(cita.id_barberia),
    barberiaDireccion: cita.barberia_direccion,
    barberiaTelefono: cita.barberia_telefono,
    barbero: cita.barbero,
    clienteNombre: cita.cliente_nombre,
    clienteApellido: cita.cliente_apellido,
    clienteCorreo: cita.cliente_correo,
    servicios: cita.servicios,
  };
}

// ------------------------------------------------------------------
// Gestión por token (cancelar / reprogramar)
// ------------------------------------------------------------------

/**
 * Consulta secundaria para dar un mensaje de error preciso cuando el token
 * no pasa la validación principal (expirado, ya usado, o inexistente).
 */
async function mensajeTokenFallido(hash, operacion) {
  const [rows] = await pool.query(
    `SELECT usado, expira_at FROM reserva_token
     WHERE token_hash = ? AND operacion = ? LIMIT 1`,
    [hash, operacion],
  );
  const fila = rows[0];
  if (!fila) return 'Este enlace no es válido.';
  if (fila.usado) {
    return operacion === 'cancelar'
      ? 'Esta cita ya fue cancelada o este enlace ya fue utilizado. Revisa tu correo más reciente.'
      : 'Esta cita ya fue reprogramada o este enlace ya fue utilizado. Revisa tu correo más reciente para el enlace actualizado.';
  }
  return 'Este enlace ha expirado. Comunícate directamente con la barbería.';
}

/** Valida el token y devuelve la cita asociada. No lo consume aún. */
async function consultarReservaPorToken(tokenClaro, operacion) {
  const hash = hashToken(tokenClaro);

  // Consultar sin consumir: buscamos el token vigente y obtenemos la cita
  // Nota: pool.query() con SELECT directo devuelve [rows, fields],
  // no el formato anidado de CALL, por eso se desestructura directamente.
  const [tokRows] = await pool.query(
    `SELECT cita_id FROM reserva_token
     WHERE token_hash = ? AND operacion = ? AND usado = FALSE AND expira_at > NOW()
     LIMIT 1`,
    [hash, operacion],
  );
  const tokFila = tokRows[0];
  if (!tokFila) throw new AppError(await mensajeTokenFallido(hash, operacion), 410);

  const [citaResult] = await pool.query('CALL sp_detalle_cita_por_id(?)', [tokFila.cita_id]);
  const cita = primeraFila(citaResult);
  if (!cita) throw new AppError('No se encontró la cita asociada.', 404);

  // Verificar que el estado de la cita permite la operación solicitada
  if (!['pendiente', 'confirmada'].includes(cita.estado)) {
    const msg =
      cita.estado === 'cancelada'
        ? 'Esta cita ya fue cancelada y no puede ser modificada.'
        : 'Esta cita no puede ser modificada en su estado actual.';
    throw new AppError(msg, 409);
  }

  return mapearDetalleCita(cita);
}

async function cancelarReserva(tokenClaro) {
  const hash = hashToken(tokenClaro);

  // La transacción garantiza atomicidad: si sp_cancelar_cita falla (ej: el
  // trigger bloquea cancelaciones con < 1h de anticipación), el rollback
  // deja el token sin consumir y el cliente puede reintentar con el mismo enlace.
  const conexion = await pool.getConnection();
  let idCita;

  try {
    await conexion.beginTransaction();

    const [resultado] = await conexion.query('CALL sp_consumir_token_reserva(?, ?)', [hash, 'cancelar']);
    const tok = primeraFila(resultado);
    if (!tok || !tok.id_cita) throw new AppError(await mensajeTokenFallido(hash, 'cancelar'), 410);
    idCita = tok.id_cita;

    // El trigger valida la ventana de 1 hora; si lanza SIGNAL se hace rollback
    await conexion.query('CALL sp_cancelar_cita(?, ?, ?)', [
      idCita, 'cliente', 'Cancelado desde enlace de correo',
    ]);

    await conexion.commit();
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }

  const [citaResult] = await pool.query('CALL sp_detalle_cita_por_id(?)', [idCita]);
  const cita = primeraFila(citaResult);

  try {
    await encolarCorreo('cancelacion', { cita });
  } catch (e) {
    console.error(`[email-queue] No se pudo encolar cancelación — cita ${idCita}: ${e.constructor.name}`);
  }

  return mapearDetalleCita(cita);
}

async function reprogramarReserva(tokenClaro, { fecha, horaInicio }) {
  const hash = hashToken(tokenClaro);
  const conexion = await pool.getConnection();

  let cita;
  let idCita;
  let urlCancelar;
  let urlReprogramar;

  try {
    await conexion.beginTransaction();

    const [resultado] = await conexion.query('CALL sp_consumir_token_reserva(?, ?)', [
      hash, 'reprogramar',
    ]);
    const tok = primeraFila(resultado);
    if (!tok || !tok.id_cita) throw new AppError(await mensajeTokenFallido(hash, 'reprogramar'), 410);
    idCita = tok.id_cita;

    const [citaResult] = await conexion.query('CALL sp_reprogramar_cita(?, ?, ?)', [
      idCita, fecha, horaInicio,
    ]);
    cita = primeraFila(citaResult);
    if (!cita) throw new AppError('No se pudo reprogramar la cita.', 500);

    ({ urlCancelar, urlReprogramar } = await crearTokensYUrls(Number(idCita), conexion));

    await conexion.commit();
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }

  try {
    await encolarCorreo('reprogramacion', { cita, urlCancelar, urlReprogramar });
  } catch (e) {
    console.error(`[email-queue] No se pudo encolar reprogramación — cita ${idCita}: ${e.constructor.name}`);
  }

  return mapearDetalleCita(cita);
}

// ------------------------------------------------------------------
// Mapper común de detalle de cita
// ------------------------------------------------------------------
function mapearDetalleCita(f) {
  return {
    idCita: Number(f.id_cita),
    numeroTicket: f.numero_ticket,
    fecha: f.fecha,
    horaInicio: f.hora_inicio,
    horaFin: f.hora_fin,
    montoTotal: Number(f.monto_total),
    duracionTotalMinutos: Number(f.duracion_total_minutos),
    estado: f.estado,
    barberia: f.barberia,
    barberiaId: Number(f.id_barberia),
    barberiaDireccion: f.barberia_direccion,
    barberiaTelefono: f.barberia_telefono,
    barbero: f.barbero,
    barberoId: Number(f.id_barbero),
    clienteNombre: f.cliente_nombre,
    clienteApellido: f.cliente_apellido,
    clienteCorreo: f.cliente_correo,
    clienteTelefono: f.cliente_telefono,
    servicios: f.servicios,
  };
}

module.exports = {
  listarBarberias,
  obtenerBarberia,
  listarBarberos,
  listarServicios,
  listarSlots,
  buscarClientePorCorreo,
  crearCliente,
  crearReserva,
  consultarReservaPorToken,
  cancelarReserva,
  reprogramarReserva,
};
