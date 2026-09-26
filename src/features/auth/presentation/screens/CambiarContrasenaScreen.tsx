import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { ApiError } from '../../../../core/api/client';
import { BotonPrimario } from '../../../../core/components/BotonPrimario';
import { CampoTexto } from '../../../../core/components/CampoTexto';
import { IndicadorFuerza } from '../../../../core/components/IndicadorFuerza';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { contrasenaValida } from '../../../../core/validacion/campos';
import { useAuth } from '../context/AuthContext';
import { authStyles } from '../styles/authStyles';

/**
 * Cambio obligatorio de la clave provisional.
 *
 * No lleva botón de retroceso ni gesto de swipe porque el AuthNavigator monta
 * ESTA como única pantalla del stack mientras debeCambiarContrasena sea true.
 * Al terminar, el perfil se actualiza en el contexto y el RootNavigator entra
 * a la app solo: esta pantalla no navega a ningún lado.
 */
export function CambiarContrasenaScreen() {
  const { perfil, cambiarContrasena, cerrarSesion } = useAuth();

  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const marcar = (campo: string) => setTocados((previo) => ({ ...previo, [campo]: true }));

  const errores = {
    actual: actual.length === 0 ? 'Escribe tu contraseña provisional.' : null,
    nueva:
      contrasenaValida(nueva) ??
      (nueva === actual && actual.length > 0
        ? 'La nueva contraseña debe ser distinta de la actual.'
        : null),
    confirmacion:
      confirmacion.length === 0
        ? 'Confirma tu nueva contraseña.'
        : confirmacion !== nueva
          ? 'Las contraseñas no coinciden.'
          : null,
  };
  const esValido = Object.values(errores).every((error) => error === null);

  const guardar = async () => {
    if (!esValido) {
      setTocados({ actual: true, nueva: true, confirmacion: true });
      return;
    }

    setErrorServidor(null);
    setGuardando(true);
    try {
      await cambiarContrasena(actual, nueva);
    } catch (fallo) {
      setErrorServidor(
        fallo instanceof ApiError
          ? fallo.message
          : 'No pudimos cambiar tu contraseña. Intenta de nuevo.',
      );
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={authStyles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={authStyles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={estilos.encabezado}>
            <View style={estilos.iconoLlave}>
              <Feather name="key" size={24} color={colors.primary} />
            </View>
            <Text style={authStyles.titulo}>
              {perfil !== null ? `Hola, ${perfil.nombre}` : 'Cambia tu contraseña'}
            </Text>
            <Text style={authStyles.subtitulo}>
              Entraste con una contraseña provisional. Crea una propia para poder continuar.
            </Text>
          </View>

          <View style={authStyles.aviso}>
            <Feather name="alert-triangle" size={18} color="#B45309" />
            <Text style={authStyles.avisoTexto}>
              Este paso es obligatorio. La clave que te entregó el administrador deja de servir en
              cuanto la cambies.
            </Text>
          </View>

          <View style={authStyles.formulario}>
            <CampoTexto
              etiqueta="CONTRASEÑA PROVISIONAL"
              placeholder="La que te entregaron"
              valor={actual}
              onCambiar={(valor) => {
                setActual(valor);
                setErrorServidor(null);
              }}
              onBlur={() => marcar('actual')}
              error={errores.actual}
              tocado={tocados.actual}
              autoCapitalize="none"
              secreto
              alternarVisibilidad
              maxLength={72}
            />

            <CampoTexto
              etiqueta="NUEVA CONTRASEÑA"
              placeholder="Mínimo 8 caracteres"
              valor={nueva}
              onCambiar={(valor) => {
                setNueva(valor);
                setErrorServidor(null);
              }}
              onBlur={() => marcar('nueva')}
              error={errores.nueva}
              tocado={tocados.nueva}
              autoCapitalize="none"
              secreto
              alternarVisibilidad
              maxLength={72}
            />
            <IndicadorFuerza contrasena={nueva} />

            <CampoTexto
              etiqueta="CONFIRMA LA NUEVA CONTRASEÑA"
              placeholder="Escríbela de nuevo"
              valor={confirmacion}
              onCambiar={setConfirmacion}
              onBlur={() => marcar('confirmacion')}
              error={errores.confirmacion}
              tocado={tocados.confirmacion}
              autoCapitalize="none"
              secreto
              alternarVisibilidad
              maxLength={72}
            />
          </View>

          {errorServidor !== null && (
            <View style={authStyles.error}>
              <Feather name="alert-circle" size={18} color={colors.danger} />
              <Text style={authStyles.errorTexto}>{errorServidor}</Text>
            </View>
          )}

          <BotonPrimario
            texto={guardando ? 'Guardando…' : 'Cambiar contraseña y entrar'}
            onPress={() => {
              void guardar();
            }}
            deshabilitado={!esValido}
            cargando={guardando}
          />

          {/*
            Cerrar sesión NO es saltarse el paso: devuelve al login, no a la app.
            Está para no dejar atrapado a quien entró con la cuenta equivocada.
          */}
          <TouchableOpacity
            style={authStyles.enlace}
            onPress={() => {
              void cerrarSesion();
            }}
            activeOpacity={0.6}
          >
            <Text style={authStyles.enlaceTexto}>Entrar con otra cuenta</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  encabezado: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconoLlave: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
});
