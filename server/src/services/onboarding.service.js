const { pool } = require('../config/db');
const { hashear, generarProvisional } = require('../utils/password');
const { primeraFila, oNulo } = require('../utils/sp');
const { AppError } = require('../utils/AppError');

/**
 * Crea la barbería completa en UNA sola transacción.
 *
 * Ningún procedimiento almacenado abre transacciones (así está documentado en
 * smartcut.sql), por eso el control es de Node. Si cualquier paso falla —un
 * correo repetido en el último barbero, por ejemplo— se revierte todo y no
 * queda una barbería a medio configurar.
 *
 * @param {object} datos Cuerpo ya validado por onboardingSchema
 */
async function crearOnboarding(datos) {
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    // 1. La contraseña se hashea aquí, en el servidor. La app la manda en
    //    texto plano dentro del POST y nunca ve un hash.
    const hashAdmin = await hashear(datos.admin.contrasena);

    // 2. Barbería + cuenta del dueño (y las 7 categorías contables por defecto)
    const [resBarberia] = await conexion.query(
      'CALL sp_crear_barberia_con_admin(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        datos.barberia.nombre,
        oNulo(datos.barberia.direccion),
        oNulo(datos.barberia.telefono),
        oNulo(datos.barberia.correo),
        oNulo(datos.barberia.latitud),
        oNulo(datos.barberia.longitud),
        datos.admin.nombre,
        oNulo(datos.admin.apellido),
        datos.admin.correo,
        hashAdmin,
        oNulo(datos.admin.telefono),
      ],
    );

    const fila = primeraFila(resBarberia);
    if (!fila || fila.id_barberia === undefined || fila.id_admin === undefined) {
      throw new AppError('No se pudo crear la barbería. Intenta de nuevo.', 500);
    }
    const idBarberia = Number(fila.id_barberia);
    const idAdmin = Number(fila.id_admin);

    // Los triggers de bitácora (trg_servicio_bitacora_creacion) atribuyen la
    // acción a @usuario_actual. Sin esto, el historial queda con barbero_id NULL.
    await conexion.query('SET @usuario_actual = ?', [idAdmin]);

    // 3. Horario. dias_atencion es un SET de MySQL: viaja separado por comas.
    await conexion.query('CALL sp_configurar_horario(?, ?, ?, ?, ?)', [
      idBarberia,
      datos.horario.dias.join(','),
      datos.horario.horaApertura,
      datos.horario.horaCierre,
      datos.horario.duracionTurno,
    ]);

    // 4. Catálogo de servicios
    for (const servicio of datos.servicios) {
      await conexion.query('CALL sp_crear_servicio(?, ?, ?, ?, ?, ?)', [
        idBarberia,
        servicio.categoria,
        servicio.nombre,
        oNulo(servicio.descripcion),
        servicio.duracionMinutos,
        servicio.precio,
      ]);
    }

    // 5. Equipo. La clave provisional se guarda en texto plano SOLO en memoria,
    //    para devolverla una única vez en la respuesta. En la base va el hash.
    const credenciales = [];
    for (const barbero of datos.barberos) {
      const contrasenaProvisional = generarProvisional();
      const hashBarbero = await hashear(contrasenaProvisional);

      const [resBarbero] = await conexion.query(
        'CALL sp_crear_barbero_provisional(?, ?, ?, ?, ?, ?)',
        [
          idBarberia,
          barbero.nombre,
          oNulo(barbero.apellido),
          barbero.correo,
          hashBarbero,
          oNulo(barbero.telefono),
        ],
      );

      const filaBarbero = primeraFila(resBarbero);
      if (!filaBarbero || filaBarbero.id_barbero === undefined) {
        throw new AppError(`No se pudo crear al barbero ${barbero.nombre}.`, 500);
      }

      credenciales.push({
        idBarbero: Number(filaBarbero.id_barbero),
        nombre: barbero.nombre,
        apellido: barbero.apellido,
        correo: barbero.correo,
        contrasenaProvisional,
      });
    }

    // 6. Marca la configuración como terminada
    await conexion.query('CALL sp_finalizar_onboarding(?)', [idBarberia]);

    // 7.
    await conexion.commit();

    return {
      idBarberia,
      admin: { idBarbero: idAdmin, correo: datos.admin.correo },
      barberos: credenciales,
    };
  } catch (error) {
    try {
      await conexion.rollback();
    } catch {
      // La conexión ya no sirve; el error original es el que importa.
    }
    throw error;
  } finally {
    // La conexión vuelve al pool: hay que limpiar la variable de sesión o el
    // siguiente que la use heredaría este @usuario_actual.
    try {
      await conexion.query('SET @usuario_actual = NULL');
    } catch {
      // Sin conexión no hay nada que limpiar.
    }
    conexion.release();
  }
}

module.exports = { crearOnboarding };
