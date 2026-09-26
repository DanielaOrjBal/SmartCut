import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import type { RankingResultado } from '../../domain/finanzas';

type Props = {
  ranking: RankingResultado;
};

/**
 * "Estás en la posición 3 de 5", sin nombres ni cifras ajenas — el backend ya
 * recortó la respuesta a la fila propia antes de que esto reciba nada.
 */
export function TarjetaPosicionRanking({ ranking }: Props) {
  const fila = ranking.barberos[0];

  if (fila === undefined || ranking.posicion === null || ranking.posicion === undefined) {
    return (
      <View style={estilos.tarjeta}>
        <Feather name="award" size={22} color={colors.placeholder} />
        <Text style={estilos.sinDatos}>
          Todavía no tienes actividad en este período para calcular tu posición.
        </Text>
      </View>
    );
  }

  return (
    <View style={estilos.tarjeta}>
      <View style={estilos.filaPosicion}>
        <Feather name="award" size={22} color={colors.primary} />
        <Text style={estilos.posicion}>
          Estás en la posición {ranking.posicion} de {ranking.total}
        </Text>
      </View>
      <Text style={estilos.detalle}>{fila.citasAtendidas} citas atendidas en el período</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  filaPosicion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posicion: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.navy,
    marginLeft: spacing.sm,
  },
  detalle: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  sinDatos: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
