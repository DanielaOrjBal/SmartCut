import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface FeatureCardProps {
  icon: keyof typeof Feather.glyphMap;
  text: string;
}

export const FeatureCard = ({ icon, text }: FeatureCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={20} color="#1F2937" />
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    // Sombras para replicar el diseño
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginRight: 16,
  },
  text: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
});