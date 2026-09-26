const { pool } = require('../config/db');
const { primeraFila, filas, oNulo } = require('../utils/sp');
const { numero } = require('./dashboard.service');
const { aISO, desdeISO, resolverPeriodo, periodoAnterior } = require('../utils/periodo');
const { AppError } = require('../utils/AppError');

/**
 * Módulo financiero.
 *
 * Regla que gobierna todo el archivo: para el ADMINISTRADOR los ingresos son
 * la facturación completa (`movimiento_financiero.monto`); para el BARBERO son
 * su comisión (`monto_comision`). `sp_serie_ingresos_diarios` ya devuelve una u
 * otra según reciba `p_barbero_id`, y el controlador se encarga de que un
 * barbero nunca pueda pedir la serie sin ese parámetro.
 */

const MILISEGUNDOS_POR_DIA = 86_400_000;

/** Más de un mes de rango se agrupa por mes: 365 barras no se leen. */
const DIAS_MAXIMOS_CON_DETALLE_DIARIO = 31;

// ---------------------------------------------------------------- resumen ---

/** `sp_reporte_financiero` de un rango, sin las comisiones. */
async function reporteCrudo(idBarberia, desde, hasta) {
  const [resultado] = await pool.query('CALL sp_reporte_financiero(?, ?, ?)', [
    idBarberia,
    desde,
    hasta,
  ]);
  const fila = primeraFila(resultado) ?? {};

  return {
    ingresos: numero(fila.total_ingresos),
    gastos: numero(fila.total_gastos),
    compras: numero(fila.total_compras),
    utilidad: numero(fila.utilidad),
  };
}

/**
 * Total de comisiones pagadas en un rango.
 *
 * `sp_reporte_financiero` no devuelve esta cifra, así que se suma la columna
 * `comision` de `sp_ranking_barberos`, que es la que agrega
 * `movimiento_financiero.monto_comision` de las citas finalizadas del período.
 *
 * Matiz conocido: el ranking filtra por `cita.fecha` y el reporte por
 * `movimiento.fecha`. Para las atenciones registradas en la app ambas son el
 * mismo día, porque el movimiento nace del trigger en el instante en que la
 * cita se finaliza. La diferencia solo aparecería con una cita finalizada en
 * un día distinto al de su agendamiento.
 */
async function totalComisiones(idBarberia, desde, hasta) {
  const filasRanking = await rankingCrudo(idBarberia, desde, hasta);
  return filasRanking.reduce((suma, fila) => suma + fila.comision, 0);
}

/**
 * Resumen del período con la comparación contra el anterior.
 *
 * La variación se devuelve como `null` cuando la utilidad anterior es cero o
 * negativa: un porcentaje contra cero no significa nada —sería una división
 * por cero o un crecimiento infinito— y la app debe poder ocultar el indicador
 * en vez de mostrar un número inventado.
 */
async function resumen({ idBarberia, periodo, desde, hasta }) {
  const rango = resolverPeriodo(periodo, desde, hasta);
  const anterior = periodoAnterior(periodo, desde, hasta);

  const [actual, comisiones, reporteAnterior] = await Promise.all([
    reporteCrudo(idBarberia, rango.desde, rango.hasta),
    totalComisiones(idBarberia, rango.desde, rango.hasta),
    reporteCrudo(idBarberia, anterior.desde, anterior.hasta),
  ]);

  let variacion = null;
  if (reporteAnterior.utilidad > 0) {
    const porcentaje = ((actual.utilidad - reporteAnterior.utilidad) / reporteAnterior.utilidad) * 100;
    const redondeado = Math.round(porcentaje * 10) / 10;
    variacion = {
      utilidad: redondeado,
      tendencia: redondeado > 0 ? 'alza' : redondeado < 0 ? 'baja' : 'estable',
    };
  }

  return {
    rango,
    rangoAnterior: anterior,
    periodo: { ...actual, comisiones },
    anterior: { utilidad: reporteAnterior.utilidad },
    variacion,
  };
}

// ----------------------------------------------------------------- series ---

/** Añade `dias` días a una fecha 'YYYY-MM-DD' y devuelve el ISO resultante. */
function sumarDias(iso, dias) {
  const fecha = desdeISO(iso);
  return aISO(new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias));
}

/**
 * Serie de ingresos contra egresos.
 *
 * Dos cosas que el procedimiento no hace y sí necesita la gráfica:
 *
 *  1. **Rellenar los huecos.** `sp_serie_ingresos_diarios` solo devuelve los
 *     días CON movimientos. Sin relleno, dos barras contiguas podrían estar
 *     separadas por una semana real y la gráfica mentiría sobre el ritmo del
 *     negocio.
 *  2. **Agrupar por mes los rangos largos.** Un año son 365 días y, con dos
 *     barras cada uno, la gráfica se vuelve ilegible. Por encima de un mes de
 *     rango se agrupa, y la respuesta dice en `granularidad` qué se devolvió.
 */
