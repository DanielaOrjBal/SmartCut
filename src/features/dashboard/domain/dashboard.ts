import type { EstadoBarbero } from '../../auth/domain/auth';
import type { CategoriaServicio } from '../../onboarding/domain/onboarding';

/**
 * Tarjetas de Inicio del barbero.
 *
 * `comisionMes` es SU comisión (`movimiento_financiero.monto_comision`), no
 * lo que facturó. Es la cifra que "Ingresos del mes" debe mostrarle: nunca la
 * facturación completa, que es la que ve el administrador.
 */
export type ResumenBarbero = {
  citasHoy: number;
  finalizadasHoy: number;
  comisionMes: number;
  serviciosMes: number;
};

/**
 * Tarjetas de "Mi negocio" del administrador.
 *
 * `ingresosMes` es la facturación completa del negocio
 * (`movimiento_financiero.monto`), incluida la parte que les corresponde a
 * los barberos. Es mayor que la suma de las comisiones, y así debe verse.
 */
export type ResumenBarberia = {
  barberosActivos: number;
  citasHoy: number;
  ingresosMes: number;
  egresosMes: number;
};

/** Perfil completo de GET /api/perfil. No confundir con el `Perfil` del login. */
export type PerfilUsuario = {
  idBarbero: number;
  nombre: string;
  apellido: string | null;
  correo: string;
  telefono: string | null;
  esAdmin: boolean;
  porcentajeComision: number;
  estado: EstadoBarbero;
  fechaIngreso: string;
  fechaUltimoAcceso: string | null;
  barberia: {
    idBarberia: number;
    nombre: string;
    direccion: string | null;
  };
};

/** Un servicio del catálogo, tal como lo ofrece el modal de registro de atención. */
export type Servicio = {
  idServicio: number;
  categoria: CategoriaServicio;
  nombre: string;
  descripcion: string | null;
  duracionMinutos: number;
  precio: number;
};
