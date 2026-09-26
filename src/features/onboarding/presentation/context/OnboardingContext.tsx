import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { enviarOnboarding } from '../../data/remote/onboarding.api';
import type {
  DatosAdmin,
  DatosBarberia,
  DatosBarbero,
  DatosHorario,
  DatosServicio,
  OnboardingResponse,
  OnboardingState,
} from '../../domain/onboarding';

/**
 * Estado del onboarding.
 *
 * Se acumula TODO en memoria y solo se envía una vez, al confirmar el paso 7.
 * Ninguna pantalla intermedia toca la red: si el usuario abandona a mitad de
 * camino no queda una barbería a medio crear en la base.
 */

const ESTADO_INICIAL: OnboardingState = {
  barberia: { nombre: '', direccion: '', telefono: '', correo: '' },
  admin: { nombre: '', apellido: '', correo: '', telefono: '', contrasena: '' },
  horario: {
    // Valores por defecto iguales a los del esquema (tabla barberia).
    dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
    horaApertura: '08:00:00',
    horaCierre: '19:00:00',
    duracionTurno: 30,
  },
  barberos: [],
  servicios: [],
};

type OnboardingContextValor = {
  estado: OnboardingState;
  actualizarBarberia: (parcial: Partial<DatosBarberia>) => void;
  actualizarAdmin: (parcial: Partial<DatosAdmin>) => void;
  actualizarHorario: (parcial: Partial<DatosHorario>) => void;
  establecerBarberos: (barberos: DatosBarbero[]) => void;
  establecerServicios: (servicios: DatosServicio[]) => void;
  reiniciar: () => void;
  /** true mientras el POST está en vuelo; la pantalla 7 deshabilita el botón. */
  enviando: boolean;
  submit: () => Promise<OnboardingResponse>;
};

const OnboardingContext = createContext<OnboardingContextValor | null>(null);

/** Quita las cadenas vacías para que el backend reciba el campo ausente. */
function limpiarOpcional(valor: string | undefined): string | undefined {
  if (valor === undefined) {
    return undefined;
  }
  const recortado = valor.trim();
  return recortado.length > 0 ? recortado : undefined;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<OnboardingState>(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);

  const actualizarBarberia = useCallback((parcial: Partial<DatosBarberia>) => {
    setEstado((previo) => ({ ...previo, barberia: { ...previo.barberia, ...parcial } }));
  }, []);

  const actualizarAdmin = useCallback((parcial: Partial<DatosAdmin>) => {
    setEstado((previo) => ({ ...previo, admin: { ...previo.admin, ...parcial } }));
  }, []);

  const actualizarHorario = useCallback((parcial: Partial<DatosHorario>) => {
    setEstado((previo) => ({ ...previo, horario: { ...previo.horario, ...parcial } }));
  }, []);

  const establecerBarberos = useCallback((barberos: DatosBarbero[]) => {
    setEstado((previo) => ({ ...previo, barberos }));
  }, []);

  const establecerServicios = useCallback((servicios: DatosServicio[]) => {
    setEstado((previo) => ({ ...previo, servicios }));
  }, []);

  const reiniciar = useCallback(() => {
    setEstado(ESTADO_INICIAL);
  }, []);

  const submit = useCallback(async (): Promise<OnboardingResponse> => {
    setEnviando(true);
    try {
      return await enviarOnboarding({
        barberia: {
          ...estado.barberia,
          nombre: estado.barberia.nombre.trim(),
          direccion: estado.barberia.direccion.trim(),
          telefono: estado.barberia.telefono.trim(),
          correo: estado.barberia.correo.trim(),
        },
        admin: {
          ...estado.admin,
          nombre: estado.admin.nombre.trim(),
          apellido: estado.admin.apellido.trim(),
          correo: estado.admin.correo.trim(),
          telefono: estado.admin.telefono.trim(),
        },
        horario: estado.horario,
        barberos: estado.barberos.map((barbero) => ({
          ...barbero,
          nombre: barbero.nombre.trim(),
          apellido: barbero.apellido.trim(),
          correo: barbero.correo.trim(),
          telefono: barbero.telefono.trim(),
        })),
        servicios: estado.servicios.map((servicio) => ({
          ...servicio,
          nombre: servicio.nombre.trim(),
          descripcion: limpiarOpcional(servicio.descripcion),
        })),
      });
    } finally {
      setEnviando(false);
    }
  }, [estado]);

  const valor = useMemo<OnboardingContextValor>(
    () => ({
      estado,
      actualizarBarberia,
      actualizarAdmin,
      actualizarHorario,
      establecerBarberos,
      establecerServicios,
      reiniciar,
      enviando,
      submit,
    }),
    [
      estado,
      actualizarBarberia,
      actualizarAdmin,
      actualizarHorario,
      establecerBarberos,
      establecerServicios,
      reiniciar,
      enviando,
      submit,
    ],
  );

  return <OnboardingContext.Provider value={valor}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValor {
  const contexto = useContext(OnboardingContext);
  if (contexto === null) {
    throw new Error('useOnboarding debe usarse dentro de <OnboardingProvider>.');
  }
  return contexto;
}
