import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import { aISO, fechaDesdeISO, formatearFechaLarga, hoyISO } from '../../../../core/utils/fechas';
import { useCategorias } from '../hooks/useCategorias';
import { useRegistrarMovimiento } from '../hooks/useRegistrarMovimiento';
import { ModalCategorias } from './ModalCategorias';
import { TIPOS_MOVIMIENTO, type TipoMovimiento } from '../../domain/finanzas';

type Props = {
  visible: boolean;
  onClose: () => void;
  onRegistrado: () => void;
};

const ETIQUETA_TIPO: Record<TipoMovimiento, string> = {
  ingreso: 'Ingreso',
  gasto: 'Gasto',
  compra: 'Compra',
};

/** Suma (o resta) días a una fecha ISO sin pasar por husos horarios. */
function sumarDias(iso: string, dias: number): string {
  const fecha = fechaDesdeISO(iso);
  if (fecha === null) {
    return iso;
  }
  return aISO(new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias));
}

/**
 * Registro de un movimiento manual: ingreso, gasto o compra.
 *
 * El selector de fecha aplica las reglas ANTES de enviar —ingreso solo hoy;
 * gasto o compra nunca a futuro— pero son una ayuda de interfaz, no la
 * validación real: esa vive en `sp_registrar_movimiento`, y si de todos modos
 * llega un error de la base, se muestra tal cual.
 */
