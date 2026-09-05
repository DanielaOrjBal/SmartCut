import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Platform, 
  ScrollView, 
  KeyboardAvoidingView,
  Alert,
  Image 
} from 'react-native';

// Importamos los estilos desde su nueva ubicación en features/barbershop/styles
import { styles } from '../styles/BarbershopRegisterstyles';

export const BarbershopRegisterScreen = ({ navigation }: any) => {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState(''); 

  const handleContinue = () => {
    console.log("👉 ¡Botón Continuar presionado en el Front!");

    // Validación local de campos vacíos
    if (!nombre.trim() || !direccion.trim() || !telefono.trim() || !correo.trim()) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos para continuar.');
      return;
    }

    // Alerta de éxito orientada 100% al frontend
    Alert.alert(
      '¡Datos guardados!', 
      'La información del formulario es correcta.',
      [
        { 
          text: 'Continuar al siguiente paso', 
          onPress: () => {
            console.log("Simulando transición a la siguiente pantalla...");
            // navigation.navigate('NombreSiguientePantalla'); // Descomentar cuando configures tu navegador
          } 
        }
      ]
    );
  };

  const handleSkip = () => {
    console.log("Paso omitido por el usuario");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Header con Logo y Paso */}
          <View style={styles.header}>
            <Image 
              source={require('../../../../assets/images/splash-icon.png')} 
              style={styles.headerLogo} 
              resizeMode="contain" 
            />
            <Text style={styles.stepText}>2 / 6</Text>
          </View>

          {/* Barra de Progreso */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarActive} />
            <View style={styles.progressBarInactive} />
          </View>

          {/* Títulos descriptivos */}
          <View style={styles.titleContainer}>
            <Text style={styles.stepIndicator}>PASO 2 DE 6</Text>
            <Text style={styles.title}>Cuéntanos sobre tu barbería</Text>
            <Text style={styles.subtitle}>
              Esta información aparecerá en tu perfil y ayudará a personalizar tu experiencia.
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            
            <Text style={styles.label}>NOMBRE DE LA BARBERÍA</Text>
            <TextInput 
              style={styles.input}
              placeholder="Ej. Barbería Clásica Brayan"
              placeholderTextColor="#9CA3AF"
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={styles.label}>UBICACIÓN / DIRECCIÓN</Text>
            <TextInput 
              style={styles.input}
              placeholder="Ej. Calle 45 # 12-30, Bogotá"
              placeholderTextColor="#9CA3AF"
              value={direccion}
              onChangeText={setDireccion}
            />

            <TouchableOpacity style={styles.mapBox} activeOpacity={0.7}>
              <View style={styles.mapIconPlaceholder}>
                <Text style={styles.mapIconText}>📍</Text>
              </View>
              <Text style={styles.mapBoxText}>Confirmar ubicación en mapa</Text>
            </TouchableOpacity>

            <Text style={styles.label}>TELÉFONO DE CONTACTO</Text>
            <TextInput 
              style={styles.input}
              placeholder="+57 300 000 0000"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={telefono}
              onChangeText={setTelefono}
            />

            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput 
              style={styles.input}
              placeholder="contacto@tu-barberia.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={correo}
              onChangeText={setCorreo}
            />

          </View>

          {/* Botones Inferiores */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.button} 
              activeOpacity={0.8} 
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.skipButton} 
              activeOpacity={0.6}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Omitir por ahora</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};