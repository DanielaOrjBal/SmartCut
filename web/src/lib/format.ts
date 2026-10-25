/** Formatea un número como COP sin decimales: 25000 → "$25.000" */
export function cop(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

/** "YYYY-MM-DD" → "lunes, 13 de octubre de 2026" */
export function fechaLarga(fechaStr: string): string {
  const [y, m, d] = fechaStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota',
  });
}

/** "HH:MM:SS" → "HH:MM" */
export function hora(timeStr: string): string {
  return timeStr.slice(0, 5);
}

/** ["lunes","sabado"] → "Lun – Sáb" */
const DIAS: Record<string, string> = {
  lunes: 'Lun',
  martes: 'Mar',
  miercoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie',
  sabado: 'Sáb',
  domingo: 'Dom',
};
export function diasCortos(dias: string[]): string {
  return dias.map((d) => DIAS[d] ?? d).join(' · ');
}

/** Duración legible: 90 → "1 h 30 min", 30 → "30 min" */
export function duracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
