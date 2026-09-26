import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';

export type OpcionBarbero = { idBarbero: number; nombre: string };

type Props = {
  opciones: OpcionBarbero[];
  valor: number | undefined;
  onCambiar: (idBarbero: number | undefined) => void;
};

/** "Todos" + un chip por barbero. Exclusivo de la agenda del administrador. */
export function FiltroBarbero({ opciones, valor, onCambiar }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.contenedor}
    >
      <Chip texto="Todos" activo={valor === undefined} onPress={() => onCambiar(undefined)} />
      {opciones.map((opcion) => (
        <Chip
          key={opcion.idBarbero}
          texto={opcion.nombre}
          activo={valor === opcion.idBarbero}
          onPress={() => onCambiar(opcion.idBarbero)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[estilos.chip, activo && estilos.chipActivo]}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
    >
      <Text style={[estilos.texto, activo && estilos.textoActivo]} numberOfLines={1}>
        {texto}
      </Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  contenedor: { paddingVertical: spacing.xs },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    maxWidth: 140,
  },
  chipActivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  texto: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  textoActivo: {
    color: colors.surface,
  },
});
