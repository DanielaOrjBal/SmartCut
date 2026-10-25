const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { config } = require('./config/env');
const rutas = require('./routes');
const { errorHandler, noEncontrado } = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');

const app = express();

// Render (y otros PaaS) usan un reverse proxy que añade X-Forwarded-For.
// Sin esto, express-rate-limit no puede identificar IPs reales y lanza warnings.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: config.allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(generalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use('/api', rutas);
app.use(noEncontrado);
app.use(errorHandler);

module.exports = app;
