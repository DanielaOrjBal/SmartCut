import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { BotonPrimario } from '../../../../core/components/BotonPrimario';
import { CampoTexto } from '../../../../core/components/CampoTexto';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import type { OnboardingScreenProps } from '../../../../app/navigation/types';
import {
  CATEGORIAS_SERVICIO,
  type CategoriaServicio,
  type DatosServicio,
} from '../../domain/onboarding';
import serviciosSugeridosJson from '../../data/local/servicios-sugeridos.json';
import { useOnboarding } from '../context/OnboardingContext';
import { Chip, PasoLayout } from '../components';

type ServicioSugerido = DatosServicio & { id: string };

const SUGERIDOS = serviciosSugeridosJson as ServicioSugerido[];

const ETIQUETA_CATEGORIA: Record<CategoriaServicio, string> = {
  corte: 'Corte',
  barba: 'Barba',
  combo: 'Combo',
  tratamiento: 'Tratamiento',
  diseno: 'Diseño',
  otro: 'Otro',
};

/** Formatea 25000 como '25.000' mientras se escribe. */
function aMiles(valor: number): string {
  return valor.toLocaleString('es-CO');
}

function soloDigitos(texto: string): number {
  const limpio = texto.replace(/\D/g, '');
  return limpio.length === 0 ? 0 : Number(limpio);
}

