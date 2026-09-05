const mysql = require('mysql2/promise');

// Creamos un pool de conexiones usando tus credenciales locales de MySQL
const pool = mysql.createPool({
  host: 'localhost',      // O '127.0.0.1'
  user: 'root',           // Tu usuario de MySQL en Workbench
  password: '',           // Tu contraseña de Workbench (si tienes una, ponla aquí)
  database: 'smartcut',   // El nombre exacto de tu base de datos en Workbench
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función rápida para probar que la base de datos responde
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('¡Conexión exitosa a la base de datos MySQL Workbench!');
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
  }
};

testConnection();

module.exports = pool;