import { useApi, type EstadoApi } from '../../../../core/hooks/useApi';
import * as dashboardApi from '../../data/remote/dashboard.api';
import type { PerfilUsuario } from '../../domain/dashboard';

/** Perfil completo para Configuración: datos, comisión y fechas de cuenta. */
export function usePerfil(): EstadoApi<PerfilUsuario> {
  return useApi(() => dashboardApi.obtenerPerfil().then((respuesta) => respuesta.perfil), []);
}
