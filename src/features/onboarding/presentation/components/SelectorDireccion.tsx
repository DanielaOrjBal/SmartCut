import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  buscarDirecciones,
  obtenerDetalleLugar,
  obtenerUrlMapaEstatico,
} from '../../data/remote/places.api';
import type { SugerenciaLugar } from '../../data/remote/places.api';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';

type Props = {
  valor: string;
  onSeleccionar: (direccion: string, latitud: number, longitud: number) => void;
  /** Se llama en cada pulsación de tecla; debe actualizar `direccion` y borrar lat/lng */
  onCambiarTexto: (texto: string) => void;
  error?: string | null;
  tocado?: boolean;
};

const DEBOUNCE_MS = 350;

export function SelectorDireccion({ valor, onSeleccionar, onCambiarTexto, error, tocado }: Props) {
  const [sugerencias, setSugerencias] = useState<SugerenciaLugar[]>([]);
  const [cargando, setCargando] = useState(false);
  const [verificada, setVerificada] = useState(false);
  const [urlMapa, setUrlMapa] = useState<string | null>(null);
  const [estadoMapa, setEstadoMapa] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrarError = tocado && !!error;

  const manejarCambio = useCallback(
    (texto: string) => {
      setVerificada(false);
      setUrlMapa(null);
      setEstadoMapa('cargando');
      // Actualiza la dirección en el contexto y borra coordenadas previas
      onCambiarTexto(texto);

      if (timer.current) clearTimeout(timer.current);

      if (texto.length < 3) {
        setSugerencias([]);
        return;
      }

      timer.current = setTimeout(async () => {
        setCargando(true);
        try {
          const resultados = await buscarDirecciones(texto);
          setSugerencias(resultados);
        } catch {
          setSugerencias([]);
        } finally {
          setCargando(false);
        }
      }, DEBOUNCE_MS);
    },
    [onCambiarTexto],
  );

  const seleccionar = useCallback(
    async (sugerencia: SugerenciaLugar) => {
      setSugerencias([]);
      setCargando(true);
      try {
        const detalle = await obtenerDetalleLugar(sugerencia.placeId);
        onSeleccionar(detalle.direccion, detalle.latitud, detalle.longitud);
        setVerificada(true);
        setEstadoMapa('cargando');
        setUrlMapa(obtenerUrlMapaEstatico(detalle.latitud, detalle.longitud));
      } catch {
        // Si falla el detalle de coordenadas, al menos actualiza el texto
        onCambiarTexto(sugerencia.descripcion);
        setVerificada(false);
        setUrlMapa(null);
        setEstadoMapa('cargando');
      } finally {
        setCargando(false);
      }
    },
    [onSeleccionar, onCambiarTexto],
  );

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>UBICACIÓN / DIRECCIÓN</Text>

      <View style={[estilos.inputFila, mostrarError && estilos.inputFilaError]}>
        <TextInput
          style={estilos.input}
          value={valor}
          onChangeText={manejarCambio}
          placeholder="Busca la dirección de tu barbería..."
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={200}
        />
        {cargando && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={estilos.indicador}
          />
        )}
        {verificada && !cargando && (
          <Text style={estilos.iconoVerificado}>✓</Text>
        )}
      </View>

      {mostrarError && <Text style={estilos.textoError}>{error}</Text>}

      {verificada && (
        <View style={estilos.badgeVerificado}>
          <Text style={estilos.badgeTexto}>📍 Ubicación verificada por Google Maps</Text>
        </View>
      )}

      {urlMapa && (
        <View style={estilos.mapaContenedor}>
          {/* La imagen siempre en flujo normal — nunca position:absolute */}
          <Image
            source={{ uri: urlMapa }}
            style={estilos.mapaImagen}
            resizeMode="cover"
            onLoad={() => setEstadoMapa('ok')}
            onError={() => setEstadoMapa('error')}
          />
          {/* Overlays encima de la imagen según el estado */}
          {estadoMapa === 'cargando' && (
            <View style={estilos.mapaOverlay}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={estilos.mapaPlaceholderTexto}>Cargando mapa...</Text>
            </View>
          )}
          {estadoMapa === 'error' && (
            <View style={estilos.mapaOverlay}>
              <Text style={estilos.mapaErrorTexto}>
                No se pudo cargar el mapa.{'\n'}
                Activa "Maps Static API" en Google Cloud Console.
              </Text>
            </View>
          )}
        </View>
      )}

      {sugerencias.length > 0 && (
        <ScrollView
          style={estilos.lista}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {sugerencias.map((item, index) => (
            <TouchableOpacity
              key={item.placeId}
              style={[
                estilos.fila,
                index < sugerencias.length - 1 && estilos.filaSeparador,
              ]}
              onPress={() => seleccionar(item)}
              activeOpacity={0.7}
            >
              <Text style={estilos.filaPrincipal} numberOfLines={1}>
                {item.principal}
              </Text>
              <Text style={estilos.filaSecundaria} numberOfLines={1}>
                {item.secundario}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    marginBottom: spacing.md,
  },
  etiqueta: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  inputFila: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  inputFilaError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.body,
    color: colors.text,
    padding: 0,
  },
  indicador: {
    marginLeft: spacing.xs,
  },
  iconoVerificado: {
    fontSize: 16,
    color: '#16A34A',
    marginLeft: spacing.xs,
    fontWeight: '700',
  },
  textoError: {
    fontSize: fontSizes.caption,
    color: colors.danger,
    marginTop: 4,
  },
  badgeVerificado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#F0FDF4',
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
  },
  badgeTexto: {
    fontSize: fontSizes.caption,
    color: '#16A34A',
    fontWeight: '500',
  },
  lista: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    maxHeight: 220,
  },
  fila: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  filaSeparador: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filaPrincipal: {
    fontSize: fontSizes.small,
    color: colors.text,
    fontWeight: '500',
  },
  filaSecundaria: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  mapaContenedor: {
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    height: 160,
    backgroundColor: colors.border,
  },
  mapaImagen: {
    width: '100%',
    height: '100%',
  },
  mapaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
    gap: spacing.xs,
  },
  mapaPlaceholderTexto: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  mapaErrorTexto: {
    fontSize: fontSizes.caption,
    color: colors.danger,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
