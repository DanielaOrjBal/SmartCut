/**
 * Convierte un color `#RRGGBB` del token a `rgba(r, g, b, alfa)`.
 *
 * Se usa para atenuar las barras no seleccionadas de las gráficas
 * interactivas: en vez de sumar un color nuevo a la paleta, se resta opacidad
 * al mismo color de siempre.
 */
export function conAlfa(hex: string, alfa: number): string {
  const limpio = hex.replace('#', '');
  const r = parseInt(limpio.substring(0, 2), 16);
  const g = parseInt(limpio.substring(2, 4), 16);
  const b = parseInt(limpio.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}

/** Opacidad estándar de un elemento NO seleccionado, cuando algo sí lo está. */
export const OPACIDAD_ATENUADA = 0.25;
