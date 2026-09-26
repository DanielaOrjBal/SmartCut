import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BotonPrimario } from '../../../../core/components/BotonPrimario';
import { CampoTexto } from '../../../../core/components/CampoTexto';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { correoValido, requerido, telefonoValido } from '../../../../core/validacion/campos';
import type { OnboardingScreenProps } from '../../../../app/navigation/types';
import { useOnboarding } from '../context/OnboardingContext';
import { PasoLayout } from '../components';

export const BarbershopRegisterScreen = ({
  navigation,
}: OnboardingScreenProps<'DatosBarberia'>) => {
  const { estado, actualizarBarberia } = useOnboarding();
  const { barberia } = estado;

  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const marcar = (campo: string) => setTocados((previo) => ({ ...previo, [campo]: true }));

  const errores = {
    nombre: requerido(barberia.nombre, 'El nombre de la barbería'),
    direccion: requerido(barberia.direccion, 'La dirección'),
    telefono: telefonoValido(barberia.telefono),
    correo: correoValido(barberia.correo),
  };
  const esValido = Object.values(errores).every((error) => error === null);

  const continuar = () => {
    if (!esValido) {
      setTocados({ nombre: true, direccion: true, telefono: true, correo: true });
      return;
    }
    navigation.navigate('CuentaAdmin');
  };

  return (
    <PasoLayout
      paso={2}
      titulo="Cuéntanos sobre tu barbería"
      subtitulo="Esta información aparecerá en tu perfil y ayudará a personalizar tu experiencia."
      pie={
        // Este paso es obligatorio: no lleva "Omitir por ahora".
        <BotonPrimario texto="Continuar" onPress={continuar} deshabilitado={!esValido} />
      }
    >
      <CampoTexto
        etiqueta="NOMBRE DE LA BARBERÍA"
        placeholder="Ej. Barbería Clásica Brayan"
        valor={barberia.nombre}
        onCambiar={(nombre) => actualizarBarberia({ nombre })}
        onBlur={() => marcar('nombre')}
        error={errores.nombre}
        tocado={tocados.nombre}
        autoCapitalize="words"
        maxLength={150}
      />

      <CampoTexto
        etiqueta="UBICACIÓN / DIRECCIÓN"
        placeholder="Ej. Calle 45 # 12-30, Bogotá"
        valor={barberia.direccion}
        onCambiar={(direccion) => actualizarBarberia({ direccion })}
        onBlur={() => marcar('direccion')}
        error={errores.direccion}
        tocado={tocados.direccion}
        maxLength={200}
      />

      <TouchableOpacity style={estilos.mapBox} activeOpacity={0.7} disabled>
        <View style={estilos.mapIconPlaceholder}>
          <Text style={estilos.mapIconText}>📍</Text>
        </View>
        <Text style={estilos.mapBoxText}>Confirmar ubicación en mapa</Text>
        <Text style={estilos.mapBoxNota}>Disponible próximamente</Text>
      </TouchableOpacity>

      <CampoTexto
        etiqueta="TELÉFONO DE CONTACTO"
        placeholder="+57 300 000 0000"
        valor={barberia.telefono}
        onCambiar={(telefono) => actualizarBarberia({ telefono })}
        onBlur={() => marcar('telefono')}
        error={errores.telefono}
        tocado={tocados.telefono}
        keyboardType="phone-pad"
        maxLength={20}
      />

      <CampoTexto
        etiqueta="CORREO ELECTRÓNICO"
        placeholder="contacto@tu-barberia.com"
        valor={barberia.correo}
        onCambiar={(correo) => actualizarBarberia({ correo })}
        onBlur={() => marcar('correo')}
        error={errores.correo}
        tocado={tocados.correo}
        keyboardType="email-address"
        autoCapitalize="none"
        maxLength={150}
      />
    </PasoLayout>
  );
};

const estilos = StyleSheet.create({
  mapBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderStyle: 'dashed',
  },
  mapIconPlaceholder: {
    marginBottom: 6,
  },
  mapIconText: {
    fontSize: 22,
  },
  mapBoxText: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  mapBoxNota: {
    fontSize: fontSizes.caption,
    color: colors.placeholder,
    marginTop: spacing.xs,
  },
});
