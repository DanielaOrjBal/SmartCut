import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSizes, radii, spacing } from '../theme/tokens';
import { formStyles } from '../theme/formStyles';

export const MEDIOS_PAGO = ['efectivo', 'tarjeta', 'nequi', 'pse', 'bre_b'] as const;
export type MedioPago = (typeof MEDIOS_PAGO)[number];

export const ETIQUETA_MEDIO_PAGO: Record<MedioPago, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  nequi: 'Nequi',
  pse: 'PSE',
  bre_b: 'Bre-B',
};

type Props = {
  valor: MedioPago | null;
  onCambiar: (medio: MedioPago) => void;
  /** Muestra borde de error y mensaje cuando el usuario intentó enviar sin seleccionar. */
  conError?: boolean;
};

/**
 * Selector de medio de pago en chips accesibles.
 * Reutilizado en ModalRegistrarAtencion y DetalleCita.
 */
export function SelectorMedioPago({ valor, onCambiar, conError = false }: Props) {
  return (
    <View>
      <Text style={[formStyles.label, conError && estilos.labelError]}>MEDIO DE PAGO</Text>
      <View style={estilos.chips}>
        {MEDIOS_PAGO.map((medio) => {
          const activo = valor === medio;
          return (
            <TouchableOpacity
              key={medio}
              style={[
                estilos.chip,
                activo && estilos.chipActivo,
                conError && !activo && estilos.chipError,
              ]}
              onPress={() => onCambiar(medio)}
              accessibilityRole="radio"
              accessibilityState={{ checked: activo }}
              accessibilityLabel={ETIQUETA_MEDIO_PAGO[medio]}
            >
              <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>
                {ETIQUETA_MEDIO_PAGO[medio]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {conError && (
        <Text style={formStyles.mensajeError}>Selecciona el medio de pago.</Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  labelError: {
    color: colors.danger,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  chipActivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipError: {
    borderColor: colors.danger,
  },
  chipTexto: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.text,
  },
  chipTextoActivo: {
    color: colors.surface,
  },
});
