import { useMutacion, type EstadoMutacion } from '../../../../core/hooks/useMutacion';
import * as configuracionApi from '../../data/remote/configuracion.api';
import type { BarberiaInfo, NuevoHorario } from '../../domain/configuracion';

/** Configurar el horario de atención. Solo admin. */
export function useActualizarHorario(): EstadoMutacion<NuevoHorario, BarberiaInfo> {
  const mutacion = useMutacion((horario: NuevoHorario) =>
    configuracionApi.actualizarHorario(horario).then((respuesta) => respuesta.barberia),
  );
  return mutacion;
}
