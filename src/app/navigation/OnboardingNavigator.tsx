import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { WelcomeScreen } from '../../features/onboarding/presentation/screens/WelcomeScreen';
import { BarbershopRegisterScreen } from '../../features/onboarding/presentation/screens/BarbershopRegisterScreen';
import { CuentaAdminScreen } from '../../features/onboarding/presentation/screens/CuentaAdminScreen';
import { HorarioScreen } from '../../features/onboarding/presentation/screens/HorarioScreen';
import { EquipoScreen } from '../../features/onboarding/presentation/screens/EquipoScreen';
import { ServiciosScreen } from '../../features/onboarding/presentation/screens/ServiciosScreen';
import { ResumenScreen } from '../../features/onboarding/presentation/screens/ResumenScreen';
import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

/** Los 7 pasos. Cada pantalla dibuja su propio encabezado, por eso headerShown: false. */
export function OnboardingNavigator() {
  return (
    <Stack.Navigator initialRouteName="Bienvenida" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Bienvenida" component={WelcomeScreen} />
      <Stack.Screen name="DatosBarberia" component={BarbershopRegisterScreen} />
      <Stack.Screen name="CuentaAdmin" component={CuentaAdminScreen} />
      <Stack.Screen name="Horario" component={HorarioScreen} />
      <Stack.Screen name="Equipo" component={EquipoScreen} />
      <Stack.Screen name="Servicios" component={ServiciosScreen} />
      <Stack.Screen name="Resumen" component={ResumenScreen} />
    </Stack.Navigator>
  );
}
