export type RolMensajeAsistente = 'usuario' | 'asistente';

export type MensajeChat = {
  rol: RolMensajeAsistente;
  texto: string;
  fecha: string;
};
