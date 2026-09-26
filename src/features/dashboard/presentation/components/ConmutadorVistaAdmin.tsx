import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSizes, radii, shadows, spacing } from '../../../../core/theme/tokens';

export type VistaAdmin = 'negocio' | 'trabajo';

type Props = {
  valor: VistaAdmin;
  onCambiar: (vista: VistaAdmin) => void;
};

/**
 * "Mi negocio" / "Mi trabajo", arriba de Inicio del administrador.
 *
 * El administrador tiene dos capas: las métricas globales del negocio, y
 * exactamente las mismas tarjetas que ve un barbero, con sus propios datos de
 * atención — porque él también atiende clientes y se queda con lo que factura.
 */
export function ConmutadorVistaAdmin({ valor, onCambiar }: Props) {
  return (
    <View style={estilos.pista}>
      <Opcion
        texto="Mi negocio"
        activo={valor === 'negocio'}
        onPress={() => onCambiar('negocio')}
      />
      <Opcion texto="Mi trabajo" activo={valor === 'trabajo'} onPress={() => onCambiar('trabajo')} />
    </View>
  );
}

function Opcion({
  texto,
  activo,
  onPress,
}: {
  texto: string;
  activo: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[estilos.opcion, activo && estilos.opcionActiva]}
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
    >
      <Text style={[estilos.texto, activo && estilos.textoActivo]}>{texto}</Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  pista: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: radii.lg,
    padding: 4,
  },
  opcion: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  opcionActiva: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  texto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.textMuted,
  },
  textoActivo: {
    color: colors.navy,
  },
});
