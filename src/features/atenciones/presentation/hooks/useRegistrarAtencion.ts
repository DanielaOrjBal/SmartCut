import { useMutacion, type EstadoMutacion } from '../../../../core/hooks/useMutacion';
import * as atencionesApi from '../../data/remote/atenciones.api';
import type { AtencionRegistrada, NuevaAtencion } from '../../domain/atencion';

/**
 * Registro de una atención sin cita.
 *
 * Quien use este hook debe refrescar el dashboard (y la agenda, si está
 * visible) después de que `ejecutar` resuelva: la atención finaliza de
 * inmediato y ya generó su ingreso, así que las tarjetas quedan desactualizadas
 * hasta que se les pida el dato de nuevo.
 */
export function useRegistrarAtencion(): EstadoMutacion<NuevaAtencion, AtencionRegistrada> {
  const mutacion = useMutacion((atencion: NuevaAtencion) =>
    atencionesApi.registrarAtencion(atencion).then((respuesta) => respuesta.atencion),
  );
  return mutacion;
}
