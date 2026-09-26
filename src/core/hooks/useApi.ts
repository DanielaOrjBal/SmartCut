import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api/client';

export type EstadoApi<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export type OpcionesApi = {
  /**
   * En `false`, no dispara la petición ni cambia `loading`. Sirve para
   * encadenar hooks: p. ej. la agenda de "Mi trabajo" del administrador
   * necesita su propio id, que sale de `usePerfil()`, y no debe salir a pedir
   * datos con un id todavía indefinido.
   */
  habilitado?: boolean;
};

/**
 * Hook base para cualquier pantalla con datos.
 *
 * Todo hook de `presentation/hooks/` de cada feature es una envoltura
 * delgada sobre este: le pasa la función que llama al `apiClient` y recibe
 * `{ data, loading, error, refetch }` listo para los tres estados visuales
 * que exige cada pantalla — cargando, error con reintento, y vacío (este
 * último lo decide la pantalla según la forma de `data`, no este hook).
 *
 * `peticion` se vuelve a ejecutar cuando cambia alguno de `deps`, igual que un
 * `useEffect`. Se ignora el resultado si la pantalla se desmontó o si ya
 * salió una petición más nueva mientras esta seguía en el aire, para que una
 * respuesta lenta no pise a una más reciente.
 */
export function useApi<T>(
  peticion: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
  opciones?: OpcionesApi,
): EstadoApi<T> {
  const habilitado = opciones?.habilitado ?? true;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(habilitado);
  const [error, setError] = useState<string | null>(null);
  const idPeticionVigente = useRef(0);

  const ejecutar = useCallback(() => {
    if (!habilitado) {
      // Invalida cualquier petición en curso: si se deshabilita a mitad de
      // camino, su respuesta ya no debe escribir en el estado.
      idPeticionVigente.current += 1;
      setLoading(false);
      return;
    }

    const idDeEstaPeticion = idPeticionVigente.current + 1;
    idPeticionVigente.current = idDeEstaPeticion;

    setLoading(true);
    setError(null);

    peticion()
      .then((resultado) => {
        if (idPeticionVigente.current === idDeEstaPeticion) {
          setData(resultado);
        }
      })
      .catch((error_: unknown) => {
        if (idPeticionVigente.current !== idDeEstaPeticion) {
          return;
        }
        const mensaje =
          error_ instanceof ApiError
            ? error_.message
            : 'Ocurrió un error inesperado. Intenta de nuevo.';
        setError(mensaje);
      })
      .finally(() => {
        if (idPeticionVigente.current === idDeEstaPeticion) {
          setLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habilitado, ...deps]);

  useEffect(() => {
    ejecutar();
  }, [ejecutar]);

  return { data, loading, error, refetch: ejecutar };
}
