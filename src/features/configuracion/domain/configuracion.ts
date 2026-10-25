import type { DiaSemana } from '../../onboarding/domain/onboarding';

export type BarberiaInfo = {
  idBarberia: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  diasAtencion: DiaSemana[];
  /** 'HH:MM:SS' */
  horaApertura: string;
  horaCierre: string;
};

export type NuevoHorario = {
  dias: DiaSemana[];
  horaApertura: string;
  horaCierre: string;
  duracionTurno: number;
};

export type ActualizarPerfilPayload = {
  nombre: string;
  apellido?: string | null;
  telefono?: string | null;
};
