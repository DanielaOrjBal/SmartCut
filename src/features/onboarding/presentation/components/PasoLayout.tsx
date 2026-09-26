import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../../core/theme/tokens';
import { onboardingStyles } from '../styles/onboardingStyles';
import { OnboardingHeader } from './OnboardingHeader';

/** Total de pasos del onboarding. Un solo lugar por si algún día cambia. */
export const TOTAL_PASOS = 7;

type Props = {
  paso: number;
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
  /** Botones del pie. Va fuera del bloque de campos, pero dentro del scroll. */
  pie: React.ReactNode;
};

/**
 * Estructura repetida por los pasos con formulario.
 *
 * Trae de fábrica el KeyboardAvoidingView + ScrollView con
 * keyboardShouldPersistTaps="handled" que ya usaba BarbershopRegisterScreen,
 * para que el teclado no tape los campos ni se coma el primer toque.
 */
export function PasoLayout({ paso, titulo, subtitulo, children, pie }: Props) {
  return (
    <SafeAreaView style={onboardingStyles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={onboardingStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <OnboardingHeader step={paso} total={TOTAL_PASOS} />

          <View style={onboardingStyles.titleContainer}>
            <Text style={onboardingStyles.stepIndicator}>
              PASO {paso} DE {TOTAL_PASOS}
            </Text>
            <Text style={onboardingStyles.title}>{titulo}</Text>
            <Text style={onboardingStyles.subtitle}>{subtitulo}</Text>
          </View>

          <View style={onboardingStyles.formContainer}>{children}</View>

          <View style={onboardingStyles.footer}>{pie}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
