import { useParams } from 'react-router-dom';
import { useReservaPorToken, useCancelarReserva } from '../../hooks';
import { EstadoCarga } from '../../components/EstadoCarga';
import { EstadoError } from '../../components/EstadoError';
import { cop, fechaLarga, hora, duracion } from '../../lib/format';
import { ApiError } from '../../lib/http';
import type { Reserva } from '../../types';

function FilaDetalle({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm gap-4">
      <span className="text-gray-500 shrink-0">{etiqueta}</span>
      <span className="font-medium text-right">{valor}</span>
    </div>
  );
}

function ResumenCita({ cita }: { cita: Reserva }) {
  return (
    <div className="card">
      <FilaDetalle etiqueta="Número" valor={cita.numeroTicket} />
      <FilaDetalle etiqueta="Barbería" valor={cita.barberia} />
      {cita.barberiaDireccion && (
        <FilaDetalle etiqueta="Dirección" valor={cita.barberiaDireccion} />
      )}
      <FilaDetalle etiqueta="Barbero" valor={cita.barbero} />
      <FilaDetalle etiqueta="Servicios" valor={cita.servicios} />
      <FilaDetalle etiqueta="Fecha" valor={fechaLarga(cita.fecha)} />
      <FilaDetalle etiqueta="Hora" valor={`${hora(cita.horaInicio)} – ${hora(cita.horaFin)}`} />
      <FilaDetalle etiqueta="Duración" valor={duracion(cita.duracionTotalMinutos)} />
      <FilaDetalle etiqueta="Total" valor={cop(cita.montoTotal)} />
    </div>
  );
}

export function CancelarPage() {
  const { token = '' } = useParams<{ token: string }>();
  const consulta = useReservaPorToken(token, 'cancelar');
  const { mutate, isPending, isSuccess, error: cancelError } = useCancelarReserva();

  if (consulta.isPending) return <Pantalla><EstadoCarga mensaje="Cargando tu cita…" /></Pantalla>;
  if (consulta.isError) {
    const msg =
      consulta.error instanceof ApiError
        ? consulta.error.message
        : 'No pudimos cargar tu cita. Verifica el enlace.';
    return <Pantalla><EstadoError mensaje={msg} /></Pantalla>;
  }

  const cita = consulta.data!;

  if (isSuccess) {
    return (
      <Pantalla>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="text-5xl" aria-hidden="true">✅</span>
          <h2 className="text-xl font-semibold">Cita cancelada</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            Tu cita ha sido cancelada correctamente. Recibirás un correo de confirmación.
          </p>
          <a href="/" className="btn-primary mt-2">Volver al inicio</a>
        </div>
      </Pantalla>
    );
  }

  const mensajeError =
    cancelError instanceof ApiError
      ? cancelError.message
      : cancelError
      ? 'No se pudo cancelar la cita. Intenta de nuevo.'
      : null;

  return (
    <Pantalla>
      <h2 className="text-xl font-semibold mb-1">Cancelar cita</h2>
      <p className="text-sm text-gray-500 mb-6">
        ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
      </p>

      <ResumenCita cita={cita} />

      {mensajeError && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700" role="alert">
          {mensajeError}
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a href="/" className="btn-secondary text-center flex-1">
          No cancelar
        </a>
        <button
          onClick={() => mutate(token)}
          disabled={isPending}
          className="btn-danger flex-1"
        >
          {isPending ? 'Cancelando…' : 'Sí, cancelar cita'}
        </button>
      </div>
    </Pantalla>
  );
}

function Pantalla({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gray-900 text-white py-4 px-4 md:px-8">
        <div className="max-w-xl mx-auto">
          <a href="/" className="text-lg font-bold tracking-tight hover:opacity-80">✂ SmartCut</a>
        </div>
      </header>
      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">{children}</div>
      </main>
    </div>
  );
}
