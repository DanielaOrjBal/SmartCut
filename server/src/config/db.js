const mysql = require('mysql2/promise');
const { config } = require('./env');

/**
 * Pool de conexiones. Todo el acceso a datos pasa por los procedimientos
 * almacenados de smartcut.sql: aquí no se escribe SQL suelto.
 *
 * El onboarding necesita varias llamadas dentro de UNA transacción, así que
 * en ese caso se toma una conexión con pool.getConnection() y se controla
 * con beginTransaction/commit/rollback desde el servicio.
 */
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Los DECIMAL de precios y montos llegan como string si no se pide esto.
  decimalNumbers: true,
  // Colombia no tiene horario de verano, así que el offset es fijo. Sin esto
  // mysql2 convierte los DATETIME usando la zona del proceso al escribir y la
  // zona local del driver al leer: una atención registrada a las 7 p.m. se
  // guardaría corrida cinco horas y CURDATE() del servidor y el "hoy" de Node
  // dejarían de coincidir en el tramo final del día.
  timezone: '-05:00',
  // Fechas y horas de MySQL como texto plano ('2026-09-07', '14:30:00').
  // Un DATE convertido a objeto Date de JS se ancla a medianoche local y, al
  // serializarse a JSON, viaja en UTC como el día anterior. La app necesita la
  // fecha calendario exacta que devolvió la base, no un instante.
  dateStrings: true,
});

/**
 * Comprueba que MySQL responde. Se invoca UNA vez desde index.js al arrancar,
 * no al importar el módulo, para que importar db.js no tenga efectos.
 */
async function probarConexion() {
  const conexion = await pool.getConnection();
  try {
    await conexion.query('SELECT 1');
  } finally {
    conexion.release();
  }
}

module.exports = { pool, probarConexion };
