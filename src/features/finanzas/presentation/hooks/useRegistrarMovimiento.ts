import { useMutacion, type EstadoMutacion } from '../../../../core/hooks/useMutacion';
import * as finanzasApi from '../../data/remote/finanzas.api';
import type { NuevoMovimiento } from '../../domain/finanzas';

/**
 * Registro de un movimiento manual.
 *
 * Las tres reglas de fecha las valida `sp_registrar_movimiento` y el mensaje
 * ya llega en español listo para mostrar en `error`; la app solo las aplica
 * antes de enviar como ayuda de interfaz (bloquear el selector de fecha), no
 * como la validación real.
 */
export function useRegistrarMovimiento(): EstadoMutacion<
  NuevoMovimiento,
  { idMovimiento: number }
> {
  const mutacion = useMutacion((movimiento: NuevoMovimiento) =>
    finanzasApi.registrarMovimiento(movimiento).then((respuesta) => respuesta.movimiento),
  );
  return mutacion;
}
