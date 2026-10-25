const { z } = require('zod');
const svc = require('../services/public.service');
const { AppError } = require('../utils/AppError');

// ------------------------------------------------------------------
// Helpers de validación inline (Zod 4 – sin .safeParse wrapper extra)
// ------------------------------------------------------------------

function validar(schema, data) {
  const resultado = schema.safeParse(data);
  if (!resultado.success) {
    const primer = resultado.error.issues[0];
    throw new AppError(primer.message, 400);
  }
  return resultado.data;
}

const idSchema = z.coerce.number().int().positive('ID inválido.');
const correoSchema = z.string().email('Correo electrónico inválido.').toLowerCase().trim();
const fechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD.');
const horaSchema = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'La hora debe tener formato HH:MM o HH:MM:SS.');

// ------------------------------------------------------------------
// Barberías
// ------------------------------------------------------------------

async function listarBarberias(req, res) {
  const barberias = await svc.listarBarberias();
  res.json(barberias);
}

async function obtenerBarberia(req, res) {
  const id = validar(idSchema, req.params.id);
  const barberia = await svc.obtenerBarberia(id);
  res.json(barberia);
}

// ------------------------------------------------------------------
// Barberos y servicios de una barbería
// ------------------------------------------------------------------

async function listarBarberos(req, res) {
  const id = validar(idSchema, req.params.id);
  const barberos = await svc.listarBarberos(id);
  res.json(barberos);
}

async function listarServicios(req, res) {
  const id = validar(idSchema, req.params.id);
  const servicios = await svc.listarServicios(id);
  res.json(servicios);
}

// ------------------------------------------------------------------
// Disponibilidad
// ------------------------------------------------------------------

async function listarDisponibilidad(req, res) {
  const { idBarbero, fecha, duracion } = validar(
    z.object({
      idBarbero: z.coerce.number().int().positive('idBarbero es obligatorio.'),
      fecha: fechaSchema,
      duracion: z.coerce.number().int().positive('La duración debe ser un número positivo.'),
    }),
    req.query,
  );
  const slots = await svc.listarSlots(idBarbero, fecha, duracion);
  res.json(slots);
}

// ------------------------------------------------------------------
// Clientes
// ------------------------------------------------------------------

async function buscarCliente(req, res) {
  const correo = validar(correoSchema, req.query.correo);
  const cliente = await svc.buscarClientePorCorreo(correo);
  // Devuelve null en lugar de 404 para que el frontend distinga
  // "no existe" de un error real sin lanzar excepción.
  res.json(cliente);
}

// ------------------------------------------------------------------
// Reservas
// ------------------------------------------------------------------

const reservaBodySchema = z.object({
  // Datos del cliente
  nombre: z.string().min(1, 'El nombre es obligatorio.').trim(),
  apellido: z.string().trim().optional(),
  correo: correoSchema,
  telefono: z.string().trim().optional(),
  // Si el cliente ya existe, el frontend envía su id para reutilizarlo.
  // Si no, el backend lo crea con los datos anteriores.
  idCliente: z.coerce.number().int().positive().optional(),
  // Datos de la reserva
  idBarberia: z.coerce.number().int().positive('Selecciona una barbería.'),
  idBarbero: z.coerce.number().int().positive('Selecciona un barbero.'),
  fecha: fechaSchema,
  horaInicio: horaSchema,
  serviciosIds: z
    .array(z.coerce.number().int().positive())
    .min(1, 'Selecciona al menos un servicio.'),
});

async function crearReserva(req, res) {
  const body = validar(reservaBodySchema, req.body);

  let idCliente = body.idCliente;

  if (!idCliente) {
    // Verificar si ya existe un cliente con ese correo
    const existente = await svc.buscarClientePorCorreo(body.correo);
    if (existente) {
      // El frontend debería haber enviado idCliente; si llegamos aquí sin él
      // y el correo ya existe, rechazamos para evitar duplicados.
      throw new AppError(
        'El correo ingresado ya se encuentra asociado a otro cliente.',
        409,
      );
    }

    try {
      const nuevo = await svc.crearCliente({
        nombre: body.nombre,
        apellido: body.apellido,
        correo: body.correo,
        telefono: body.telefono,
      });
      idCliente = nuevo.idCliente;
    } catch (err) {
      // Race condition: dos peticiones con el mismo correo nuevo llegaron en
      // paralelo; la segunda llega aquí con ER_DUP_ENTRY porque la primera ya
      // insertó el cliente. Se resuelve leyendo el cliente recién creado.
      if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
        const repetido = await svc.buscarClientePorCorreo(body.correo);
        if (!repetido) throw new AppError('Error inesperado al procesar el cliente.', 500);
        idCliente = repetido.idCliente;
      } else {
        throw err;
      }
    }
  }

  const reserva = await svc.crearReserva({
    idBarberia: body.idBarberia,
    idCliente,
    idBarbero: body.idBarbero,
    fecha: body.fecha,
    horaInicio: body.horaInicio,
    serviciosIds: body.serviciosIds,
  });

  res.status(201).json(reserva);
}

// ------------------------------------------------------------------
// Gestión por token
// ------------------------------------------------------------------

async function consultarReserva(req, res) {
  const { token, operacion } = req.params;
  if (!['cancelar', 'reprogramar'].includes(operacion)) {
    throw new AppError('Operación no válida.', 400);
  }
  const cita = await svc.consultarReservaPorToken(token, operacion);
  res.json(cita);
}

async function cancelarReserva(req, res) {
  const { token } = req.params;
  const cita = await svc.cancelarReserva(token);
  res.json(cita);
}

async function reprogramarReserva(req, res) {
  const { token } = req.params;
  const { fecha, horaInicio } = validar(
    z.object({
      fecha: fechaSchema,
      horaInicio: horaSchema,
    }),
    req.body,
  );
  const cita = await svc.reprogramarReserva(token, { fecha, horaInicio });
  res.json(cita);
}

module.exports = {
  listarBarberias,
  obtenerBarberia,
  listarBarberos,
  listarServicios,
  listarDisponibilidad,
  buscarCliente,
  crearReserva,
  consultarReserva,
  cancelarReserva,
  reprogramarReserva,
};
