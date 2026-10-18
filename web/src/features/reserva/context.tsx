import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { WizardState, Barberia, Barbero, Servicio, SlotDisponible, Reserva } from '../../types';

const INITIAL: WizardState = {
  correo: '',
  nombre: '',
  apellido: '',
  telefono: '',
  idCliente: null,
  clienteConfirmado: false,
  barberia: null,
  barbero: null,
  serviciosSeleccionados: [],
  fecha: '',
  slot: null,
  reservaConfirmada: null,
};

type Action =
  | { type: 'SET_CLIENTE'; payload: Partial<WizardState> }
  | { type: 'SET_BARBERIA'; payload: Barberia }
  | { type: 'SET_BARBERO'; payload: Barbero }
  | { type: 'TOGGLE_SERVICIO'; payload: Servicio }
  | { type: 'SET_FECHA'; payload: string }
  | { type: 'SET_SLOT'; payload: SlotDisponible }
  | { type: 'SET_RESERVA_CONFIRMADA'; payload: Reserva }
  | { type: 'CAMBIAR_BARBERIA' }
  | { type: 'RESET' };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case 'SET_CLIENTE':
      return { ...state, ...action.payload };
    case 'SET_BARBERIA':
      return {
        ...state,
        barberia: action.payload,
        barbero: null,
        serviciosSeleccionados: [],
        fecha: '',
        slot: null,
      };
    case 'SET_BARBERO':
      return { ...state, barbero: action.payload, slot: null };
    case 'TOGGLE_SERVICIO': {
      const ya = state.serviciosSeleccionados.find(
        (s) => s.idServicio === action.payload.idServicio,
      );
      return {
        ...state,
        serviciosSeleccionados: ya
          ? state.serviciosSeleccionados.filter((s) => s.idServicio !== action.payload.idServicio)
          : [...state.serviciosSeleccionados, action.payload],
        slot: null,
      };
    }
    case 'SET_FECHA':
      return { ...state, fecha: action.payload, slot: null };
    case 'SET_SLOT':
      return { ...state, slot: action.payload };
    case 'SET_RESERVA_CONFIRMADA':
      return { ...state, reservaConfirmada: action.payload };
    case 'CAMBIAR_BARBERIA':
      return {
        ...state,
        barberia: null,
        barbero: null,
        serviciosSeleccionados: [],
        fecha: '',
        slot: null,
      };
    case 'RESET':
      return INITIAL;
    default:
      return state;
  }
}

interface WizardCtx {
  state: WizardState;
  dispatch: React.Dispatch<Action>;
  duracionTotal: number;
  precioTotal: number;
}

const Ctx = createContext<WizardCtx | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const duracionTotal = state.serviciosSeleccionados.reduce(
    (acc, s) => acc + s.duracionMinutos,
    0,
  );
  const precioTotal = state.serviciosSeleccionados.reduce(
    (acc, s) => acc + s.precio,
    0,
  );

  return (
    <Ctx.Provider value={{ state, dispatch, duracionTotal, precioTotal }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWizard(): WizardCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWizard debe usarse dentro de WizardProvider');
  return ctx;
}
