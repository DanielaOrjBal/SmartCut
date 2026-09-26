import { BASE_URL, REQUEST_TIMEOUT_MS } from '../config/env';

/**
 * Error de API con el código HTTP y el mensaje ya listo para mostrarle
 * al usuario. El backend redacta sus mensajes en español (los SIGNAL de
 * los triggers y los del errorHandler), así que se muestran tal cual.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly detalle: unknown;

  constructor(mensaje: string, status: number, detalle: unknown = null) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.detalle = detalle;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  /** Cuerpo a serializar como JSON. Se omite en GET/DELETE si no se pasa. */
  body?: unknown;
  /** Token JWT para esta petición. Si no se pasa, se usa el token global. */
  token?: string | null;
  signal?: AbortSignal;
};

/**
 * Token JWT en memoria. Lo fija el AuthContext al iniciar sesión y lo
 * limpia al cerrarla, para no tener que pasarlo en cada llamada.
 */
let tokenEnMemoria: string | null = null;

export function setAuthToken(token: string | null): void {
  tokenEnMemoria = token;
}

export function getAuthToken(): string | null {
  return tokenEnMemoria;
}

const MENSAJES_POR_ESTADO: Readonly<Record<number, string>> = {
  400: 'Los datos enviados no son válidos.',
  401: 'Correo o contraseña incorrectos.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No encontramos lo que buscabas.',
  409: 'Ese registro ya existe.',
  500: 'Ocurrió un error en el servidor. Intenta de nuevo en un momento.',
};

const MENSAJE_GENERICO = 'Ocurrió un error inesperado. Intenta de nuevo.';

const MENSAJE_SIN_RED =
  'No pudimos conectar con el servidor. Revisa que esté encendido y que la ' +
  'dirección configurada en src/core/config/env.ts sea la correcta.';

function parsearJson(texto: string): unknown {
  if (texto.trim().length === 0) {
    return null;
  }
  try {
    return JSON.parse(texto) as unknown;
  } catch {
    return texto;
  }
}

function extraerMensaje(cuerpo: unknown, status: number): string {
  if (typeof cuerpo === 'object' && cuerpo !== null) {
    const registro = cuerpo as Record<string, unknown>;
    for (const clave of ['mensaje', 'error', 'message']) {
      const valor = registro[clave];
      if (typeof valor === 'string' && valor.trim().length > 0) {
        return valor;
      }
    }
  }
  if (typeof cuerpo === 'string' && cuerpo.trim().length > 0) {
    return cuerpo;
  }
  return MENSAJES_POR_ESTADO[status] ?? MENSAJE_GENERICO;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const token = options.token !== undefined ? options.token : tokenEnMemoria;
  if (token !== null && token.length > 0) {
    headers.Authorization = `Bearer ${token}`;
  }

  // AbortSignal.timeout() no está disponible en todos los runtimes de RN,
  // así que se arma el timeout a mano.
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), REQUEST_TIMEOUT_MS);
  options.signal?.addEventListener('abort', () => controlador.abort());

  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controlador.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('El servidor tardó demasiado en responder.', 0, error);
    }
    throw new ApiError(MENSAJE_SIN_RED, 0, error);
  } finally {
    clearTimeout(temporizador);
  }

  const cuerpo = parsearJson(await respuesta.text());

  if (!respuesta.ok) {
    throw new ApiError(extraerMensaje(cuerpo, respuesta.status), respuesta.status, cuerpo);
  }

  return cuerpo as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions): Promise<T> =>
    request<T>('DELETE', path, options),
};
