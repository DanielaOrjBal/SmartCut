import { cop, fechaLarga, hora, duracion } from '../../lib/format';
import { useWizard } from './context';

export function ResumenReserva() {
  const { state, duracionTotal, precioTotal } = useWizard();
  const { barberia, barbero, serviciosSeleccionados, fecha, slot } = state;

  if (!barberia && serviciosSeleccionados.length === 0) return null;

  return (
    <aside className="card sticky top-4 text-sm space-y-4" aria-label="Resumen de tu reserva">
      <h3 className="font-semibold text-base">Resumen</h3>

      {barberia && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Barbería</p>
          <p className="font-medium">{barberia.nombre}</p>
          {barberia.direccion && <p className="text-gray-500 text-xs">{barberia.direccion}</p>}
        </div>
      )}

      {barbero && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Barbero</p>
          <p className="font-medium">
            {barbero.nombre} {barbero.apellido ?? ''}
          </p>
        </div>
      )}

      {serviciosSeleccionados.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Servicios</p>
          <ul className="space-y-1">
            {serviciosSeleccionados.map((s) => (
              <li key={s.idServicio} className="flex justify-between gap-2">
                <span className="text-gray-700">{s.nombre}</span>
                <span className="font-medium tabular-nums">{cop(s.precio)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {fecha && slot && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Fecha y hora</p>
          <p className="font-medium capitalize">{fechaLarga(fecha)}</p>
          <p className="text-gray-600">
            {hora(slot.horaInicio)} – {hora(slot.horaFin)}
          </p>
        </div>
      )}

      {serviciosSeleccionados.length > 0 && (
        <div className="border-t pt-3 space-y-1">
          <div className="flex justify-between text-gray-500">
            <span>Duración</span>
            <span>{duracion(duracionTotal)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{cop(precioTotal)}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
