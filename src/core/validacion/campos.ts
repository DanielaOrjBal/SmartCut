/**
 * Validadores de campo del lado de la app.
 *
 * Devuelven el mensaje de error o null si el valor sirve. Duplican a propósito
 * las reglas de los esquemas zod del servidor: aquí para dar retroalimentación
 * inmediata bajo el input, allá porque el servidor nunca confía en el cliente.
 */

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function requerido(valor: string, etiqueta: string): string | null {
  return valor.trim().length === 0 ? `${etiqueta} es obligatorio.` : null;
}

export function correoValido(valor: string): string | null {
  const recortado = valor.trim();
  if (recortado.length === 0) {
    return 'El correo es obligatorio.';
  }
  if (!CORREO.test(recortado)) {
    return 'Escribe un correo válido.';
  }
  if (recortado.length > 150) {
    return 'El correo no puede superar 150 caracteres.';
  }
  return null;
}

export function telefonoValido(valor: string, obligatorio = true): string | null {
  const recortado = valor.trim();
  if (recortado.length === 0) {
    return obligatorio ? 'El teléfono es obligatorio.' : null;
  }
  // Solo se permiten dígitos; se extraen para contar exactamente 10.
  const soloDigitos = recortado.replace(/\D/g, '');
  if (soloDigitos.length !== 10) {
    return 'El teléfono debe tener exactamente 10 dígitos (ej: 3001234567).';
  }
  return null;
}

/** Valida nombre o apellido de persona: solo letras (incluyendo tildes), mínimo 3. */
export function nombreValido(valor: string, etiqueta: string): string | null {
  const recortado = valor.trim();
  if (recortado.length === 0) return `${etiqueta} es obligatorio.`;
  if (recortado.length < 3) return `${etiqueta} debe tener al menos 3 letras.`;
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(recortado)) {
    return `${etiqueta} solo puede contener letras.`;
  }
  return null;
}

/** Valida número de cédula: solo dígitos, mínimo 6. */
export function cedulaValida(valor: string, obligatorio = true): string | null {
  const recortado = valor.trim();
  if (recortado.length === 0) {
    return obligatorio ? 'La cédula es obligatoria.' : null;
  }
  if (!/^\d+$/.test(recortado)) return 'La cédula solo puede contener números.';
  if (recortado.length < 6) return 'La cédula debe tener al menos 6 dígitos.';
  return null;
}

/** HH:mm en rango 00:00–23:59 */
export const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export function contrasenaValida(valor: string): string | null {
  if (valor.length === 0) {
    return 'La contraseña es obligatoria.';
  }
  if (valor.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  // bcrypt ignora lo que pase de 72 bytes: aceptar más sería engañoso.
  if (valor.length > 72) {
    return 'La contraseña no puede superar 72 caracteres.';
  }
  if (!/[0-9]/.test(valor)) {
    return 'La contraseña debe incluir al menos un número.';
  }
  if (!/[^A-Za-z0-9]/.test(valor)) {
    return 'La contraseña debe incluir al menos un carácter especial (ej: @, #, $, !).';
  }
  return null;
}

export type NivelFuerza = {
  /** 0 = vacía, 1 = débil, 2 = regular, 3 = buena, 4 = fuerte */
  puntaje: 0 | 1 | 2 | 3 | 4;
  etiqueta: string;
};

/** Fuerza de la contraseña, para el indicador visual. */
export function fuerzaContrasena(valor: string): NivelFuerza {
  if (valor.length === 0) {
    return { puntaje: 0, etiqueta: '' };
  }

  let puntos = 0;
  if (valor.length >= 8) puntos += 1;
  if (valor.length >= 12) puntos += 1;
  if (/[a-z]/.test(valor) && /[A-Z]/.test(valor)) puntos += 1;
  if (/\d/.test(valor)) puntos += 1;
  if (/[^A-Za-z0-9]/.test(valor)) puntos += 1;

  const puntaje = Math.min(Math.max(puntos - 1, 1), 4) as 1 | 2 | 3 | 4;
  const etiquetas: Record<1 | 2 | 3 | 4, string> = {
    1: 'Débil',
    2: 'Regular',
    3: 'Buena',
    4: 'Fuerte',
  };

  return { puntaje, etiqueta: etiquetas[puntaje] };
}