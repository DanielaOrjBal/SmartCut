export type NuevaAtencion = {
  nombreCliente: string;
  servicios: number[];
};

/**
 * Resultado de `sp_registrar_atencion`.
 *
 * `comision` es lo que le corresponde AL BARBERO que la registró, ya
 * calculado por el trigger según su `porcentaje_comision`. Es el número que
 * hay que mostrarle a él, nunca `montoCobrado` como si fuera lo suyo.
 */
export type AtencionRegistrada = {
  idCita: number;
  numeroTicket: string;
  horaInicio: string;
  horaFin: string;
  montoCobrado: number;
  comision: number;
  cliente: string;
};
