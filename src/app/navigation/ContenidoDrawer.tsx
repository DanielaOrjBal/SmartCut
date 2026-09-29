import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer';
import type { ComponentProps } from 'react';

import { colors, fontSizes, radii, spacing } from '../../core/theme/tokens';
import { useAuth } from '../../features/auth/presentation/context/AuthContext';
import type { AppDrawerParamList } from './types';

type ItemMenu = {
  ruta: keyof AppDrawerParamList;
  etiqueta: string;
  icono: ComponentProps<typeof Feather>['name'];
};

const ITEMS_BARBERO: ItemMenu[] = [
  { ruta: 'Inicio', etiqueta: 'Inicio', icono: 'home' },
  { ruta: 'Agenda', etiqueta: 'Agenda', icono: 'calendar' },
  { ruta: 'Finanzas', etiqueta: 'Finanzas', icono: 'dollar-sign' },
  { ruta: 'Publicaciones', etiqueta: 'Publicaciones', icono: 'globe' },
  { ruta: 'Configuracion', etiqueta: 'Configuración', icono: 'settings' },
];

/** Equipo entre Agenda y Finanzas: es la sección propia de gestión del negocio. */
const ITEMS_ADMIN: ItemMenu[] = [
  { ruta: 'Inicio', etiqueta: 'Inicio', icono: 'home' },
  { ruta: 'Agenda', etiqueta: 'Agenda', icono: 'calendar' },
  { ruta: 'Equipo', etiqueta: 'Equipo', icono: 'users' },
  { ruta: 'Finanzas', etiqueta: 'Finanzas', icono: 'dollar-sign' },
  { ruta: 'Publicaciones', etiqueta: 'Publicaciones', icono: 'globe' },
  { ruta: 'Configuracion', etiqueta: 'Configuración', icono: 'settings' },
];

/**
 * Contenido del drawer lateral. Un mismo componente para los dos roles: la
 * cabecera y la lista de secciones cambian según `perfil.esAdmin`, nunca hay
 * dos componentes de drawer distintos.
 *
 * "Equipo" solo aparece en `ITEMS_ADMIN": un barbero no solo no ve el ítem,
 * la ruta ni siquiera está registrada en su `Drawer.Navigator`.
 */
export function ContenidoDrawer(props: DrawerContentComponentProps) {
  const { perfil, cerrarSesion } = useAuth();
  const { state, navigation } = props;

  const rutaActiva = state.routes[state.index]?.name;
  const items = perfil?.esAdmin ? ITEMS_ADMIN : ITEMS_BARBERO;
  const nombreCompleto = perfil === null ? '' : `${perfil.nombre} ${perfil.apellido ?? ''}`.trim();

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'bottom']}>
      <DrawerContentScrollView {...props} contentContainerStyle={estilos.scroll}>
        <View style={estilos.cabecera}>
          <View style={estilos.avatar}>
            <Feather name="user" size={28} color={colors.surface} />
          </View>
          <Text style={estilos.nombre} numberOfLines={1}>
            {nombreCompleto}
          </Text>
          <View style={estilos.insignia}>
            <Text style={estilos.insigniaTexto}>
              {perfil?.esAdmin ? 'ADMINISTRADOR' : 'BARBERO'}
            </Text>
          </View>
          <Text style={estilos.barberia} numberOfLines={1}>
            {perfil?.nombreBarberia ?? ''}
          </Text>
        </View>

        <View style={estilos.menu}>
          {items.map((item) => {
            const activo = item.ruta === rutaActiva;
            return (
              <TouchableOpacity
                key={item.ruta}
                style={[estilos.item, activo && estilos.itemActivo]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(item.ruta)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
              >
                <Feather
                  name={item.icono}
                  size={20}
                  color={activo ? colors.primary : colors.textSecondary}
                />
                <Text style={[estilos.itemTexto, activo && estilos.itemTextoActivo]}>
                  {item.etiqueta}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      <View style={estilos.pie}>
        <TouchableOpacity
          style={estilos.itemCerrarSesion}
          activeOpacity={0.7}
          onPress={() => {
            void cerrarSesion();
          }}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Feather name="log-out" size={20} color={colors.danger} />
          <Text style={estilos.itemCerrarSesionTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingTop: 0 },
  cabecera: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  nombre: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.surface,
  },
  insignia: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm + 4,
    marginTop: 6,
    marginBottom: 6,
  },
  insigniaTexto: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: 0.5,
  },
  barberia: {
    fontSize: fontSizes.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  menu: { paddingHorizontal: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginBottom: 2,
  },
  itemActivo: {
    backgroundColor: '#FBF4E7',
  },
  itemTexto: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  itemTextoActivo: {
    color: colors.navy,
    fontWeight: '700',
  },
  pie: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  itemCerrarSesion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  itemCerrarSesionTexto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.danger,
    marginLeft: spacing.md,
  },
});
