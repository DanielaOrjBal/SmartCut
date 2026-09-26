import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../../features/auth/presentation/context/AuthContext';
import { colors } from '../../core/theme/tokens';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { decidirStack } from './decidirStack';

export function RootNavigator() {
  const { cargando, token, perfil, onboardingCompleto, forzarRegistro } = useAuth();

  const stack = decidirStack({ cargando, token, perfil, onboardingCompleto, forzarRegistro });

  switch (stack) {
    case 'cargando':
      return (
        <View style={estilos.centrado}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    case 'onboarding':
      return <OnboardingNavigator />;
    case 'auth':
      return <AuthNavigator forzarCambio={false} />;
    case 'cambioObligatorio':
      return <AuthNavigator forzarCambio />;
    case 'app':
      return <AppNavigator esAdmin={perfil?.esAdmin ?? false} />;
  }
}

const estilos = StyleSheet.create({
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
