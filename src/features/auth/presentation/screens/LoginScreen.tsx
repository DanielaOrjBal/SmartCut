import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { ApiError } from '../../../../core/api/client';
import { BotonPrimario } from '../../../../core/components/BotonPrimario';
import { CampoTexto } from '../../../../core/components/CampoTexto';
import { colors } from '../../../../core/theme/tokens';
import { correoValido } from '../../../../core/validacion/campos';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../../../onboarding/presentation/context/OnboardingContext';
import { authStyles } from '../styles/authStyles';

export function LoginScreen() {
  const { iniciarSesion, iniciarRegistroNuevo } = useAuth();
  const { reiniciar: reiniciarOnboarding } = useOnboarding();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  const errorCorreo = correoValido(correo);
  const errorContrasena = contrasena.length === 0 ? 'Escribe tu contraseña.' : null;
  const esValido = errorCorreo === null && errorContrasena === null;

  const entrar = async () => {
    if (!esValido) {
      setTocados({ correo: true, contrasena: true });
      return;
    }

    setErrorServidor(null);
    setEntrando(true);
    try {
      // Al terminar, el AuthContext guarda el token y el RootNavigator cambia
      // de stack solo. Esta pantalla no navega a ningún lado.
      await iniciarSesion(correo.trim(), contrasena);
    } catch (fallo) {
      // El backend ya redacta sus mensajes en español: se muestran tal cual.
      setErrorServidor(
        fallo instanceof ApiError ? fallo.message : 'No pudimos iniciar sesión. Intenta de nuevo.',
      );
      setEntrando(false);
    }
  };

  /**
   * Registrar una barbería nueva desde el login: hace falta cuando el
   * dispositivo ya completó un onboarding antes (de otra barbería) y por eso
   * `decidirStack` cae aquí en vez de mostrar el onboarding de una.
   *
   * `reiniciar()` es imprescindible: sin él, el onboarding arrancaría con los
   * datos de la última barbería registrada en este mismo dispositivo todavía
   * en memoria (nadie los había limpiado hasta ahora, porque nunca hacía
   * falta — no existía forma de volver a entrar al onboarding).
   */
  const registrarBarberiaNueva = () => {
    reiniciarOnboarding();
    iniciarRegistroNuevo();
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
          <View style={authStyles.encabezado}>
            <Image
              source={require('../../../../../assets/images/logo-smartcut.png')}
              style={authStyles.logo}
              resizeMode="contain"
            />
            <Text style={authStyles.titulo}>Bienvenido de vuelta</Text>
            <Text style={authStyles.subtitulo}>
              Entra con el correo y la contraseña de tu cuenta de SmartCut.
            </Text>
          </View>

          <View style={authStyles.formulario}>
            <CampoTexto
              etiqueta="CORREO ELECTRÓNICO"
              placeholder="tu-correo@ejemplo.com"
              valor={correo}
              onCambiar={(valor) => {
                setCorreo(valor);
                setErrorServidor(null);
              }}
              onBlur={() => setTocados((previo) => ({ ...previo, correo: true }))}
              error={errorCorreo}
              tocado={tocados.correo}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={150}
            />

            <CampoTexto
              etiqueta="CONTRASEÑA"
              placeholder="Tu contraseña"
              valor={contrasena}
              onCambiar={(valor) => {
                setContrasena(valor);
                setErrorServidor(null);
              }}
              onBlur={() => setTocados((previo) => ({ ...previo, contrasena: true }))}
              error={errorContrasena}
              tocado={tocados.contrasena}
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
            texto={entrando ? 'Entrando…' : 'Iniciar sesión'}
            onPress={() => {
              void entrar();
            }}
            deshabilitado={!esValido}
            cargando={entrando}
          />

          {/*
            Sin esto, un dispositivo donde ya se registró una barbería antes
            no tenía ninguna forma de registrar una segunda: la app siempre
            caía aquí, en el login, y el onboarding quedaba inalcanzable.
          */}
          <TouchableOpacity
            style={authStyles.enlace}
            onPress={registrarBarberiaNueva}
            activeOpacity={0.6}
          >
            <Text style={authStyles.enlaceTexto}>¿Tu barbería no está registrada? Regístrala aquí</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
