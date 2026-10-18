const nodemailer = require('nodemailer');
const { config } = require('../config/env');

/**
 * Transportador SMTP. Se crea una sola vez al importar el módulo.
 * Las variables de entorno necesarias:
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false), SMTP_USER, SMTP_PASS
 *   EMAIL_FROM  → dirección de origen, p.ej. "SmartCut <reservas@smartcut.co>"
 */
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

/** Formatea un número como COP sin decimales: 25000 → "$25.000" */
function cop(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(valor));
}

/** Formatea fecha "YYYY-MM-DD" → "lunes, 13 de octubre de 2026" */
function fechaLarga(fechaStr) {
  const [y, m, d] = String(fechaStr).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota',
  });
}

/** Extrae "HH:MM" de "HH:MM:SS" */
function hora(timeStr) {
  return String(timeStr).slice(0, 5);
}

// ------------------------------------------------------------------
// Plantilla base HTML (cabecera + pie reutilizados en todos los correos)
// ------------------------------------------------------------------
function wrapHTML(contenido) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SmartCut</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;background:#ffffff;border-radius:12px;
                    box-shadow:0 2px 8px rgba(0,0,0,.08);overflow:hidden;">
        <!-- Cabecera -->
        <tr>
          <td style="background:#111827;padding:28px 40px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
              ✂ SmartCut
            </p>
          </td>
        </tr>
        <!-- Contenido -->
        <tr><td style="padding:32px 40px;">
          ${contenido}
        </td></tr>
        <!-- Pie -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
              Este correo fue generado automáticamente por SmartCut.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function botonHTML(texto, url, color = '#111827') {
  return `<a href="${url}"
     style="display:inline-block;padding:12px 24px;background:${color};
            color:#ffffff;border-radius:8px;font-size:14px;font-weight:600;
            text-decoration:none;margin-top:8px;">
    ${texto}
  </a>`;
}

function filaDetalle(etiqueta, valor) {
  return `<tr>
    <td style="padding:6px 0;font-size:14px;color:#6b7280;width:40%;">${etiqueta}</td>
    <td style="padding:6px 0;font-size:14px;font-weight:600;">${valor}</td>
  </tr>`;
}

// ------------------------------------------------------------------
// Correo 1: confirmación de reserva
// ------------------------------------------------------------------
async function enviarConfirmacion({ cita, urlCancelar, urlReprogramar }) {
  const contenido = `
    <h2 style="margin:0 0 4px;font-size:20px;">¡Tu cita está confirmada!</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      Aquí tienes el resumen de tu reserva en <strong>${cita.barberia}</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;
                  border-collapse:separate;">
      <tbody>
        ${filaDetalle('Número de cita', cita.numero_ticket)}
        ${filaDetalle('Barbería', cita.barberia)}
        ${filaDetalle('Dirección', cita.barberia_direccion || '—')}
        ${filaDetalle('Teléfono', cita.barberia_telefono || '—')}
        ${filaDetalle('Barbero', cita.barbero)}
        ${filaDetalle('Servicios', cita.servicios)}
        ${filaDetalle('Fecha', fechaLarga(cita.fecha))}
        ${filaDetalle('Hora', `${hora(cita.hora_inicio)} – ${hora(cita.hora_fin)}`)}
        ${filaDetalle('Duración', `${cita.duracion_total_minutos} min`)}
        ${filaDetalle('Valor total', cop(cita.monto_total))}
      </tbody>
    </table>

    <p style="margin:28px 0 8px;font-size:14px;color:#374151;">
      ¿Necesitas hacer cambios?
    </p>
    <div style="display:flex;gap:12px;">
      ${botonHTML('Cancelar cita', urlCancelar, '#dc2626')}
      &nbsp;&nbsp;
      ${botonHTML('Reprogramar cita', urlReprogramar, '#2563eb')}
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
      Los enlaces son válidos por 72 horas a partir del envío de este correo.
    </p>`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: cita.cliente_correo,
    subject: `Cita confirmada – ${cita.barberia} | ${cita.numero_ticket}`,
    html: wrapHTML(contenido),
  });
}

