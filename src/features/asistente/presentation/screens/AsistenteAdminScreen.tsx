import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { EncabezadoPantalla } from '../../../../core/components/EncabezadoPantalla';
import type { AppDrawerScreenProps } from '../../../../app/navigation/types';
import type { MensajeChat } from '../../domain/asistente';
import { useAsistente } from '../hooks/useAsistente';

export function AsistenteAdminScreen({ navigation }: AppDrawerScreenProps<'Asistente'>) {
  const { mensajes, cargando, error, enviar, limpiar } = useAsistente();
  const [pregunta, setPregunta] = useState('');
  const listaRef = useRef<FlatList<MensajeChat>>(null);

  function enviarPregunta() {
    const texto = pregunta.trim();
    if (texto.length === 0 || cargando) return;
    setPregunta('');
    void enviar(texto);
  }

  function renderMensaje({ item }: { item: MensajeChat }) {
    const esUsuario = item.rol === 'usuario';
    return (
      <View style={[estilos.burbuja, esUsuario ? estilos.burbujaUsuario : estilos.burbujaAsistente]}>
        <Text style={[estilos.textoBurbuja, esUsuario && estilos.textoUsuario]}>{item.texto}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <EncabezadoPantalla titulo="Asistente" onAbrirMenu={() => navigation.openDrawer()}>
        <TouchableOpacity onPress={limpiar} style={estilos.limpiar} accessibilityRole="button">
          <Feather name="trash-2" size={16} color={colors.primary} />
          <Text style={estilos.limpiarTexto}>Limpiar</Text>
        </TouchableOpacity>
      </EncabezadoPantalla>

      <KeyboardAvoidingView
        style={estilos.contenedor}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <Text style={estilos.aviso}>El asistente solo analiza datos registrados; no modifica información.</Text>

        <FlatList
          ref={listaRef}
          data={mensajes}
          renderItem={renderMensaje}
          keyExtractor={(item, indice) => `${item.fecha}-${indice}`}
          contentContainerStyle={estilos.lista}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: true })}
        />

        {cargando && (
          <View style={[estilos.burbuja, estilos.burbujaAsistente, estilos.cargando]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={estilos.cargandoTexto}>Analizando información…</Text>
          </View>
        )}
        {error !== null && <Text style={estilos.error}>{error}</Text>}

        <View style={estilos.entrada}>
          <TextInput
            style={estilos.input}
            placeholder="Pregunta sobre las finanzas…"
            placeholderTextColor={colors.placeholder}
            value={pregunta}
            onChangeText={setPregunta}
            maxLength={500}
            multiline
            editable={!cargando}
            accessibilityLabel="Pregunta para el asistente financiero"
          />
          <TouchableOpacity
            style={[estilos.enviar, (pregunta.trim().length === 0 || cargando) && estilos.enviarDeshabilitado]}
            onPress={enviarPregunta}
            disabled={pregunta.trim().length === 0 || cargando}
            accessibilityRole="button"
            accessibilityLabel="Enviar pregunta"
          >
            <Feather name="send" size={19} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  contenedor: { flex: 1 },
  aviso: {
    marginHorizontal: spacing.screen,
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: fontSizes.caption,
    textAlign: 'center',
  },
  limpiar: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: spacing.sm },
  limpiarTexto: { color: colors.primary, fontSize: fontSizes.caption, fontWeight: '700' },
  lista: { padding: spacing.screen, paddingBottom: spacing.md, gap: spacing.sm },
  burbuja: { maxWidth: '84%', borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.sm },
  burbujaUsuario: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  burbujaAsistente: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  textoBurbuja: { color: colors.text, fontSize: fontSizes.small, lineHeight: 20 },
  textoUsuario: { color: colors.surface },
  cargando: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.screen },
  cargandoTexto: { color: colors.textMuted, fontSize: fontSizes.caption, marginLeft: spacing.sm },
  error: { color: colors.danger, fontSize: fontSizes.caption, marginHorizontal: spacing.screen, marginBottom: spacing.sm },
  entrada: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.md, gap: spacing.sm },
  input: { flex: 1, minHeight: 44, maxHeight: 100, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.lg, color: colors.text, fontSize: fontSizes.small, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, textAlignVertical: 'top' },
  enviar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  enviarDeshabilitado: { opacity: 0.5 },
});
