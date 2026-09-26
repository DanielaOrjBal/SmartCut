import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { BotonPrimario } from '../../../../core/components/BotonPrimario';
import { CampoTexto } from '../../../../core/components/CampoTexto';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import { correoValido, requerido, telefonoValido } from '../../../../core/validacion/campos';
import type { OnboardingScreenProps } from '../../../../app/navigation/types';
import type { DatosBarbero } from '../../domain/onboarding';
import { useOnboarding } from '../context/OnboardingContext';
import { Chip, PasoLayout } from '../components';

const OPCIONES_CANTIDAD = [1, 2, 3, 4, 5] as const;
const MAXIMO = 20;

const barberoVacio = (): DatosBarbero => ({
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
});

export function EquipoScreen({ navigation }: OnboardingScreenProps<'Equipo'>) {
  const { estado, establecerBarberos } = useOnboarding();
  const { barberos } = estado;

  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const marcar = (clave: string) => setTocados((previo) => ({ ...previo, [clave]: true }));

  /** El chip fija la cantidad: recorta o agrega formularios vacíos. */
  const fijarCantidad = (cantidad: number) => {
    if (cantidad <= barberos.length) {
      establecerBarberos(barberos.slice(0, cantidad));
      return;
    }
    const faltantes = Array.from({ length: cantidad - barberos.length }, barberoVacio);
    establecerBarberos([...barberos, ...faltantes]);
  };

  const actualizarBarbero = (indice: number, parcial: Partial<DatosBarbero>) => {
    establecerBarberos(
      barberos.map((barbero, i) => (i === indice ? { ...barbero, ...parcial } : barbero)),
    );
  };

  const quitarBarbero = (indice: number) => {
    establecerBarberos(barberos.filter((_, i) => i !== indice));
  };

  const erroresDe = (barbero: DatosBarbero, indice: number) => {
    // El correo es obligatorio: es el usuario con el que el barbero inicia sesión.
    let errorCorreo = correoValido(barbero.correo);
    if (errorCorreo === null) {
      const repetido = barberos.some(
        (otro, i) =>
          i !== indice && otro.correo.trim().toLowerCase() === barbero.correo.trim().toLowerCase(),
      );
      if (repetido) {
        errorCorreo = 'Ese correo ya lo estás usando en otro barbero.';
      }
    }
    return {
      nombre: requerido(barbero.nombre, 'El nombre'),
      apellido: requerido(barbero.apellido, 'El apellido'),
      correo: errorCorreo,
      telefono: telefonoValido(barbero.telefono, false),
    };
  };

  const esValido = barberos.every(
    (barbero, indice) =>
      Object.values(erroresDe(barbero, indice)).every((error) => error === null),
  );

  const continuar = () => {
    if (!esValido) {
      const todos: Record<string, boolean> = {};
      barberos.forEach((_, indice) => {
        ['nombre', 'apellido', 'correo', 'telefono'].forEach((campo) => {
          todos[`${indice}.${campo}`] = true;
        });
      });
      setTocados(todos);
      return;
    }
    navigation.navigate('Servicios');
  };

  return (
    <PasoLayout
      paso={5}
      titulo="Arma tu equipo"
      subtitulo="A cada barbero se le generará una contraseña provisional que podrás entregarle al terminar."
      pie={
        <>
          <BotonPrimario texto="Continuar" onPress={continuar} deshabilitado={!esValido} />
          {/* Paso opcional: una barbería puede empezar con el dueño solo. */}
          <TouchableOpacity
            style={estilos.omitir}
            activeOpacity={0.6}
            onPress={() => {
              establecerBarberos([]);
              navigation.navigate('Servicios');
            }}
          >
            <Text style={estilos.omitirTexto}>Omitir por ahora</Text>
          </TouchableOpacity>
        </>
      }
    >
      <Text style={formStyles.label}>¿CUÁNTOS BARBEROS TRABAJAN CONTIGO?</Text>
      <View style={estilos.filaChips}>
        {OPCIONES_CANTIDAD.map((cantidad) => (
          <Chip
            key={cantidad}
            texto={cantidad === 5 ? '5+' : String(cantidad)}
            activo={
              cantidad === 5 ? barberos.length >= 5 : barberos.length === cantidad
            }
            onPress={() => fijarCantidad(cantidad)}
          />
        ))}
      </View>

      {barberos.length === 0 && (
        <View style={estilos.vacio}>
          <Feather name="users" size={20} color={colors.placeholder} />
          <Text style={estilos.vacioTexto}>
            Todavía no agregaste barberos. Puedes hacerlo ahora o más tarde desde la app.
          </Text>
        </View>
      )}

      {barberos.map((barbero, indice) => {
        const errores = erroresDe(barbero, indice);
        return (
          <View key={indice} style={[formStyles.tarjeta, estilos.tarjetaBarbero]}>
            <View style={estilos.encabezadoTarjeta}>
              <Text style={estilos.tituloTarjeta}>Barbero {indice + 1}</Text>
              <TouchableOpacity
                onPress={() => quitarBarbero(indice)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel={`Quitar barbero ${indice + 1}`}
              >
                <Feather name="x" size={18} color={colors.placeholder} />
              </TouchableOpacity>
            </View>

            <CampoTexto
              etiqueta="NOMBRE"
              placeholder="Ej. Carlos"
              valor={barbero.nombre}
              onCambiar={(nombre) => actualizarBarbero(indice, { nombre })}
              onBlur={() => marcar(`${indice}.nombre`)}
              error={errores.nombre}
              tocado={tocados[`${indice}.nombre`]}
              autoCapitalize="words"
              maxLength={80}
            />
            <CampoTexto
              etiqueta="APELLIDO"
              placeholder="Ej. Mendoza"
              valor={barbero.apellido}
              onCambiar={(apellido) => actualizarBarbero(indice, { apellido })}
              onBlur={() => marcar(`${indice}.apellido`)}
              error={errores.apellido}
              tocado={tocados[`${indice}.apellido`]}
              autoCapitalize="words"
              maxLength={80}
            />
            <CampoTexto
              etiqueta="CORREO (SERÁ SU USUARIO)"
              placeholder="carlos@tu-barberia.com"
              valor={barbero.correo}
              onCambiar={(correo) => actualizarBarbero(indice, { correo })}
              onBlur={() => marcar(`${indice}.correo`)}
              error={errores.correo}
              tocado={tocados[`${indice}.correo`]}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={150}
            />
            <CampoTexto
              etiqueta="TELÉFONO (OPCIONAL)"
              placeholder="+57 300 000 0000"
              valor={barbero.telefono}
              onCambiar={(telefono) => actualizarBarbero(indice, { telefono })}
              onBlur={() => marcar(`${indice}.telefono`)}
              error={errores.telefono}
              tocado={tocados[`${indice}.telefono`]}
              keyboardType="phone-pad"
              maxLength={20}
            />
          </View>
        );
      })}

      {barberos.length > 0 && barberos.length < MAXIMO && (
        <TouchableOpacity
          style={estilos.agregar}
          activeOpacity={0.7}
          onPress={() => establecerBarberos([...barberos, barberoVacio()])}
        >
          <Feather name="plus" size={16} color={colors.primary} />
          <Text style={estilos.agregarTexto}>Agregar otro barbero</Text>
        </TouchableOpacity>
      )}
    </PasoLayout>
  );
}

const estilos = StyleSheet.create({
  filaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  tarjetaBarbero: {
    paddingBottom: 0,
  },
  encabezadoTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tituloTarjeta: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.navy,
  },
  vacio: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  vacioTexto: {
    flex: 1,
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginLeft: spacing.sm,
    lineHeight: 17,
  },
  agregar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
  },
  agregarTexto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
  omitir: {
    paddingVertical: spacing.sm,
  },
  omitirTexto: {
    color: colors.textMuted,
    fontSize: fontSizes.small,
    fontWeight: '600',
  },
});
