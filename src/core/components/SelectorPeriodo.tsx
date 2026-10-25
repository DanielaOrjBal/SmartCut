import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';
import { PERIODOS, type Periodo } from '../utils/fechas';

type Props = {
  valor: Periodo;
  onCambiar: (periodo: Periodo) => void;
  /** Lista personalizada de opciones. Si se omite, se usan los cinco períodos globales. */
  opciones?: ReadonlyArray<{ valor: Periodo; etiqueta: string }>;
  centrado?:boolean;
};

/**
 * Fila de píldoras de período. Reutilizado en Inicio, Agenda y Finanzas.
 * Finanzas pasa `opciones={PERIODOS_FINANZAS}` para mostrar solo Mes/Trimestre/Año.
 */
export function SelectorPeriodo({ valor, onCambiar, opciones, centrado = false }: Props) {
  const lista = opciones ?? PERIODOS;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        estilos.contenedor, 
        centrado && estilos.contenedorCentrado,
      ]}
    >
      {lista.map((opcion) => {
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
  contenedorCentrado:{
    flexGrow: 1,
    justifyContent: 'center',
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
