import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, estadoCitaColors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import type { EstadoBarbero } from '../../../auth/domain/auth';
import type { BarberoEquipo } from '../../domain/equipo';

type Props = {
  barbero: BarberoEquipo;
  onPress: () => void;
};

/**
 * Verde de éxito ya usado en otras tarjetas de la app, y el naranja oficial
 * de "no_asistio" para incapacitado — misma familia de significado (algo que
 * hoy no está funcionando), sin sumar un color nuevo a la paleta.
 */
const COLOR_ESTADO: Record<EstadoBarbero, string> = {
  activo: '#16A34A',
  incapacitado: estadoCitaColors.no_asistio,
  inactivo: colors.danger,
};

const ETIQUETA_ESTADO: Record<EstadoBarbero, string> = {
  activo: 'Activo',
  incapacitado: 'Incapacitado',
  inactivo: 'Inactivo',
};

/** Una fila de la lista del equipo. */
export function FilaBarbero({ barbero, onPress }: Props) {
  const nombreCompleto = `${barbero.nombre} ${barbero.apellido ?? ''}`.trim();

  return (
    <TouchableOpacity style={estilos.fila} activeOpacity={0.7} onPress={onPress}>
      <View style={estilos.avatar}>
        <Feather name="user" size={22} color={colors.surface} />
      </View>

      <View style={estilos.info}>
        <Text style={estilos.nombre} numberOfLines={1}>
          {nombreCompleto}
          {barbero.esAdmin ? ' · Administrador' : ''}
        </Text>
        <View style={estilos.filaEstado}>
          <View style={[estilos.punto, { backgroundColor: COLOR_ESTADO[barbero.estado] }]} />
          <Text style={estilos.estado}>{ETIQUETA_ESTADO[barbero.estado]}</Text>
          <Text style={estilos.separador}>·</Text>
          <Text style={estilos.comision}>{barbero.porcentajeComision}% comisión</Text>
        </View>
        {barbero.pendienteActivacion && (
          <View style={estilos.insigniaPendiente}>
            <Text style={estilos.insigniaPendienteTexto}>Pendiente de activación</Text>
          </View>
        )}
      </View>

      <Feather name="chevron-right" size={18} color={colors.placeholder} />
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: { flex: 1 },
  nombre: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.text,
  },
  filaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  punto: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  estado: { fontSize: fontSizes.caption, color: colors.textMuted },
  separador: { fontSize: fontSizes.caption, color: colors.textMuted, marginHorizontal: 5 },
  comision: { fontSize: fontSizes.caption, color: colors.textMuted },
  insigniaPendiente: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm + 4,
    marginTop: 6,
  },
  insigniaPendienteTexto: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
});
