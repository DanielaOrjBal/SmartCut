import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formatearCOP } from '../../../../core/utils/moneda';
import { ETIQUETA_MEDIO_PAGO, type MedioPago } from '../../../../core/components/SelectorMedioPago';
import type { MetricasBarbero } from '../../domain/finanzas';

type Props = {
  datos: MetricasBarbero;
  /** Cuando es true, se muestran facturación + comisión. Cuando false, solo comisión. */
  esAdmin?: boolean;
};

const MEDIOS_VALIDOS = new Set<string>(['efectivo', 'tarjeta', 'nequi', 'pse', 'bre_b']);

function etiquetaMedio(medio: string): string {
  return MEDIOS_VALIDOS.has(medio) ? ETIQUETA_MEDIO_PAGO[medio as MedioPago] : medio;
}

export function TarjetaMetricasBarbero({ datos, esAdmin = false }: Props) {
  const { resumen, mediosPago, servicios } = datos;

  if (!resumen) {
    return (
      <View style={estilos.tarjeta}>
        <Text style={estilos.sinDatos}>Sin actividad en el período seleccionado.</Text>
      </View>
    );
  }

  return (
    <View style={estilos.tarjeta}>
      {/* Resumen principal */}
      <View style={estilos.fila3}>
        <FilaMetrica
          etiqueta="Citas"
          valor={String(resumen.citasAtendidas)}
        />
        {esAdmin && (
          <FilaMetrica
            etiqueta="Facturación"
            valor={formatearCOP(resumen.facturacion)}
            colorValor="#16A34A"
          />
        )}
        <FilaMetrica
          etiqueta={esAdmin ? 'Comisión' : 'Ganancias'}
          valor={formatearCOP(resumen.comision)}
          colorValor="#16A34A"
        />
      </View>

      {/* Medios de pago */}
      {mediosPago.length > 0 && (
        <>
          <Text style={estilos.subtitulo}>Por medio de pago</Text>
          {mediosPago.map((m) => (
            <View key={m.medioPago} style={estilos.filaDesglose}>
              <Text style={estilos.desgloseEtiqueta}>{etiquetaMedio(m.medioPago)}</Text>
              <Text style={estilos.desgloseSecundario}>{m.citas} cita{m.citas !== 1 ? 's' : ''}</Text>
              <Text style={estilos.desgloseValor}>{formatearCOP(m.facturado)}</Text>
            </View>
          ))}
        </>
      )}

      {/* Servicios */}
      {servicios.length > 0 && (
        <>
          <Text style={estilos.subtitulo}>Por servicio</Text>
          {servicios.map((s) => (
            <View key={s.idServicio} style={estilos.filaDesglose}>
              <Text style={estilos.desgloseEtiqueta} numberOfLines={1}>{s.servicio}</Text>
              <Text style={estilos.desgloseSecundario}>{s.veces}×</Text>
              <Text style={estilos.desgloseValor}>{formatearCOP(s.facturado)}</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

type FilaMetricaProps = { etiqueta: string; valor: string; colorValor?: string };

function FilaMetrica({ etiqueta, valor, colorValor }: FilaMetricaProps) {
  return (
    <View style={estilos.metricaBloque}>
      <Text numberOfLines={1} style={[estilos.metricaValor, colorValor ? { color: colorValor } : undefined]}>
        {valor}
      </Text>
      <Text style={estilos.metricaEtiqueta}>{etiqueta}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  sinDatos: {
    color: colors.textMuted,
    fontSize: fontSizes.small,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  fila3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metricaBloque: {
    alignItems: 'center',
    minWidth: 70,
    flex: 1,
  },
  metricaValor: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
  },
  metricaEtiqueta: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  subtitulo: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.navy,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  filaDesglose: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  desgloseEtiqueta: {
    flex: 1,
    fontSize: fontSizes.small,
    color: colors.text,
  },
  desgloseSecundario: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    minWidth: 40,
    textAlign: 'right',
  },
  desgloseValor: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.navy,
    minWidth: 80,
    textAlign: 'right',
  },
});
