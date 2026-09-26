import React from 'react';
import { Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotonPrimario } from '../../../../core/components/BotonPrimario';
import { colors, fontSizes, spacing } from '../../../../core/theme/tokens';
import type { OnboardingScreenProps } from '../../../../app/navigation/types';
import type { WelcomeInfo } from '../../domain/welcome';
import welcomeInfoJson from '../../data/local/welcome-info.json';
import { FeatureCard } from '../components/FeatureCard';
import { OnboardingHeader, TOTAL_PASOS } from '../components';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';

// Único punto donde el JSON crudo se convierte en el modelo tipado.
const welcomeData = welcomeInfoJson as WelcomeInfo;

export const WelcomeScreen = ({ navigation }: OnboardingScreenProps<'Bienvenida'>) => {
  const { forzarRegistro, cancelarRegistroNuevo } = useAuth();
  const { reiniciar: reiniciarOnboarding } = useOnboarding();

  // Solo tiene sentido cuando se llegó aquí desde el botón "Registrar mi
  // barbería" del login (`forzarRegistro`): en un onboarding de verdad —
  // dispositivo nuevo, sin ninguna barbería registrada todavía— no hay ningún
  // login al que volver, así que el enlace ni se muestra.
  const cancelar = () => {
    reiniciarOnboarding();
    cancelarRegistroNuevo();
  };

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={estilos.container}>
        <OnboardingHeader step={1} total={TOTAL_PASOS} />

        <View style={estilos.content}>
          <Image
            source={require('../../../../../assets/images/logo-smartcut.png')}
            style={estilos.mainLogo}
            resizeMode="contain"
          />

          <Text style={estilos.title}>{welcomeData.title}</Text>
          <Text style={estilos.subtitle}>{welcomeData.subtitle}</Text>
          <Text style={estilos.description}>{welcomeData.description}</Text>

          <View style={estilos.featuresContainer}>
            {welcomeData.features.map((feature) => (
              <FeatureCard key={feature.id} icon={feature.icon} text={feature.text} />
            ))}
          </View>
        </View>

        <View style={estilos.footer}>
          <BotonPrimario
            texto={welcomeData.buttonText}
            onPress={() => navigation.navigate('DatosBarberia')}
          />
          {forzarRegistro && (
            <TouchableOpacity style={estilos.enlace} onPress={cancelar} activeOpacity={0.6}>
              <Text style={estilos.enlaceTexto}>¿Ya tienes una cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.screen,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  mainLogo: {
    width: 120,
    height: 120,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes.titleLarge,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: spacing.xxl,
    lineHeight: 20,
  },
  featuresContainer: {
    width: '100%',
  },
  footer: {
    paddingBottom: 30,
    width: '100%',
  },
  enlace: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  enlaceTexto: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
