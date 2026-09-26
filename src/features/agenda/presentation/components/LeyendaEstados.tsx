import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { estadoCitaColors, estadoCitaEtiquetas, colors, fontSizes, spacing } from '../../../../core/theme/tokens';
import { ESTADOS_CITA } from '../../domain/agenda';

/** Los seis estados de cita con su color, siempre visible en la agenda. */
export function LeyendaEstados() {
  return (
    <View style={estilos.contenedor}>
      {ESTADOS_CITA.map((estado) => (
        <View key={estado} style={estilos.item}>
          <View style={[estilos.punto, { backgroundColor: estadoCitaColors[estado] }]} />
          <Text style={estilos.texto}>{estadoCitaEtiquetas[estado]}</Text>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: 4,
  },
  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  texto: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
