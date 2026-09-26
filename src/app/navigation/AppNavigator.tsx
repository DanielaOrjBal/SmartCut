import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { DashboardAdminScreen } from '../../features/dashboard/presentation/screens/DashboardAdminScreen';
import { DashboardBarberoScreen } from '../../features/dashboard/presentation/screens/DashboardBarberoScreen';
import { AgendaScreen } from '../../features/agenda/presentation/screens/AgendaScreen';
import { FinanzasScreen } from '../../features/finanzas/presentation/screens/FinanzasScreen';
import { EquipoScreen } from '../../features/equipo/presentation/screens/EquipoScreen';
import { ConfiguracionScreen } from '../../features/configuracion/presentation/screens/ConfiguracionScreen';
import { ContenidoDrawer } from './ContenidoDrawer';
import type { AppDrawerParamList } from './types';

const Drawer = createDrawerNavigator<AppDrawerParamList>();

type Props = {
  esAdmin: boolean;
};

/**
 * El drawer lateral de la app. Reemplaza el stack simple que había antes de
 * esta fase — es el único navegador que le corresponde tocar a esta fase.
 *
 * `headerShown: false`: cada pantalla ya construye su propio encabezado (con
 * su propio ícono de hamburguesa desde `BotonAbrirMenu`), como el resto de la
 * app; un header de React Navigation encima se vería duplicado.
 *
 * "Equipo" solo se registra para el administrador: un barbero no solo no lo
 * ve en el menú (`ContenidoDrawer` ya filtra eso), la ruta ni siquiera existe
 * en su navegador.
 */
export function AppNavigator({ esAdmin }: Props) {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false, drawerType: 'front' }}
      drawerContent={(props) => <ContenidoDrawer {...props} />}
    >
      <Drawer.Screen name="Inicio" component={esAdmin ? DashboardAdminScreen : DashboardBarberoScreen} />
      <Drawer.Screen name="Agenda" component={AgendaScreen} />
      {esAdmin && <Drawer.Screen name="Equipo" component={EquipoScreen} />}
      <Drawer.Screen name="Finanzas" component={FinanzasScreen} />
      <Drawer.Screen name="Configuracion" component={ConfiguracionScreen} />
    </Drawer.Navigator>
  );
}
