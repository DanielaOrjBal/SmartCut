import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SplashScreen } from '../features/splash/presentation/screens/SplashScreen';

export function AppContent() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setIsSplashVisible(false);
  }, []);

  if (isSplashVisible) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aquí iniciaremos la autenticación</Text>
    </View>
  );
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