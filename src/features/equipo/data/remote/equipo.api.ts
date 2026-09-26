import { apiClient } from '../../../../core/api/client';
import { construirQuery } from '../../../../core/utils/query';
import type { EstadoBarbero } from '../../../auth/domain/auth';
import type {
  AusenciaRegistrada,
  BarberoCreado,
  CambioComisionResultado,
  CambioEstadoResultado,
  DetalleBarberoResultado,
  EquipoResultado,
  NuevaAusencia,
  NuevoBarbero,
  ParametrosEquipo,
} from '../../domain/equipo';

function queryPeriodo(parametros: ParametrosEquipo): string {
  return construirQuery({
    periodo: parametros.periodo,
    desde: parametros.desde,
    hasta: parametros.hasta,
  });
}

/** GET /api/equipo — solo admin. */
export function listarEquipo(parametros: ParametrosEquipo): Promise<EquipoResultado> {
  return apiClient.get(`/equipo${queryPeriodo(parametros)}`);
}

/** GET /api/equipo/:id — solo admin. */
export function obtenerDetalleBarbero(
  idBarbero: number,
  parametros: ParametrosEquipo,
): Promise<DetalleBarberoResultado> {
  return apiClient.get(`/equipo/${idBarbero}${queryPeriodo(parametros)}`);
}

/**
 * POST /api/equipo/:id/ausencias — solo admin.
 *
 * Con `esIncapacidad: true` además cancela, por trigger, las citas futuras
 * pendientes o confirmadas del barbero: la app debe avisarlo antes de enviar.
 */
export function registrarAusencia(
  idBarbero: number,
  ausencia: NuevaAusencia,
): Promise<{ ausencia: AusenciaRegistrada }> {
  return apiClient.post(`/equipo/${idBarbero}/ausencias`, ausencia);
}

/** PATCH /api/equipo/:id/estado — solo admin. */
export function cambiarEstado(
  idBarbero: number,
  estado: EstadoBarbero,
): Promise<{ barbero: CambioEstadoResultado }> {
  return apiClient.patch(`/equipo/${idBarbero}/estado`, { estado });
}

/** PATCH /api/equipo/:id/comision — solo admin. De 0 a 100. */
export function cambiarComision(
  idBarbero: number,
  porcentaje: number,
): Promise<{ barbero: CambioComisionResultado }> {
  return apiClient.patch(`/equipo/${idBarbero}/comision`, { porcentaje });
}

/**
 * POST /api/barberos — solo admin.
 *
 * Mismo flujo de credenciales provisionales del onboarding: la contraseña
 * generada solo viaja en esta respuesta, una vez.
 */
export function crearBarbero(datos: NuevoBarbero): Promise<{ barbero: BarberoCreado }> {
  return apiClient.post('/barberos', datos);
}
