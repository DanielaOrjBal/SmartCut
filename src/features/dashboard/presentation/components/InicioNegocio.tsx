import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, shadows, spacing } from '../../../../core/theme/tokens';
import { SelectorPeriodo } from '../../../../core/components/SelectorPeriodo';
import { Esqueleto } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { estilosGrillaTarjetas, TarjetaMetrica } from './TarjetaMetrica';
import { useResumenBarberia } from '../hooks/useResumenBarberia';
import { GraficaIngresosEgresos } from '../../../finanzas/presentation/components/GraficaIngresosEgresos';
import { GraficaComparacionBarberos } from '../../../finanzas/presentation/components/GraficaComparacionBarberos';
import type { Periodo } from '../../../../core/utils/fechas';

type Props = {
  onVerPublicaciones?: () => void;
};

/**
 * Capa "Mi negocio" del administrador: dos tarjetas y, ocupando la mayor
 * parte de la pantalla, las gráficas. Cambiar el período recarga los datos
 * desde el backend, no filtra en el cliente.
 */
export function InicioNegocio({ onVerPublicaciones }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const resumen = useResumenBarberia();

  const cargandoTarjetas = resumen.loading && resumen.data === null;
  const r = resumen.data;

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.scroll}>
      <SelectorPeriodo valor={periodo} onCambiar={setPeriodo} />

      <View style={estilos.espacioSuperior}>
        {cargandoTarjetas ? (
          <View style={estilosGrillaTarjetas.grilla}>
            <Esqueleto ancho="48%" alto={92} />
            <Esqueleto ancho="48%" alto={92} />
          </View>
        ) : resumen.error !== null ? (
          <EstadoError mensaje={resumen.error} onReintentar={resumen.refetch} />
        ) : r !== null ? (
          <View style={estilosGrillaTarjetas.grilla}>
            <TarjetaMetrica
              icono="users"
              etiqueta="Barberos activos"
              valor={String(r.barberosActivos)}
            />
            <TarjetaMetrica icono="calendar" etiqueta="Citas hoy" valor={String(r.citasHoy)} />
          </View>
        ) : null}
      </View>

      <Text style={estilos.tituloSeccion}>Gráficas</Text>
      <GraficaIngresosEgresos parametros={{ periodo }} />
      <GraficaComparacionBarberos parametros={{ periodo }} />

      {onVerPublicaciones !== undefined && (
        <Pressable
          style={({ pressed }) => [
            estilos.tarjetaPublicaciones,
            pressed && estilos.tarjetaPublicacionesPresionada,
          ]}
          onPress={onVerPublicaciones}
        >
          <View style={estilos.iconoContenedor}>
            <Feather name="globe" size={24} color={colors.primary} />
          </View>
          <View style={estilos.textoContenedor}>
            <Text style={estilos.tarjetaTitulo}>Ver publicaciones públicas</Text>
            <Text style={estilos.tarjetaSubtitulo}>
              Consulta información desde un servicio web
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={20}
            color={colors.placeholder}
            style={estilos.chevron}
          />
        </Pressable>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1 },
  scroll: { paddingHorizontal: spacing.screen, paddingBottom: 40 },
  espacioSuperior: { marginTop: spacing.md },
  tituloSeccion: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  tarjetaPublicaciones: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    ...shadows.card,
  },
  tarjetaPublicacionesPresionada: {
    opacity: 0.88,
  },
  iconoContenedor: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: '#FBF4E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  textoContenedor: {
    flex: 1,
  },
  tarjetaTitulo: {
    fontSize: fontSizes.button,
    fontWeight: '700',
    color: colors.navy,
  },
  tarjetaSubtitulo: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  chevron: {
    marginLeft: spacing.md,
  },
});
