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
import { useAbrirCaja } from '../hooks/useAbrirCaja';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAbierta: () => void;
};

export function ModalAbrirCaja({ visible, onClose, onAbierta }: Props) {
  const mutacion = useAbrirCaja();

  const [montoTexto, setMontoTexto] = useState('');
  const [observacion, setObservacion] = useState('');
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const monto = parseFloat(montoTexto.replace(/[^0-9.]/g, '')) || 0;
  const montoValido = montoTexto.trim().length > 0 && monto >= 0;

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
        montoApertura: monto,
        observacion: observacion.trim().length > 0 ? observacion.trim() : undefined,
      });
      cerrar();
      onAbierta();
    } catch {
      // El mensaje queda en mutacion.error
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={cerrar}>
      <View style={estilos.fondo}>
        <View style={estilos.hoja}>
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>Abrir caja</Text>
            <TouchableOpacity onPress={cerrar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={estilos.cuerpo}
            contentContainerStyle={estilos.cuerpoContenido}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={formStyles.label}>FONDO INICIAL (EFECTIVO)</Text>
            <TextInput
              style={[
                formStyles.input,
                intentoEnviar && !montoValido && formStyles.inputConError,
              ]}
              placeholder="0"
              placeholderTextColor={colors.placeholder}
              value={montoTexto}
              onChangeText={setMontoTexto}
              keyboardType="numeric"
            />
            {intentoEnviar && !montoValido && (
              <Text style={formStyles.mensajeError}>Ingresa el fondo inicial (puede ser 0).</Text>
            )}

            {montoTexto.trim().length > 0 && montoValido && (
              <Text style={estilos.montoPreview}>{formatearCOP(monto)}</Text>
            )}

            <Text style={[formStyles.label, estilos.labelSeparador]}>OBSERVACIÓN (OPCIONAL)</Text>
            <TextInput
              style={formStyles.input}
              placeholder="Ej. Se inicia turno de mañana"
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
                {mutacion.cargando ? 'Abriendo…' : 'Abrir caja'}
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
    maxHeight: '80%',
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
  labelSeparador: { marginTop: spacing.lg },
  montoPreview: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
    marginTop: 4,
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
  spinner: { marginRight: spacing.sm },
});
