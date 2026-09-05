import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { FeatureCard } from '../components/FeatureCard';
import welcomeData from '../data/local/welcome-info.json';

// Definimos la interfaz para recibir la función de navegación sin alterar el componente
interface WelcomeScreenProps {
  onNext?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <View style={styles.container}>
        {/* Header: Logo pequeño y Contador */}
        <View style={styles.header}>
          <Image 
            source={require('../../../../assets/images/splash-icon.png')} 
            style={styles.headerLogo} 
            resizeMode="contain" 
          />
          <Text style={styles.stepText}>{welcomeData.step}</Text>
        </View>

        {/* Barra de Progreso */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarActive} />
          <View style={styles.progressBarInactive} />
        </View>

        {/* Contenido Principal */}
        <View style={styles.content}>
          <Image 
            source={require('../../../../assets/images/splash-icon.png')} 
            style={styles.mainLogo} 
            resizeMode="contain" 
          />

          <Text style={styles.title}>{welcomeData.title}</Text>
          <Text style={styles.subtitle}>{welcomeData.subtitle}</Text>
          <Text style={styles.description}>{welcomeData.description}</Text>

          {/* Tarjetas Dinámicas desde el JSON */}
          <View style={styles.featuresContainer}>
            {welcomeData.features.map((feature) => (
              <FeatureCard 
                key={feature.id} 
                icon={feature.icon as any} 
                text={feature.text} 
              />
            ))}
          </View>
        </View>

        {/* Botón Inferior conectado a la acción onNext */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.8}
            onPress={() => {
              if (onNext) {
                onNext();
              }
            }}
          >
            <Text style={styles.buttonText}>{welcomeData.buttonText}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  headerLogo: {
    width: 30,
    height: 40,
  },
  stepText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 1,
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 3,
    width: '100%',
    marginBottom: 40,
  },
  progressBarActive: {
    flex: 0.16,
    backgroundColor: '#14B8A6',
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  progressBarInactive: {
    flex: 0.84,
    backgroundColor: '#E5E7EB',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  mainLogo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0A192F',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C49A45',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 32,
    lineHeight: 20,
  },
  featuresContainer: {
    width: '100%',
  },
  footer: {
    paddingBottom: 30,
    width: '100%',
  },
  button: {
    backgroundColor: '#C49A45',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#C49A45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});