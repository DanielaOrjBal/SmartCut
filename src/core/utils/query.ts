/**
 * Arma un query string a partir de un objeto, omitiendo `undefined`, `null` y
 * cadenas vacías.
 *
 * Se centraliza aquí porque casi todos los endpoints de esta fase reciben
 * `periodo`, `desde`, `hasta` o `barberoId` por query, y repetir el
 * `URLSearchParams` a mano en cada archivo de `data/remote/` terminaría
 * divergiendo en cómo se filtran los valores vacíos.
 */
export function construirQuery(
  parametros: Record<string, string | number | boolean | undefined | null>,
): string {
  const entradas = Object.entries(parametros).filter(
    ([, valor]) => valor !== undefined && valor !== null && valor !== '',
  );

  if (entradas.length === 0) {
    return '';
  }

  const partes = entradas.map(
    ([clave, valor]) => `${encodeURIComponent(clave)}=${encodeURIComponent(String(valor))}`,
  );

  return `?${partes.join('&')}`;
}
