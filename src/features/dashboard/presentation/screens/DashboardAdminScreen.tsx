import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../../../../core/theme/tokens';
import { BotonAbrirMenu } from '../../../../core/components/BotonAbrirMenu';
import { ConmutadorVistaAdmin, type VistaAdmin } from '../components/ConmutadorVistaAdmin';
import { InicioNegocio } from '../components/InicioNegocio';
import { InicioBarbero } from '../components/InicioBarbero';
import type { AppDrawerScreenProps } from '../../../../app/navigation/types';

/**
 * Inicio del administrador: dos capas.
 *
 * "Mi negocio" (por defecto) son las métricas globales y las gráficas.
 * "Mi trabajo" reutiliza `InicioBarbero` TAL CUAL — el administrador también
 * atiende clientes y se queda con lo que factura — así que ve exactamente las
 * mismas tarjetas que vería cualquier barbero, sin duplicar ese componente.
 *
 * La hamburguesa vive aquí, fija junto al conmutador, y cubre las dos capas:
 * por eso `InicioBarbero` no recibe `onAbrirMenu` cuando se usa para
 * "Mi trabajo" — ya hay uno visible siempre.
 */
export function DashboardAdminScreen({ navigation }: AppDrawerScreenProps<'Inicio'>) {
  const [vista, setVista] = useState<VistaAdmin>('negocio');

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={estilos.filaSuperior}>
        <BotonAbrirMenu onPress={() => navigation.openDrawer()} />
        <View style={estilos.conmutador}>
          <ConmutadorVistaAdmin valor={vista} onCambiar={setVista} />
        </View>
      </View>

      <View style={estilos.contenido}>
        {vista === 'negocio' ? (
          <InicioNegocio onVerPublicaciones={() => navigation.navigate('Publicaciones')} />
        ) : (
          <InicioBarbero onVerPublicaciones={() => navigation.navigate('Publicaciones')} />
        )}
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  conmutador: { flex: 1, marginLeft: spacing.sm },
  contenido: { flex: 1 },
});
