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
  if (!/^[\d\s+()-]{7,20}$/.test(recortado)) {
    return 'Escribe un teléfono válido.';
  }
  return null;
}

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
