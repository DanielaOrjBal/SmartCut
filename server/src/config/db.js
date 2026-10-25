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
  // Afecta cómo mysql2 serializa objetos Date de JS al enviarlos a MySQL.
  // NO cambia el timezone de sesión de MySQL (eso lo hace el listener abajo).
  timezone: '-05:00',
  // Fechas y horas de MySQL como texto plano ('2026-09-07', '14:30:00').
  // Un DATE convertido a objeto Date de JS se ancla a medianoche local y, al
  // serializarse a JSON, viaja en UTC como el día anterior. La app necesita la
  // fecha calendario exacta que devolvió la base, no un instante.
  dateStrings: true,
  // Aiven y otros proveedores cloud exigen conexiones SSL. Se activa con
  // DB_SSL=true en el .env del servidor; en local queda deshabilitado.
  // rejectUnauthorized:false porque Aiven usa su propia CA que Node.js no
  // incluye en su store por defecto. La conexión sigue siendo SSL encriptada.
  ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } }),
});

// Fija el timezone de SESIÓN de MySQL en cada nueva conexión del pool.
// Sin esto, CURDATE() y NOW() dentro de los procedimientos almacenados usan
// el timezone del servidor MySQL (normalmente UTC): una caja abierta o cerrada
// después de las 7 p.m. Bogotá (= medianoche UTC) quedaría registrada con la
// fecha del día siguiente, y al abrir la app la mañana siguiente aparecería
// "Cerrada" en lugar de "Sin abrir".
pool.pool.on('connection', (conexion) => {
  conexion.query("SET time_zone = '-05:00'", (err) => {
    if (err) {
      console.error('[db] No se pudo fijar el timezone de sesión:', err.message);
    }
  });
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
