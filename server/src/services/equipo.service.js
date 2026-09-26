const { pool } = require('../config/db');
const { primeraFila, filas, oNulo } = require('../utils/sp');
const { numero, perfil } = require('./dashboard.service');
const { rankingCrudo } = require('./finanzas.service');
const { resolverPeriodo } = require('../utils/periodo');
const { AppError } = require('../utils/AppError');

/**
 * Gestión del equipo. Todo lo de aquí es exclusivo del administrador.
 *
 * El administrador NO puede editar los datos personales de un barbero
 * (nombre, apellido, correo, teléfono): eso lo cambia cada quien desde su
 * propia Configuración. Lo que sí administra es el estado, la comisión y las
 * ausencias.
 */

/** Filas crudas de `sp_listar_barberos`, ya traducidas. */
async function listarBarberosCrudo(idBarberia) {
  const [resultado] = await pool.query('CALL sp_listar_barberos(?)', [idBarberia]);

  return filas(resultado).map((fila) => ({
    idBarbero: numero(fila.id_barbero),
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

/**
 * Comprueba que un barbero pertenece a esta barbería y devuelve sus datos.
 *
 * Ni `sp_cambiar_estado_barbero` ni `sp_actualizar_comision` ni
 * `sp_registrar_ausencia` verifican la barbería: reciben el id y actúan. Sin
 * esta comprobación, un administrador podría cambiarle la comisión al barbero
 * de otro negocio con solo escribir su id en la URL.
 */
async function exigirBarberoDeLaBarberia(idBarberia, idBarbero) {
  const equipo = await listarBarberosCrudo(idBarberia);
  const barbero = equipo.find((integrante) => integrante.idBarbero === idBarbero);

  if (barbero === undefined) {
    throw new AppError('Ese barbero no pertenece a tu barbería.', 404);
  }
  return barbero;
}

/**
 * Equipo con la comisión de cada uno y su desempeño en el período.
 *
 * `sp_listar_barberos` no devuelve `porcentaje_comision`, así que se cruza con
 * `sp_ranking_barberos`, que sí lo trae junto con las citas atendidas y lo
 * facturado. El ranking excluye a los barberos inactivos, y para esos —que son
 * pocos y no aparecen en ninguna gráfica— se pide el porcentaje con
 * `sp_perfil_usuario`, uno por uno.
 */
async function listarEquipo({ idBarberia, periodo, desde, hasta }) {
  const rango = resolverPeriodo(periodo, desde, hasta);

  const [equipo, ranking] = await Promise.all([
    listarBarberosCrudo(idBarberia),
    rankingCrudo(idBarberia, rango.desde, rango.hasta),
  ]);

  const porId = new Map(ranking.map((fila) => [fila.idBarbero, fila]));

  const faltantes = equipo.filter((integrante) => !porId.has(integrante.idBarbero));
  const perfilesFaltantes = await Promise.all(
    faltantes.map((integrante) => perfil(integrante.idBarbero)),
  );
  const comisionPorId = new Map(
    perfilesFaltantes.map((p) => [p.idBarbero, p.porcentajeComision]),
  );

  return {
    rango,
    barberos: equipo.map((integrante) => {
      const desempeno = porId.get(integrante.idBarbero);
      return {
        ...integrante,
        porcentajeComision:
          desempeno?.porcentajeComision ?? comisionPorId.get(integrante.idBarbero) ?? 0,
        citasAtendidas: desempeno?.citasAtendidas ?? 0,
        // Facturación generada por él para el negocio, y su parte de esa cifra.
        facturacion: desempeno?.facturacion ?? 0,
        comision: desempeno?.comision ?? 0,
      };
    }),
  };
}

/** Detalle de un barbero: sus datos, su comisión y su desempeño del período. */
async function detalleBarbero({ idBarberia, idBarbero, periodo, desde, hasta }) {
  const rango = resolverPeriodo(periodo, desde, hasta);
  const barbero = await exigirBarberoDeLaBarberia(idBarberia, idBarbero);

  const [datos, ranking] = await Promise.all([
    perfil(idBarbero),
    rankingCrudo(idBarberia, rango.desde, rango.hasta),
  ]);

  const desempeno = ranking.find((fila) => fila.idBarbero === idBarbero);

  return {
    rango,
    barbero: {
      ...barbero,
      porcentajeComision: datos.porcentajeComision,
      citasAtendidas: desempeno?.citasAtendidas ?? 0,
      facturacion: desempeno?.facturacion ?? 0,
      comision: desempeno?.comision ?? 0,
    },
  };
}

/**
 * Registra una ausencia y, si es una incapacidad, además pasa al barbero a
 * estado 'incapacitado'.
 *
 * Ese segundo paso NO es un adorno: `ausencia_barbero` es una tabla de
 * registro y no dispara nada. Quien cancela las citas futuras es
 * `trg_barbero_incapacidad_cancela_citas`, que solo salta cuando el estado del
 * barbero pasa de 'activo' a 'incapacitado'. Sin el cambio de estado, la
 * incapacidad quedaría anotada pero el barbero seguiría con citas agendadas.
 */
async function registrarAusencia({ idBarberia, idBarbero, ausencia }) {
  const barbero = await exigirBarberoDeLaBarberia(idBarberia, idBarbero);

  const [resultado] = await pool.query('CALL sp_registrar_ausencia(?, ?, ?, ?, ?, ?)', [
    idBarbero,
    ausencia.fechaInicio,
    ausencia.fechaFin,
    oNulo(ausencia.horaInicio),
    oNulo(ausencia.horaFin),
    oNulo(ausencia.motivo),
  ]);

  const fila = primeraFila(resultado);
  const idAusencia = fila === null ? null : numero(fila.id_ausencia);

  let citasCanceladas = false;
  if (ausencia.esIncapacidad && barbero.estado === 'activo') {
    await pool.query('CALL sp_cambiar_estado_barbero(?, ?)', [idBarbero, 'incapacitado']);
    citasCanceladas = true;
  }

  return {
    idAusencia,
    esIncapacidad: ausencia.esIncapacidad,
    // Le dice a la app si debe avisar que se cancelaron citas.
    citasCanceladas,
    estadoBarbero: citasCanceladas ? 'incapacitado' : barbero.estado,
  };
}

/**
 * Cambia el estado de un barbero.
 *
 * Pasar de 'activo' a 'incapacitado' o 'inactivo' cancela automáticamente sus
 * citas futuras pendientes y confirmadas, por trigger. No se toca ninguna cita
 * desde Node.
 */
async function cambiarEstado({ idBarberia, idBarbero, estado }) {
  const barbero = await exigirBarberoDeLaBarberia(idBarberia, idBarbero);

  if (barbero.esAdmin && estado !== 'activo') {
    throw new AppError(
      'No puedes desactivar la cuenta del administrador de la barbería.',
      400,
    );
  }

  if (barbero.estado === estado) {
    throw new AppError('El barbero ya está en ese estado.', 400);
  }

  await pool.query('CALL sp_cambiar_estado_barbero(?, ?)', [idBarbero, estado]);

  return {
    idBarbero,
    estado,
    // Solo el paso desde 'activo' dispara la cancelación.
    citasCanceladas: barbero.estado === 'activo' && estado !== 'activo',
  };
}

/** Ajusta el porcentaje de comisión. Solo el administrador puede moverlo. */
async function cambiarComision({ idBarberia, idBarbero, porcentaje }) {
  await exigirBarberoDeLaBarberia(idBarberia, idBarbero);
  await pool.query('CALL sp_actualizar_comision(?, ?)', [idBarbero, porcentaje]);
  return { idBarbero, porcentajeComision: porcentaje };
}

module.exports = {
  listarBarberosCrudo,
  exigirBarberoDeLaBarberia,
  listarEquipo,
  detalleBarbero,
  registrarAusencia,
  cambiarEstado,
  cambiarComision,
};
