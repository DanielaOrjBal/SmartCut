const { pool } = require('../config/db');
const { config } = require('../config/env');
const { obtenerClienteGemini } = require('../config/gemini');
const { AppError } = require('../utils/AppError');
const { numero } = require('../utils/numero');

function resultadoSet(resultado, indice) {
  return Array.isArray(resultado?.[indice]) ? resultado[indice] : [];
}

// ─── Caché en memoria del contexto financiero ────────────────────────────────
// Evita consultar la BD en cada pregunta: el contexto "últimos 30 días"
// cambia muy poco en 60 segundos, así que la segunda pregunta (o más) no espera.
const _cacheContexto = new Map();
const CACHE_TTL_MS = 60_000; // 1 minuto

function formatoCOP(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(numero(valor));
}

/**
 * Obtiene agregados de los últimos 30 días. Gemini nunca recibe acceso a la
 * base de datos: solamente esta representación reducida y sin PII.
 * El resultado se guarda en caché 60 s para evitar una consulta a la BD
 * en cada pregunta del usuario.
 */
async function obtenerContextoFinanciero(idBarberia) {
  const ahora = Date.now();
  const entrada = _cacheContexto.get(idBarberia);
  if (entrada && ahora - entrada.fecha < CACHE_TTL_MS) {
    return entrada.contexto;
  }

  const [resultado] = await pool.query('CALL sp_contexto_financiero(?)', [idBarberia]);
  const resumen = resultadoSet(resultado, 0)[0] ?? {};
  const barberos = resultadoSet(resultado, 1).slice(0, 3);
  const categorias = resultadoSet(resultado, 2).slice(0, 3);

  const contexto = {
    periodo: 'últimos 30 días',
    resumen: {
      ingresos: numero(resumen.ingresos),
      egresos: numero(resumen.egresos),
      utilidad: numero(resumen.utilidad),
    },
    topBarberos: barberos.map((fila) => ({
      nombre: String(fila.barbero ?? 'Sin nombre').trim(),
      facturacion: numero(fila.facturacion),
      citasAtendidas: numero(fila.citas_atendidas),
    })),
    topCategoriasEgreso: categorias.map((fila) => ({
      categoria: String(fila.categoria ?? 'Sin categoría').trim(),
      total: numero(fila.total),
    })),
  };

  _cacheContexto.set(idBarberia, { contexto, fecha: ahora });
  return contexto;
}

/**
 * Construye la instrucción del sistema (sin la pregunta del usuario).
 * Separar la instrucción del contenido del usuario previene la inyección de
 * prompt: el modelo recibe cada parte por canales distintos de la API y no
 * puede confundirlas.
 */
function construirInstruccionSistema(contexto) {
  const barberos =
    contexto.topBarberos.length === 0
      ? 'Sin datos de facturación por barbero.'
      : contexto.topBarberos
          .map(
            (barbero, indice) =>
              `${indice + 1}. ${barbero.nombre}: ${formatoCOP(barbero.facturacion)} en ${barbero.citasAtendidas} citas`,
          )
          .join('\n');
  const categorias =
    contexto.topCategoriasEgreso.length === 0
      ? 'Sin egresos registrados.'
      : contexto.topCategoriasEgreso
          .map((categoria, indice) => `${indice + 1}. ${categoria.categoria}: ${formatoCOP(categoria.total)}`)
          .join('\n');

  return `Eres el asistente financiero de SmartCut. Responde en español de Colombia, de forma breve y clara.

Solo puedes analizar los datos agregados entregados aquí. No inventes datos, no supongas cifras y no menciones que tienes acceso a una base de datos. Si los datos no alcanzan para responder, dilo claramente.

Eres estrictamente de solo lectura: no puedes registrar, editar, anular ni eliminar citas, movimientos, cajas, servicios ni usuarios. Ante una solicitud de modificación, explica que el administrador debe realizarla desde el módulo correspondiente.

Contexto de ${contexto.periodo}:
- Ingresos: ${formatoCOP(contexto.resumen.ingresos)}
- Egresos: ${formatoCOP(contexto.resumen.egresos)}
- Utilidad: ${formatoCOP(contexto.resumen.utilidad)}

Top 3 barberos por facturación:
${barberos}

Top 3 categorías de egreso:
${categorias}`;
}

function conTimeout(promesa, milisegundos) {
  let temporizador;
  const limite = new Promise((_, rechazar) => {
    temporizador = setTimeout(
      () => rechazar(new AppError('El asistente tardó demasiado en responder. Intenta de nuevo.', 504)),
      milisegundos,
    );
  });

  return Promise.race([promesa, limite]).finally(() => clearTimeout(temporizador));
}

/**
 * Llama a la API de Gemini con un reintento inmediato si el primer intento
 * falla (timeout o error de red). El segundo fallo se propaga al llamador
 * para que lo convierta en una respuesta amigable.
 */
async function llamarConReintento(cliente, params, timeoutMs) {
  try {
    return await conTimeout(cliente.models.generateContent(params), timeoutMs);
  } catch (primerError) {
    console.error(
      `[gemini] Primer intento fallido: ${primerError.constructor.name}: ${primerError.message ?? '(sin mensaje)'}`,
    );
    // Sin delay: reintentar de inmediato reduce el tiempo total en caso de fallo transitorio.
    return await conTimeout(cliente.models.generateContent(params), timeoutMs);
  }
}

async function consultarAsistente({ idBarberia, pregunta }) {
  const contexto = await obtenerContextoFinanciero(idBarberia);
  const cliente = obtenerClienteGemini();

  let interaccion;
  try {
    interaccion = await llamarConReintento(
      cliente,
      {
        model: config.gemini.model,
        // systemInstruction y contents son canales separados en la API:
        // el modelo no puede confundir las instrucciones del sistema con el
        // input del usuario, lo que elimina el vector de inyección de prompt.
        config: {
          systemInstruction: construirInstruccionSistema(contexto),
          // Limitar la respuesta a ~400 tokens reduce el tiempo de generación
          // considerablemente: para Q&A financiero breve sobra con ese límite.
          maxOutputTokens: 400,
          // temperature 0 = respuestas deterministas; Gemini las genera más rápido.
          temperature: 0,
        },
        contents: pregunta,
      },
      config.gemini.timeoutMs,
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('El asistente no está disponible en este momento. Intenta de nuevo más tarde.', 502);
  }

  const respuesta = typeof interaccion.text === 'string' ? interaccion.text.trim() : '';
  if (respuesta.length === 0) {
    throw new AppError('El asistente no devolvió una respuesta. Intenta reformular tu pregunta.', 502);
  }

  return { respuesta };
}

module.exports = { consultarAsistente, construirInstruccionSistema };