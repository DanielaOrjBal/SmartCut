import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SplashScreen } from '../features/splash/presentation/screens/SplashScreen';
// 1. Importamos la pantalla de bienvenida desde su carpeta correspondiente
import { WelcomeScreen } from '../features/onboarding/screens/WelcomeScreen';
// Agregamos la importación de tu pantalla de registro de barbería
import { BarbershopRegisterScreen } from '../features/barbershop/screens/BarbershopRegisterScreen';

export function AppContent() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  // Agregamos el estado para controlar cuándo pasar a la siguiente pantalla
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'barbershop'>('welcome');

  const handleSplashFinish = useCallback(() => {
    setIsSplashVisible(false);
  }, []);

  if (isSplashVisible) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Si el usuario avanzó, mostramos la pantalla de la barbería
  if (currentScreen === 'barbershop') {
    return <BarbershopRegisterScreen />;
  }

  // 2. Pasamos la función de navegación a nuestra WelcomeScreen original
  return <WelcomeScreen onNext={() => setCurrentScreen('barbershop')} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3A2E2B',
    textAlign: 'center'
  }
});