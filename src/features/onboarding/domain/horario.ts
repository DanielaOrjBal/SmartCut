import { DIAS_SEMANA, type DiaSemana } from './onboarding';

/** Inicial que se muestra en el chip. La X de miércoles evita chocar con martes. */
export const INICIAL_DIA: Record<DiaSemana, string> = {
  lunes: 'L',
  martes: 'M',
  miercoles: 'X',
  jueves: 'J',
  viernes: 'V',
  sabado: 'S',
  domingo: 'D',
};

/** Nombre con tilde para mostrar. En la base van sin tilde (es un SET). */
export const NOMBRE_DIA: Record<DiaSemana, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

/** Ordena de lunes a domingo, sin importar en qué orden se tocaron los chips. */
export function ordenarDias(dias: DiaSemana[]): DiaSemana[] {
  return DIAS_SEMANA.filter((dia) => dias.includes(dia));
}

/** 'HH:MM:SS' → 'HH:MM' para mostrar en el input. */
export function aHoraCorta(hora: string): string {
  return hora.slice(0, 5);
}

/** 'HH:MM' → 'HH:MM:SS', que es lo que espera el tipo TIME de MySQL. */
export function aHoraLarga(hora: string): string {
  return hora.length === 5 ? `${hora}:00` : hora;
}

/** 'HH:MM:SS' → '08:00 AM', solo para el resumen. */
export function aHora12(hora: string): string {
  const [horasTexto, minutos] = aHoraCorta(hora).split(':');
  const horas = Number(horasTexto);
  const sufijo = horas < 12 ? 'AM' : 'PM';
  const horas12 = horas % 12 === 0 ? 12 : horas % 12;
  return `${String(horas12).padStart(2, '0')}:${minutos} ${sufijo}`;
}

export function horaEsValida(hora: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(aHoraCorta(hora));
}

/**
 * Texto legible de los días: 'Lunes a Sábado' cuando son consecutivos,
 * la lista completa cuando no lo son.
 */
export function resumenDias(dias: DiaSemana[]): string {
  const ordenados = ordenarDias(dias);

  if (ordenados.length === 0) {
    return 'Sin días seleccionados';
  }
  if (ordenados.length === 7) {
    return 'Todos los días';
  }
  if (ordenados.length === 1) {
    return NOMBRE_DIA[ordenados[0]];
  }

  const indices = ordenados.map((dia) => DIAS_SEMANA.indexOf(dia));
  const consecutivos = indices.every(
    (indice, posicion) => posicion === 0 || indice === indices[posicion - 1] + 1,
  );

  if (consecutivos) {
    return `${NOMBRE_DIA[ordenados[0]]} a ${NOMBRE_DIA[ordenados[ordenados.length - 1]]}`;
  }

  const nombres = ordenados.map((dia) => NOMBRE_DIA[dia]);
  const ultimo = nombres.pop() as string;
  return `${nombres.join(', ')} y ${ultimo}`;
}

/** 'Lunes a Sábado · 08:00 AM — 07:00 PM' */
export function resumenHorario(
  dias: DiaSemana[],
  horaApertura: string,
  horaCierre: string,
): string {
  return `${resumenDias(dias)} · ${aHora12(horaApertura)} — ${aHora12(horaCierre)}`;
}
