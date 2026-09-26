// La zona horaria del proceso se fija ANTES de cualquier otro require: si se
// hiciera después, los módulos ya cargados habrían resuelto su propio Date con
// la zona del sistema. Sin esto, un "hoy" calculado en Node a las 8 p.m. de
// Bogotá cae en el día siguiente UTC y las métricas del cierre del día quedan
// asignadas a la fecha equivocada.
process.env.TZ = 'America/Bogota';

const express = require('express');
const cors = require('cors');

const { config, validarConfig } = require('./config/env');
const { probarConexion } = require('./config/db');
const rutas = require('./routes');
const { errorHandler, noEncontrado } = require('./middlewares/errorHandler');

const app = express();

// La app móvil corre en otro origen (Expo Go / emulador), así que CORS abierto.
// Es una API de proyecto universitario, no hay cookies ni sesiones de navegador.
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api', rutas);

app.use(noEncontrado);
app.use(errorHandler);

async function arrancar() {
  const faltantes = validarConfig();
  if (faltantes.length > 0) {
    console.warn(
      `⚠️  Falta configurar en server/.env: ${faltantes.join(', ')}. ` +
        'Copia server/.env.example como server/.env y llénalo.',
    );
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
}

arrancar();
