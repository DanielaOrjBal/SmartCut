import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { BotonPrimario } from '../../../../core/components/BotonPrimario';
import { ApiError } from '../../../../core/api/client';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import type { OnboardingScreenProps } from '../../../../app/navigation/types';
import { useAuth } from '../../../auth/presentation/context/AuthContext';
import type { OnboardingResponse } from '../../domain/onboarding';
import { resumenHorario } from '../../domain/horario';
import { useOnboarding } from '../context/OnboardingContext';
import { onboardingStyles } from '../styles/onboardingStyles';
import { OnboardingHeader, TOTAL_PASOS } from '../components';
import { TarjetaCredencial } from '../components/TarjetaCredencial';

const aMiles = (valor: number) => valor.toLocaleString('es-CO');

type BloqueProps = {
  titulo: string;
  onEditar: () => void;
  children: React.ReactNode;
};

function Bloque({ titulo, onEditar, children }: BloqueProps) {
  return (
    <View style={formStyles.tarjeta}>
      <View style={estilos.encabezadoBloque}>
        <Text style={estilos.tituloBloque}>{titulo}</Text>
        <TouchableOpacity
          onPress={onEditar}
          style={estilos.botonEditar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="edit-2" size={13} color={colors.primary} />
          <Text style={estilos.textoEditar}>Editar</Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

export function ResumenScreen({ navigation }: OnboardingScreenProps<'Resumen'>) {
  const { estado, enviando, submit } = useOnboarding();
  const { completarOnboarding } = useAuth();

  const [resultado, setResultado] = useState<OnboardingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { barberia, admin, horario, barberos, servicios } = estado;

  const enviar = async () => {
    setError(null);
    try {
      setResultado(await submit());
    } catch (fallo) {
      // El backend redacta sus mensajes en español: se muestran tal cual,
      // en pantalla y no en un Alert.
      setError(
        fallo instanceof ApiError
          ? fallo.message
          : 'No pudimos crear tu barbería. Intenta de nuevo.',
      );
    }
  };

  // ---------------------------------------------------------------- éxito ---
  if (resultado !== null) {
    return (
      <SafeAreaView style={onboardingStyles.safeArea} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScrollView
          contentContainerStyle={onboardingStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.exito}>
            <View style={estilos.iconoExito}>
              <Feather name="check" size={28} color={colors.surface} />
            </View>
            <Text style={onboardingStyles.title}>¡{barberia.nombre} está lista!</Text>
            <Text style={onboardingStyles.subtitle}>
              Ya puedes iniciar sesión con tu correo {admin.correo}.
            </Text>
          </View>

          {resultado.barberos.length > 0 && (
            <>
              <View style={estilos.advertencia}>
                <Feather name="alert-triangle" size={18} color="#B45309" />
                <Text style={estilos.textoAdvertencia}>
                  Estas contraseñas se muestran <Text style={estilos.negrita}>una sola vez</Text>.
                  Cópialas y entrégaselas a cada barbero: al entrar, la app les pedirá cambiarlas.
                </Text>
              </View>

              {resultado.barberos.map((credencial) => (
                <TarjetaCredencial key={credencial.idBarbero} credencial={credencial} />
              ))}
            </>
          )}

          <View style={estilos.pieExito}>
            <BotonPrimario
              texto="Ir a iniciar sesión"
              onPress={() => {
                void completarOnboarding();
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------------------- resumen ---
  return (
    <SafeAreaView style={onboardingStyles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={onboardingStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeader step={7} total={TOTAL_PASOS} />

        <View style={onboardingStyles.titleContainer}>
          <Text style={onboardingStyles.stepIndicator}>PASO 7 DE {TOTAL_PASOS}</Text>
          <Text style={onboardingStyles.title}>Revisa antes de crear</Text>
          <Text style={onboardingStyles.subtitle}>
            Verifica que todo esté bien. Puedes volver a cualquier paso para corregir.
          </Text>
        </View>

        <Bloque titulo="Barbería" onEditar={() => navigation.navigate('DatosBarberia')}>
          <Dato etiqueta="Nombre" valor={barberia.nombre} />
          <Dato etiqueta="Dirección" valor={barberia.direccion} />
          <Dato etiqueta="Teléfono" valor={barberia.telefono} />
          <Dato etiqueta="Correo" valor={barberia.correo} />
        </Bloque>

        <Bloque titulo="Tu cuenta" onEditar={() => navigation.navigate('CuentaAdmin')}>
          <Dato etiqueta="Nombre" valor={`${admin.nombre} ${admin.apellido}`} />
          <Dato etiqueta="Correo" valor={admin.correo} />
          <Dato etiqueta="Teléfono" valor={admin.telefono} />
          <Dato etiqueta="Contraseña" valor="••••••••" />
        </Bloque>

        <Bloque titulo="Horario" onEditar={() => navigation.navigate('Horario')}>
          <Text style={estilos.resumenHorario}>
            {resumenHorario(horario.dias, horario.horaApertura, horario.horaCierre)}
          </Text>
          <Dato etiqueta="Duración del turno" valor={`${horario.duracionTurno} minutos`} />
        </Bloque>

        <Bloque
          titulo={`Equipo (${barberos.length})`}
          onEditar={() => navigation.navigate('Equipo')}
        >
          {barberos.length === 0 ? (
            <Text style={estilos.vacio}>Sin barberos por ahora. Podrás agregarlos después.</Text>
          ) : (
            barberos.map((barbero) => (
              <Dato
                key={barbero.correo}
                etiqueta={`${barbero.nombre} ${barbero.apellido}`}
                valor={barbero.correo}
              />
            ))
          )}
        </Bloque>

        <Bloque
          titulo={`Servicios (${servicios.length})`}
          onEditar={() => navigation.navigate('Servicios')}
        >
          {servicios.map((servicio) => (
            <Dato
              key={servicio.nombre}
              etiqueta={servicio.nombre}
              valor={`$${aMiles(servicio.precio)} · ${servicio.duracionMinutos} min`}
            />
          ))}
        </Bloque>

        {error !== null && (
          <View style={estilos.error}>
            <Feather name="alert-circle" size={18} color={colors.danger} />
            <Text style={estilos.textoError}>{error}</Text>
          </View>
        )}

        <View style={onboardingStyles.footer}>
          <BotonPrimario
            texto={enviando ? 'Creando tu barbería…' : 'Crear mi barbería'}
            onPress={() => {
              void enviar();
            }}
            cargando={enviando}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  encabezadoBloque: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tituloBloque: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.navy,
  },
  botonEditar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoEditar: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  etiqueta: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    flex: 1,
    marginRight: spacing.md,
  },
  valor: {
    fontSize: fontSizes.caption,
    color: colors.text,
    fontWeight: '600',
    flex: 1.4,
    textAlign: 'right',
  },
  resumenHorario: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  vacio: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  textoError: {
    flex: 1,
    fontSize: fontSizes.small,
    color: colors.danger,
    marginLeft: spacing.sm,
    lineHeight: 19,
  },
  exito: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  iconoExito: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  advertencia: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  textoAdvertencia: {
    flex: 1,
    fontSize: fontSizes.caption,
    color: '#92400E',
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
  negrita: {
    fontWeight: '700',
  },
  pieExito: {
    marginTop: spacing.lg,
  },
});