async function serie({ idBarberia, idBarbero, periodo, desde, hasta }) {
  const rango = resolverPeriodo(periodo, desde, hasta);

  const [resultado] = await pool.query('CALL sp_serie_ingresos_diarios(?, ?, ?, ?)', [
    idBarberia,
    idBarbero ?? null,
    rango.desde,
    rango.hasta,
  ]);

  const porDia = new Map();
  for (const fila of filas(resultado)) {
    porDia.set(String(fila.dia), {
      ingresos: numero(fila.ingresos),
      egresos: numero(fila.egresos),
    });
  }

  const inicio = desdeISO(rango.desde);
  const fin = desdeISO(rango.hasta);
  const totalDias = Math.round((fin.getTime() - inicio.getTime()) / MILISEGUNDOS_POR_DIA) + 1;
  const agrupadoPorMes = totalDias > DIAS_MAXIMOS_CON_DETALLE_DIARIO;

  const acumulado = new Map();
  for (let i = 0; i < totalDias; i += 1) {
    const dia = sumarDias(rango.desde, i);
    const clave = agrupadoPorMes ? dia.slice(0, 7) : dia;
    const valores = porDia.get(dia) ?? { ingresos: 0, egresos: 0 };
    const previo = acumulado.get(clave) ?? { ingresos: 0, egresos: 0 };
    acumulado.set(clave, {
      ingresos: previo.ingresos + valores.ingresos,
      egresos: previo.egresos + valores.egresos,
    });
  }

  return {
    rango,
    granularidad: agrupadoPorMes ? 'mes' : 'dia',
    // El barbero recibe su comisión; el admin, la facturación. Lo decide el SP.
    esComision: idBarbero !== null && idBarbero !== undefined,
    puntos: [...acumulado.entries()].map(([clave, valores]) => ({ clave, ...valores })),
  };
}

// ---------------------------------------------------------------- ranking ---

async function rankingCrudo(idBarberia, desde, hasta) {
  const [resultado] = await pool.query('CALL sp_ranking_barberos(?, ?, ?)', [
    idBarberia,
    desde,
    hasta,
  ]);

  return filas(resultado).map((fila) => ({
    idBarbero: numero(fila.id_barbero),
    barbero: (fila.barbero ?? '').trim(),
    porcentajeComision: numero(fila.porcentaje_comision),
    citasAtendidas: numero(fila.citas_atendidas),
    facturacion: numero(fila.facturacion),
    comision: numero(fila.comision),
  }));
}

/**
 * Comparación de barberos.
 *
 * Al administrador se le entrega la tabla completa. Al barbero se le entrega
 * ÚNICAMENTE su propia fila, con su posición y el total de participantes. Ve
 * dónde está parado, no quién está arriba: ni los nombres ni las cifras de sus
 * compañeros salen del servidor. Filtrar esto en la app no serviría de nada,
 * porque los datos ya habrían viajado.
 */
async function ranking({ idBarberia, idBarbero, esAdmin, periodo, desde, hasta }) {
  const rango = resolverPeriodo(periodo, desde, hasta);
  const completo = await rankingCrudo(idBarberia, rango.desde, rango.hasta);

  if (esAdmin) {
    return { rango, barberos: completo, total: completo.length };
  }

  const indice = completo.findIndex((fila) => fila.idBarbero === idBarbero);
  if (indice === -1) {
    return { rango, barberos: [], total: completo.length, posicion: null };
  }

  return {
    rango,
    barberos: [completo[indice]],
    total: completo.length,
    posicion: indice + 1,
  };
}

// ----------------------------------------------------------------- egresos ---

/**
 * Egresos de los últimos 12 meses, mes a mes, con el rubro que más pesó.
 *
 * Usa `sp_gastos_mensuales_anio` directamente. Tal como venía en
 * smartcut_v2.sql / smartcut.sql, ese procedimiento fallaba con el error 1055
 * de MySQL (`ONLY_FULL_GROUP_BY`): sus dos subconsultas correlacionadas
 * comparaban `DATE_FORMAT(m2.fecha,'%Y-%m')` contra `DATE_FORMAT(m.fecha,'%Y-%m')`,
 * y `m.fecha` no era funcionalmente dependiente del `GROUP BY` externo. Ya se
 * corrigió en la base (`m.fecha` → `ANY_VALUE(m.fecha)` dentro de esas dos
 * subconsultas, sin tocar ninguna tabla, trigger ni otra rutina), así que
 * vuelve a poder llamarse en una sola consulta en vez del rodeo de doce
 * llamadas a `sp_egresos_por_categoria` que se usaba mientras estuvo rota.
 *
 * Los meses sin movimientos se rellenan en ceros y no se omiten: el
 * procedimiento solo devuelve los meses CON datos, y la gráfica debe mostrar
 * siempre doce barras — un mes sin gastos tiene que verse como lo que es y no
 * como un mes que no existió.
 */
