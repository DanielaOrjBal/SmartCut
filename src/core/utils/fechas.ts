/**
 * Fechas y horas en español de Colombia.
 *
 * Dos decisiones que atraviesan todo el archivo:
 *
 *  1. Las cadenas 'YYYY-MM-DD' que devuelve la base NUNCA se pasan a
 *     `new Date(cadena)`. El motor las interpreta como medianoche UTC, y en
 *     Bogotá (UTC-5) eso es las 7 p.m. del día ANTERIOR: una cita del 7 se
 *     mostraría como del 6. Se parten a mano y se arma la fecha local.
 *
 *  2. Los nombres de mes y día se escriben aquí en vez de usar `toLocaleString`.
 *     En Android el motor de JS de React Native viene sin los datos de
 *     configuración regional completos y 'es-CO' cae a inglés sin avisar.
 */

const DIAS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

/** 'YYYY-MM-DD' → Date local a medianoche. Devuelve null si no tiene forma. */
export function fechaDesdeISO(iso: string): Date | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (partes === null) {
    return null;
  }
  return new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
}

/**
 * Un DATETIME de MySQL llega como '2026-09-07 14:30:00' (con espacio, sin
 * zona). `new Date()` no lo acepta en iOS, así que se parte igual que la fecha.
 */
export function fechaHoraDesdeISO(valor: string): Date | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(valor);
  if (partes === null) {
    return fechaDesdeISO(valor);
  }
  return new Date(
    Number(partes[1]),
    Number(partes[2]) - 1,
    Number(partes[3]),
    Number(partes[4]),
    Number(partes[5]),
    Number(partes[6] ?? '0'),
  );
}

/** Date → 'YYYY-MM-DD' usando los campos locales, nunca `toISOString()`. */
export function aISO(fecha: Date): string {
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fecha.getDate()}`.padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function hoyISO(): string {
  return aISO(new Date());
}

/** '14:30:00' o '14:30' → '2:30 p. m.' */
export function formatearHora(hora: string): string {
  const partes = /^(\d{1,2}):(\d{2})/.exec(hora);
  if (partes === null) {
    return hora;
  }
  const horas24 = Number(partes[1]);
  const sufijo = horas24 < 12 ? 'a. m.' : 'p. m.';
  const horas12 = horas24 % 12 === 0 ? 12 : horas24 % 12;
  return `${horas12}:${partes[2]} ${sufijo}`;
}

/** '2026-09-07' → 'lunes, 7 de septiembre' */
export function formatearFechaLarga(iso: string): string {
  const fecha = fechaDesdeISO(iso);
  if (fecha === null) {
    return iso;
  }
  return `${DIAS[fecha.getDay()]}, ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}

/** '2026-09-07' → '7 sep' — para etiquetas de eje, donde el espacio manda. */
export function formatearFechaCorta(iso: string): string {
  const fecha = fechaDesdeISO(iso);
  if (fecha === null) {
    return iso;
  }
  return `${fecha.getDate()} ${MESES[fecha.getMonth()].slice(0, 3)}`;
}

/** '2026-03' → 'marzo'. Es el formato que devuelve sp_gastos_mensuales_anio. */
export function nombreDelMes(periodo: string): string {
  const partes = /^(\d{4})-(\d{2})$/.exec(periodo);
  if (partes === null) {
    return periodo;
  }
  return MESES[Number(partes[2]) - 1] ?? periodo;
}

/** '2026-03' → 'mar' */
export function nombreMesCorto(periodo: string): string {
  return nombreDelMes(periodo).slice(0, 3);
}

export function nombreMesPorNumero(mes: number): string {
  return MESES[mes - 1] ?? '';
}

/**
 * Fecha relativa para el encabezado: "hoy a las 3:45 p. m.", "ayer a las
 * 9:10 a. m.", "el 3 de septiembre a las 8:00 a. m.".
 *
 * Se compara por día calendario y no por horas transcurridas: a la 1 a. m.,
 * algo de las 11 p. m. de anoche es "ayer" aunque hayan pasado dos horas.
 */
export function formatearUltimoAcceso(valor: string | null | undefined): string | null {
  if (valor === null || valor === undefined || valor.length === 0) {
    return null;
  }
  const fecha = fechaHoraDesdeISO(valor);
  if (fecha === null) {
    return null;
  }

  const hhmm = `${`${fecha.getHours()}`.padStart(2, '0')}:${`${fecha.getMinutes()}`.padStart(2, '0')}`;
  const hora = formatearHora(hhmm);

  const hoy = new Date();
  const diaDe = (d: Date): number => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diasDeDiferencia = Math.round((diaDe(hoy) - diaDe(fecha)) / 86_400_000);

  if (diasDeDiferencia === 0) {
    return `hoy a las ${hora}`;
  }
  if (diasDeDiferencia === 1) {
    return `ayer a las ${hora}`;
  }
  if (diasDeDiferencia > 1 && diasDeDiferencia < 7) {
    return `el ${DIAS[fecha.getDay()]} a las ${hora}`;
  }
  return `el ${fecha.getDate()} de ${MESES[fecha.getMonth()]} a las ${hora}`;
}

