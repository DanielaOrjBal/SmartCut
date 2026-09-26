import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import { formatearCOP } from '../../../../core/utils/moneda';
import { useAnularMovimiento } from '../hooks/useAnularMovimiento';
import type { Movimiento } from '../../domain/finanzas';

type Props = {
  movimiento: Movimiento | null;
  onClose: () => void;
  onAnulado: () => void;
};

/**
 * Anular un movimiento. El motivo es obligatorio: no se borra ni se edita,
 * solo se anula y queda constancia de por qué.
 */
export function ModalAnularMovimiento({ movimiento, onClose, onAnulado }: Props) {
  const anular = useAnularMovimiento();
  const [motivo, setMotivo] = useState('');
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  useEffect(() => {
    if (movimiento !== null) {
      setMotivo('');
      setIntentoEnviar(false);
      anular.limpiarError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movimiento?.idMovimiento]);

  if (movimiento === null) {
    return null;
  }

  const motivoValido = motivo.trim().length > 0;

  async function confirmar() {
    setIntentoEnviar(true);
    if (!motivoValido || movimiento === null) {
      return;
    }
    try {
      await anular.ejecutar({
        idMovimiento: movimiento.idMovimiento,
        fecha: movimiento.fecha.slice(0, 10),
        motivo: motivo.trim(),
      });
      onAnulado();
      onClose();
    } catch {
      // El mensaje queda en anular.error.
    }
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={estilos.fondo}>
        <View style={estilos.tarjeta}>
          <View style={estilos.encabezado}>
            <Feather name="alert-triangle" size={20} color={colors.danger} />
            <Text style={estilos.titulo}>Anular movimiento</Text>
          </View>

          <Text style={estilos.resumen}>
            {movimiento.categoria} · {formatearCOP(movimiento.monto)}
          </Text>

          <Text style={[formStyles.label, estilos.espacio]}>MOTIVO DE LA ANULACIÓN</Text>
          <TextInput
            style={[formStyles.input, intentoEnviar && !motivoValido && formStyles.inputConError]}
            placeholder="Explica por qué se anula"
            placeholderTextColor={colors.placeholder}
            value={motivo}
            onChangeText={setMotivo}
            multiline
            maxLength={255}
          />
          {intentoEnviar && !motivoValido && (
            <Text style={formStyles.mensajeError}>El motivo es obligatorio.</Text>
          )}
          {anular.error !== null && <Text style={formStyles.mensajeError}>{anular.error}</Text>}

          <View style={estilos.acciones}>
            <TouchableOpacity style={estilos.botonCancelar} onPress={onClose}>
              <Text style={estilos.botonCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[estilos.botonConfirmar, anular.cargando && estilos.botonDeshabilitado]}
              onPress={() => {
                void confirmar();
              }}
              disabled={anular.cargando}
            >
              {anular.cargando ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <Text style={estilos.botonConfirmarTexto}>Anular</Text>
              )}
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.screen,
  },
  tarjeta: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  encabezado: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  titulo: { fontSize: fontSizes.body, fontWeight: '700', color: colors.navy, marginLeft: spacing.sm },
  resumen: { fontSize: fontSizes.small, color: colors.textMuted, marginBottom: spacing.md },
  espacio: { marginTop: spacing.sm },
  acciones: { flexDirection: 'row', marginTop: spacing.lg },
  botonCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  botonCancelarTexto: { fontSize: fontSizes.small, fontWeight: '700', color: colors.textSecondary },
  botonConfirmar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonConfirmarTexto: { fontSize: fontSizes.small, fontWeight: '700', color: colors.surface },
});
