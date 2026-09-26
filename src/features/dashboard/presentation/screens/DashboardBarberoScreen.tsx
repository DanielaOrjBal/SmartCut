import React from 'react';
import { InicioBarbero } from '../components/InicioBarbero';
import type { AppDrawerScreenProps } from '../../../../app/navigation/types';

export function DashboardBarberoScreen({ navigation }: AppDrawerScreenProps<'Inicio'>) {
  return <InicioBarbero onAbrirMenu={() => navigation.openDrawer()} />;
}
