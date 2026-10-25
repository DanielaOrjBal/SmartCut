interface Props {
  mensaje?: string;
  onReintentar?: () => void;
}
export function EstadoError({
  mensaje = 'Ocurrió un error. Intenta de nuevo.',
  onReintentar,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="text-4xl" aria-hidden="true">⚠️</span>
      <p className="text-sm text-red-600 max-w-xs">{mensaje}</p>
      {onReintentar && (
        <button onClick={onReintentar} className="btn-secondary text-sm">
          Reintentar
        </button>
      )}
    </div>
  );
}
