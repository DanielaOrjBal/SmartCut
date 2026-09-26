import React, { useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { EncabezadoPantalla } from '../../../../core/components/EncabezadoPantalla';
import { Esqueleto } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { formatearUltimoAcceso } from '../../../../core/utils/fechas';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import { usePerfil } from '../../../dashboard/presentation/hooks/usePerfil';
import { useBarberia } from '../hooks/useBarberia';
import { FormularioCambiarContrasena } from '../components/FormularioCambiarContrasena';
import { FormularioHorario } from '../components/FormularioHorario';
import type { AppDrawerScreenProps } from '../../../../app/navigation/types';

/**
 * Configuración. Ambos roles ven y editan sus propios datos, cambian su
 * contraseña, ven la información de su cuenta y cierran sesión. El admin
 * además ve los datos de su barbería y edita el horario de atención.
 *
 * Nombre, apellido, correo y teléfono se muestran SIEMPRE en modo lectura:
 * no existe todavía un procedimiento para actualizarlos (ver nota en el
 * README), así que esta pantalla no ofrece un formulario que terminaría
 * fallando contra el backend.
 */
export function ConfiguracionScreen({ navigation }: AppDrawerScreenProps<'Configuracion'>) {
  const { perfil: sesion, cerrarSesion } = useAuth();
  const perfil = usePerfil();
  const barberia = useBarberia({ habilitado: sesion?.esAdmin ?? false });

  useFocusEffect(
    useCallback(() => {
      perfil.refetch();
      if (sesion?.esAdmin) {
        barberia.refetch();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const datos = perfil.data;
  const ultimoAcceso = formatearUltimoAcceso(datos?.fechaUltimoAcceso ?? null);

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <EncabezadoPantalla titulo="Configuración" onAbrirMenu={() => navigation.openDrawer()} />

      <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false}>
        <View style={estilos.avatarFila}>
          <View style={estilos.avatar}>
            <Feather name="user" size={30} color={colors.surface} />
          </View>
          {datos !== null && (
            <View>
              <Text style={estilos.nombre}>
                {datos.nombre} {datos.apellido ?? ''}
              </Text>
              <View style={estilos.insignia}>
                <Text style={estilos.insigniaTexto}>
                  {datos.esAdmin ? 'ADMINISTRADOR' : 'BARBERO'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {perfil.loading && datos === null ? (
          <Esqueleto alto={160} radio={radii.lg} />
        ) : perfil.error !== null ? (
          <EstadoError mensaje={perfil.error} onReintentar={perfil.refetch} />
        ) : datos === null ? null : (
          <>
            <Seccion titulo="Tus datos">
              <Dato etiqueta="Nombre" valor={`${datos.nombre} ${datos.apellido ?? ''}`.trim()} />
              <Dato etiqueta="Correo" valor={datos.correo} />
              <Dato etiqueta="Teléfono" valor={datos.telefono ?? 'Sin registrar'} />
              <Text style={estilos.notaSoloLectura}>
                Estos datos son de solo lectura por ahora.
              </Text>
            </Seccion>

            <Seccion titulo="Información de la cuenta">
              <Dato etiqueta="Rol" valor={datos.esAdmin ? 'Administrador' : 'Barbero'} />
              <Dato etiqueta="Barbería" valor={datos.barberia.nombre} />
              <Dato etiqueta="Fecha de ingreso" valor={datos.fechaIngreso} />
              <Dato etiqueta="Último acceso" valor={ultimoAcceso ?? 'Sin registrar'} />
              <Dato etiqueta="Comisión" valor={`${datos.porcentajeComision}% (solo lectura)`} />
            </Seccion>

            <Seccion titulo="Cambiar contraseña">
              <FormularioCambiarContrasena />
            </Seccion>

            {sesion?.esAdmin && (
              <>
                <Seccion titulo="Datos de la barbería">
                  {barberia.loading && barberia.data === null ? (
                    <Esqueleto alto={80} radio={radii.md} />
                  ) : barberia.error !== null ? (
                    <EstadoError mensaje={barberia.error} onReintentar={barberia.refetch} />
                  ) : barberia.data !== null ? (
                    <>
                      <Dato etiqueta="Nombre" valor={barberia.data.nombre} />
                      <Dato etiqueta="Dirección" valor={barberia.data.direccion ?? 'Sin registrar'} />
                      <Dato etiqueta="Teléfono" valor={barberia.data.telefono ?? 'Sin registrar'} />
                      <Text style={estilos.notaSoloLectura}>
                        Estos datos son de solo lectura por ahora.
                      </Text>
                    </>
                  ) : null}
                </Seccion>

                {barberia.data !== null && (
                  <Seccion titulo="Horario de atención">
                    <FormularioHorario barberia={barberia.data} onActualizado={() => barberia.refetch()} />
                  </Seccion>
                )}
              </>
            )}
          </>
        )}

        <TouchableOpacity
          style={estilos.botonCerrarSesion}
          activeOpacity={0.7}
          onPress={() => {
            void cerrarSesion();
          }}
        >
          <Feather name="log-out" size={16} color={colors.danger} />
          <Text style={estilos.botonCerrarSesionTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={estilos.seccion}>
      <Text style={estilos.tituloSeccion}>{titulo}</Text>
      {children}
    </View>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.screen, paddingBottom: 60 },
  avatarFila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  nombre: { fontSize: fontSizes.body, fontWeight: '700', color: colors.navy },
  insignia: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm + 4,
    marginTop: 6,
  },
  insigniaTexto: { fontSize: 10, fontWeight: '700', color: colors.surface, letterSpacing: 0.5 },
  seccion: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  tituloSeccion: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.md,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  etiqueta: { fontSize: fontSizes.caption, color: colors.textMuted },
  valor: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.md,
    flexShrink: 1,
    textAlign: 'right',
  },
  notaSoloLectura: {
    fontSize: 11,
    color: colors.placeholder,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  botonCerrarSesion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    marginTop: spacing.sm,
  },
  botonCerrarSesionTexto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.danger,
    marginLeft: spacing.sm,
  },
});
