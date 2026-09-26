import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../theme/tokens';
import { BotonAbrirMenu } from './BotonAbrirMenu';

type Props = {
  titulo: string;
  onAbrirMenu: () => void;
  /** Espacio a la derecha del título, para filtros o acciones propias de la pantalla. */
  children?: React.ReactNode;
};

/**
 * Encabezado estándar de las pantallas que cuelgan del drawer: hamburguesa +
 * título. Inicio no lo usa porque ya tiene su propio saludo como encabezado;
 * este es para Agenda, Finanzas, Equipo y Configuración.
 */
export function EncabezadoPantalla({ titulo, onAbrirMenu, children }: Props) {
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.filaTitulo}>
        <BotonAbrirMenu onPress={onAbrirMenu} />
        <Text style={estilos.titulo}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titulo: {
    fontSize: fontSizes.titleLarge,
    fontWeight: '700',
    color: colors.navy,
    marginLeft: spacing.sm,
  },
});
