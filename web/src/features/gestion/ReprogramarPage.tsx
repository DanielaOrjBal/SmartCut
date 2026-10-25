import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useReservaPorToken, useDisponibilidad, useReprogramarReserva } from '../../hooks';
import { EstadoCarga } from '../../components/EstadoCarga';
import { EstadoError } from '../../components/EstadoError';
import { EstadoVacio } from '../../components/EstadoVacio';
import { cop, fechaLarga, hora } from '../../lib/format';
import { ApiError } from '../../lib/http';
import type { Reserva, SlotDisponible } from '../../types';

function hoyBogota(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}
function maxFecha(): string {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

export function ReprogramarPage() {
  const { token = '' } = useParams<{ token: string }>();
  const consulta = useReservaPorToken(token, 'reprogramar');
  const { mutate, isPending, isSuccess, data: citaReprogramada, error: reprError } =
    useReprogramarReserva();

  const [fecha, setFecha] = useState('');
  const [slotElegido, setSlotElegido] = useState<SlotDisponible | null>(null);

  const cita = consulta.data as Reserva | undefined;

  const slots = useDisponibilidad({
    idBarbero: cita ? (cita.barberoId ?? null) : null,
    fecha,
    duracion: cita?.duracionTotalMinutos ?? 0,
  });

  if (consulta.isPending) return <Pantalla><EstadoCarga mensaje="Cargando tu cita…" /></Pantalla>;
  if (consulta.isError) {
    const msg =
      consulta.error instanceof ApiError
        ? consulta.error.message
        : 'No pudimos cargar tu cita. Verifica el enlace.';
    return <Pantalla><EstadoError mensaje={msg} /></Pantalla>;
  }

  if (isSuccess && citaReprogramada) {
    return (
      <Pantalla>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="text-5xl" aria-hidden="true">📅</span>
          <h2 className="text-xl font-semibold">Cita reprogramada</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            Tu cita fue reprogramada para el{' '}
            <strong className="capitalize">{fechaLarga(citaReprogramada.fecha)}</strong>{' '}
            a las <strong>{hora(citaReprogramada.horaInicio)}</strong>.
            Recibirás un correo con los nuevos datos.
          </p>
          <a href="/" className="btn-primary mt-2">Volver al inicio</a>
        </div>
      </Pantalla>
    );
  }

  const mensajeError =
    reprError instanceof ApiError
      ? reprError.message
      : reprError
      ? 'No se pudo reprogramar la cita. Intenta de nuevo.'
      : null;

  return (
    <Pantalla>
      <h2 className="text-xl font-semibold mb-1">Reprogramar cita</h2>
      <p className="text-sm text-gray-500 mb-6">
        Elige una nueva fecha y hora. El barbero y los servicios se mantienen.
      </p>

      {/* Datos actuales */}
      <div className="card mb-6 text-sm space-y-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Cita actual</p>
        <p><span className="text-gray-500">Barbería: </span><span className="font-medium">{cita!.barberia}</span></p>
        <p><span className="text-gray-500">Barbero: </span><span className="font-medium">{cita!.barbero}</span></p>
        <p><span className="text-gray-500">Servicios: </span><span className="font-medium">{cita!.servicios}</span></p>
        <p>
          <span className="text-gray-500">Fecha actual: </span>
          <span className="font-medium capitalize">{fechaLarga(cita!.fecha)}</span>
        </p>
        <p>
          <span className="text-gray-500">Hora actual: </span>
          <span className="font-medium">{hora(cita!.horaInicio)} – {hora(cita!.horaFin)}</span>
        </p>
        <p><span className="text-gray-500">Total: </span><span className="font-medium">{cop(cita!.montoTotal)}</span></p>
      </div>

      {/* Nueva fecha */}
      <div className="mb-4">
        <label htmlFor="nueva-fecha" className="label">Nueva fecha</label>
        <input
          id="nueva-fecha"
          type="date"
          min={hoyBogota()}
          max={maxFecha()}
          value={fecha}
          onChange={(e) => { setFecha(e.target.value); setSlotElegido(null); }}
          className="input"
        />
      </div>

      {/* Nuevos slots */}
      {fecha && (
        <div className="mb-6">
          <p className="label mb-2">Nueva hora disponible</p>
          {slots.isPending && <EstadoCarga mensaje="Verificando disponibilidad…" />}
          {slots.isError && (
            <EstadoError
              mensaje="No pudimos consultar la disponibilidad."
              onReintentar={() => slots.refetch()}
            />
          )}
          {!slots.isPending && !slots.isError && (slots.data ?? []).length === 0 && (
            <EstadoVacio mensaje="No hay horarios disponibles para esta fecha." />
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {(slots.data ?? []).map((slot) => {
              const sel = slotElegido?.horaInicio === slot.horaInicio;
              return (
                <button
                  key={slot.horaInicio}
                  onClick={() => setSlotElegido(slot)}
                  aria-pressed={sel}
                  className={`rounded-lg border py-2 text-sm font-medium transition-colors
                    ${sel ? 'bg-gray-900 border-gray-900 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-500'}`}
                >
                  {hora(slot.horaInicio)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mensajeError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700" role="alert">
          {mensajeError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <a href="/" className="btn-secondary text-center flex-1">Cancelar</a>
        <button
          onClick={() =>
            mutate({ token, fecha, horaInicio: slotElegido!.horaInicio })
          }
          disabled={isPending || !fecha || !slotElegido}
          className="btn-primary flex-1"
        >
          {isPending ? 'Reprogramando…' : 'Confirmar nueva hora'}
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
