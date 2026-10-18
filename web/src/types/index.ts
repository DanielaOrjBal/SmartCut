export interface Barberia {
  idBarberia: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  latitud: number | null;
  longitud: number | null;
  diasAtencion: string[];
  horaApertura: string;
  horaCierre: string;
  duracionTurnoMinutos: number;
}

export interface Barbero {
  idBarbero: number;
  nombre: string;
  apellido: string | null;
}

export interface Servicio {
  idServicio: number;
  categoria: 'corte' | 'barba' | 'combo' | 'tratamiento' | 'diseno' | 'otro';
  nombre: string;
  descripcion: string | null;
  duracionMinutos: number;
  precio: number;
}

export interface SlotDisponible {
  horaInicio: string;
  horaFin: string;
}

export interface ClienteEncontrado {
  idCliente: number;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  correo: string;
}

export interface Reserva {
  idCita: number;
  numeroTicket: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  montoTotal: number;
  duracionTotalMinutos: number;
  estado?: string;
  barberia: string;
  barberiaId: number;
  barberiaDireccion: string | null;
  barberiaTelefono: string | null;
  barbero: string;
  barberoId?: number;
  clienteNombre: string;
  clienteApellido: string | null;
  clienteCorreo: string;
  clienteTelefono?: string | null;
  servicios: string;
}

// Estado global del wizard de reserva
export interface WizardState {
  // Paso 1 – cliente
  correo: string;
  nombre: string;
  apellido: string;
  telefono: string;
  idCliente: number | null;
  clienteConfirmado: boolean;

  // Paso 2 – barbería
  barberia: Barberia | null;

  // Paso 3 – barbero + servicios
  barbero: Barbero | null;
  serviciosSeleccionados: Servicio[];

  // Paso 4 – disponibilidad
  fecha: string;
  slot: SlotDisponible | null;

  // Resultado
  reservaConfirmada: Reserva | null;
}
