import { useWizard } from '../context';
import { useCrearReserva } from '../../../hooks';
import { cop, fechaLarga, hora, duracion } from '../../../lib/format';
import { ApiError } from '../../../lib/http';
import type { Reserva } from '../../../types';

interface Props {
  onConfirmada: (reserva: Reserva) => void;
  onAnterior: () => void;
}

function FilaDetalle({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm gap-4">
      <span className="text-gray-500 shrink-0">{etiqueta}</span>
      <span className="font-medium text-right">{valor}</span>
    </div>
  );
}

export function StepConfirmacion({ onConfirmada, onAnterior }: Props) {
  const { state, duracionTotal, precioTotal } = useWizard();
  const { mutate, isPending, isSuccess, error } = useCrearReserva();

  const { barberia, barbero, serviciosSeleccionados, fecha, slot } = state;

  function handleConfirmar() {
    if (!barberia || !barbero || !slot || serviciosSeleccionados.length === 0) return;

    mutate(
      {
        nombre: state.nombre,
        apellido: state.apellido || undefined,
        correo: state.correo,
        telefono: state.telefono || undefined,
        idCliente: state.idCliente ?? undefined,
        idBarberia: barberia.idBarberia,
        idBarbero: barbero.idBarbero,
        fecha,
        horaInicio: slot.horaInicio,
        serviciosIds: serviciosSeleccionados.map((s) => s.idServicio),
      },
      {
        onSuccess: (reserva) => {
          onConfirmada(reserva);
        },
      },
    );
  }

  const mensajeError =
    error instanceof ApiError
      ? error.message
      : error
      ? 'Ocurrió un error al confirmar la reserva. Intenta de nuevo.'
      : null;

  // Detectar conflicto de horario (el SP devuelve SQLSTATE 45000 que llega como 400)
  const esConflicto =
    error instanceof ApiError &&
    error.status === 400 &&
    error.message.includes('disponible');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Confirma tu reserva</h2>
        <p className="text-sm text-gray-500">
          Revisa los detalles antes de confirmar.
        </p>
      </div>

      <div className="card">
        <FilaDetalle etiqueta="Nombre" valor={`${state.nombre} ${state.apellido}`.trim()} />
        <FilaDetalle etiqueta="Correo" valor={state.correo} />
        {state.telefono && <FilaDetalle etiqueta="Teléfono" valor={state.telefono} />}
      </div>

      <div className="card">
        <FilaDetalle etiqueta="Barbería" valor={barberia?.nombre ?? '—'} />
        {barberia?.direccion && (
          <FilaDetalle etiqueta="Dirección" valor={barberia.direccion} />
        )}
        {barberia?.telefono && (
          <FilaDetalle etiqueta="Teléfono barbería" valor={barberia.telefono} />
        )}
        <FilaDetalle
          etiqueta="Barbero"
          valor={`${barbero?.nombre ?? ''} ${barbero?.apellido ?? ''}`.trim()}
        />
        <FilaDetalle
          etiqueta="Servicios"
          valor={serviciosSeleccionados.map((s) => s.nombre).join(', ')}
        />
        <FilaDetalle
          etiqueta="Fecha"
          valor={fecha ? fechaLarga(fecha) : '—'}
        />
        <FilaDetalle
          etiqueta="Hora"
          valor={slot ? `${hora(slot.horaInicio)} – ${hora(slot.horaFin)}` : '—'}
        />
        <FilaDetalle etiqueta="Duración" valor={duracion(duracionTotal)} />
        <FilaDetalle etiqueta="Total" valor={cop(precioTotal)} />
      </div>

      {mensajeError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700" role="alert">
          <p className="font-medium mb-1">
            {esConflicto ? 'El horario ya no está disponible' : 'No se pudo confirmar la reserva'}
          </p>
          <p>{mensajeError}</p>
          {esConflicto && (
            <button
              onClick={onAnterior}
              className="mt-2 text-red-700 underline text-xs"
            >
              Volver a elegir horario
            </button>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onAnterior} className="btn-secondary" disabled={isPending}>
          Atrás
        </button>
        <button
          onClick={handleConfirmar}
          className="btn-primary"
          disabled={isPending || isSuccess}
        >
          {isPending ? 'Confirmando…' : 'Confirmar reserva'}
        </button>
      </div>
    </div>
  );
}
