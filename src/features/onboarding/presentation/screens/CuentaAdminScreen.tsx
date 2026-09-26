import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { BotonPrimario } from '../../../../core/components/BotonPrimario';
import { CampoTexto } from '../../../../core/components/CampoTexto';
import { IndicadorFuerza } from '../../../../core/components/IndicadorFuerza';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import {
  contrasenaValida,
  correoValido,
  requerido,
  telefonoValido,
} from '../../../../core/validacion/campos';
import type { OnboardingScreenProps } from '../../../../app/navigation/types';
import { useOnboarding } from '../context/OnboardingContext';
import { PasoLayout } from '../components';

/**
 * Paso 3: la cuenta del administrador.
 *
 * No estaba en el mockup original, pero sp_crear_barberia_con_admin la exige:
 * la barbería y su dueño se crean en la misma llamada.
 */
export function CuentaAdminScreen({ navigation }: OnboardingScreenProps<'CuentaAdmin'>) {
  const { estado, actualizarAdmin } = useOnboarding();
  const { admin } = estado;

  const [confirmacion, setConfirmacion] = useState('');
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const marcar = (campo: string) => setTocados((previo) => ({ ...previo, [campo]: true }));

  const coincide = confirmacion.length > 0 && confirmacion === admin.contrasena;

  const errores = {
    nombre: requerido(admin.nombre, 'Tu nombre'),
    apellido: requerido(admin.apellido, 'Tu apellido'),
    correo: correoValido(admin.correo),
    telefono: telefonoValido(admin.telefono),
    contrasena: contrasenaValida(admin.contrasena),
    confirmacion:
      confirmacion.length === 0
        ? 'Confirma tu contraseña.'
        : confirmacion !== admin.contrasena
          ? 'Las contraseñas no coinciden.'
          : null,
  };
  const esValido = Object.values(errores).every((error) => error === null);

  const continuar = () => {
    if (!esValido) {
      setTocados({
        nombre: true,
        apellido: true,
        correo: true,
        telefono: true,
        contrasena: true,
        confirmacion: true,
      });
      return;
    }
    navigation.navigate('Horario');
  };

  return (
    <PasoLayout
      paso={3}
      titulo="Crea tu cuenta"
      subtitulo="Con este correo y contraseña entrarás a SmartCut como administrador de tu barbería."
      pie={
        // Paso obligatorio: sin "Omitir por ahora".
        <BotonPrimario texto="Continuar" onPress={continuar} deshabilitado={!esValido} />
      }
    >
      <CampoTexto
        etiqueta="NOMBRE"
        placeholder="Ej. Brayan"
        valor={admin.nombre}
        onCambiar={(nombre) => actualizarAdmin({ nombre })}
        onBlur={() => marcar('nombre')}
        error={errores.nombre}
        tocado={tocados.nombre}
        autoCapitalize="words"
        maxLength={80}
      />

      <CampoTexto
        etiqueta="APELLIDO"
        placeholder="Ej. Ramírez"
        valor={admin.apellido}
        onCambiar={(apellido) => actualizarAdmin({ apellido })}
        onBlur={() => marcar('apellido')}
        error={errores.apellido}
        tocado={tocados.apellido}
        autoCapitalize="words"
        maxLength={80}
      />

      <CampoTexto
        etiqueta="CORREO ELECTRÓNICO"
        placeholder="tu-correo@ejemplo.com"
        valor={admin.correo}
        onCambiar={(correo) => actualizarAdmin({ correo })}
        onBlur={() => marcar('correo')}
        error={errores.correo}
        tocado={tocados.correo}
        keyboardType="email-address"
        autoCapitalize="none"
        maxLength={150}
      />

      <CampoTexto
        etiqueta="TELÉFONO"
        placeholder="+57 300 000 0000"
        valor={admin.telefono}
        onCambiar={(telefono) => actualizarAdmin({ telefono })}
        onBlur={() => marcar('telefono')}
        error={errores.telefono}
        tocado={tocados.telefono}
        keyboardType="phone-pad"
        maxLength={20}
      />

      <CampoTexto
        etiqueta="CONTRASEÑA"
        placeholder="Mínimo 8 caracteres"
        valor={admin.contrasena}
        onCambiar={(contrasena) => actualizarAdmin({ contrasena })}
        onBlur={() => marcar('contrasena')}
        error={errores.contrasena}
        tocado={tocados.contrasena}
        autoCapitalize="none"
        secreto
        alternarVisibilidad
        maxLength={72}
      />
      <IndicadorFuerza contrasena={admin.contrasena} />

      <CampoTexto
        etiqueta="CONFIRMA TU CONTRASEÑA"
        placeholder="Escríbela de nuevo"
        valor={confirmacion}
        onCambiar={setConfirmacion}
        onBlur={() => marcar('confirmacion')}
        error={errores.confirmacion}
        tocado={tocados.confirmacion}
        autoCapitalize="none"
        secreto
        alternarVisibilidad
        maxLength={72}
      />

      {coincide && (
        <View style={estilos.coincide}>
          <Feather name="check-circle" size={14} color={colors.accent} />
          <Text style={estilos.coincideTexto}>Las contraseñas coinciden</Text>
        </View>
      )}

      <View style={estilos.aviso}>
        <Feather name="shield" size={16} color={colors.textMuted} />
        <Text style={estilos.avisoTexto}>
          Tu contraseña se cifra en el servidor. Nadie, ni siquiera nosotros, puede verla.
        </Text>
      </View>
    </PasoLayout>
  );
}

const estilos = StyleSheet.create({
  coincide: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: spacing.lg,
  },
  coincideTexto: {
    fontSize: fontSizes.caption,
    color: colors.accent,
    fontWeight: '600',
    marginLeft: 6,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  avisoTexto: {
    flex: 1,
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginLeft: spacing.sm,
    lineHeight: 17,
  },
});
