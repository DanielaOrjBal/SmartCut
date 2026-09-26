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
import { colors, fontSizes, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import { TarjetaCredencial } from '../../../onboarding/presentation/components/TarjetaCredencial';
import { useCrearBarbero } from '../hooks/useAccionesEquipo';
import type { BarberoCreado } from '../../domain/equipo';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreado: () => void;
};

/** Correo válido, la misma pinta que usa el resto de la app en sus formularios. */
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Alta de un barbero: mismo flujo de credenciales provisionales del
 * onboarding. La contraseña generada se muestra UNA sola vez, en la misma
 * tarjeta copiable que ya usa esa pantalla — no se reimplementa nada.
 */
export function ModalAgregarBarbero({ visible, onClose, onCreado }: Props) {
  const crear = useCrearBarbero();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [creado, setCreado] = useState<BarberoCreado | null>(null);

  function reiniciar() {
    setNombre('');
    setApellido('');
    setCorreo('');
    setTelefono('');
    setIntentoEnviar(false);
    setCreado(null);
    crear.limpiarError();
  }

  function cerrar() {
    const habiaCreado = creado !== null;
    reiniciar();
    onClose();
    if (habiaCreado) {
      onCreado();
    }
  }

  const nombreValido = nombre.trim().length > 0;
  const apellidoValido = apellido.trim().length > 0;
  const correoValido = CORREO_VALIDO.test(correo.trim());
  const formularioValido = nombreValido && apellidoValido && correoValido;

  async function confirmar() {
    setIntentoEnviar(true);
    if (!formularioValido) {
      return;
    }
    try {
      const resultado = await crear.ejecutar({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim().toLowerCase(),
        telefono: telefono.trim().length > 0 ? telefono.trim() : undefined,
      });
      setCreado(resultado);
    } catch {
      // El mensaje queda en crear.error.
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={cerrar}>
      <View style={estilos.fondo}>
        <View style={estilos.hoja}>
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>
              {creado === null ? 'Agregar barbero' : 'Barbero agregado'}
            </Text>
            <TouchableOpacity onPress={cerrar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {creado !== null ? (
            <View style={estilos.cuerpo}>
              <View style={estilos.avisoUnaVez}>
                <Feather name="eye-off" size={16} color={colors.danger} />
                <Text style={estilos.avisoUnaVezTexto}>
                  Esta contraseña solo se muestra una vez. Cópiala y entrégasela a{' '}
                  {creado.nombre} antes de cerrar esta ventana.
                </Text>
              </View>
              <TarjetaCredencial credencial={creado} />
              <TouchableOpacity style={formStyles.button} onPress={cerrar}>
                <Text style={formStyles.buttonText}>Listo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={estilos.cuerpo} keyboardShouldPersistTaps="handled">
              <Text style={formStyles.label}>NOMBRE</Text>
              <TextInput
                style={[formStyles.input, intentoEnviar && !nombreValido && formStyles.inputConError]}
                placeholder="Nombre"
                placeholderTextColor={colors.placeholder}
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
                maxLength={80}
              />

              <Text style={[formStyles.label, estilos.espacio]}>APELLIDO</Text>
              <TextInput
                style={[formStyles.input, intentoEnviar && !apellidoValido && formStyles.inputConError]}
                placeholder="Apellido"
                placeholderTextColor={colors.placeholder}
                value={apellido}
                onChangeText={setApellido}
                autoCapitalize="words"
                maxLength={80}
              />

              <Text style={[formStyles.label, estilos.espacio]}>CORREO</Text>
              <TextInput
                style={[formStyles.input, intentoEnviar && !correoValido && formStyles.inputConError]}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={colors.placeholder}
                value={correo}
                onChangeText={setCorreo}
                autoCapitalize="none"
                keyboardType="email-address"
                maxLength={150}
              />

              <Text style={[formStyles.label, estilos.espacio]}>TELÉFONO (OPCIONAL)</Text>
              <TextInput
                style={formStyles.input}
                placeholder="3001234567"
                placeholderTextColor={colors.placeholder}
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
                maxLength={20}
              />

              {crear.error !== null && (
                <Text style={[formStyles.mensajeError, estilos.espacio]}>{crear.error}</Text>
              )}

              <TouchableOpacity
                style={[
                  formStyles.button,
                  estilos.espacio,
                  (crear.cargando || (intentoEnviar && !formularioValido)) &&
                    formStyles.buttonDeshabilitado,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  void confirmar();
                }}
                disabled={crear.cargando}
              >
                {crear.cargando && <ActivityIndicator color={colors.surface} style={estilos.spinner} />}
                <Text style={formStyles.buttonText}>
                  {crear.cargando ? 'Creando…' : 'Crear barbero'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(10, 25, 47, 0.45)', justifyContent: 'flex-end' },
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
  titulo: { fontSize: fontSizes.title, fontWeight: '700', color: colors.navy },
  cuerpo: { paddingHorizontal: spacing.screen, paddingBottom: spacing.xl },
  espacio: { marginTop: spacing.md },
  spinner: { marginRight: spacing.sm },
  avisoUnaVez: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  avisoUnaVezTexto: {
    flex: 1,
    fontSize: fontSizes.caption,
    color: colors.text,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
});