// ------------------------------------------------------------------
// Correo 2: reprogramación confirmada
// ------------------------------------------------------------------
async function enviarReprogramacion({ cita, urlCancelar, urlReprogramar }) {
  const contenido = `
    <h2 style="margin:0 0 4px;font-size:20px;">Tu cita fue reprogramada</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      Aquí tienes los nuevos datos de tu cita en <strong>${cita.barberia}</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;
                  border-collapse:separate;">
      <tbody>
        ${filaDetalle('Número de cita', cita.numero_ticket)}
        ${filaDetalle('Barbería', cita.barberia)}
        ${filaDetalle('Dirección', cita.barberia_direccion || '—')}
        ${filaDetalle('Barbero', cita.barbero)}
        ${filaDetalle('Servicios', cita.servicios)}
        ${filaDetalle('Nueva fecha', fechaLarga(cita.fecha))}
        ${filaDetalle('Nueva hora', `${hora(cita.hora_inicio)} – ${hora(cita.hora_fin)}`)}
        ${filaDetalle('Duración', `${cita.duracion_total_minutos} min`)}
        ${filaDetalle('Valor total', cop(cita.monto_total))}
      </tbody>
    </table>

    <p style="margin:28px 0 8px;font-size:14px;color:#374151;">
      ¿Necesitas hacer más cambios?
    </p>
    <div>
      ${botonHTML('Cancelar cita', urlCancelar, '#dc2626')}
      &nbsp;&nbsp;
      ${botonHTML('Reprogramar de nuevo', urlReprogramar, '#2563eb')}
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
      Los enlaces son válidos por 72 horas a partir del envío de este correo.
    </p>`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: cita.cliente_correo,
    subject: `Cita reprogramada – ${cita.barberia} | ${cita.numero_ticket}`,
    html: wrapHTML(contenido),
  });
}

// ------------------------------------------------------------------
// Correo 3: cancelación confirmada
// ------------------------------------------------------------------
async function enviarCancelacion({ cita }) {
  const contenido = `
    <h2 style="margin:0 0 4px;font-size:20px;">Tu cita fue cancelada</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      Tu reserva en <strong>${cita.barberia}</strong> ha sido cancelada correctamente.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;
                  border-collapse:separate;">
      <tbody>
        ${filaDetalle('Número de cita', cita.numero_ticket)}
        ${filaDetalle('Barbería', cita.barberia)}
        ${filaDetalle('Barbero', cita.barbero)}
        ${filaDetalle('Servicios', cita.servicios)}
        ${filaDetalle('Fecha cancelada', fechaLarga(cita.fecha))}
        ${filaDetalle('Hora cancelada', `${hora(cita.hora_inicio)} – ${hora(cita.hora_fin)}`)}
      </tbody>
    </table>

    <p style="margin:24px 0 0;font-size:14px;color:#374151;">
      Si deseas agendar una nueva cita, visita nuestro sitio web.
    </p>`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: cita.cliente_correo,
    subject: `Cita cancelada – ${cita.barberia} | ${cita.numero_ticket}`,
    html: wrapHTML(contenido),
  });
}

// ------------------------------------------------------------------
// Correo 4: bienvenida al administrador cuando se crea la barbería
// ------------------------------------------------------------------
async function enviarBienvenidaAdmin({ correoAdmin, nombreAdmin, nombreBarberia }) {
  const contenido = `
    <h2 style="margin:0 0 4px;font-size:20px;">¡Bienvenido a SmartCut!</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      Hola <strong>${nombreAdmin}</strong>, tu barbería fue creada exitosamente.
      Ya puedes iniciar sesión y empezar a gestionar tu negocio.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;
                  border-collapse:separate;">
      <tbody>
        ${filaDetalle('Barbería', nombreBarberia)}
        ${filaDetalle('Correo', correoAdmin)}
        ${filaDetalle('Rol', 'Administrador')}
      </tbody>
    </table>

    <p style="margin:24px 0 0;font-size:14px;color:#374151;">
      Descarga la app SmartCut e inicia sesión con tu correo y la contraseña
      que registraste durante la configuración.
    </p>`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: correoAdmin,
    subject: `¡Tu barbería ${nombreBarberia} ya está en SmartCut!`,
    html: wrapHTML(contenido),
  });
}

