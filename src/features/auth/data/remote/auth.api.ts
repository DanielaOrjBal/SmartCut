import { apiClient } from '../../../../core/api/client';
import type {
  CambiarContrasenaRequest,
  CambiarContrasenaResponse,
  LoginRequest,
  LoginResponse,
} from '../../domain/auth';

export function login(datos: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/auth/login', datos);
}

/** Requiere el JWT; el apiClient lo adjunta desde el token en memoria. */
export function cambiarContrasena(
  datos: CambiarContrasenaRequest,
): Promise<CambiarContrasenaResponse> {
  return apiClient.post<CambiarContrasenaResponse>('/auth/cambiar-contrasena', datos);
}
