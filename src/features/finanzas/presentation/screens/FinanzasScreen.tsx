import React from 'react';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { FinanzasBarberoScreen } from './FinanzasBarberoScreen';
import { FinanzasAdminScreen } from './FinanzasAdminScreen';
import type { AppDrawerScreenProps } from '../../../../app/navigation/types';

/**
 * Punto de entrada de la ruta "Finanzas" del drawer: reparte según el rol,
 * igual que ya hace `AppNavigator` con "Inicio".
 */
export function FinanzasScreen(props: AppDrawerScreenProps<'Finanzas'>) {
  const { perfil } = useAuth();
  return perfil?.esAdmin ? <FinanzasAdminScreen {...props} /> : <FinanzasBarberoScreen {...props} />;
}
