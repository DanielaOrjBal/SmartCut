import { useState } from 'react';
import { useBarberias } from '../../../hooks';
import { useWizard } from '../context';
import { EstadoCarga } from '../../../components/EstadoCarga';
import { EstadoError } from '../../../components/EstadoError';
import { EstadoVacio } from '../../../components/EstadoVacio';
import { diasCortos } from '../../../lib/format';
import type { Barberia } from '../../../types';

interface Props {
  onSiguiente: () => void;
  onAnterior: () => void;
}

export function StepBarberia({ onSiguiente, onAnterior }: Props) {
  const { state, dispatch } = useWizard();
  const [busqueda, setBusqueda] = useState('');
  const { data, isPending, isError, refetch } = useBarberias();

  const barberias = (data ?? []).filter((b) =>
    b.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (b.direccion ?? '').toLowerCase().includes(busqueda.toLowerCase()),
  );

  function seleccionar(b: Barberia) {
    dispatch({ type: 'SET_BARBERIA', payload: b });
    onSiguiente();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Elige tu barbería</h2>
        <p className="text-sm text-gray-500">Selecciona la barbería donde quieres reservar.</p>
      </div>

      <input
        type="search"
        placeholder="Buscar por nombre o dirección…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="input"
        aria-label="Buscar barbería"
      />

      {isPending && <EstadoCarga mensaje="Cargando barberías…" />}
      {isError && (
        <EstadoError
          mensaje="No pudimos cargar las barberías. Intenta de nuevo."
          onReintentar={() => refetch()}
        />
      )}
      {!isPending && !isError && barberias.length === 0 && (
        <EstadoVacio mensaje="No encontramos barberías con esa búsqueda." />
      )}

      <ul className="grid gap-3 sm:grid-cols-2" role="list">
        {barberias.map((b) => (
          <li key={b.idBarberia}>
            <button
              onClick={() => seleccionar(b)}
              className={`w-full text-left card hover:border-brand-500 hover:shadow-md
                transition-all focus-visible:ring-2 focus-visible:ring-brand-500
                ${state.barberia?.idBarberia === b.idBarberia
                  ? 'border-brand-500 ring-2 ring-brand-500/30'
                  : ''}`}
              aria-pressed={state.barberia?.idBarberia === b.idBarberia}
            >
              <p className="font-semibold text-gray-900 mb-1">{b.nombre}</p>
              {b.direccion && (
                <p className="text-xs text-gray-500 mb-2">📍 {b.direccion}</p>
              )}
              {b.telefono && (
                <p className="text-xs text-gray-500 mb-2">📞 {b.telefono}</p>
              )}
              <p className="text-xs text-gray-400">
                {diasCortos(b.diasAtencion)} · {b.horaApertura.slice(0, 5)} – {b.horaCierre.slice(0, 5)}
              </p>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex justify-between">
        <button onClick={onAnterior} className="btn-secondary">
          Atrás
        </button>
      </div>
    </div>
  );
}
