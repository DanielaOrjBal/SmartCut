import { useDisponibilidad } from '../../../hooks';
import { useWizard } from '../context';
import { EstadoCarga } from '../../../components/EstadoCarga';
import { EstadoError } from '../../../components/EstadoError';
import { EstadoVacio } from '../../../components/EstadoVacio';
import { hora } from '../../../lib/format';
import type { SlotDisponible } from '../../../types';

interface Props {
  onSiguiente: () => void;
  onAnterior: () => void;
}

/** Devuelve "YYYY-MM-DD" de hoy en zona Colombia */
function hoyBogota(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

/** Máximo 60 días adelante */
function maxFecha(): string {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

export function StepDisponibilidad({ onSiguiente, onAnterior }: Props) {
  const { state, dispatch, duracionTotal } = useWizard();

  const { data, isPending, isError, refetch } = useDisponibilidad({
    idBarbero: state.barbero?.idBarbero ?? null,
    fecha: state.fecha,
    duracion: duracionTotal,
  });

  function seleccionarSlot(slot: SlotDisponible) {
    dispatch({ type: 'SET_SLOT', payload: slot });
  }

  const puedeAvanzar = state.fecha !== '' && state.slot !== null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Fecha y hora</h2>
        <p className="text-sm text-gray-500">
          Elige el día y la franja disponible que más te convenga.
        </p>
      </div>

      {/* Selector de fecha */}
      <div>
        <label htmlFor="fecha" className="label">
          Fecha <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="fecha"
          type="date"
          min={hoyBogota()}
          max={maxFecha()}
          value={state.fecha}
          onChange={(e) => dispatch({ type: 'SET_FECHA', payload: e.target.value })}
          className="input"
        />
      </div>

      {/* Slots */}
      {state.fecha && (
        <section aria-labelledby="titulo-slots">
          <h3 id="titulo-slots" className="font-medium text-gray-700 mb-3 text-sm">
            Horarios disponibles
          </h3>

          {isPending && <EstadoCarga mensaje="Verificando disponibilidad…" />}
          {isError && (
            <EstadoError
              mensaje="No pudimos consultar la disponibilidad."
              onReintentar={() => refetch()}
            />
          )}
          {!isPending && !isError && data?.length === 0 && (
            <EstadoVacio
              mensaje="No hay horarios disponibles para esta fecha. Prueba con otro día u otro barbero."
              accion={{ label: 'Cambiar barbero', onClick: onAnterior }}
            />
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {(data ?? []).map((slot) => {
              const seleccionado =
                state.slot?.horaInicio === slot.horaInicio;
              return (
                <button
                  key={slot.horaInicio}
                  onClick={() => seleccionarSlot(slot)}
                  aria-pressed={seleccionado}
                  className={`rounded-lg border py-2 text-sm font-medium transition-colors
                    ${seleccionado
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-500'}`}
                >
                  {hora(slot.horaInicio)}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex justify-between">
        <button onClick={onAnterior} className="btn-secondary">
          Atrás
        </button>
        <button
          onClick={onSiguiente}
          disabled={!puedeAvanzar}
          className="btn-primary"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
