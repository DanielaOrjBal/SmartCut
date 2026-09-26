import { useCallback, useState } from 'react';
import { ApiError } from '../api/client';

export type EstadoMutacion<Entrada, Salida> = {
  ejecutar: (entrada: Entrada) => Promise<Salida>;
  cargando: boolean;
  error: string | null;
  limpiarError: () => void;
};

/**
 * Hook base para acciones que escriben (registrar una atención, anular un
 * movimiento, cambiar el estado de una cita...). Es el equivalente en
 * escritura de `useApi`.
 *
 * `ejecutar` devuelve la promesa tal cual, para que la pantalla pueda
 * reaccionar al resultado exacto (por ejemplo, mostrar el ticket y la
 * comisión que devuelve el registro de atención) además de leer `cargando`
 * para deshabilitar el botón y evitar el doble envío.
 */
export function useMutacion<Entrada, Salida>(
  accion: (entrada: Entrada) => Promise<Salida>,
): EstadoMutacion<Entrada, Salida> {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ejecutar = useCallback(
    async (entrada: Entrada): Promise<Salida> => {
      setCargando(true);
      setError(null);
      try {
        return await accion(entrada);
      } catch (error_) {
        const mensaje =
          error_ instanceof ApiError
            ? error_.message
            : 'Ocurrió un error inesperado. Intenta de nuevo.';
        setError(mensaje);
        throw error_;
      } finally {
        setCargando(false);
      }
    },
    [accion],
  );

  const limpiarError = useCallback(() => setError(null), []);

  return { ejecutar, cargando, error, limpiarError };
}
