import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../../features/auth/presentation/screens/LoginScreen';
import { CambiarContrasenaScreen } from '../../features/auth/presentation/screens/CambiarContrasenaScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

type Props = {
  /** true cuando el barbero entró con una clave provisional. */
  forzarCambio: boolean;
};

/**
 * Login y cambio de contraseña.
 *
 * Cuando el cambio es obligatorio se registra SOLO esa pantalla. No es que se
 * oculte el botón de volver: es que no hay ninguna otra ruta montada, así que
 * no existe a dónde regresar. Con gestureEnabled en false tampoco se sale
 * deslizando en iOS.
 */
export function AuthNavigator({ forzarCambio }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      {forzarCambio ? (
        <Stack.Screen name="CambiarContrasena" component={CambiarContrasenaScreen} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
