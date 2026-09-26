import React, { useMemo, useState } from 'react';
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
import { formatearCOP } from '../../../../core/utils/moneda';
import { Esqueleto } from '../../../../core/components/Esqueleto';
import { EstadoError } from '../../../../core/components/EstadoError';
import { EstadoVacio } from '../../../../core/components/EstadoVacio';
import { useServicios } from '../../../dashboard/presentation/hooks/useServicios';
import { useRegistrarAtencion } from '../hooks/useRegistrarAtencion';
import { ItemServicio, formatearDuracion } from './ItemServicio';
import type { AtencionRegistrada } from '../../domain/atencion';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Se llama tras un registro exitoso, para que la pantalla refresque sus tarjetas. */
  onRegistrada?: (atencion: AtencionRegistrada) => void;
};

type Vista = 'formulario' | 'resultado';

/**
 * Modal de registro de atención sin cita.
 *
 * Es la única fuente de datos reales mientras no exista la web pública de
 * reservas: el barbero anota a un cliente que llegó sin reserva, elige los
 * servicios y la atención queda finalizada de inmediato, con su ingreso y su
 * comisión ya calculados por el trigger.
 */
export function ModalRegistrarAtencion({ visible, onClose, onRegistrada }: Props) {
  const servicios = useServicios();
  const registrar = useRegistrarAtencion();

  const [vista, setVista] = useState<Vista>('formulario');
  const [nombreCliente, setNombreCliente] = useState('');
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [resultado, setResultado] = useState<AtencionRegistrada | null>(null);

  const listaServicios = servicios.data ?? [];
  const elegidos = useMemo(
    () => listaServicios.filter((servicio) => seleccionados.has(servicio.idServicio)),
    [listaServicios, seleccionados],
  );
  const totalMonto = elegidos.reduce((suma, servicio) => suma + servicio.precio, 0);
  const totalDuracion = elegidos.reduce((suma, servicio) => suma + servicio.duracionMinutos, 0);

  const nombreValido = nombreCliente.trim().length > 0;
  const serviciosValidos = elegidos.length > 0;
  const formularioValido = nombreValido && serviciosValidos;

  function alternarServicio(idServicio: number) {
    setSeleccionados((previo) => {
      const siguiente = new Set(previo);
      if (siguiente.has(idServicio)) {
        siguiente.delete(idServicio);
      } else {
        siguiente.add(idServicio);
      }
      return siguiente;
    });
  }

  function reiniciar() {
    setVista('formulario');
    setNombreCliente('');
    setSeleccionados(new Set());
    setIntentoEnviar(false);
    setResultado(null);
    registrar.limpiarError();
  }

  function cerrar() {
    reiniciar();
    onClose();
  }

  async function confirmar() {
    setIntentoEnviar(true);
    if (!formularioValido) {
      return;
    }

    try {
      const atencion = await registrar.ejecutar({
        nombreCliente: nombreCliente.trim(),
        servicios: [...seleccionados],
      });
      setResultado(atencion);
      setVista('resultado');
      onRegistrada?.(atencion);
    } catch {
      // El mensaje ya queda en registrar.error; no hay nada más que hacer aquí.
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={cerrar}>
      <View style={estilos.fondo}>
        <View style={estilos.hoja}>
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>
              {vista === 'formulario' ? 'Registrar atención' : 'Atención registrada'}
            </Text>
            <TouchableOpacity onPress={cerrar} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {vista === 'resultado' && resultado !== null ? (
            <VistaResultado resultado={resultado} onCerrar={cerrar} />
          ) : (
            <ScrollView
              style={estilos.cuerpo}
              contentContainerStyle={estilos.cuerpoContenido}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={formStyles.label}>NOMBRE DEL CLIENTE</Text>
              <TextInput
                style={[
                  formStyles.input,
                  intentoEnviar && !nombreValido && formStyles.inputConError,
                ]}
                placeholder="Ej. Juan Pérez"
                placeholderTextColor={colors.placeholder}
                value={nombreCliente}
                onChangeText={setNombreCliente}
                autoCapitalize="words"
                maxLength={80}
              />
              {intentoEnviar && !nombreValido && (
                <Text style={formStyles.mensajeError}>Escribe el nombre del cliente.</Text>
              )}

              <Text style={[formStyles.label, estilos.labelServicios]}>SERVICIOS</Text>

              {servicios.loading ? (
                <View>
                  <Esqueleto alto={56} estilo={estilos.espacioEsqueleto} />
                  <Esqueleto alto={56} estilo={estilos.espacioEsqueleto} />
                  <Esqueleto alto={56} />
                </View>
              ) : servicios.error !== null ? (
                <EstadoError mensaje={servicios.error} onReintentar={servicios.refetch} />
              ) : listaServicios.length === 0 ? (
                <EstadoVacio
                  icono="scissors"
                  mensaje="Tu barbería todavía no tiene servicios activos en el catálogo."
                />
              ) : (
                <View>
                  {listaServicios.map((servicio) => (
                    <ItemServicio
                      key={servicio.idServicio}
                      servicio={servicio}
                      seleccionado={seleccionados.has(servicio.idServicio)}
                      onPress={() => alternarServicio(servicio.idServicio)}
                    />
                  ))}
                </View>
              )}

              {intentoEnviar && !serviciosValidos && (
                <Text style={formStyles.mensajeError}>Selecciona al menos un servicio.</Text>
              )}

              {registrar.error !== null && (
                <Text style={[formStyles.mensajeError, estilos.errorEnvio]}>{registrar.error}</Text>
              )}
            </ScrollView>
          )}

          {vista === 'formulario' && (
            <View style={estilos.pie}>
              <View style={estilos.totales}>
                <View>
                  <Text style={estilos.totalEtiqueta}>Total</Text>
                  <Text style={estilos.totalMonto}>{formatearCOP(totalMonto)}</Text>
                </View>
                <Text style={estilos.totalDuracion}>
                  {elegidos.length === 0
                    ? 'Sin servicios seleccionados'
                    : formatearDuracion(totalDuracion)}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  formStyles.button,
                  (registrar.cargando || (intentoEnviar && !formularioValido)) &&
                    formStyles.buttonDeshabilitado,
                ]}
                activeOpacity={0.8}
                onPress={confirmar}
                disabled={registrar.cargando}
                accessibilityRole="button"
                accessibilityState={{ disabled: registrar.cargando, busy: registrar.cargando }}
              >
                {registrar.cargando && (
                  <ActivityIndicator color={colors.surface} style={estilos.spinner} />
                )}
                <Text style={formStyles.buttonText}>
                  {registrar.cargando ? 'Registrando…' : 'Confirmar atención'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function VistaResultado({
  resultado,
  onCerrar,
}: {
  resultado: AtencionRegistrada;
  onCerrar: () => void;
}) {
  return (
    <View style={estilos.resultado}>
      <View style={estilos.iconoExito}>
        <Feather name="check" size={28} color={colors.surface} />
      </View>

      <Text style={estilos.resultadoTicket}>Ticket {resultado.numeroTicket}</Text>
      <Text style={estilos.resultadoCliente}>{resultado.cliente}</Text>

      <View style={estilos.resultadoTarjeta}>
        <View style={estilos.resultadoFila}>
          <Text style={estilos.resultadoEtiqueta}>Monto cobrado</Text>
          <Text style={estilos.resultadoValor}>{formatearCOP(resultado.montoCobrado)}</Text>
        </View>
        <View style={estilos.resultadoSeparador} />
        <View style={estilos.resultadoFila}>
          <Text style={estilos.resultadoEtiqueta}>Tu comisión</Text>
          <Text style={[estilos.resultadoValor, estilos.resultadoComision]}>
            {formatearCOP(resultado.comision)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={formStyles.button} activeOpacity={0.8} onPress={onCerrar}>
        <Text style={formStyles.buttonText}>Listo</Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 47, 0.45)',
    justifyContent: 'flex-end',
  },
  hoja: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingTop: spacing.lg,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.navy,
  },
  cuerpo: { paddingHorizontal: spacing.screen },
  cuerpoContenido: { paddingBottom: spacing.xl },
  labelServicios: { marginTop: spacing.lg },
  espacioEsqueleto: { marginBottom: spacing.sm },
  errorEnvio: { marginTop: spacing.sm },
  pie: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  totales: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  totalEtiqueta: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  totalMonto: {
    fontSize: fontSizes.titleLarge,
    fontWeight: '700',
    color: colors.navy,
  },
  totalDuracion: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
  spinner: { marginRight: spacing.sm },
  resultado: {
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  iconoExito: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  resultadoTicket: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    color: colors.navy,
  },
  resultadoCliente: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  resultadoTarjeta: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  resultadoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resultadoSeparador: {
    height: 1,
    backgroundColor: colors.border,
  },
  resultadoEtiqueta: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  resultadoValor: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.navy,
  },
  resultadoComision: {
    color: colors.accent,
  },
});