// ------------------------------------------------------------------
// Correo 5: credenciales provisionales al barbero recién creado
// ------------------------------------------------------------------
async function enviarCredencialesBarbero({
  nombre,
  apellido,
  correo,
  contrasenaProvisional,
  nombreBarberia,
}) {
  const contenido = `
    <h2 style="margin:0 0 4px;font-size:20px;">Tu cuenta en SmartCut está lista</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      Hola <strong>${nombre}${apellido ? ` ${apellido}` : ''}</strong>, el administrador
      de <strong>${nombreBarberia}</strong> creó tu cuenta. Aquí están tus credenciales
      de acceso provisionales.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;
                  border-collapse:separate;">
      <tbody>
        ${filaDetalle('Correo', correo)}
        ${filaDetalle('Contraseña provisional', contrasenaProvisional)}
        ${filaDetalle('Barbería', nombreBarberia)}
      </tbody>
    </table>

    <p style="margin:24px 0 8px;font-size:14px;color:#374151;">
      Al iniciar sesión por primera vez, el sistema te pedirá que cambies esta
      contraseña por una propia. Guárdala hasta entonces.
    </p>
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      Si no esperabas este correo, contacta al administrador de tu barbería.
    </p>`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: correo,
    subject: `Tus credenciales para SmartCut – ${nombreBarberia}`,
    html: wrapHTML(contenido),
  });
}

// ------------------------------------------------------------------
// Correo 6: notificación al admin cuando se actualiza el horario
// ------------------------------------------------------------------
async function enviarActualizacionHorario({ correoAdmin, nombreBarberia }) {
  const contenido = `
    <h2 style="margin:0 0 4px;font-size:20px;">Horario actualizado</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      El horario de atención de <strong>${nombreBarberia}</strong> fue actualizado
      correctamente.
    </p>

    <p style="margin:0;font-size:14px;color:#374151;">
      Si no realizaste este cambio, revisa el acceso a tu cuenta de administrador.
    </p>`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: correoAdmin,
    subject: `Horario actualizado – ${nombreBarberia}`,
    html: wrapHTML(contenido),
  });
}

// ------------------------------------------------------------------
// Correo 7: confirmación al usuario cuando cambia su contraseña
// ------------------------------------------------------------------
async function enviarCambioContrasena({ nombre, correo }) {
  const contenido = `
    <h2 style="margin:0 0 4px;font-size:20px;">Contraseña actualizada</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      Hola <strong>${nombre}</strong>, tu contraseña fue cambiada exitosamente.
    </p>

    <p style="margin:0;font-size:14px;color:#374151;">
      Si no realizaste este cambio, contacta al administrador de tu barbería
      de inmediato.
    </p>`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: correo,
    subject: 'Tu contraseña de SmartCut fue actualizada',
    html: wrapHTML(contenido),
  });
}

// ------------------------------------------------------------------
// Correo 8: notificación al usuario cuando actualiza sus datos personales
// ------------------------------------------------------------------
async function enviarActualizacionPerfil({ nombre, correo }) {
  const contenido = `
    <h2 style="margin:0 0 4px;font-size:20px;">Datos personales actualizados</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      Hola <strong>${nombre}</strong>, tus datos personales en SmartCut fueron
      actualizados correctamente.
    </p>

    <p style="margin:0;font-size:14px;color:#374151;">
      Si no realizaste este cambio, contacta al administrador de tu barbería
      de inmediato.
    </p>`;

  await transporter.sendMail({
    from: config.smtp.from,
    to: correo,
    subject: 'Tus datos en SmartCut fueron actualizados',
    html: wrapHTML(contenido),
  });
}

module.exports = {
  enviarConfirmacion,
  enviarReprogramacion,
  enviarCancelacion,
  enviarBienvenidaAdmin,
  enviarCredencialesBarbero,
  enviarActualizacionHorario,
  enviarCambioContrasena,
  enviarActualizacionPerfil,
};
