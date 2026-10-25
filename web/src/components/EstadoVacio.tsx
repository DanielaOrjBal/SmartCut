interface Props {
  mensaje: string;
  accion?: { label: string; onClick: () => void };
}
export function EstadoVacio({ mensaje, accion }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="text-4xl" aria-hidden="true">📭</span>
      <p className="text-sm text-gray-500 max-w-xs">{mensaje}</p>
      {accion && (
        <button onClick={accion.onClick} className="btn-secondary text-sm">
          {accion.label}
        </button>
      )}
    </div>
  );
}
