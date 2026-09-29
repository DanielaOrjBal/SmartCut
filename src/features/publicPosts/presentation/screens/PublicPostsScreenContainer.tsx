import React from 'react';
import { PublicPostsScreen } from './PublicPostsScreen';
import type { AppDrawerScreenProps } from '../../../../app/navigation/types';

export function PublicPostsScreenContainer({
  navigation,
}: AppDrawerScreenProps<'Publicaciones'>) {
  return <PublicPostsScreen onBack={() => navigation.navigate('Inicio')} />;
}
