import { useMutacion, type EstadoMutacion } from '../../../../core/hooks/useMutacion';
import * as configuracionApi from '../../data/remote/configuracion.api';
import type { ActualizarPerfilPayload } from '../../domain/configuracion';
import type { PerfilUsuario } from '../../../dashboard/domain/dashboard';

/** Actualizar nombre, apellido y teléfono del usuario en sesión. */
export function useActualizarPerfil(): EstadoMutacion<ActualizarPerfilPayload, PerfilUsuario> {
  return useMutacion((datos: ActualizarPerfilPayload) =>
    configuracionApi.actualizarPerfil(datos).then((respuesta) => respuesta.perfil),
  );
}
