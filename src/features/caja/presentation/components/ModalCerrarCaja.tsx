import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import { formatearCOP } from '../../../../core/utils/moneda';
import { useCerrarCaja } from '../hooks/useCerrarCaja';
import type { CajaDia, DesgloseCaja } from '../../domain/caja';

type Props = {
  visible: boolean;
  caja: CajaDia;
  desglose: DesgloseCaja;
  saldoEsperadoEfectivo: number;
  onClose: () => void;
  onCerrada: () => void;
};

type FilaProps = { etiqueta: string; valor: string; variante?: 'normal' | 'resaltado' | 'diferencia' };

function FilaResumen({ etiqueta, valor, variante = 'normal' }: FilaProps) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.filaEtiqueta}>{etiqueta}</Text>
      <Text
        style={[
          estilos.filaValor,
          variante === 'resaltado' && estilos.filaValorResaltado,
          variante === 'diferencia' && estilos.filaValorDiferencia,
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

export function ModalCerrarCaja({ visible, caja, desglose, saldoEsperadoEfectivo, onClose, onCerrada }: Props) {
  const mutacion = useCerrarCaja();

  const [montoTexto, setMontoTexto] = useState('');
  const [observacion, setObservacion] = useState('');
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const montoCierre = parseFloat(montoTexto.replace(/[^0-9.]/g, '')) || 0;
  const montoValido = montoTexto.trim().length > 0 && montoCierre >= 0;
  const diferencia = montoValido ? montoCierre - saldoEsperadoEfectivo : null;

  function cerrar() {
    setMontoTexto('');
    setObservacion('');
    setIntentoEnviar(false);
    mutacion.limpiarError();
    onClose();
  }

  async function confirmar() {
    setIntentoEnviar(true);
    if (!montoValido) return;

    try {
      await mutacion.ejecutar({
        montoCierre,
        observacion: observacion.trim().length > 0 ? observacion.trim() : undefined,
      });
      cerrar();
      onCerrada();
    } catch {
      // El mensaje queda en mutacion.error
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={cerrar}>
      <View style={estilos.fondo}>
        <View style={estilos.hoja}>
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>Cerrar caja</Text>
            <TouchableOpacity onPress={cerrar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={estilos.cuerpo}
            contentContainerStyle={estilos.cuerpoContenido}
            keyboardShouldPersistTaps="handled"
          >
            {/* Resumen del día */}
            <Text style={estilos.seccion}>MOVIMIENTOS DEL DÍA</Text>
            <View style={estilos.tarjeta}>
              <FilaResumen etiqueta="Fondo inicial" valor={formatearCOP(caja.montoApertura)} />
              <View style={estilos.separador} />
              <FilaResumen etiqueta="Efectivo" valor={formatearCOP(desglose.ingEfectivo)} />
              {desglose.ingTarjeta > 0 && (
                <FilaResumen etiqueta="Tarjeta" valor={formatearCOP(desglose.ingTarjeta)} />
              )}
              {desglose.ingNequi > 0 && (
                <FilaResumen etiqueta="Nequi" valor={formatearCOP(desglose.ingNequi)} />
              )}
              {desglose.ingPse > 0 && (
                <FilaResumen etiqueta="PSE" valor={formatearCOP(desglose.ingPse)} />
              )}
              {desglose.ingBreB > 0 && (
                <FilaResumen etiqueta="Bre-B" valor={formatearCOP(desglose.ingBreB)} />
              )}
              <View style={estilos.separador} />
              <FilaResumen
                etiqueta="Total ingresos"
                valor={formatearCOP(desglose.totalIngresos)}
                variante="resaltado"
              />
              <FilaResumen
                etiqueta="Egresos del día"
                valor={`- ${formatearCOP(desglose.totalEgresos)}`}
              />
              <View style={estilos.separador} />
              <FilaResumen
                etiqueta="Efectivo esperado"
                valor={formatearCOP(saldoEsperadoEfectivo)}
                variante="resaltado"
              />
            </View>

            {/* Conteo físico */}
            <Text style={[estilos.seccion, estilos.seccionSeparador]}>CONTEO FÍSICO</Text>
            <TextInput
              style={[
                formStyles.input,
                intentoEnviar && !montoValido && formStyles.inputConError,
              ]}
              placeholder="Efectivo contado en caja"
              placeholderTextColor={colors.placeholder}
              value={montoTexto}
              onChangeText={setMontoTexto}
              keyboardType="numeric"
            />
            {intentoEnviar && !montoValido && (
              <Text style={formStyles.mensajeError}>Ingresa el efectivo contado (puede ser 0).</Text>
            )}

            {diferencia !== null && (
              <View style={[estilos.tarjeta, estilos.tarjetaDiferencia]}>
                <FilaResumen
                  etiqueta="Diferencia"
                  valor={`${diferencia >= 0 ? '+' : ''}${formatearCOP(diferencia)}`}
                  variante="diferencia"
                />
              </View>
            )}

            <Text style={[estilos.seccion, estilos.seccionSeparador]}>OBSERVACIÓN (OPCIONAL)</Text>
            <TextInput
              style={formStyles.input}
              placeholder="Ej. Sobrante por propinas"
              placeholderTextColor={colors.placeholder}
              value={observacion}
              onChangeText={setObservacion}
              maxLength={500}
              multiline
              numberOfLines={2}
            />

            {mutacion.error !== null && (
              <Text style={[formStyles.mensajeError, estilos.errorEnvio]}>{mutacion.error}</Text>
            )}
          </ScrollView>

          <View style={estilos.pie}>
            <TouchableOpacity
              style={[
                formStyles.button,
                estilos.botonCerrar,
                mutacion.cargando && formStyles.buttonDeshabilitado,
              ]}
              activeOpacity={0.8}
              onPress={confirmar}
              disabled={mutacion.cargando}
            >
              {mutacion.cargando && (
                <ActivityIndicator color={colors.surface} style={estilos.spinner} />
              )}
              <Text style={formStyles.buttonText}>
                {mutacion.cargando ? 'Cerrando…' : 'Confirmar cierre'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.45)',
    justifyContent: 'flex-end',
  },
  hoja: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: spacing.lg,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.navy,
  },
  cuerpo: { paddingHorizontal: spacing.screen },
  cuerpoContenido: { paddingBottom: spacing.xl },
  seccion: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  seccionSeparador: { marginTop: spacing.lg, marginBottom: spacing.sm },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  tarjetaDiferencia: { marginTop: spacing.sm },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  filaEtiqueta: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  filaValor: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.text,
  },
  filaValorResaltado: {
    color: colors.navy,
    fontWeight: '700',
  },
  filaValorDiferencia: {
    color: colors.accent,
    fontWeight: '700',
  },
  separador: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  errorEnvio: { marginTop: spacing.sm },
  pie: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  botonCerrar: { backgroundColor: colors.danger },
  spinner: { marginRight: spacing.sm },
});