/** Los cinco períodos que maneja el backend. */
export type Periodo = 'dia' | 'semana' | 'mes' | 'trimestre' | 'anio';

export const PERIODOS: ReadonlyArray<{ valor: Periodo; etiqueta: string }> = [
  { valor: 'dia', etiqueta: 'Día' },
  { valor: 'semana', etiqueta: 'Semana' },
  { valor: 'mes', etiqueta: 'Mes' },
  { valor: 'trimestre', etiqueta: 'Trimestre' },
  { valor: 'anio', etiqueta: 'Año' },
];

/**
 * Rango de un período alrededor de una fecha de referencia.
 *
 * Réplica exacta de `resolverPeriodo` del backend, para que la agenda pueda
 * navegar entre semanas y meses sin pedirle al servidor que le diga qué rango
 * sigue. **La semana empieza el lunes**, como en Colombia y como `WEEKDAY()`
 * de MySQL, donde 0 es lunes.
 */
export function rangoDePeriodo(
  periodo: Periodo,
  referencia: Date = new Date(),
): { desde: string; hasta: string } {
  const anio = referencia.getFullYear();
  const mes = referencia.getMonth();
  const dia = referencia.getDate();

  switch (periodo) {
    case 'dia':
      return { desde: aISO(referencia), hasta: aISO(referencia) };

    case 'semana': {
      // getDay() da 0 para domingo; se corre para que el lunes sea 0.
      const desplazamiento = (referencia.getDay() + 6) % 7;
      const lunes = new Date(anio, mes, dia - desplazamiento);
      const domingo = new Date(anio, mes, dia - desplazamiento + 6);
      return { desde: aISO(lunes), hasta: aISO(domingo) };
    }

    case 'mes':
      // El día 0 del mes siguiente es el último del actual.
      return { desde: aISO(new Date(anio, mes, 1)), hasta: aISO(new Date(anio, mes + 1, 0)) };

    case 'trimestre': {
      const primerMes = Math.floor(mes / 3) * 3;
      return {
        desde: aISO(new Date(anio, primerMes, 1)),
        hasta: aISO(new Date(anio, primerMes + 3, 0)),
      };
    }

    case 'anio':
      return { desde: aISO(new Date(anio, 0, 1)), hasta: aISO(new Date(anio, 11, 31)) };
  }
}

/** Corre la fecha de referencia un período hacia atrás (-1) o adelante (+1). */
export function desplazarReferencia(periodo: Periodo, referencia: Date, pasos: number): Date {
  const anio = referencia.getFullYear();
  const mes = referencia.getMonth();
  const dia = referencia.getDate();

  switch (periodo) {
    case 'dia':
      return new Date(anio, mes, dia + pasos);
    case 'semana':
      return new Date(anio, mes, dia + pasos * 7);
    case 'mes':
      return new Date(anio, mes + pasos, 1);
    case 'trimestre':
      return new Date(anio, mes + pasos * 3, 1);
    case 'anio':
      return new Date(anio + pasos, mes, 1);
  }
}

/** Rótulo del rango que se muestra junto a las flechas de navegación. */
export function etiquetaDeRango(periodo: Periodo, referencia: Date): string {
  const { desde, hasta } = rangoDePeriodo(periodo, referencia);
  const inicio = fechaDesdeISO(desde);
  const fin = fechaDesdeISO(hasta);
  if (inicio === null || fin === null) {
    return '';
  }

  switch (periodo) {
    case 'dia':
      return formatearFechaLarga(desde);
    case 'semana': {
      const mesInicio = MESES[inicio.getMonth()].slice(0, 3);
      const mesFin = MESES[fin.getMonth()].slice(0, 3);
      return `${inicio.getDate()} ${mesInicio} – ${fin.getDate()} ${mesFin}`;
    }
    case 'mes':
      return `${MESES[inicio.getMonth()]} ${inicio.getFullYear()}`;
    case 'trimestre':
      return `Trimestre ${Math.floor(inicio.getMonth() / 3) + 1} de ${inicio.getFullYear()}`;
    case 'anio':
      return `${inicio.getFullYear()}`;
  }
}
