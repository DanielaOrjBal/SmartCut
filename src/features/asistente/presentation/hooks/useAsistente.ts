import { useCallback, useState } from 'react';
import { ApiError } from '../../../../core/api/client';
import * as asistenteApi from '../../data/remote/asistente.api';
import type { MensajeChat } from '../../domain/asistente';

const bienvenida: MensajeChat = {
  rol: 'asistente',
  texto: 'Soy tu asistente financiero. Puedo responderte preguntas sobre los últimos 30 días de tu barbería.',
  fecha: new Date().toISOString(),
};

/** Estado local a propósito: una conversación necesita conservar los mensajes previos. */
export function useAsistente() {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([bienvenida]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = useCallback(async (pregunta: string) => {
    const texto = pregunta.trim();
    if (texto.length === 0 || cargando) return;

    const mensajeUsuario: MensajeChat = { rol: 'usuario', texto, fecha: new Date().toISOString() };
    setMensajes((previos) => [...previos, mensajeUsuario]);
    setCargando(true);
    setError(null);

    try {
      const { respuesta } = await asistenteApi.consultarAsistente(texto);
      setMensajes((previos) => [
        ...previos,
        { rol: 'asistente', texto: respuesta, fecha: new Date().toISOString() },
      ]);
    } catch (fallo) {
      setError(
        fallo instanceof ApiError
          ? fallo.message
          : 'No pudimos consultar el asistente financiero. Intenta de nuevo.',
      );
    } finally {
      setCargando(false);
    }
  }, [cargando]);

  const limpiar = useCallback(() => {
    setMensajes([{ ...bienvenida, fecha: new Date().toISOString() }]);
    setError(null);
  }, []);

  return { mensajes, cargando, error, enviar, limpiar };
}
