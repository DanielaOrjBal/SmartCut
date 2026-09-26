import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  colors,
  estadoCitaColors,
  estadoCitaEtiquetas,
  estadoCitaFondos,
  fontSizes,
  radii,
  spacing,
} from '../../../../core/theme/tokens';
import { formatearCOP } from '../../../../core/utils/moneda';
import { formatearHora } from '../../../../core/utils/fechas';
import type { Cita } from '../../domain/agenda';

type Props = {
  cita: Cita;
  /** Se oculta en la agenda del barbero, donde ya se sabe de quién es. */
  mostrarBarbero?: boolean;
  onPress?: () => void;
};

/**
 * Una cita en una lista: hora, cliente, servicios y monto, con el color de su
 * estado. Se reutiliza en Inicio (citas de hoy) y en la Agenda.
 */
export function FilaCita({ cita, mostrarBarbero = false, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[estilos.fila, { borderLeftColor: estadoCitaColors[cita.estado] }]}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={onPress === undefined}
    >
      <View style={estilos.encabezadoFila}>
        <Text style={estilos.hora}>{formatearHora(cita.horaInicio)}</Text>
        <View style={[estilos.insignia, { backgroundColor: estadoCitaFondos[cita.estado] }]}>
          <Text style={[estilos.insigniaTexto, { color: estadoCitaColors[cita.estado] }]}>
            {estadoCitaEtiquetas[cita.estado]}
          </Text>
        </View>
      </View>

      <Text style={estilos.cliente} numberOfLines={1}>
        {cita.cliente}
      </Text>
      {mostrarBarbero && (
        <Text style={estilos.barbero} numberOfLines={1}>
          {cita.barbero}
        </Text>
      )}
      <Text style={estilos.servicios} numberOfLines={1}>
        {cita.servicios.length > 0 ? cita.servicios : 'Sin servicios registrados'}
      </Text>

      <Text style={estilos.monto}>{formatearCOP(cita.montoTotal)}</Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  fila: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  encabezadoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hora: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.navy,
  },
  insignia: {
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm + 4,
  },
  insigniaTexto: {
    fontSize: 10,
    fontWeight: '700',
  },
  cliente: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.text,
  },
  barbero: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  servicios: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  monto: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
});
