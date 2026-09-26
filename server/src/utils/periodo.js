/**
 * Resolución de rangos de fecha para todos los endpoints con período.
 *
 * Los rangos se calculan AQUÍ y no en la app: si cada pantalla armara su
 * propio "este mes", bastaría con que un celular tuviera la fecha corrida
 * para que sus cifras no cuadraran con las de otro. El servidor manda.
 *
 * Todo el archivo trabaja en hora de Bogotá porque `index.js` fija
 * `process.env.TZ = 'America/Bogota'` antes de cargar cualquier módulo.
 *
 * **La semana empieza el lunes**, como en Colombia y como `WEEKDAY()` de
 * MySQL, donde 0 es lunes. `Date.getDay()` de JavaScript usa domingo = 0, así
 * que en todo el archivo se corre con `(getDay() + 6) % 7`.
 */

const PERIODOS_VALIDOS = ['dia', 'semana', 'mes', 'trimestre', 'anio'];
const PERIODO_POR_DEFECTO = 'mes';

const MILISEGUNDOS_POR_DIA = 86_400_000;

/**
 * Date → 'YYYY-MM-DD' con los campos locales.
 *
 * `toISOString()` sería un error aquí: convierte a UTC, y en Bogotá cualquier
 * fecha local sale como el día anterior a partir de las 7 p.m.
 */
function aISO(fecha) {
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fecha.getDate()}`.padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** 'YYYY-MM-DD' → Date local a medianoche. */
function desdeISO(iso) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (partes === null) {
    return null;
  }
  return new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
}

/** Rango calendario del período que contiene a `referencia`. */
function rangoDe(periodo, referencia) {
  const anio = referencia.getFullYear();
  const mes = referencia.getMonth();
  const dia = referencia.getDate();

  switch (periodo) {
    case 'dia':
      return { desde: aISO(referencia), hasta: aISO(referencia) };

    case 'semana': {
      const desplazamiento = (referencia.getDay() + 6) % 7; // lunes = 0
      return {
        desde: aISO(new Date(anio, mes, dia - desplazamiento)),
        hasta: aISO(new Date(anio, mes, dia - desplazamiento + 6)),
      };
    }

    case 'mes':
      // El día 0 del mes siguiente es el último día del mes actual.
      return { desde: aISO(new Date(anio, mes, 1)), hasta: aISO(new Date(anio, mes + 1, 0)) };

    case 'trimestre': {
      const primerMes = Math.floor(mes / 3) * 3;
      return {
        desde: aISO(new Date(anio, primerMes, 1)),
        hasta: aISO(new Date(anio, primerMes + 3, 0)),
      };
    }

    case 'anio':
    default:
      return { desde: aISO(new Date(anio, 0, 1)), hasta: aISO(new Date(anio, 11, 31)) };
  }
}

/**
 * Traduce los parámetros de la petición a un rango concreto.
 *
 * `desde` y `hasta` explícitos ganan sobre `periodo`: son lo que usa la agenda
 * cuando el usuario navega a una semana que no es la actual. En ese caso el
 * período resultante se marca como 'personalizado', porque ya no corresponde a
 * ningún mes ni trimestre del calendario.
 *
 * Si no llega nada, el período es `mes`, que es el que la app trae por defecto.
 *
 * @returns {{ periodo: string, desde: string, hasta: string }}
 */
function resolverPeriodo(periodo, desde, hasta) {
  const inicio = desdeISO(desde);
  const fin = desdeISO(hasta);

  if (inicio !== null && fin !== null) {
    // Si vienen al revés se enderezan en vez de devolver un rango vacío.
    return inicio <= fin
      ? { periodo: 'personalizado', desde: aISO(inicio), hasta: aISO(fin) }
      : { periodo: 'personalizado', desde: aISO(fin), hasta: aISO(inicio) };
  }

  const elegido = PERIODOS_VALIDOS.includes(periodo) ? periodo : PERIODO_POR_DEFECTO;
  return { periodo: elegido, ...rangoDe(elegido, new Date()) };
}

/**
 * El mismo rango desplazado un período hacia atrás, para la comparación de
 * utilidad del resumen financiero.
 *
 * En los períodos de calendario se devuelve el anterior COMPLETO (el mes
 * pasado entero, no los últimos 30 días), porque es contra eso que un dueño
 * compara. En un rango personalizado se desplaza tantos días como dure, que es
 * lo único con sentido cuando el rango no encaja en el calendario.
 *
 * @returns {{ periodo: string, desde: string, hasta: string }}
 */
function periodoAnterior(periodo, desde, hasta) {
  const actual = resolverPeriodo(periodo, desde, hasta);
  const inicio = desdeISO(actual.desde);
  const fin = desdeISO(actual.hasta);

  if (actual.periodo === 'personalizado') {
    const dias = Math.round((fin.getTime() - inicio.getTime()) / MILISEGUNDOS_POR_DIA) + 1;
    const nuevoFin = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() - 1);
    const nuevoInicio = new Date(
      inicio.getFullYear(),
      inicio.getMonth(),
      inicio.getDate() - dias,
    );
    return { periodo: 'personalizado', desde: aISO(nuevoInicio), hasta: aISO(nuevoFin) };
  }

  const anio = inicio.getFullYear();
  const mes = inicio.getMonth();
  const dia = inicio.getDate();

  let referencia;
  switch (actual.periodo) {
    case 'dia':
      referencia = new Date(anio, mes, dia - 1);
      break;
    case 'semana':
      referencia = new Date(anio, mes, dia - 7);
      break;
    case 'mes':
      referencia = new Date(anio, mes - 1, 1);
      break;
    case 'trimestre':
      referencia = new Date(anio, mes - 3, 1);
      break;
    case 'anio':
    default:
      referencia = new Date(anio - 1, 0, 1);
      break;
  }

  return { periodo: actual.periodo, ...rangoDe(actual.periodo, referencia) };
}

/** 'YYYY-MM-DD' de hoy en Bogotá. */
function hoyISO() {
  return aISO(new Date());
}

module.exports = {
  PERIODOS_VALIDOS,
  aISO,
  desdeISO,
  hoyISO,
  rangoDe,
  resolverPeriodo,
  periodoAnterior,
};
