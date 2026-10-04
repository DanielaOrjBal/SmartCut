process.env.TZ = 'America/Bogota';

const express = require('express');
const cors = require('cors');
const rutas = require('./routes');
const { errorHandler, noEncontrado } = require('./middlewares/errorHandler');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api', rutas);
app.use(noEncontrado);
app.use(errorHandler);

module.exports = app;
