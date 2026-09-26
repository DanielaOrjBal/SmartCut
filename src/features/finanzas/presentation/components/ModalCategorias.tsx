import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import { Esqueleto } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { useCategorias, useCrearCategoria } from '../hooks/useCategorias';
import { TIPOS_MOVIMIENTO, type TipoMovimiento } from '../../domain/finanzas';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Se llama tras crear una categoría, para que quien la abrió refresque su propia lista. */
  onCreada?: () => void;
};

const ETIQUETA_TIPO: Record<TipoMovimiento, string> = {
  ingreso: 'Ingresos',
  gasto: 'Gastos',
  compra: 'Compras',
};

/**
 * Listar y crear categorías. No hay botón de eliminar: el sistema no ofrece
 * esa operación en ninguna parte, así que las siete por defecto quedan
 * protegidas simplemente porque nada puede borrar ninguna categoría.
 */
export function ModalCategorias({ visible, onClose, onCreada }: Props) {
  const categorias = useCategorias();
  const crear = useCrearCategoria();

  const [tipo, setTipo] = useState<TipoMovimiento>('gasto');
  const [nombre, setNombre] = useState('');
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  async function confirmarCreacion() {
    setIntentoEnviar(true);
    if (nombre.trim().length === 0) {
      return;
    }
    try {
      await crear.ejecutar({ nombre: nombre.trim(), tipo });
      setNombre('');
      setIntentoEnviar(false);
      categorias.refetch();
      onCreada?.();
    } catch {
      // El mensaje ya queda en crear.error.
    }
  }

  const lista = categorias.data ?? [];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={estilos.fondo}>
        <View style={estilos.hoja}>
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>Categorías</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={estilos.lista}>
            {categorias.loading && categorias.data === null ? (
              <>
                <Esqueleto alto={40} estilo={estilos.espacio} />
                <Esqueleto alto={40} estilo={estilos.espacio} />
                <Esqueleto alto={40} />
              </>
            ) : categorias.error !== null ? (
              <EstadoError mensaje={categorias.error} onReintentar={categorias.refetch} />
            ) : (
              TIPOS_MOVIMIENTO.map((tipoGrupo) => {
                const delGrupo = lista.filter((c) => c.tipo === tipoGrupo);
                if (delGrupo.length === 0) {
                  return null;
                }
                return (
                  <View key={tipoGrupo} style={estilos.grupo}>
                    <Text style={estilos.tituloGrupo}>{ETIQUETA_TIPO[tipoGrupo]}</Text>
                    {delGrupo.map((categoria) => (
                      <View key={categoria.idCategoria} style={estilos.filaCategoria}>
                        <Text style={estilos.nombreCategoria}>{categoria.nombre}</Text>
                      </View>
                    ))}
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={estilos.formulario}>
            <Text style={formStyles.label}>NUEVA CATEGORÍA</Text>
            <View style={estilos.chips}>
              {TIPOS_MOVIMIENTO.map((opcion) => (
                <TouchableOpacity
                  key={opcion}
                  style={[estilos.chip, tipo === opcion && estilos.chipActivo]}
                  onPress={() => setTipo(opcion)}
                >
                  <Text style={[estilos.chipTexto, tipo === opcion && estilos.chipTextoActivo]}>
                    {ETIQUETA_TIPO[opcion]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={estilos.filaInput}>
              <TextInput
                style={[formStyles.input, estilos.input, intentoEnviar && nombre.trim().length === 0 && formStyles.inputConError]}
                placeholder="Nombre de la categoría"
                placeholderTextColor={colors.placeholder}
                value={nombre}
                onChangeText={setNombre}
                maxLength={50}
              />
              <TouchableOpacity
                style={[estilos.botonCrear, crear.cargando && estilos.botonDeshabilitado]}
                onPress={() => {
                  void confirmarCreacion();
                }}
                disabled={crear.cargando}
              >
                {crear.cargando ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Feather name="plus" size={18} color={colors.surface} />
                )}
              </TouchableOpacity>
            </View>
            {crear.error !== null && <Text style={formStyles.mensajeError}>{crear.error}</Text>}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(10, 25, 47, 0.45)', justifyContent: 'flex-end' },
  hoja: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.screen,
    maxHeight: '85%',
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titulo: { fontSize: fontSizes.title, fontWeight: '700', color: colors.navy },
  lista: { maxHeight: 260, marginBottom: spacing.md },
  espacio: { marginBottom: spacing.sm },
  grupo: { marginBottom: spacing.md },
  tituloGrupo: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  filaCategoria: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nombreCategoria: { fontSize: fontSizes.small, color: colors.text },
  formulario: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  chips: { flexDirection: 'row', marginBottom: spacing.sm },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginRight: spacing.sm,
  },
  chipActivo: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipTexto: { fontSize: fontSizes.caption, fontWeight: '700', color: colors.textSecondary },
  chipTextoActivo: { color: colors.surface },
  filaInput: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, marginRight: spacing.sm },
  botonCrear: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonDeshabilitado: { opacity: 0.6 },
});
