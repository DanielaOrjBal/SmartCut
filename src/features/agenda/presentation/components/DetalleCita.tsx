import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  colors,
  estadoCitaColors,
  estadoCitaEtiquetas,
  estadoCitaFondos,
  fontSizes,
  radii,
  spacing,
} from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import { formatearCOP } from '../../../../core/utils/moneda';
import { formatearFechaLarga, formatearHora } from '../../../../core/utils/fechas';
import { useCambiarEstadoCita } from '../hooks/useCambiarEstadoCita';
import { TRANSICIONES_CITA, ETIQUETA_ACCION_CITA, type Cita, type EstadoCita } from '../../domain/agenda';

type Props = {
  cita: Cita | null;
  /** false para el administrador viendo la cita de OTRO barbero: solo consulta. */
  puedeActuar: boolean;
  onClose: () => void;
  /** Se llama tras un cambio de estado exitoso, para que la lista se refresque. */
  onCambiado: () => void;
};

/**
 * Detalle de una cita, con acciones según su estado actual.
 *
 * Las transiciones válidas salen de `TRANSICIONES_CITA`: nunca se ofrece un
 * botón para un estado que la base no aceptaría. Al finalizar una cita, el
 * ingreso lo genera un trigger — aquí no se calcula ni se envía ningún monto.
 */
export function DetalleCita({ cita, puedeActuar, onClose, onCambiado }: Props) {
  const mutacion = useCambiarEstadoCita();
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (cita !== null) {
      setMotivo('');
      mutacion.limpiarError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cita?.idCita]);

  if (cita === null) {
    return null;
  }

  const transiciones = TRANSICIONES_CITA[cita.estado];

  async function ejecutar(destino: EstadoCita) {
    if (cita === null) {
      return;
    }
    try {
      await mutacion.ejecutar({
        idCita: cita.idCita,
        estado: destino,
        fecha: cita.fecha,
        motivo: destino === 'cancelada' && motivo.trim().length > 0 ? motivo.trim() : undefined,
      });
      onCambiado();
      onClose();
    } catch {
      // El mensaje ya queda en mutacion.error; el modal sigue abierto.
    }
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={estilos.fondo}>
        <View style={estilos.hoja}>
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>Ticket {cita.numeroTicket}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={[estilos.insignia, { backgroundColor: estadoCitaFondos[cita.estado] }]}>
            <Text style={[estilos.insigniaTexto, { color: estadoCitaColors[cita.estado] }]}>
              {estadoCitaEtiquetas[cita.estado]}
            </Text>
          </View>

          <View style={estilos.filas}>
            <Fila etiqueta="Fecha" valor={formatearFechaLarga(cita.fecha)} />
            <Fila
              etiqueta="Hora"
              valor={`${formatearHora(cita.horaInicio)} – ${formatearHora(cita.horaFin)}`}
            />
            <Fila etiqueta="Cliente" valor={cita.cliente} />
            <Fila etiqueta="Barbero" valor={cita.barbero} />
            <Fila
              etiqueta="Servicios"
              valor={cita.servicios.length > 0 ? cita.servicios : 'Sin servicios registrados'}
            />
            <Fila etiqueta="Monto" valor={formatearCOP(cita.montoTotal)} resaltado />
          </View>

          {!puedeActuar ? (
            <View style={estilos.avisoSoloConsulta}>
              <Feather name="eye" size={16} color={colors.textMuted} />
              <Text style={estilos.avisoTexto}>
                Solo puedes consultarla: esta cita es de otro barbero.
              </Text>
            </View>
          ) : transiciones.length === 0 ? (
            <Text style={estilos.avisoTexto}>Esta cita ya no admite cambios de estado.</Text>
          ) : (
            <>
              {transiciones.includes('cancelada') && (
                <TextInput
                  style={[formStyles.input, estilos.motivo]}
                  placeholder="Motivo de la cancelación (opcional)"
                  placeholderTextColor={colors.placeholder}
                  value={motivo}
                  onChangeText={setMotivo}
                  maxLength={255}
                />
              )}

              {mutacion.error !== null && (
                <Text style={[formStyles.mensajeError, estilos.error]}>{mutacion.error}</Text>
              )}

              <View style={estilos.acciones}>
                {transiciones.map((destino) => (
                  <TouchableOpacity
                    key={destino}
                    style={[
                      estilos.boton,
                      destino === 'cancelada' || destino === 'no_asistio'
                        ? estilos.botonSecundario
                        : estilos.botonPrimario,
                      mutacion.cargando && estilos.botonDeshabilitado,
                    ]}
                    activeOpacity={0.8}
                    disabled={mutacion.cargando}
                    onPress={() => {
                      void ejecutar(destino);
                    }}
                  >
                    {mutacion.cargando ? (
                      <ActivityIndicator
                        size="small"
                        color={
                          destino === 'cancelada' || destino === 'no_asistio'
                            ? colors.navy
                            : colors.surface
                        }
                      />
                    ) : (
                      <Text
                        style={
                          destino === 'cancelada' || destino === 'no_asistio'
                            ? estilos.botonTextoSecundario
                            : estilos.botonTexto
                        }
                      >
                        {ETIQUETA_ACCION_CITA[destino]}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Fila({ etiqueta, valor, resaltado = false }: { etiqueta: string; valor: string; resaltado?: boolean }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.filaEtiqueta}>{etiqueta}</Text>
      <Text style={[estilos.filaValor, resaltado && estilos.filaValorResaltado]}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.45)',
    justifyContent: 'flex-end',
  },
  hoja: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.screen,
    paddingBottom: spacing.xl,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.navy,
  },
  insignia: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  insigniaTexto: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
  },
  filas: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  filaEtiqueta: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginRight: spacing.md,
  },
  filaValor: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  filaValorResaltado: {
    fontWeight: '700',
    color: colors.navy,
  },
  avisoSoloConsulta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  avisoTexto: {
    flex: 1,
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  motivo: { marginBottom: spacing.md },
  error: { marginBottom: spacing.sm },
  acciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  boton: {
    flexGrow: 1,
    minWidth: '47%',
    paddingVertical: 14,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonPrimario: { backgroundColor: colors.primary },
  botonSecundario: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: {
    color: colors.surface,
    fontSize: fontSizes.small,
    fontWeight: '700',
  },
  botonTextoSecundario: {
    color: colors.navy,
    fontSize: fontSizes.small,
    fontWeight: '700',
  },
});