export function ServiciosScreen({ navigation }: OnboardingScreenProps<'Servicios'>) {
  const { estado, establecerServicios } = useOnboarding();
  const { servicios } = estado;

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevo, setNuevo] = useState<DatosServicio>({
    categoria: 'otro',
    nombre: '',
    duracionMinutos: 30,
    precio: 0,
  });
  const [tocadoNuevo, setTocadoNuevo] = useState(false);

  const estaSeleccionado = (nombre: string) =>
    servicios.some((s) => s.nombre.toLowerCase() === nombre.toLowerCase());

  const alternarSugerido = (sugerido: ServicioSugerido) => {
    if (estaSeleccionado(sugerido.nombre)) {
      establecerServicios(
        servicios.filter((s) => s.nombre.toLowerCase() !== sugerido.nombre.toLowerCase()),
      );
      return;
    }
    const { id: _id, ...datos } = sugerido;
    establecerServicios([...servicios, datos]);
  };

  const actualizarServicio = (nombre: string, parcial: Partial<DatosServicio>) => {
    establecerServicios(
      servicios.map((s) =>
        s.nombre.toLowerCase() === nombre.toLowerCase() ? { ...s, ...parcial } : s,
      ),
    );
  };

  const errorNuevoNombre =
    nuevo.nombre.trim().length === 0
      ? 'El nombre del servicio es obligatorio.'
      : estaSeleccionado(nuevo.nombre)
        ? 'Ya agregaste un servicio con ese nombre.'
        : null;

  const nuevoEsValido =
    errorNuevoNombre === null && nuevo.duracionMinutos > 0 && nuevo.precio > 0;

  const agregarPersonalizado = () => {
    if (!nuevoEsValido) {
      setTocadoNuevo(true);
      return;
    }
    establecerServicios([...servicios, { ...nuevo, nombre: nuevo.nombre.trim() }]);
    setNuevo({ categoria: 'otro', nombre: '', duracionMinutos: 30, precio: 0 });
    setTocadoNuevo(false);
    setMostrarFormulario(false);
  };

  // Los personalizados son los que no están en la lista de sugeridos.
  const personalizados = servicios.filter(
    (s) => !SUGERIDOS.some((sug) => sug.nombre.toLowerCase() === s.nombre.toLowerCase()),
  );

  const esValido = servicios.length > 0;

  return (
    <PasoLayout
      paso={6}
      titulo="¿Qué servicios ofreces?"
      subtitulo="Ajusta el precio y la duración de cada uno. Podrás cambiarlos después desde la app."
      pie={
        <BotonPrimario
          texto="Continuar"
          onPress={() => navigation.navigate('Resumen')}
          deshabilitado={!esValido}
        />
      }
    >
      <View style={estilos.contador}>
        <Text style={estilos.contadorNumero}>{servicios.length}</Text>
        <Text style={estilos.contadorTexto}>
          {servicios.length === 1 ? 'servicio seleccionado' : 'servicios seleccionados'}
        </Text>
      </View>
      {!esValido && (
        <Text style={formStyles.mensajeError}>Agrega al menos un servicio para continuar.</Text>
      )}

      <Text style={[formStyles.label, estilos.tituloSeccion]}>SUGERIDOS</Text>
      {SUGERIDOS.map((sugerido) => {
        const seleccionado = estaSeleccionado(sugerido.nombre);
        const actual = servicios.find(
          (s) => s.nombre.toLowerCase() === sugerido.nombre.toLowerCase(),
        );

        return (
          <View key={sugerido.id} style={formStyles.tarjeta}>
            <TouchableOpacity
              style={estilos.filaServicio}
              activeOpacity={0.7}
              onPress={() => alternarSugerido(sugerido)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: seleccionado }}
            >
              <View
                style={[estilos.casilla, seleccionado ? estilos.casillaActiva : estilos.casillaInactiva]}
              >
                {seleccionado && <Feather name="check" size={14} color={colors.surface} />}
              </View>
              <View style={estilos.infoServicio}>
                <Text style={estilos.nombreServicio}>{sugerido.nombre}</Text>
                <Text style={estilos.categoriaServicio}>
                  {ETIQUETA_CATEGORIA[sugerido.categoria]}
                </Text>
              </View>
            </TouchableOpacity>

            {seleccionado && actual !== undefined && (
              <View style={estilos.editor}>
                <View style={estilos.campoMitad}>
                  <Text style={formStyles.label}>PRECIO (COP)</Text>
                  <TextInput
                    style={formStyles.input}
                    value={aMiles(actual.precio)}
                    onChangeText={(texto) =>
                      actualizarServicio(sugerido.nombre, { precio: soloDigitos(texto) })
                    }
                    keyboardType="number-pad"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
                <View style={estilos.separador} />
                <View style={estilos.campoMitad}>
                  <Text style={formStyles.label}>DURACIÓN (MIN)</Text>
                  <TextInput
                    style={formStyles.input}
                    value={String(actual.duracionMinutos)}
                    onChangeText={(texto) =>
                      actualizarServicio(sugerido.nombre, {
                        duracionMinutos: soloDigitos(texto),
                      })
                    }
                    keyboardType="number-pad"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              </View>
            )}
          </View>
        );
      })}

      {personalizados.length > 0 && (
        <>
          <Text style={[formStyles.label, estilos.tituloSeccion]}>PERSONALIZADOS</Text>
          {personalizados.map((servicio) => (
            <View key={servicio.nombre} style={formStyles.tarjeta}>
              <View style={estilos.filaServicio}>
                <View style={estilos.infoServicio}>
                  <Text style={estilos.nombreServicio}>{servicio.nombre}</Text>
                  <Text style={estilos.categoriaServicio}>
                    {ETIQUETA_CATEGORIA[servicio.categoria]} · ${aMiles(servicio.precio)} ·{' '}
                    {servicio.duracionMinutos} min
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    establecerServicios(servicios.filter((s) => s.nombre !== servicio.nombre))
                  }
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={`Quitar ${servicio.nombre}`}
                >
                  <Feather name="trash-2" size={16} color={colors.placeholder} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      {mostrarFormulario ? (
        <View style={[formStyles.tarjeta, estilos.formularioNuevo]}>
          <Text style={estilos.tituloFormulario}>Nuevo servicio</Text>

          <CampoTexto
            etiqueta="NOMBRE"
            placeholder="Ej. Cejas"
            valor={nuevo.nombre}
            onCambiar={(nombre) => setNuevo((previo) => ({ ...previo, nombre }))}
            error={errorNuevoNombre}
            tocado={tocadoNuevo}
            maxLength={100}
          />

          <Text style={formStyles.label}>CATEGORÍA</Text>
          <View style={estilos.filaChips}>
            {CATEGORIAS_SERVICIO.map((categoria) => (
              <Chip
                key={categoria}
                texto={ETIQUETA_CATEGORIA[categoria]}
                activo={nuevo.categoria === categoria}
                onPress={() => setNuevo((previo) => ({ ...previo, categoria }))}
              />
            ))}
          </View>

          <View style={estilos.editor}>
            <View style={estilos.campoMitad}>
              <Text style={formStyles.label}>PRECIO (COP)</Text>
              <TextInput
                style={formStyles.input}
                value={nuevo.precio === 0 ? '' : aMiles(nuevo.precio)}
                onChangeText={(texto) =>
                  setNuevo((previo) => ({ ...previo, precio: soloDigitos(texto) }))
                }
                keyboardType="number-pad"
                placeholder="25.000"
                placeholderTextColor={colors.placeholder}
              />
            </View>
            <View style={estilos.separador} />
            <View style={estilos.campoMitad}>
              <Text style={formStyles.label}>DURACIÓN (MIN)</Text>
              <TextInput
                style={formStyles.input}
                value={nuevo.duracionMinutos === 0 ? '' : String(nuevo.duracionMinutos)}
                onChangeText={(texto) =>
                  setNuevo((previo) => ({ ...previo, duracionMinutos: soloDigitos(texto) }))
                }
                keyboardType="number-pad"
                placeholder="30"
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>

          {tocadoNuevo && !nuevoEsValido && errorNuevoNombre === null && (
            <Text style={formStyles.mensajeError}>
              El precio y la duración deben ser mayores que cero.
            </Text>
          )}

          <View style={estilos.accionesFormulario}>
            <TouchableOpacity
              style={estilos.botonSecundario}
              onPress={() => {
                setMostrarFormulario(false);
                setTocadoNuevo(false);
              }}
            >
              <Text style={estilos.botonSecundarioTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.botonAgregar} onPress={agregarPersonalizado}>
              <Text style={estilos.botonAgregarTexto}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={estilos.agregar}
          activeOpacity={0.7}
          onPress={() => setMostrarFormulario(true)}
        >
          <Feather name="plus" size={16} color={colors.primary} />
          <Text style={estilos.agregarTexto}>Agregar servicio personalizado</Text>
        </TouchableOpacity>
      )}
    </PasoLayout>
  );
}

const estilos = StyleSheet.create({
  contador: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  contadorNumero: {
    fontSize: fontSizes.title,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 6,
  },
  contadorTexto: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  tituloSeccion: {
    marginTop: spacing.lg,
  },
  filaServicio: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  casilla: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  casillaActiva: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  casillaInactiva: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  infoServicio: {
    flex: 1,
  },
  nombreServicio: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.text,
  },
  categoriaServicio: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  editor: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  campoMitad: {
    flex: 1,
  },
  separador: {
    width: spacing.md,
  },
  filaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  formularioNuevo: {
    borderColor: colors.primary,
  },
  tituloFormulario: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.lg,
  },
  accionesFormulario: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  botonSecundario: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginRight: spacing.sm,
  },
  botonSecundarioTexto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.textMuted,
  },
  botonAgregar: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  botonAgregarTexto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.surface,
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
    marginTop: spacing.sm,
  },
  agregarTexto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
});
