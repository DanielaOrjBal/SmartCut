import { useMutacion, type EstadoMutacion } from '../../../../core/hooks/useMutacion';
import * as finanzasApi from '../../data/remote/finanzas.api';
import type { InformeMensual } from '../../domain/finanzas';

/**
 * Datos del informe mensual, a pedido (no se cargan solos al entrar a la
 * pantalla): se piden cuando el usuario aprieta el botón de generar el PDF.
 */
export function useInformeMensual(): EstadoMutacion<
  { anio: number; mes: number },
  InformeMensual
> {
  const mutacion = useMutacion(({ anio, mes }: { anio: number; mes: number }) =>
    finanzasApi.obtenerInformeMensual(anio, mes).then((respuesta) => respuesta.informe),
  );
  return mutacion;
}
