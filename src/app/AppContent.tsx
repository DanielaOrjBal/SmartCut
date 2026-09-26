import { useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SplashScreen } from '../features/splash/presentation/screens/SplashScreen';
import { AuthProvider } from '../features/auth/presentation/context/AuthContext';
import { OnboardingProvider } from '../features/onboarding/presentation/context/OnboardingContext';
import { RootNavigator } from './navigation/RootNavigator';

export function AppContent() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setIsSplashVisible(false);
  }, []);

  return (
    <SafeAreaProvider>
      {isSplashVisible ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        // El AuthProvider decide qué stack se monta; el RootNavigator solo obedece.
        <AuthProvider>
          <OnboardingProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </OnboardingProvider>
        </AuthProvider>
      )}
    </SafeAreaProvider>
  );
}
