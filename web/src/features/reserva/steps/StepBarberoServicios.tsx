import { useBarberos, useServicios } from '../../../hooks';
import { useWizard } from '../context';
import { EstadoCarga } from '../../../components/EstadoCarga';
import { EstadoError } from '../../../components/EstadoError';
import { cop, duracion } from '../../../lib/format';
import type { Barbero, Servicio } from '../../../types';

interface Props {
  onSiguiente: () => void;
  onAnterior: () => void;
}

export function StepBarberoServicios({ onSiguiente, onAnterior }: Props) {
  const { state, dispatch, duracionTotal, precioTotal } = useWizard();
  const idBarberia = state.barberia?.idBarberia ?? null;

  const barberos = useBarberos(idBarberia);
  const servicios = useServicios(idBarberia);

  function seleccionarBarbero(b: Barbero) {
    dispatch({ type: 'SET_BARBERO', payload: b });
  }

  function toggleServicio(s: Servicio) {
    dispatch({ type: 'TOGGLE_SERVICIO', payload: s });
  }

  const puedeAvanzar = state.barbero !== null && state.serviciosSeleccionados.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Barbero y servicios</h2>
        <p className="text-sm text-gray-500">
          Elige quién te atenderá y qué servicios deseas.
        </p>
      </div>

      {/* Barberos */}
      <section aria-labelledby="titulo-barberos">
        <h3 id="titulo-barberos" className="font-medium text-gray-700 mb-3">
          Elige tu barbero
        </h3>
        {barberos.isPending && <EstadoCarga mensaje="Cargando barberos…" />}
        {barberos.isError && (
          <EstadoError
            mensaje="No pudimos cargar los barberos."
            onReintentar={() => barberos.refetch()}
          />
        )}
        <div className="flex flex-wrap gap-2">
          {(barberos.data ?? []).map((b) => {
            const activo = state.barbero?.idBarbero === b.idBarbero;
            return (
              <button
                key={b.idBarbero}
                onClick={() => seleccionarBarbero(b)}
                aria-pressed={activo}
                className={`rounded-lg px-4 py-2 text-sm font-medium border transition-colors
                  ${activo
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-500'}`}
              >
                {b.nombre} {b.apellido ?? ''}
              </button>
            );
          })}
        </div>
      </section>

      {/* Servicios */}
      <section aria-labelledby="titulo-servicios">
        <h3 id="titulo-servicios" className="font-medium text-gray-700 mb-3">
          Elige tus servicios{' '}
          <span className="text-xs font-normal text-gray-400">(puedes elegir varios)</span>
        </h3>
        {servicios.isPending && <EstadoCarga mensaje="Cargando servicios…" />}
        {servicios.isError && (
          <EstadoError
            mensaje="No pudimos cargar los servicios."
            onReintentar={() => servicios.refetch()}
          />
        )}
        <ul className="grid gap-3 sm:grid-cols-2" role="list">
          {(servicios.data ?? []).map((s) => {
            const seleccionado = state.serviciosSeleccionados.some(
              (x) => x.idServicio === s.idServicio,
            );
            return (
              <li key={s.idServicio}>
                <button
                  onClick={() => toggleServicio(s)}
                  aria-pressed={seleccionado}
                  className={`w-full text-left rounded-xl border p-4 transition-all
                    ${seleccionado
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-400'}`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-medium text-sm">{s.nombre}</span>
                    <span className="font-semibold text-sm tabular-nums shrink-0">
                      {cop(s.precio)}
                    </span>
                  </div>
                  {s.descripcion && (
                    <p className="text-xs text-gray-500 mb-1">{s.descripcion}</p>
                  )}
                  <p className="text-xs text-gray-400">{duracion(s.duracionMinutos)}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Totales */}
      {state.serviciosSeleccionados.length > 0 && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 flex justify-between text-sm">
          <span className="text-gray-600">
            {state.serviciosSeleccionados.length} servicio
            {state.serviciosSeleccionados.length !== 1 ? 's' : ''} · {duracion(duracionTotal)}
          </span>
          <span className="font-semibold">{cop(precioTotal)}</span>
        </div>
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
