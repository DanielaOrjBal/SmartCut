import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBarberias } from '../../hooks';
import { EstadoCarga } from '../../components/EstadoCarga';
import { EstadoError } from '../../components/EstadoError';
import { EstadoVacio } from '../../components/EstadoVacio';
import { diasCortos } from '../../lib/format';

export function LandingPage() {
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useBarberias();

  const barberias = (data ?? []).filter(
    (b) =>
      b.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (b.direccion ?? '').toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Cabecera / hero */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 md:px-8 md:py-20">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Reserva tu cita <br className="hidden sm:block" />
            en minutos ✂
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-lg mb-8">
            Elige tu barbería favorita, selecciona barbero y servicios, y agenda
            directamente en el horario que más te convenga.
          </p>
          <a
            href="#barberias"
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold
                       px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            Ver barberías
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </header>

      {/* Buscador + listado */}
      <main className="flex-1 bg-gray-50" id="barberias">
        <div className="max-w-5xl mx-auto px-4 py-10 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Barberías disponibles</h2>
            <input
              type="search"
              placeholder="Buscar por nombre o dirección…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input sm:w-72"
              aria-label="Buscar barbería"
            />
          </div>

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

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {barberias.map((b) => (
              <li key={b.idBarberia}>
                <article className="card h-full flex flex-col hover:shadow-md hover:border-gray-300 transition-all">
                  {/* Icono placeholder de imagen */}
                  <div className="rounded-lg bg-gray-100 h-32 flex items-center justify-center mb-4 text-4xl select-none">
                    ✂
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{b.nombre}</h3>
                  {b.direccion && (
                    <p className="text-xs text-gray-500 mb-1">📍 {b.direccion}</p>
                  )}
                  {b.telefono && (
                    <p className="text-xs text-gray-500 mb-2">📞 {b.telefono}</p>
                  )}
                  <p className="text-xs text-gray-400 mb-4">
                    {diasCortos(b.diasAtencion)} · {b.horaApertura.slice(0, 5)} –{' '}
                    {b.horaCierre.slice(0, 5)}
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={() => navigate('/reservar', { state: { barberia: b } })}
                      className="btn-primary w-full text-center text-sm"
                    >
                      Reservar cita
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-500 text-xs text-center py-6 px-4">
        © {new Date().getFullYear()} SmartCut · Todos los derechos reservados
      </footer>
    </div>
  );
}