async function gastosAnuales(idBarberia) {
  const [resultado] = await pool.query('CALL sp_gastos_mensuales_anio(?)', [idBarberia]);

  const porMes = new Map();
  for (const fila of filas(resultado)) {
    porMes.set(String(fila.periodo), {
      totalEgresos: numero(fila.total_egresos),
      categoriaMayor: fila.categoria_mayor,
      montoCategoriaMayor: numero(fila.monto_categoria_mayor),
    });
  }

  const hoy = new Date();
  const meses = [];
  for (let i = 11; i >= 0; i -= 1) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const clave = `${fecha.getFullYear()}-${`${fecha.getMonth() + 1}`.padStart(2, '0')}`;
    const valores = porMes.get(clave);
    meses.push({
      periodo: clave,
      totalEgresos: valores?.totalEgresos ?? 0,
      // El rubro concreto: sin esto el detalle solo podría decir cuánto se
      // gastó, no en qué.
      categoriaMayor: valores?.categoriaMayor ?? null,
      montoCategoriaMayor: valores?.montoCategoriaMayor ?? 0,
    });
  }

  return meses;
}

async function egresosPorCategoria({ idBarberia, periodo, desde, hasta }) {
  const rango = resolverPeriodo(periodo, desde, hasta);

  const [resultado] = await pool.query('CALL sp_egresos_por_categoria(?, ?, ?)', [
    idBarberia,
    rango.desde,
    rango.hasta,
  ]);

  return {
    rango,
    categorias: filas(resultado).map((fila) => ({
      idCategoria: numero(fila.id_categoria),
      nombre: fila.nombre,
      tipo: fila.tipo,
      total: numero(fila.total),
      movimientos: numero(fila.movimientos),
    })),
  };
}

// ------------------------------------------------------------ movimientos ---

function mapearMovimiento(fila) {
  return {
    idMovimiento: numero(fila.id_movimiento),
    idBarbero: fila.barbero_id === null ? null : numero(fila.barbero_id),
    tipo: fila.tipo,
    idCategoria: numero(fila.categoria_id),
    categoria: fila.categoria,
    monto: numero(fila.monto),
    // NULL en los movimientos manuales: solo los ingresos por cita reparten.
    montoComision: fila.monto_comision === null ? null : numero(fila.monto_comision),
    porcentajeAplicado:
      fila.porcentaje_aplicado === null ? null : numero(fila.porcentaje_aplicado),
    cantidad: fila.cantidad === null ? null : numero(fila.cantidad),
    unidadMedida: fila.unidad_medida,
    descripcion: fila.descripcion,
    idCita: fila.cita_id === null ? null : numero(fila.cita_id),
    origen: fila.origen,
    estado: fila.estado,
    fecha: fila.fecha,
  };
}

async function listarMovimientos({ idBarberia, idBarbero, periodo, desde, hasta, tipo }) {
  const rango = resolverPeriodo(periodo, desde, hasta);

  const [resultado] = await pool.query('CALL sp_listar_movimientos(?, ?, ?, ?, ?)', [
    idBarberia,
    idBarbero ?? null,
    rango.desde,
    rango.hasta,
    oNulo(tipo),
  ]);

  return { rango, movimientos: filas(resultado).map(mapearMovimiento) };
}

/**
 * Registra un movimiento manual.
 *
 * Las tres reglas —solo el admin, ingresos únicamente con fecha de hoy, y
 * gastos o compras nunca a futuro— las hace cumplir `sp_registrar_movimiento`,
 * que devuelve el mensaje ya redactado en español. Repetirlas aquí solo
 * crearía una segunda versión de la verdad.
 *
 * `p_barbero_id` va en NULL: un movimiento manual es del negocio, no de un
 * barbero. Los que sí tienen barbero son los ingresos automáticos por cita.
 */
