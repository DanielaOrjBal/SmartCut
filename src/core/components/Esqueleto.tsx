import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radii } from '../theme/tokens';

type Props = {
  ancho?: number | `${number}%`;
  alto?: number;
  radio?: number;
  estilo?: ViewStyle;
};

/**
 * Un bloque gris que respira (pulsa de opacidad) mientras algo carga.
 *
 * Se usa como pieza para armar el esqueleto de cada pantalla — dos o tres
 * `<Esqueleto />` del tamaño de las tarjetas reales, en vez de un spinner de
 * pantalla completa. El pulso es la señal de "esto sigue cargando"; sin él,
 * un bloque gris fijo se podría confundir con un elemento vacío de verdad.
 */
export function Esqueleto({ ancho = '100%', alto = 16, radio = radii.md, estilo }: Props) {
  const opacidad = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidad, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    animacion.start();
    return () => animacion.stop();
  }, [opacidad]);

  return (
    <Animated.View
      style={[
        estilos.base,
        { width: ancho, height: alto, borderRadius: radio, opacity: opacidad },
        estilo,
      ]}
    />
  );
}


/** Lista de renglones, para agenda y listas de movimientos mientras cargan. */
export function EsqueletoLista({ filas = 4 }: { filas?: number }) {
  return (
    <View>
      {Array.from({ length: filas }).map((_, indice) => (
        <View key={indice} style={estilos.fila}>
          <Esqueleto ancho={44} alto={44} radio={radii.md} />
          <View style={estilos.filaTexto}>
            <Esqueleto ancho="60%" alto={14} />
            <Esqueleto ancho="40%" alto={12} estilo={estilos.espacioSuperior} />
          </View>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  base: { backgroundColor: colors.border },
  espacioSuperior: { marginTop: 8 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  filaTexto: { flex: 1, marginLeft: 12 },
});