export function ModalRegistrarMovimiento({ visible, onClose, onRegistrado }: Props) {
  const [tipo, setTipo] = useState<TipoMovimiento>('gasto');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [modalCategoriasVisible, setModalCategoriasVisible] = useState(false);

  const categorias = useCategorias(tipo);
  const registrar = useRegistrarMovimiento();

  // Cambiar de tipo invalida la categoría elegida (son listas distintas) y,
  // si pasa a ser ingreso, la fecha queda fija en hoy: es la única que acepta.
  useEffect(() => {
    setCategoriaId(null);
    if (tipo === 'ingreso') {
      setFecha(hoyISO());
    }
  }, [tipo]);

  function reiniciar() {
    setTipo('gasto');
    setCategoriaId(null);
    setMonto('');
    setFecha(hoyISO());
    setDescripcion('');
    setCantidad('');
    setUnidadMedida('');
    setIntentoEnviar(false);
    registrar.limpiarError();
  }

  function cerrar() {
    reiniciar();
    onClose();
  }

  const montoNumero = Number(monto.replace(/[^\d]/g, ''));
  const montoValido = monto.trim().length > 0 && montoNumero > 0;
  const categoriaValida = categoriaId !== null;
  const formularioValido = montoValido && categoriaValida;

  async function confirmar() {
    setIntentoEnviar(true);
    if (!formularioValido || categoriaId === null) {
      return;
    }
    try {
      await registrar.ejecutar({
        tipo,
        categoriaId,
        monto: montoNumero,
        fecha,
        descripcion: descripcion.trim().length > 0 ? descripcion.trim() : undefined,
        cantidad: tipo === 'compra' && cantidad.trim().length > 0 ? Number(cantidad) : undefined,
        unidadMedida: tipo === 'compra' && unidadMedida.trim().length > 0 ? unidadMedida.trim() : undefined,
      });
      onRegistrado();
      cerrar();
    } catch {
      // El mensaje de la base queda en registrar.error, incluida cualquiera
      // de las tres reglas de fecha que esta pantalla no alcanzó a prevenir.
    }
  }

  const listaCategorias = categorias.data ?? [];

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={cerrar}>
        <View style={estilos.fondo}>
          <View style={estilos.hoja}>
            <View style={estilos.encabezado}>
              <Text style={estilos.titulo}>Registrar movimiento</Text>
              <TouchableOpacity onPress={cerrar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={estilos.cuerpo} keyboardShouldPersistTaps="handled">
              <Text style={formStyles.label}>TIPO</Text>
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

              <View style={estilos.filaLabelAccion}>
                <Text style={formStyles.label}>CATEGORÍA</Text>
                <TouchableOpacity onPress={() => setModalCategoriasVisible(true)}>
                  <Text style={estilos.enlaceCategorias}>+ Nueva categoría</Text>
                </TouchableOpacity>
              </View>
              {categorias.loading ? (
                <Text style={estilos.cargandoTexto}>Cargando categorías…</Text>
              ) : listaCategorias.length === 0 ? (
                <Text style={estilos.cargandoTexto}>
                  No hay categorías de {ETIQUETA_TIPO[tipo].toLowerCase()}. Crea una arriba.
                </Text>
              ) : (
                <View style={estilos.chips}>
                  {listaCategorias.map((categoria) => (
                    <TouchableOpacity
                      key={categoria.idCategoria}
                      style={[estilos.chip, categoriaId === categoria.idCategoria && estilos.chipActivo]}
                      onPress={() => setCategoriaId(categoria.idCategoria)}
                    >
                      <Text
                        style={[
                          estilos.chipTexto,
                          categoriaId === categoria.idCategoria && estilos.chipTextoActivo,
                        ]}
                      >
                        {categoria.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {intentoEnviar && !categoriaValida && (
                <Text style={formStyles.mensajeError}>Elige una categoría.</Text>
              )}

              <Text style={[formStyles.label, estilos.espacioSuperior]}>MONTO</Text>
              <TextInput
                style={[formStyles.input, intentoEnviar && !montoValido && formStyles.inputConError]}
                placeholder="$0"
                placeholderTextColor={colors.placeholder}
                value={monto}
                onChangeText={(valor) => setMonto(valor.replace(/[^\d]/g, ''))}
                keyboardType="number-pad"
              />
              {intentoEnviar && !montoValido && (
                <Text style={formStyles.mensajeError}>El monto debe ser mayor que cero.</Text>
              )}

              <Text style={[formStyles.label, estilos.espacioSuperior]}>FECHA</Text>
              {tipo === 'ingreso' ? (
                <View style={estilos.fechaFija}>
                  <Feather name="lock" size={14} color={colors.textMuted} />
                  <Text style={estilos.fechaFijaTexto}>
                    Hoy, {formatearFechaLarga(fecha)} — los ingresos solo se registran con la fecha de hoy.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={estilos.selectorFecha}>
                    <TouchableOpacity
                      style={estilos.flechaFecha}
                      onPress={() => setFecha((previa) => sumarDias(previa, -1))}
                    >
                      <Feather name="chevron-left" size={20} color={colors.navy} />
                    </TouchableOpacity>
                    <Text style={estilos.fechaTexto}>{formatearFechaLarga(fecha)}</Text>
                    <TouchableOpacity
                      style={[estilos.flechaFecha, fecha >= hoyISO() && estilos.flechaDeshabilitada]}
                      onPress={() => {
                        if (fecha < hoyISO()) {
                          setFecha((previa) => sumarDias(previa, 1));
                        }
                      }}
                      disabled={fecha >= hoyISO()}
                    >
                      <Feather
                        name="chevron-right"
                        size={20}
                        color={fecha >= hoyISO() ? colors.placeholder : colors.navy}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={estilos.chips}>
                    <TouchableOpacity style={estilos.chipFecha} onPress={() => setFecha(hoyISO())}>
                      <Text style={estilos.chipFechaTexto}>Hoy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={estilos.chipFecha}
                      onPress={() => setFecha(sumarDias(hoyISO(), -1))}
                    >
                      <Text style={estilos.chipFechaTexto}>Ayer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={estilos.chipFecha}
                      onPress={() => setFecha(sumarDias(hoyISO(), -7))}
                    >
                      <Text style={estilos.chipFechaTexto}>Hace 7 días</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {tipo === 'compra' && (
                <View style={estilos.filaDoble}>
                  <View style={estilos.mitad}>
                    <Text style={formStyles.label}>CANTIDAD (OPCIONAL)</Text>
                    <TextInput
                      style={formStyles.input}
                      placeholder="0"
                      placeholderTextColor={colors.placeholder}
                      value={cantidad}
                      onChangeText={setCantidad}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={estilos.mitad}>
                    <Text style={formStyles.label}>UNIDAD</Text>
                    <TextInput
                      style={formStyles.input}
                      placeholder="Ej. unidades, kg"
                      placeholderTextColor={colors.placeholder}
                      value={unidadMedida}
                      onChangeText={setUnidadMedida}
                      maxLength={20}
                    />
                  </View>
                </View>
              )}

              <Text style={[formStyles.label, estilos.espacioSuperior]}>DESCRIPCIÓN (OPCIONAL)</Text>
              <TextInput
                style={formStyles.input}
                placeholder="Ej. Arriendo de septiembre"
                placeholderTextColor={colors.placeholder}
                value={descripcion}
                onChangeText={setDescripcion}
                maxLength={255}
              />

              {registrar.error !== null && (
                <Text style={[formStyles.mensajeError, estilos.espacioSuperior]}>
                  {registrar.error}
                </Text>
              )}
            </ScrollView>

            <View style={estilos.pie}>
              <TouchableOpacity
                style={[
                  formStyles.button,
                  (registrar.cargando || (intentoEnviar && !formularioValido)) &&
                    formStyles.buttonDeshabilitado,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  void confirmar();
                }}
                disabled={registrar.cargando}
              >
                {registrar.cargando && (
                  <ActivityIndicator color={colors.surface} style={estilos.spinner} />
                )}
                <Text style={formStyles.buttonText}>
                  {registrar.cargando ? 'Registrando…' : 'Registrar movimiento'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ModalCategorias
        visible={modalCategoriasVisible}
        onClose={() => setModalCategoriasVisible(false)}
        onCreada={() => categorias.refetch()}
      />
    </>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(10, 25, 47, 0.45)', justifyContent: 'flex-end' },
  hoja: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: spacing.lg,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.md,
  },
  titulo: { fontSize: fontSizes.title, fontWeight: '700', color: colors.navy },
  cuerpo: { paddingHorizontal: spacing.screen, paddingBottom: spacing.xl },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActivo: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipTexto: { fontSize: fontSizes.caption, fontWeight: '700', color: colors.textSecondary },
  chipTextoActivo: { color: colors.surface },
  filaLabelAccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  enlaceCategorias: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  cargandoTexto: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  espacioSuperior: { marginTop: spacing.md },
  fechaFija: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  fechaFijaTexto: {
    flex: 1,
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  selectorFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  flechaFecha: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  flechaDeshabilitada: { opacity: 0.4 },
  fechaTexto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
    marginHorizontal: spacing.md,
    textTransform: 'capitalize',
  },
  chipFecha: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipFechaTexto: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  filaDoble: { flexDirection: 'row', marginTop: spacing.md },
  mitad: { flex: 1, marginRight: spacing.sm },
  pie: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  spinner: { marginRight: spacing.sm },
});
