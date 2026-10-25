// La zona horaria del proceso se fija ANTES de cualquier otro require: si se
// hiciera después, los módulos ya cargados habrían resuelto su propio Date con
// la zona del sistema. Sin esto, un "hoy" calculado en Node a las 8 p.m. de
// Bogotá cae en el día siguiente UTC y las métricas del cierre del día quedan
// asignadas a la fecha equivocada.
process.env.TZ = 'America/Bogota';

const { config, validarConfig } = require('./config/env');
const { probarConexion } = require('./config/db');
const { iniciarWorker, detenerWorker } = require('./queues/emailQueue');
const app = require('./app');

async function arrancar() {
  const faltantes = validarConfig();
  if (faltantes.length > 0) {
    // Sin JWT_SECRET el servidor firmaría tokens con secreto vacío, lo que
    // permite a cualquiera forjar sesiones de administrador. Se aborta el
    // arranque en lugar de continuar en un estado inseguro.
    console.error(
      `❌ Variables de entorno requeridas no configuradas: ${faltantes.join(', ')}.\n` +
        '   Copia server/.env.example como server/.env y llénalo antes de arrancar.',
    );
    process.exit(1);
  }

  try {
    await probarConexion();
    console.log(
      `✅ Conectado a MySQL → ${config.db.user}@${config.db.host}:${config.db.port}/${config.db.database}`,
    );
  } catch (error) {
    console.error('❌ No se pudo conectar a MySQL:', error.message);
    console.error(
      '   Revisa que el servidor de MySQL esté encendido, que la base "smartcut" ' +
        'exista (importa smartcut.sql) y que las credenciales de server/.env sean correctas.',
    );
    process.exit(1);
  }

  // 0.0.0.0 y no localhost: si escuchara solo en localhost, un celular en la
  // misma red no podría alcanzar el servidor por la IP LAN del PC.
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 API de SmartCut escuchando en http://localhost:${config.port}/api`);
    console.log(`   Prueba de vida: http://localhost:${config.port}/api/salud`);
  });

  iniciarWorker();

  // Apagado limpio: detener el worker antes de que el proceso termine.
  process.once('SIGTERM', detenerWorker);
  process.once('SIGINT', detenerWorker);
}

arrancar();
