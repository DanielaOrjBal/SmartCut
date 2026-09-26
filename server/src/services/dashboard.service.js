const { pool } = require('../config/db');
const { primeraFila, filas } = require('../utils/sp');
const { AppError } = require('../utils/AppError');

/**
 * Métricas de inicio, perfil y catálogo de servicios.
 *
 * Aquí vive la distinción que atraviesa toda la fase: para el barbero
 * "ingresos" es su COMISIÓN (`movimiento_financiero.monto_comision`), y para
 * el administrador es la FACTURACIÓN del negocio (`monto`). Los dos números
 * salen de procedimientos distintos —`sp_resumen_barbero` y
 * `sp_resumen_barberia`— y nunca se mezclan en la misma respuesta.
 */

/** Convierte a número lo que venga, para que un NULL de SQL no viaje como null. */
function numero(valor) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : 0;
}

/**
 * Tarjetas del inicio del barbero. El id SIEMPRE es el del JWT: no hay forma
 * de pedir el resumen de otro.
 */
async function resumenBarbero(idBarbero) {
  const [resultado] = await pool.query('CALL sp_resumen_barbero(?)', [idBarbero]);
  const fila = primeraFila(resultado);

  if (fila === null) {
    throw new AppError('No encontramos tu información. Inicia sesión de nuevo.', 404);
  }

  return {
    citasHoy: numero(fila.citas_hoy),
    finalizadasHoy: numero(fila.finalizadas_hoy),
    // Su comisión del mes, NO lo que facturó. Es la cifra que le corresponde.
    comisionMes: numero(fila.comision_mes),
    serviciosMes: numero(fila.servicios_mes),
  };
}

/** Métricas globales del negocio. Solo las ve el administrador. */
async function resumenBarberia(idBarberia) {
  const [resultado] = await pool.query('CALL sp_resumen_barberia(?)', [idBarberia]);
  const fila = primeraFila(resultado);

  if (fila === null) {
    throw new AppError('No encontramos la información de tu barbería.', 404);
  }

  return {
    barberosActivos: numero(fila.barberos_activos),
    citasHoy: numero(fila.citas_hoy),
    // Facturación completa del negocio, incluida la parte de los barberos.
    ingresosMes: numero(fila.ingresos_mes),
    egresosMes: numero(fila.egresos_mes),
  };
}

/** Perfil completo del usuario en sesión, con su comisión y su barbería. */
async function perfil(idBarbero) {
  const [resultado] = await pool.query('CALL sp_perfil_usuario(?)', [idBarbero]);
  const fila = primeraFila(resultado);

  if (fila === null) {
    throw new AppError('No encontramos tu perfil. Inicia sesión de nuevo.', 404);
  }

  return {
    idBarbero: numero(fila.id_barbero),
    nombre: fila.nombre,
    apellido: fila.apellido,
    correo: fila.correo,
    telefono: fila.telefono,
    esAdmin: Boolean(fila.es_admin),
    porcentajeComision: numero(fila.porcentaje_comision),
    estado: fila.estado,
    fechaIngreso: fila.fecha_ingreso,
    fechaUltimoAcceso: fila.fecha_ultimo_acceso,
    barberia: {
      idBarberia: numero(fila.id_barberia),
      nombre: fila.barberia,
      direccion: fila.direccion,
    },
  };
}

/**
 * Catálogo de servicios de la barbería. Lo consume el modal de registro de
 * atención, que necesita precio y duración para ir sumando el total en vivo.
 *
 * Se filtran los inactivos en Node porque `sp_registrar_atencion` solo cuenta
 * los activos: ofrecer uno inactivo llevaría al usuario a un error inevitable.
 */
async function listarServicios(idBarberia) {
  const [resultado] = await pool.query('CALL sp_listar_servicios(?)', [idBarberia]);

  return filas(resultado)
    .filter((fila) => fila.estado === 'activo')
    .map((fila) => ({
      idServicio: numero(fila.id_servicio),
      categoria: fila.categoria,
      nombre: fila.nombre,
      descripcion: fila.descripcion,
      duracionMinutos: numero(fila.duracion_minutos),
      precio: numero(fila.precio),
    }));
}

module.exports = { numero, resumenBarbero, resumenBarberia, perfil, listarServicios };
