import React, { useState } from 'react';

import { BotonPrimario } from '../../../../core/components/BotonPrimario';
import { CampoTexto } from '../../../../core/components/CampoTexto';
import { correoValido, requerido, telefonoValido } from '../../../../core/validacion/campos';
import type { OnboardingScreenProps } from '../../../../app/navigation/types';
import { useOnboarding } from '../context/OnboardingContext';
import { PasoLayout, SelectorDireccion } from '../components';

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

      <SelectorDireccion
        valor={barberia.direccion}
        onSeleccionar={(direccion, latitud, longitud) => {
          actualizarBarberia({ direccion, latitud, longitud });
          marcar('direccion');
        }}
        onCambiarTexto={(texto) => {
          actualizarBarberia({ direccion: texto, latitud: undefined, longitud: undefined });
          marcar('direccion');
        }}
        error={errores.direccion}
        tocado={tocados.direccion}
      />

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
