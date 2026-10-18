import { apiClient } from '../../../../core/api/client';
import { BASE_URL } from '../../../../core/config/env';

export type SugerenciaLugar = {
  placeId: string;
  descripcion: string;
  principal: string;
  secundario: string;
};

export type DetalleLugar = {
  direccion: string;
  latitud: number;
  longitud: number;
};

type AutocompleteResponse = { sugerencias: SugerenciaLugar[] };

export function buscarDirecciones(input: string): Promise<SugerenciaLugar[]> {
  return apiClient
    .get<AutocompleteResponse>(`/places/autocomplete?input=${encodeURIComponent(input)}`)
    .then((res) => res.sugerencias);
}

export function obtenerDetalleLugar(placeId: string): Promise<DetalleLugar> {
  return apiClient.get<DetalleLugar>(`/places/details?place_id=${encodeURIComponent(placeId)}`);
}

/**
 * Devuelve la URL del endpoint proxy que sirve la imagen PNG del mapa estático.
 * Al usar BASE_URL la key de Google nunca queda expuesta en el cliente.
 */
export function obtenerUrlMapaEstatico(latitud: number, longitud: number): string {
  return `${BASE_URL}/places/staticmap?lat=${latitud}&lng=${longitud}`;
}
