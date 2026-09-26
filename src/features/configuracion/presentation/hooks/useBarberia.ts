import { useApi, type EstadoApi, type OpcionesApi } from '../../../../core/hooks/useApi';
import * as configuracionApi from '../../data/remote/configuracion.api';
import type { BarberiaInfo } from '../../domain/configuracion';

/** Datos de la barbería para Configuración. Solo admin. */
export function useBarberia(opciones?: OpcionesApi): EstadoApi<BarberiaInfo> {
  return useApi(
    () => configuracionApi.obtenerBarberia().then((respuesta) => respuesta.barberia),
    [],
    opciones,
  );
}
