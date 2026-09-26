import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import { aISO, fechaDesdeISO, formatearFechaLarga, hoyISO } from '../../../../core/utils/fechas';
import { useRegistrarAusencia } from '../hooks/useAccionesEquipo';

type Props = {
  idBarbero: number | null;
  nombreBarbero: string;
  onClose: () => void;
  onRegistrada: () => void;
};

function sumarDias(iso: string, dias: number): string {
  const fecha = fechaDesdeISO(iso);
  if (fecha === null) {
    return iso;
  }
  return aISO(new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias));
}

const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Registrar una ausencia o incapacidad. Marcar "es incapacidad" cancela por
 * trigger las citas futuras del barbero: se advierte antes de enviar, no
 * después.
 */
export function ModalRegistrarAusencia({ idBarbero, nombreBarbero, onClose, onRegistrada }: Props) {
  const registrar = useRegistrarAusencia();

  const [fechaInicio, setFechaInicio] = useState(hoyISO());
  const [fechaFin, setFechaFin] = useState(hoyISO());
  const [diaCompleto, setDiaCompleto] = useState(true);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [esIncapacidad, setEsIncapacidad] = useState(false);
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  useEffect(() => {
    if (idBarbero !== null) {
      setFechaInicio(hoyISO());
      setFechaFin(hoyISO());
      setDiaCompleto(true);
      setHoraInicio('');
      setHoraFin('');
      setMotivo('');
      setEsIncapacidad(false);
      setIntentoEnviar(false);
      registrar.limpiarError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idBarbero]);

  if (idBarbero === null) {
    return null;
  }

  const rangoValido = fechaFin >= fechaInicio;
  const horasValidas =
    diaCompleto || (REGEX_HORA.test(horaInicio) && REGEX_HORA.test(horaFin) && horaFin > horaInicio);
  const formularioValido = rangoValido && horasValidas;

  async function confirmar() {
    setIntentoEnviar(true);
    if (!formularioValido || idBarbero === null) {
      return;
    }
    try {
      await registrar.ejecutar({
        idBarbero,
        ausencia: {
          fechaInicio,
          fechaFin,
          horaInicio: diaCompleto ? undefined : `${horaInicio}:00`,
          horaFin: diaCompleto ? undefined : `${horaFin}:00`,
          motivo: motivo.trim().length > 0 ? motivo.trim() : undefined,
          esIncapacidad,
        },
      });
      onRegistrada();
      onClose();
    } catch {
      // El mensaje queda en registrar.error.
    }
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={estilos.fondo}>
        <View style={estilos.hoja}>
          <View style={estilos.encabezado}>
            <Text style={estilos.titulo}>Registrar ausencia</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={estilos.subtitulo}>{nombreBarbero}</Text>

          <ScrollView contentContainerStyle={estilos.cuerpo} keyboardShouldPersistTaps="handled">
            <Text style={formStyles.label}>DESDE</Text>
            <SelectorFecha
              valor={fechaInicio}
              onCambiar={(dias) => setFechaInicio((previa) => sumarDias(previa, dias))}
            />

            <Text style={[formStyles.label, estilos.espacio]}>HASTA</Text>
            <SelectorFecha
              valor={fechaFin}
              onCambiar={(dias) => setFechaFin((previa) => sumarDias(previa, dias))}
            />
            {intentoEnviar && !rangoValido && (
              <Text style={formStyles.mensajeError}>
                La fecha de fin no puede ser anterior a la de inicio.
              </Text>
            )}

            <View style={[estilos.filaSwitch, estilos.espacio]}>
              <Text style={estilos.textoSwitch}>Todo el día</Text>
              <Switch value={diaCompleto} onValueChange={setDiaCompleto} />
            </View>

            {!diaCompleto && (
              <View style={estilos.filaHoras}>
                <View style={estilos.mitad}>
                  <Text style={formStyles.label}>DESDE LAS</Text>
                  <TextInput
                    style={[
                      formStyles.input,
                      intentoEnviar && !REGEX_HORA.test(horaInicio) && formStyles.inputConError,
                    ]}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.placeholder}
                    value={horaInicio}
                    onChangeText={setHoraInicio}
                    maxLength={5}
                  />
                </View>
                <View style={estilos.mitad}>
                  <Text style={formStyles.label}>HASTA LAS</Text>
                  <TextInput
                    style={[
                      formStyles.input,
                      intentoEnviar && !REGEX_HORA.test(horaFin) && formStyles.inputConError,
                    ]}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.placeholder}
                    value={horaFin}
                    onChangeText={setHoraFin}
                    maxLength={5}
                  />
                </View>
              </View>
            )}

            <Text style={[formStyles.label, estilos.espacio]}>MOTIVO (OPCIONAL)</Text>
            <TextInput
              style={formStyles.input}
              placeholder="Ej. Cita médica"
              placeholderTextColor={colors.placeholder}
              value={motivo}
              onChangeText={setMotivo}
              maxLength={255}
            />

            <TouchableOpacity
              style={[estilos.opcionIncapacidad, esIncapacidad && estilos.opcionIncapacidadActiva]}
              onPress={() => setEsIncapacidad((previo) => !previo)}
            >
              <View style={[estilos.casilla, esIncapacidad && estilos.casillaMarcada]}>
                {esIncapacidad && <Feather name="check" size={13} color={colors.surface} />}
              </View>
              <Text style={estilos.opcionIncapacidadTexto}>Es una incapacidad</Text>
            </TouchableOpacity>

            {esIncapacidad && (
              <View style={estilos.aviso}>
                <Feather name="alert-triangle" size={16} color={colors.danger} />
                <Text style={estilos.avisoTexto}>
                  Esto cancelará automáticamente las citas futuras pendientes o confirmadas de{' '}
                  {nombreBarbero}, y su estado pasará a "Incapacitado".
                </Text>
              </View>
            )}

            {registrar.error !== null && (
              <Text style={[formStyles.mensajeError, estilos.espacio]}>{registrar.error}</Text>
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
                {registrar.cargando ? 'Registrando…' : 'Registrar ausencia'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SelectorFecha({ valor, onCambiar }: { valor: string; onCambiar: (dias: 1 | -1) => void }) {
  return (
    <View style={estilos.selectorFecha}>
      <TouchableOpacity style={estilos.flecha} onPress={() => onCambiar(-1)}>
        <Feather name="chevron-left" size={20} color={colors.navy} />
      </TouchableOpacity>
      <Text style={estilos.fechaTexto}>{formatearFechaLarga(valor)}</Text>
      <TouchableOpacity style={estilos.flecha} onPress={() => onCambiar(1)}>
        <Feather name="chevron-right" size={20} color={colors.navy} />
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(10, 25, 47, 0.45)', justifyContent: 'flex-end' },
  hoja: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingTop: spacing.lg,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
  },
  titulo: { fontSize: fontSizes.title, fontWeight: '700', color: colors.navy },
  subtitulo: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
    paddingHorizontal: spacing.screen,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  cuerpo: { paddingHorizontal: spacing.screen, paddingBottom: spacing.xl },
  espacio: { marginTop: spacing.md },
  selectorFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
  },
  flecha: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  fechaTexto: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.navy,
    marginHorizontal: spacing.md,
    textTransform: 'capitalize',
  },
  filaSwitch: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textoSwitch: { fontSize: fontSizes.small, fontWeight: '600', color: colors.text },
  filaHoras: { flexDirection: 'row', marginTop: spacing.md },
  mitad: { flex: 1, marginRight: spacing.sm },
  opcionIncapacidad: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  opcionIncapacidadActiva: { borderColor: colors.danger, backgroundColor: '#FEF2F2' },
  casilla: {
    width: 22,
    height: 22,
    borderRadius: radii.sm + 2,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  casillaMarcada: { borderColor: colors.danger, backgroundColor: colors.danger },
  opcionIncapacidadTexto: { fontSize: fontSizes.small, fontWeight: '600', color: colors.text },
  aviso: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  avisoTexto: {
    flex: 1,
    fontSize: fontSizes.caption,
    color: colors.text,
    marginLeft: spacing.sm,
    lineHeight: 18,
  },
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
