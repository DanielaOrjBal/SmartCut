/**
 * Error de negocio con código HTTP. Lo lanzan los servicios cuando la
 * situación no la detecta la base de datos (credenciales inválidas, permisos,
 * etc.). El errorHandler lo traduce tal cual a la respuesta.
 *
 * El mensaje SIEMPRE debe estar redactado en español y ser apto para
 * mostrárselo al usuario.
 */
class AppError extends Error {
  constructor(mensaje, status = 400, detalle = null) {
    super(mensaje);
    this.name = 'AppError';
    this.status = status;
    this.detalle = detalle;
    Error.captureStackTrace(this, AppError);
  }
}

module.exports = { AppError };
