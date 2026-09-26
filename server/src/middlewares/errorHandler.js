const { AppError } = require('../utils/AppError');

/**
 * Mensajes por índice UNIQUE violado. El sqlMessage de MySQL trae el nombre
 * del índice, así se da un mensaje útil en vez de "ese registro ya existe".
 */
const MENSAJES_DUPLICADO = [
  { indice: 'uq_barbero_correo', mensaje: 'Ya existe una cuenta con ese correo.' },
  {
    indice: 'uq_servicio_barberia_nombre',
    mensaje: 'Ya agregaste un servicio con ese nombre.',
  },
  {
    indice: 'uq_categoria_barberia_nombre',
    mensaje: 'Ya existe una categoría con ese nombre.',
  },
];

const MENSAJE_GENERICO = 'Ocurrió un error en el servidor. Intenta de nuevo en un momento.';

/**
 * Traduce cualquier error a una respuesta HTTP con sentido.
 *
 * Reglas:
 *  - AppError            → su propio status y mensaje.
 *  - SQLSTATE 45000      → 400 con el MESSAGE_TEXT del SIGNAL. Los mensajes de
 *                          los triggers y SP ya están redactados en español y
 *                          son aptos para mostrarle al usuario tal cual.
 *  - ER_DUP_ENTRY (1062) → 409 según el índice violado.
 *  - JSON malformado     → 400.
 *  - Cualquier otro      → 500 genérico. El detalle SOLO va al log del servidor,
 *                          nunca al cliente (puede filtrar SQL o rutas).
 */
// eslint-disable-next-line no-unused-vars -- Express identifica el errorHandler por sus 4 parámetros
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ mensaje: err.message });
  }

  // SIGNAL SQLSTATE '45000' de los triggers y procedimientos almacenados
  if (err.sqlState === '45000') {
    return res.status(400).json({ mensaje: err.sqlMessage || MENSAJE_GENERICO });
  }

  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    const sqlMessage = err.sqlMessage || '';
    const coincidencia = MENSAJES_DUPLICADO.find((m) => sqlMessage.includes(m.indice));
    return res.status(409).json({
      mensaje: coincidencia ? coincidencia.mensaje : 'Ese registro ya existe.',
    });
  }

  // Cuerpo que no es JSON válido (lo lanza express.json())
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es JSON válido.' });
  }

  console.error(`[error] ${req.method} ${req.originalUrl}`);
  console.error(err);

  return res.status(500).json({ mensaje: MENSAJE_GENERICO });
}

/** Se monta después de todas las rutas: lo que llegue aquí no existe. */
function noEncontrado(req, res) {
  res.status(404).json({ mensaje: `No existe la ruta ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, noEncontrado };
