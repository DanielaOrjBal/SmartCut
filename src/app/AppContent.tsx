import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SplashScreen } from "../features/splash/presentation/screens/SplashScreen";

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
      <Text style={styles.title}>
        Muchachos me deben un helado JAJAJAJ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});