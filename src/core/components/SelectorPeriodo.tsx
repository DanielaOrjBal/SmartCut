import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';
import { PERIODOS, type Periodo } from '../utils/fechas';

type Props = {
  valor: Periodo;
  onCambiar: (periodo: Periodo) => void;
};

/**
 * Día / Semana / Mes / Trimestre / Año, en una fila de píldoras.
 *
 * Componente único reutilizado en Inicio del administrador, Agenda y
 * Finanzas: cambiar de período aquí siempre dispara una nueva petición al
 * backend (los rangos los calcula el servidor), nunca un filtrado en el
 * cliente sobre datos ya cargados.
 */
export function SelectorPeriodo({ valor, onCambiar }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.contenedor}
    >
      {PERIODOS.map((opcion) => {
        const activo = opcion.valor === valor;
        return (
          <TouchableOpacity
            key={opcion.valor}
            style={[estilos.pildora, activo && estilos.pildoraActiva]}
            activeOpacity={0.7}
            onPress={() => onCambiar(opcion.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
          >
            <Text style={[estilos.texto, activo && estilos.textoActivo]}>{opcion.etiqueta}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    paddingVertical: spacing.xs,
  },
  pildora: {
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  pildoraActiva: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
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
