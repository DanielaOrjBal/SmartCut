import React, { useState } from 'react';
import { FabRegistrarAtencion } from './FabRegistrarAtencion';
import { ModalRegistrarAtencion } from './ModalRegistrarAtencion';
import type { AtencionRegistrada } from '../../domain/atencion';

type Props = {
  /** Se llama tras un registro exitoso, para refrescar las tarjetas del dashboard. */
  onRegistrada?: (atencion: AtencionRegistrada) => void;
};

/**
 * Botón flotante + modal de registro de atención, listos para dejar caer en
 * cualquier pantalla de Inicio (la del barbero, y la capa "Mi trabajo" del
 * administrador): ambas reutilizan este mismo componente en vez de duplicar
 * el flujo.
 */
export function AccionRegistrarAtencion({ onRegistrada }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <FabRegistrarAtencion onPress={() => setVisible(true)} />
      <ModalRegistrarAtencion
        visible={visible}
        onClose={() => setVisible(false)}
        onRegistrada={onRegistrada}
      />
    </>
  );
}
