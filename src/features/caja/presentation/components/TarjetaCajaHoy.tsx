import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formatearCOP } from '../../../../core/utils/moneda';
import { formatearFechaLarga } from '../../../../core/utils/fechas';
import type { DesgloseCaja, EstadoCajaHoy } from '../../domain/caja';

type Props = {
  estado: EstadoCajaHoy;
  cargando: boolean;
  onAbrirCaja: () => void;
  onCerrarCaja: () => void;
};

type FilaMedioPagoProps = {
  etiqueta: string;
  valor: number;
};

function FilaMedioPago({ etiqueta, valor }: FilaMedioPagoProps) {
  return (
    <View style={estilos.filaMedio}>
      <Text style={estilos.filaMedioEtiqueta}>{etiqueta}</Text>
      <Text style={estilos.filaMedioValor}>{formatearCOP(valor)}</Text>
    </View>
  );
}

function DesgloseMedios({ desglose }: { desglose: DesgloseCaja }) {
  return (
    <View style={estilos.desglose}>
      <FilaMedioPago etiqueta="Efectivo" valor={desglose.ingEfectivo} />
      {desglose.ingTarjeta > 0 && <FilaMedioPago etiqueta="Tarjeta" valor={desglose.ingTarjeta} />}
      {desglose.ingNequi > 0 && <FilaMedioPago etiqueta="Nequi" valor={desglose.ingNequi} />}
      {desglose.ingPse > 0 && <FilaMedioPago etiqueta="PSE" valor={desglose.ingPse} />}
      {desglose.ingBreB > 0 && <FilaMedioPago etiqueta="Bre-B" valor={desglose.ingBreB} />}
      <View style={estilos.desgloseTotal}>
        <Text style={estilos.totalEtiqueta}>Total ingresos</Text>
        <Text style={estilos.totalValor}>{formatearCOP(desglose.totalIngresos)}</Text>
      </View>
    </View>
  );
}

/**
 * Tarjeta de resumen de caja del día, insertada en FinanzasAdminScreen.
 *
 * - Sin caja: muestra badge "Sin abrir" y botón para abrir.
 * - Abierta: muestra desglose por medio de pago y botón para cerrar.
 * - Cerrada: muestra resumen final (solo lectura).
 */
export function TarjetaCajaHoy({ estado, cargando, onAbrirCaja, onCerrarCaja }: Props) {
  const { caja, desglose, saldoEsperadoEfectivo } = estado;

  const estadoLabel =
    caja === null ? 'Sin abrir' : caja.estado === 'abierta' ? 'Abierta' : 'Cerrada';

  const badgeColor =
    caja === null
      ? colors.textMuted
      : caja.estado === 'abierta'
        ? '#16A34A'
        : colors.navy;

  return (
    <View style={estilos.tarjeta}>
      {/* Encabezado */}
      <View style={estilos.encabezado}>
        <View>
          <Text style={estilos.titulo}>Caja del día</Text>
          <Text style={estilos.fecha}>{formatearFechaLarga(estado.fecha)}</Text>
        </View>
        <View style={[estilos.badge, { backgroundColor: `${badgeColor}1A` }]}>
          <Text style={[estilos.badgeTexto, { color: badgeColor }]}>{estadoLabel}</Text>
        </View>
      </View>

      {cargando ? (
        <ActivityIndicator color={colors.primary} style={estilos.spinner} />
      ) : caja === null ? (
        /* Sin caja */
        <View>
          <Text style={estilos.sinCajaTexto}>
            No se ha abierto la caja hoy. Registra el fondo inicial para empezar.
          </Text>
          <TouchableOpacity style={estilos.botonAbrir} activeOpacity={0.8} onPress={onAbrirCaja}>
            <Feather name="unlock" size={16} color={colors.surface} />
            <Text style={estilos.botonTexto}>Abrir caja</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Con caja */
        <View>
          <View style={estilos.montoApertura}>
            <Text style={estilos.montoAperturaEtiqueta}>Fondo inicial</Text>
            <Text style={estilos.montoAperturaValor}>{formatearCOP(caja.montoApertura)}</Text>
          </View>

          <DesgloseMedios desglose={desglose} />

          {saldoEsperadoEfectivo !== null && (
            <View style={estilos.saldoEsperado}>
              <Text style={estilos.saldoEtiqueta}>Efectivo esperado en caja</Text>
              <Text style={estilos.saldoValor}>{formatearCOP(saldoEsperadoEfectivo)}</Text>
            </View>
          )}

          {caja.estado === 'cerrada' && caja.montoCierre !== null && (
            <View style={estilos.saldoCierre}>
              <View style={estilos.filaCierre}>
                <Text style={estilos.cierreEtiqueta}>Efectivo contado</Text>
                <Text style={estilos.cierreValor}>{formatearCOP(caja.montoCierre)}</Text>
              </View>
              <View style={estilos.filaCierre}>
                <Text style={estilos.cierreEtiqueta}>Diferencia</Text>
                <Text
                  style={[
                    estilos.cierreValor,
                    caja.montoCierre - (saldoEsperadoEfectivo ?? 0) !== 0 && estilos.diferencia,
                  ]}
                >
                  {caja.montoCierre - (saldoEsperadoEfectivo ?? 0) >= 0 ? '+' : ''}
                  {formatearCOP(caja.montoCierre - (saldoEsperadoEfectivo ?? 0))}
                </Text>
              </View>
            </View>
          )}

          {caja.estado === 'abierta' && (
            <TouchableOpacity
              style={estilos.botonCerrar}
              activeOpacity={0.8}
              onPress={onCerrarCaja}
            >
              <Feather name="lock" size={16} color={colors.surface} />
              <Text style={estilos.botonTexto}>Cerrar caja</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.navy,
  },
  fecha: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  badgeTexto: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
  },
  spinner: { marginVertical: spacing.md },
  sinCajaTexto: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  montoApertura: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  montoAperturaEtiqueta: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  montoAperturaValor: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.text,
  },
  desglose: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  filaMedio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  filaMedioEtiqueta: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  filaMedioValor: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.text,
  },
  desgloseTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  totalEtiqueta: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
  },
  totalValor: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
  },
  saldoEsperado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: `${colors.primary}14`,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  saldoEtiqueta: {
    fontSize: fontSizes.small,
    color: colors.primary,
    fontWeight: '600',
  },
  saldoValor: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.primary,
  },
  saldoCierre: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  filaCierre: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  cierreEtiqueta: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  cierreValor: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.text,
  },
  diferencia: {
    color: colors.accent,
  },
  botonAbrir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 12,
    gap: spacing.sm,
  },
  botonCerrar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    borderRadius: radii.lg,
    paddingVertical: 12,
    gap: spacing.sm,
  },
  botonTexto: {
    color: colors.surface,
    fontSize: fontSizes.small,
    fontWeight: '700',
  },
});
