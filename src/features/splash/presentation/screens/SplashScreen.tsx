import { useEffect, useRef } from "react";
import {
  Animated,
  ImageBackground,
  StyleSheet,
} from "react-native";

type SplashScreenProps = {
  onFinish: () => void;
};

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Esperar y luego hacer fade out
    const timerId = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2000);

    return () => {
      clearTimeout(timerId);
    };
  }, [opacity, onFinish]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
        },
      ]}
    >
      <ImageBackground
        source={require("../../../../../assets/images/splash-icon.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF9",
  },

  image: {
    flex: 1,
  },
  
});