import { useMutacion, type EstadoMutacion } from '../../../../core/hooks/useMutacion';
import { useMemo } from 'react';
import * as equipoApi from '../../data/remote/equipo.api';
import type { EstadoBarbero } from '../../../auth/domain/auth';
import type {
  AusenciaRegistrada,
  BarberoCreado,
  CambioComisionResultado,
  CambioEstadoResultado,
  NuevaAusencia,
  NuevoBarbero,
} from '../../domain/equipo';

/**
 * Registrar ausencia/incapacidad. `esIncapacidad: true` cancela por trigger las
 * citas futuras del barbero: la app debe advertirlo antes de confirmar.
 */
export function useRegistrarAusencia(): EstadoMutacion<
  { idBarbero: number; ausencia: NuevaAusencia },
  AusenciaRegistrada
> {
  const mutacion = useMutacion(({ idBarbero, ausencia }: { idBarbero: number; ausencia: NuevaAusencia }) =>
    equipoApi.registrarAusencia(idBarbero, ausencia).then((respuesta) => respuesta.ausencia),
  );
  return mutacion;
}

/** Cambiar estado: activo, incapacitado, inactivo. */
export function useCambiarEstadoBarbero(): EstadoMutacion<
  { idBarbero: number; estado: EstadoBarbero },
  CambioEstadoResultado
> {
  const mutacion = useMutacion(({ idBarbero, estado }: { idBarbero: number; estado: EstadoBarbero }) =>
    equipoApi.cambiarEstado(idBarbero, estado).then((respuesta) => respuesta.barbero),
  );
  return mutacion;
}

/** Ajustar el porcentaje de comisión, de 0 a 100. */
export function useCambiarComision(): EstadoMutacion<
  { idBarbero: number; porcentaje: number },
  CambioComisionResultado
> {
  const mutacion = useMutacion(({ idBarbero, porcentaje }: { idBarbero: number; porcentaje: number }) =>
    equipoApi.cambiarComision(idBarbero, porcentaje).then((respuesta) => respuesta.barbero),
  );
  return mutacion;
}

/** Alta de barbero con credenciales provisionales. */
export function useCrearBarbero(): EstadoMutacion<NuevoBarbero, BarberoCreado> {
  const mutacion = useMutacion((datos: NuevoBarbero) =>
    equipoApi.crearBarbero(datos).then((respuesta) => respuesta.barbero),
  );
  return mutacion;
}

/** Agrupa las cuatro mutaciones de acciones de equipo, por si una pantalla las necesita todas. */
export function useAccionesEquipo() {
  const registrarAusencia = useRegistrarAusencia();
  const cambiarEstado = useCambiarEstadoBarbero();
  const cambiarComision = useCambiarComision();
  const crearBarbero = useCrearBarbero();

  return useMemo(
    () => ({ registrarAusencia, cambiarEstado, cambiarComision, crearBarbero }),
    [registrarAusencia, cambiarEstado, cambiarComision, crearBarbero],
  );
}
