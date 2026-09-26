import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../../../../core/theme/tokens';
import { SelectorPeriodo } from '../../../../core/components/SelectorPeriodo';
import { Esqueleto } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { estilosGrillaTarjetas, TarjetaMetrica } from './TarjetaMetrica';
import { useResumenBarberia } from '../hooks/useResumenBarberia';
import { GraficaIngresosEgresos } from '../../../finanzas/presentation/components/GraficaIngresosEgresos';
import { GraficaComparacionBarberos } from '../../../finanzas/presentation/components/GraficaComparacionBarberos';
import type { Periodo } from '../../../../core/utils/fechas';

/**
 * Capa "Mi negocio" del administrador: dos tarjetas y, ocupando la mayor
 * parte de la pantalla, las gráficas. Cambiar el período recarga los datos
 * desde el backend, no filtra en el cliente.
 */
export function InicioNegocio() {
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const resumen = useResumenBarberia();

  const cargandoTarjetas = resumen.loading && resumen.data === null;
  const r = resumen.data;

  return (
    <View>
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
    </View>
  );
}

const estilos = StyleSheet.create({
  espacioSuperior: { marginTop: spacing.md },
  tituloSeccion: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
