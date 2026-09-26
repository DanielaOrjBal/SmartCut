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
import { colors, estadoCitaColors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import { formatearCOP } from '../../../../core/utils/moneda';
import { useDetalleBarbero } from '../hooks/useDetalleBarbero';
import { useCambiarComision, useCambiarEstadoBarbero } from '../hooks/useAccionesEquipo';
import { EstadoError } from '../../../../core/components/EstadoError';
import { Esqueleto } from '../../../../core/components/Esqueleto';
import type { EstadoBarbero } from '../../../auth/domain/auth';
import type { ParametrosEquipo } from '../../domain/equipo';

type Props = {
  idBarbero: number | null;
  parametros: ParametrosEquipo;
  onClose: () => void;
  onRegistrarAusencia: (idBarbero: number) => void;
  onCambiado: () => void;
};

const OPCIONES_ESTADO: EstadoBarbero[] = ['activo', 'incapacitado', 'inactivo'];
const ETIQUETA_ESTADO: Record<EstadoBarbero, string> = {
  activo: 'Activo',
  incapacitado: 'Incapacitado',
  inactivo: 'Inactivo',
};
const COLOR_ESTADO: Record<EstadoBarbero, string> = {
  activo: '#16A34A',
  incapacitado: estadoCitaColors.no_asistio,
  inactivo: colors.danger,
};

/**
 * Detalle de un barbero: sus datos, comisión, desempeño del período y las
 * acciones de administración. Nunca sus datos personales editables —eso es
 * de cada barbero, desde su propia Configuración—, solo estado y comisión.
 */
export function ModalDetalleBarbero({
  idBarbero,
  parametros,
  onClose,
  onRegistrarAusencia,
  onCambiado,
}: Props) {
  const detalle = useDetalleBarbero(idBarbero ?? 0, parametros, { habilitado: idBarbero !== null });
  const cambiarEstado = useCambiarEstadoBarbero();
  const cambiarComision = useCambiarComision();

  const [estadoPorConfirmar, setEstadoPorConfirmar] = useState<EstadoBarbero | null>(null);
  const [comisionTexto, setComisionTexto] = useState('');

  const barbero = detalle.data?.barbero ?? null;

  useEffect(() => {
    if (barbero !== null) {
      setComisionTexto(String(barbero.porcentajeComision));
    }
    setEstadoPorConfirmar(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idBarbero, barbero?.porcentajeComision]);

  if (idBarbero === null) {
    return null;
  }

  async function aplicarEstado(estado: EstadoBarbero) {
    try {
      await cambiarEstado.ejecutar({ idBarbero: idBarbero as number, estado });
      setEstadoPorConfirmar(null);
      detalle.refetch();
      onCambiado();
    } catch {
      // El mensaje queda en cambiarEstado.error.
    }
  }

  function tocarEstado(estado: EstadoBarbero) {
    if (barbero === null || estado === barbero.estado) {
      return;
    }
    // Pasar a incapacitado o inactivo cancela por trigger las citas futuras:
    // se pide confirmación explícita antes de aplicarlo, nunca de una vez.
    if (estado === 'activo') {
      void aplicarEstado(estado);
    } else {
      setEstadoPorConfirmar(estado);
    }
  }

  async function guardarComision() {
    const porcentaje = Number(comisionTexto);
    if (Number.isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
      return;
    }
    try {
      await cambiarComision.ejecutar({ idBarbero: idBarbero as number, porcentaje });
      detalle.refetch();
      onCambiado();
    } catch {
      // El mensaje queda en cambiarComision.error.
    }
  }

  const comisionValida = (() => {
    const numero = Number(comisionTexto);
    return comisionTexto.trim().length > 0 && !Number.isNaN(numero) && numero >= 0 && numero <= 100;
  })();
  const comisionCambio = barbero !== null && Number(comisionTexto) !== barbero.porcentajeComision;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={estilos.fondo}>
        <View style={estilos.hoja}>
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>Detalle del barbero</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {detalle.loading && barbero === null ? (
            <Esqueleto alto={220} radio={radii.md} />
          ) : detalle.error !== null ? (
            <EstadoError mensaje={detalle.error} onReintentar={detalle.refetch} />
          ) : barbero === null ? null : (
            <ScrollView contentContainerStyle={estilos.cuerpo}>
              <Text style={estilos.nombre}>
                {barbero.nombre} {barbero.apellido ?? ''}
              </Text>
              <Text style={estilos.dato}>{barbero.correo}</Text>
              {barbero.telefono !== null && <Text style={estilos.dato}>{barbero.telefono}</Text>}
              <Text style={estilos.datoMuted}>
                Ingresó el {barbero.fechaIngreso}
                {barbero.pendienteActivacion ? ' · Pendiente de activación' : ''}
              </Text>

              <View style={estilos.grillaCifras}>
                <Cifra etiqueta="Citas atendidas" valor={String(barbero.citasAtendidas)} />
                <Cifra etiqueta="Facturación generada" valor={formatearCOP(barbero.facturacion)} />
                <Cifra etiqueta="Comisión pagada" valor={formatearCOP(barbero.comision)} />
              </View>

              <Text style={[formStyles.label, estilos.espacio]}>ESTADO</Text>
              <View style={estilos.chips}>
                {OPCIONES_ESTADO.map((estado) => (
                  <TouchableOpacity
                    key={estado}
                    style={[
                      estilos.chipEstado,
                      barbero.estado === estado && {
                        backgroundColor: COLOR_ESTADO[estado],
                        borderColor: COLOR_ESTADO[estado],
                      },
                    ]}
                    onPress={() => tocarEstado(estado)}
                    disabled={barbero.esAdmin}
                  >
                    <Text
                      style={[
                        estilos.chipEstadoTexto,
                        barbero.estado === estado && estilos.chipEstadoTextoActivo,
                      ]}
                    >
                      {ETIQUETA_ESTADO[estado]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {barbero.esAdmin && (
                <Text style={estilos.avisoAdmin}>
                  No puedes desactivar la cuenta del administrador de la barbería.
                </Text>
              )}

              {estadoPorConfirmar !== null && (
                <View style={estilos.avisoConfirmar}>
                  <Feather name="alert-triangle" size={16} color={colors.danger} />
                  <Text style={estilos.avisoConfirmarTexto}>
                    Esto cancelará automáticamente las citas futuras pendientes o confirmadas de{' '}
                    {barbero.nombre}. ¿Confirmas el cambio a {ETIQUETA_ESTADO[estadoPorConfirmar]}?
                  </Text>
                  <View style={estilos.filaConfirmar}>
                    <TouchableOpacity
                      style={estilos.botonCancelarConfirmacion}
                      onPress={() => setEstadoPorConfirmar(null)}
                    >
                      <Text style={estilos.botonCancelarTexto}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={estilos.botonConfirmarEstado}
                      onPress={() => {
                        void aplicarEstado(estadoPorConfirmar);
                      }}
                      disabled={cambiarEstado.cargando}
                    >
                      {cambiarEstado.cargando ? (
                        <ActivityIndicator size="small" color={colors.surface} />
                      ) : (
                        <Text style={estilos.botonConfirmarEstadoTexto}>Sí, cambiar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {cambiarEstado.error !== null && (
                <Text style={formStyles.mensajeError}>{cambiarEstado.error}</Text>
              )}

              <Text style={[formStyles.label, estilos.espacio]}>COMISIÓN (0 A 100)</Text>
              <View style={estilos.filaComision}>
                <TextInput
                  style={[formStyles.input, estilos.inputComision]}
                  value={comisionTexto}
                  onChangeText={(valor) => setComisionTexto(valor.replace(/[^\d]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <Text style={estilos.simboloPorcentaje}>%</Text>
                <TouchableOpacity
                  style={[
                    estilos.botonGuardarComision,
                    (!comisionValida || !comisionCambio || cambiarComision.cargando) &&
                      estilos.botonDeshabilitado,
                  ]}
                  onPress={() => {
                    void guardarComision();
                  }}
                  disabled={!comisionValida || !comisionCambio || cambiarComision.cargando}
                >
                  {cambiarComision.cargando ? (
                    <ActivityIndicator size="small" color={colors.surface} />
                  ) : (
                    <Text style={estilos.botonGuardarComisionTexto}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
              {cambiarComision.error !== null && (
                <Text style={formStyles.mensajeError}>{cambiarComision.error}</Text>
              )}

              <TouchableOpacity
                style={estilos.botonAusencia}
                onPress={() => onRegistrarAusencia(idBarbero)}
              >
                <Feather name="calendar" size={16} color={colors.navy} />
                <Text style={estilos.botonAusenciaTexto}>Registrar ausencia o incapacidad</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.cifra}>
      <Text style={estilos.cifraEtiqueta}>{etiqueta}</Text>
      <Text style={estilos.cifraValor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(10, 25, 47, 0.45)', justifyContent: 'flex-end' },
  hoja: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.screen,
    maxHeight: '90%',
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titulo: { fontSize: fontSizes.title, fontWeight: '700', color: colors.navy },
  cuerpo: { paddingBottom: spacing.xl },
  nombre: { fontSize: fontSizes.body, fontWeight: '700', color: colors.navy },
  dato: { fontSize: fontSizes.small, color: colors.text, marginTop: 2 },
  datoMuted: { fontSize: fontSizes.caption, color: colors.textMuted, marginTop: 4 },
  grillaCifras: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  cifra: { alignItems: 'center', flex: 1 },
  cifraEtiqueta: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },
  cifraValor: { fontSize: fontSizes.small, fontWeight: '700', color: colors.navy, marginTop: 4 },
  espacio: { marginTop: spacing.lg },
  chips: { flexDirection: 'row' },
  chipEstado: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  chipEstadoTexto: { fontSize: fontSizes.caption, fontWeight: '700', color: colors.textSecondary },
  chipEstadoTextoActivo: { color: colors.surface },
  avisoAdmin: { fontSize: fontSizes.caption, color: colors.textMuted, marginTop: spacing.sm },
  avisoConfirmar: {
    backgroundColor: '#FEF2F2',
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  avisoConfirmarTexto: { fontSize: fontSizes.caption, color: colors.text, marginTop: spacing.xs },
  filaConfirmar: { flexDirection: 'row', marginTop: spacing.sm },
  botonCancelarConfirmacion: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  botonCancelarTexto: { fontSize: fontSizes.caption, fontWeight: '700', color: colors.textSecondary },
  botonConfirmarEstado: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  botonConfirmarEstadoTexto: { fontSize: fontSizes.caption, fontWeight: '700', color: colors.surface },
  filaComision: { flexDirection: 'row', alignItems: 'center' },
  inputComision: { flex: 1 },
  simboloPorcentaje: { marginHorizontal: spacing.sm, fontSize: fontSizes.body, color: colors.textMuted },
  botonGuardarComision: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
  },
  botonDeshabilitado: { opacity: 0.5 },
  botonGuardarComisionTexto: { fontSize: fontSizes.small, fontWeight: '700', color: colors.surface },
  botonAusencia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingVertical: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  botonAusenciaTexto: { fontSize: fontSizes.small, fontWeight: '700', color: colors.navy, marginLeft: spacing.sm },
});
