import { useNavigate, useLocation } from 'react-router-dom';
import { cop, fechaLarga, hora, duracion } from '../../lib/format';
import type { Reserva } from '../../types';

function FilaDetalle({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm gap-4">
      <span className="text-gray-500 shrink-0">{etiqueta}</span>
      <span className="font-medium text-right">{valor}</span>
    </div>
  );
}

export function ConfirmacionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const r = (location.state as { reserva?: Reserva } | null)?.reserva;

  if (!r) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-500 text-sm">No hay una reserva activa para mostrar.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gray-900 text-white py-4 px-4 md:px-8">
        <div className="max-w-xl mx-auto">
          <a href="/" className="text-lg font-bold tracking-tight hover:opacity-80">
            ✂ SmartCut
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">¡Reserva confirmada!</h1>
            <p className="text-gray-500 text-sm mt-1 text-center">
              Recibirás un correo en <strong>{r.clienteCorreo}</strong> con todos los detalles
              y los botones para cancelar o reprogramar.
            </p>
          </div>

          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Número de cita</span>
              <span className="font-bold text-lg">{r.numeroTicket}</span>
            </div>

            <FilaDetalle etiqueta="Barbería" valor={r.barberia} />
            {r.barberiaDireccion && (
              <FilaDetalle etiqueta="Dirección" valor={r.barberiaDireccion} />
            )}
            {r.barberiaTelefono && (
              <FilaDetalle etiqueta="Teléfono" valor={r.barberiaTelefono} />
            )}
            <FilaDetalle etiqueta="Barbero" valor={r.barbero} />
            <FilaDetalle etiqueta="Servicios" valor={r.servicios} />
            <FilaDetalle etiqueta="Fecha" valor={fechaLarga(r.fecha)} />
            <FilaDetalle
              etiqueta="Hora"
              valor={`${hora(r.horaInicio)} – ${hora(r.horaFin)}`}
            />
            <FilaDetalle etiqueta="Duración" valor={duracion(r.duracionTotalMinutos)} />
            <FilaDetalle etiqueta="Total" valor={cop(r.montoTotal)} />
          </div>

          <button onClick={() => navigate('/')} className="btn-secondary w-full">
            Volver al inicio
          </button>
        </div>
      </main>
    </div>
  );
}