async function registrarMovimiento({ idBarberia, idRegistradoPor, movimiento }) {
  const [resultado] = await pool.query(
    'CALL sp_registrar_movimiento(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      idBarberia,
      null,
      movimiento.tipo,
      movimiento.categoriaId,
      movimiento.monto,
      oNulo(movimiento.cantidad),
      oNulo(movimiento.unidadMedida),
      oNulo(movimiento.descripcion),
      // El SP compara DATE(p_fecha) con CURDATE(); la hora da igual, pero la
      // columna es DATETIME, así que se completa con el inicio del día.
      `${movimiento.fecha} 00:00:00`,
      idRegistradoPor,
    ],
  );

  const fila = primeraFila(resultado);
  if (fila === null || fila.id_movimiento === undefined) {
    throw new AppError('No se pudo registrar el movimiento. Intenta de nuevo.', 500);
  }

  return { idMovimiento: numero(fila.id_movimiento) };
}

/**
 * Anula un movimiento previa comprobación de que es de esta barbería.
 *
 * `sp_anular_movimiento` recibe solo el id y no mira de quién es, así que la
 * pertenencia se verifica antes con `sp_listar_movimientos` acotado al día del
 * movimiento. Si no aparece ahí, o no existe o es de otro negocio.
 */
async function anularMovimiento({ idBarberia, idMovimiento, fecha, motivo }) {
  const { movimientos } = await listarMovimientos({
    idBarberia,
    periodo: undefined,
    desde: fecha,
    hasta: fecha,
  });

  const objetivo = movimientos.find((m) => m.idMovimiento === idMovimiento);
  if (objetivo === undefined) {
    throw new AppError('No encontramos ese movimiento en tu barbería.', 404);
  }

  await pool.query('CALL sp_anular_movimiento(?, ?)', [idMovimiento, motivo]);
  return { idMovimiento, estado: 'anulado', motivo };
}

// ------------------------------------------------------------- categorías ---

/** Las siete categorías que crea el onboarding no se pueden eliminar. */
async function listarCategorias({ idBarberia, tipo }) {
  const [resultado] = await pool.query('CALL sp_listar_categorias(?, ?)', [
    idBarberia,
    oNulo(tipo),
  ]);

  return filas(resultado).map((fila) => ({
    idCategoria: numero(fila.id_categoria),
    nombre: fila.nombre,
    tipo: fila.tipo,
    activa: Boolean(fila.activo),
  }));
}

async function crearCategoria({ idBarberia, nombre, tipo }) {
  const [resultado] = await pool.query('CALL sp_crear_categoria(?, ?, ?)', [
    idBarberia,
    nombre,
    tipo,
  ]);

  const fila = primeraFila(resultado);
  if (fila === null || fila.id_categoria === undefined) {
    throw new AppError('No se pudo crear la categoría. Intenta de nuevo.', 500);
  }

  return { idCategoria: numero(fila.id_categoria), nombre, tipo, activa: true };
}

// ---------------------------------------------------------------- informe ---

/**
 * Datos del informe mensual en PDF.
 *
 * El procedimiento devuelve los totales del mes, pero el desglose de egresos
 * por categoría vive en otro: se piden los dos y se arma la respuesta completa,
 * para que la app genere el documento con una sola llamada.
 */
async function informeMensual({ idBarberia, anio, mes }) {
  const [resultado] = await pool.query('CALL sp_informe_mensual(?, ?, ?)', [idBarberia, anio, mes]);
  const fila = primeraFila(resultado);

  if (fila === null) {
    throw new AppError('No encontramos la información de tu barbería.', 404);
  }

  const desde = `${anio}-${`${mes}`.padStart(2, '0')}-01`;
  const hasta = aISO(new Date(anio, mes, 0));

  const [{ categorias }, comisiones] = await Promise.all([
    egresosPorCategoria({ idBarberia, desde, hasta }),
    totalComisiones(idBarberia, desde, hasta),
  ]);

  return {
    barberia: {
      nombre: fila.barberia,
      direccion: fila.direccion,
      telefono: fila.telefono,
    },
    periodo: { anio, mes, desde: fila.periodo_inicio ?? desde, hasta: fila.periodo_fin ?? hasta },
    totales: {
      ingresos: numero(fila.total_ingresos),
      gastos: numero(fila.total_gastos),
      compras: numero(fila.total_compras),
      // El SP suma monto_comision de los movimientos del mes; se prefiere esa
      // cifra y solo se recurre al ranking si viniera en cero por no haber
      // movimientos con comisión asociada.
      comisiones: numero(fila.total_comisiones) || comisiones,
      utilidad: numero(fila.utilidad),
    },
    citasFinalizadas: numero(fila.citas_finalizadas),
    egresosPorCategoria: categorias,
  };
}

module.exports = {
  resumen,
  serie,
  ranking,
  rankingCrudo,
  gastosAnuales,
  egresosPorCategoria,
  listarMovimientos,
  registrarMovimiento,
  anularMovimiento,
  listarCategorias,
  crearCategoria,
  informeMensual,
};
