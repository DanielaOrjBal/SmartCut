const { pool } = require('../config/db');
const { primeraFila, filas } = require('../utils/sp');
const { numero } = require('./dashboard.service');
const { AppError } = require('../utils/AppError');

/**
 * Agenda, registro de atención sin cita y cambios de estado de cita.
 *
 * El registro de atención es la pieza central de la fase: mientras no exista
 * la web pública de reservas, es la ÚNICA fuente de citas reales, y refleja
 * cómo trabaja de verdad una barbería, donde buena parte de los clientes llega
 * sin haber reservado.
 */

/** Una fila de `sp_agenda_barberia` traducida al lenguaje de la app. */
function mapearCita(fila) {
  return {
    idCita: numero(fila.id_cita),
    numeroTicket: fila.numero_ticket,
    fecha: fila.fecha,
    horaInicio: fila.hora_inicio,
    horaFin: fila.hora_fin,
    estado: fila.estado,
    montoTotal: numero(fila.monto_total),
    cliente: fila.cliente,
    idBarbero: numero(fila.id_barbero),
    barbero: (fila.barbero ?? '').trim(),
    // GROUP_CONCAT devuelve NULL si la cita quedó sin servicios asociados.
    servicios: fila.servicios ?? '',
  };
}

/**
 * Citas de la barbería en un rango.
 *
 * `idBarbero` ya viene decidido por el controlador: para un barbero es
 * siempre el suyo, aunque haya escrito otro en la URL.
 */
async function listarAgenda({ idBarberia, idBarbero, desde, hasta }) {
  const [resultado] = await pool.query('CALL sp_agenda_barberia(?, ?, ?, ?)', [
    idBarberia,
    idBarbero ?? null,
    desde,
    hasta,
  ]);

  return filas(resultado).map(mapearCita);
}

/**
 * Comprueba que una cita es alcanzable por quien la quiere modificar, y la
 * devuelve.
 *
 * No hay procedimiento que traiga una cita por id, así que se consulta la
 * agenda de ESE día con el filtro de barbero ya aplicado. Si el id no aparece,
 * o la cita es de otra barbería, o es de otro barbero: en ambos casos, no es
 * suya. La fecha la manda el cliente, pero eso no debilita nada — mentir sobre
 * la fecha solo hace que la cita no aparezca.
 */
async function buscarCitaDelDia({ idBarberia, idBarbero, idCita, fecha }) {
  const citas = await listarAgenda({ idBarberia, idBarbero, desde: fecha, hasta: fecha });
  return citas.find((cita) => cita.idCita === idCita) ?? null;
}

/**
 * Registro de una atención sin cita: el cliente llegó, se le atendió y se cobra.
 *
 * `sp_registrar_atencion` hace todo dentro de la base — crea el cliente, la
 * cita, sus servicios y la deja finalizada, lo que dispara
 * `trg_cita_finalizada_genera_ingreso` y con él el movimiento con su comisión.
 * Aquí no se calcula ni un peso.
 */
async function registrarAtencion({ idBarbero, nombreCliente, servicios }) {
  // FIND_IN_SET espera 'id,id,id'. Los ids ya vienen validados como enteros.
  const csv = servicios.join(',');

  const [resultado] = await pool.query('CALL sp_registrar_atencion(?, ?, ?)', [
    idBarbero,
    nombreCliente,
    csv,
  ]);

  const fila = primeraFila(resultado);
  if (fila === null) {
    throw new AppError('No se pudo registrar la atención. Intenta de nuevo.', 500);
  }

  return {
    idCita: numero(fila.id_cita),
    numeroTicket: fila.numero_ticket,
    horaInicio: fila.hora_inicio,
    horaFin: fila.hora_fin,
    montoCobrado: numero(fila.monto_total),
    // Lo que le queda al barbero según su porcentaje. Lo calculó el trigger.
    comision: numero(fila.monto_comision),
    cliente: fila.cliente,
  };
}

/**
 * Cambia el estado de una cita.
 *
 * Las consecuencias financieras NO se tocan desde aquí:
 *  - 'finalizada' hace que `trg_cita_finalizada_genera_ingreso` cree el ingreso
 *    con su comisión.
 *  - 'cancelada' y 'no_asistio' hacen que `trg_cita_no_atendida_anula_ingreso`
 *    anule el movimiento asociado. No suma ni resta.
 *
 * Cancelar pasa por `sp_cancelar_cita` y no por `sp_actualizar_estado_cita`
 * porque solo el primero registra quién canceló y por qué.
 */
async function cambiarEstadoCita({ cita, estado, motivo, esAdmin }) {
  if (cita.estado === estado) {
    throw new AppError('La cita ya está en ese estado.', 400);
  }

  if (estado === 'cancelada') {
    // 'admin' o 'barbero': la tercera opción del enum, 'cliente', la usaría la
    // web pública de reservas, que no existe todavía.
    await pool.query('CALL sp_cancelar_cita(?, ?, ?)', [
      cita.idCita,
      esAdmin ? 'admin' : 'barbero',
      motivo ?? null,
    ]);
  } else {
    await pool.query('CALL sp_actualizar_estado_cita(?, ?)', [cita.idCita, estado]);
  }

  return { ...cita, estado };
}

module.exports = {
  mapearCita,
  listarAgenda,
  buscarCitaDelDia,
  registrarAtencion,
  cambiarEstadoCita,
};
