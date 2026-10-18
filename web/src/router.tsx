import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from './features/landing/LandingPage';
import { ReservaWizard } from './features/reserva/ReservaWizard';
import { ConfirmacionPage } from './features/reserva/ConfirmacionPage';
import { CancelarPage } from './features/gestion/CancelarPage';
import { ReprogramarPage } from './features/gestion/ReprogramarPage';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/reservar', element: <ReservaWizard /> },
  { path: '/reserva/confirmada', element: <ConfirmacionPage /> },
  { path: '/reserva/:token/cancelar', element: <CancelarPage /> },
  { path: '/reserva/:token/reprogramar', element: <ReprogramarPage /> },
]);
