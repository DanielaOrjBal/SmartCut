import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import type { ParametrosPeriodo } from '../../domain/finanzas';
import { useRanking } from '../hooks/useRanking';
import { useMetricasBarbero } from '../hooks/useMetricasBarbero';
import { TarjetaMetricasBarbero } from './TarjetaMetricasBarbero';

type Props = {
  parametros: ParametrosPeriodo;
};

/**
 * Sección de admin: chips con los barberos del período → métricas del seleccionado.
 * Usa `useRanking` para obtener la lista (ya disponible en caché de la pantalla padre).
 */
export function SelectorYMetricasBarbero({ parametros }: Props) {
  const ranking = useRanking(parametros);
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);

  const barberos = ranking.data?.barberos ?? [];

  // Si no hay selección explícita, seleccionamos el primero al cargar
  const idActivo = idSeleccionado ?? (barberos.length > 0 ? barberos[0].idBarbero : null);

  const metricas = useMetricasBarbero(idActivo, parametros);

  if (ranking.loading) {
    return <ActivityIndicator color={colors.primary} style={{ margin: spacing.md }} />;
  }

  if (barberos.length === 0) {
    return (
      <View style={estilos.vacio}>
        <Text style={estilos.textoVacio}>Sin barberos con actividad en el período.</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {/* Chips de selección */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={estilos.chipsScroll}>
        <View style={estilos.chips}>
          {barberos.map((b) => {
            const activo = b.idBarbero === idActivo;
            return (
              <TouchableOpacity
                key={b.idBarbero}
                style={[estilos.chip, activo && estilos.chipActivo]}
                onPress={() => setIdSeleccionado(b.idBarbero)}
                activeOpacity={0.7}
              >
                <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>
                  {b.barbero}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Métricas del barbero activo */}
      {metricas.loading ? (
        <ActivityIndicator color={colors.primary} style={{ margin: spacing.md }} />
      ) : metricas.error ? (
        <Text style={estilos.error}>No se pudieron cargar las métricas.</Text>
      ) : metricas.data ? (
        <TarjetaMetricasBarbero datos={metricas.data} esAdmin />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: spacing.sm,
  },
  vacio: {
    padding: spacing.md,
    alignItems: 'center',
  },
  textoVacio: {
    color: colors.textMuted,
    fontSize: fontSizes.small,
  },
  chipsScroll: {
    flexGrow: 0,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  chipActivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTexto: {
    fontSize: fontSizes.small,
    color: colors.text,
    fontWeight: '500',
  },
  chipTextoActivo: {
    color: colors.surface,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    fontSize: fontSizes.small,
    textAlign: 'center',
    padding: spacing.md,
  },
});
