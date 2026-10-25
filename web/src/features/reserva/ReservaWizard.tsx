import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { WizardProvider, useWizard } from './context';
import { ProgressBar } from './ProgressBar';
import { ResumenReserva } from './ResumenReserva';
import { StepCliente } from './steps/StepCliente';
import { StepBarberia } from './steps/StepBarberia';
import { StepBarberoServicios } from './steps/StepBarberoServicios';
import { StepDisponibilidad } from './steps/StepDisponibilidad';
import { StepConfirmacion } from './steps/StepConfirmacion';
import type { Barberia, Reserva } from '../../types';

function WizardInner() {
  const [paso, setPaso] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useWizard();
  // true cuando la barbería vino pre-seleccionada desde la landing
  const barberiaDesdeLanding = useRef(false);
  const stepRef = useRef<HTMLDivElement>(null);

  // Mueve el foco al contenedor del paso activo cada vez que cambia.
  // Necesario para que lectores de pantalla anuncien el nuevo contenido.
  useEffect(() => {
    stepRef.current?.focus();
  }, [paso]);

  // Pre-cargar la barbería en el estado sin saltar el paso 1
  useEffect(() => {
    const barberiaPreseleccionada = (location.state as { barberia?: Barberia } | null)
      ?.barberia;
    if (barberiaPreseleccionada) {
      dispatch({ type: 'SET_BARBERIA', payload: barberiaPreseleccionada });
      barberiaDesdeLanding.current = true;
    }
  // Solo al montar
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function siguiente() {
    setPaso((p) => {
      // Si la barbería ya está pre-seleccionada, omitir el paso 2
      if (p === 1 && barberiaDesdeLanding.current) return 3;
      return Math.min(p + 1, 5);
    });
  }

  function anterior() {
    setPaso((p) => {
      // Volver al paso 1 directamente si la barbería vino desde la landing
      if (p === 3 && barberiaDesdeLanding.current) return 1;
      return Math.max(p - 1, 1);
    });
  }
  function irAConfirmada(reserva: Reserva) {
    navigate('/reserva/confirmada', { state: { reserva } });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white py-4 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/" className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
            ✂ SmartCut
          </a>
          <span className="text-gray-400 text-sm hidden sm:inline">/ Reservar cita</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:px-8">
        <ProgressBar pasoActual={paso} />

        <div className="flex flex-col md:flex-row gap-8">
          <div ref={stepRef} tabIndex={-1} className="flex-1 min-w-0 max-w-xl outline-none">
            {paso === 1 && <StepCliente onSiguiente={siguiente} />}
            {paso === 2 && (
              <StepBarberia onSiguiente={siguiente} onAnterior={anterior} />
            )}
            {paso === 3 && (
              <StepBarberoServicios onSiguiente={siguiente} onAnterior={anterior} />
            )}
            {paso === 4 && (
              <StepDisponibilidad onSiguiente={siguiente} onAnterior={anterior} />
            )}
            {paso === 5 && (
              <StepConfirmacion onConfirmada={irAConfirmada} onAnterior={anterior} />
            )}
          </div>

          {paso >= 2 && (
            <aside className="md:w-72 shrink-0">
              <ResumenReserva />
              <button
                className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline w-full text-center"
                onClick={() => { barberiaDesdeLanding.current = false; setPaso(2); }}
              >
                Cambiar barbería
              </button>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

export function ReservaWizard() {
  return (
    <WizardProvider>
      <WizardInner />
    </WizardProvider>
  );
}
