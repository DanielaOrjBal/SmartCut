import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import { CampoTexto } from '../../../../core/components/CampoTexto';
import { IndicadorFuerza } from '../../../../core/components/IndicadorFuerza';
import { contrasenaValida } from '../../../../core/validacion/campos';
import { useAuth } from '../../../auth/presentation/context/AuthContext';

/**
 * Cambio de contraseña desde Configuración.
 *
 * Llama al mismo `cambiarContrasena()` de `AuthContext` que usa el cambio
 * obligatorio del primer ingreso —no se reimplementa la llamada—, solo que
 * aquí es voluntario y el formulario vive en esta pantalla, no en el stack de
 * autenticación.
 */
export function FormularioCambiarContrasena() {
  const { cambiarContrasena } = useAuth();

  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [tocado, setTocado] = useState({ actual: false, nueva: false, confirmar: false });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const errorActual = tocado.actual ? (actual.length === 0 ? 'Escribe tu contraseña actual.' : null) : null;
  const errorNueva = tocado.nueva ? contrasenaValida(nueva) : null;
  const errorConfirmar = tocado.confirmar
    ? confirmar !== nueva
      ? 'Las contraseñas no coinciden.'
      : null
    : null;

  const formularioValido =
    actual.length > 0 && contrasenaValida(nueva) === null && confirmar === nueva;

  async function confirmarCambio() {
    setTocado({ actual: true, nueva: true, confirmar: true });
    setError(null);
    setExito(false);
    if (!formularioValido) {
      return;
    }
    setCargando(true);
    try {
      await cambiarContrasena(actual, nueva);
      setActual('');
      setNueva('');
      setConfirmar('');
      setTocado({ actual: false, nueva: false, confirmar: false });
      setExito(true);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <View>
      <CampoTexto
        etiqueta="CONTRASEÑA ACTUAL"
        valor={actual}
        onCambiar={(valor) => {
          setActual(valor);
          setExito(false);
        }}
        onBlur={() => setTocado((t) => ({ ...t, actual: true }))}
        error={errorActual}
        tocado={tocado.actual}
        secreto
        alternarVisibilidad
      />

      <CampoTexto
        etiqueta="CONTRASEÑA NUEVA"
        valor={nueva}
        onCambiar={(valor) => {
          setNueva(valor);
          setExito(false);
        }}
        onBlur={() => setTocado((t) => ({ ...t, nueva: true }))}
        error={errorNueva}
        tocado={tocado.nueva}
        secreto
        alternarVisibilidad
      />
      <IndicadorFuerza contrasena={nueva} />

      <CampoTexto
        etiqueta="CONFIRMAR CONTRASEÑA NUEVA"
        valor={confirmar}
        onCambiar={(valor) => {
          setConfirmar(valor);
          setExito(false);
        }}
        onBlur={() => setTocado((t) => ({ ...t, confirmar: true }))}
        error={errorConfirmar}
        tocado={tocado.confirmar}
        secreto
        alternarVisibilidad
      />

      {error !== null && <Text style={[formStyles.mensajeError, estilos.espacio]}>{error}</Text>}
      {exito && (
        <View style={estilos.exito}>
          <Feather name="check-circle" size={16} color="#16A34A" />
          <Text style={estilos.exitoTexto}>Tu contraseña se actualizó correctamente.</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          formStyles.button,
          estilos.boton,
          (cargando || (Object.values(tocado).some(Boolean) && !formularioValido)) &&
            formStyles.buttonDeshabilitado,
        ]}
        activeOpacity={0.8}
        onPress={() => {
          void confirmarCambio();
        }}
        disabled={cargando}
      >
        {cargando && <ActivityIndicator color={colors.surface} style={estilos.spinner} />}
        <Text style={formStyles.buttonText}>{cargando ? 'Guardando…' : 'Cambiar contraseña'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  espacio: { marginTop: -spacing.sm, marginBottom: spacing.md },
  exito: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  exitoTexto: { fontSize: fontSizes.caption, color: '#166534', marginLeft: spacing.sm, flex: 1 },
  boton: { marginBottom: 0 },
  spinner: { marginRight: spacing.sm },
});
