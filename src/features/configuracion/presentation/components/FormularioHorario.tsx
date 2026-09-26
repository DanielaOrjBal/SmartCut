import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fontSizes, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import { Chip } from '../../../onboarding/presentation/components/Chip';
import { DIAS_SEMANA, DURACIONES_TURNO, type DiaSemana } from '../../../onboarding/domain/onboarding';
import { useActualizarHorario } from '../hooks/useActualizarHorario';
import type { BarberiaInfo } from '../../domain/configuracion';

type Props = {
  barberia: BarberiaInfo;
  onActualizado: (barberia: BarberiaInfo) => void;
};

const REGEX_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** 'HH:MM:SS' → 'HH:MM', para mostrar en el input de texto. */
function aHHMM(hora: string): string {
  return hora.slice(0, 5);
}

/**
 * Horario de atención. Mismo procedimiento que el paso de horario del
 * onboarding (`sp_configurar_horario`), así que exige lo mismo que allá: al
 * menos un día, y la hora de cierre después de la de apertura.
 *
 * La duración del turno no viaja en ninguna consulta de lectura disponible
 * fuera del onboarding, así que este formulario no puede mostrar la que ya
 * está configurada — parte de un valor por defecto razonable (30 minutos) en
 * vez de aparentar que conoce el actual.
 */
export function FormularioHorario({ barberia, onActualizado }: Props) {
  const actualizar = useActualizarHorario();

  const [dias, setDias] = useState<DiaSemana[]>(barberia.diasAtencion);
  const [horaApertura, setHoraApertura] = useState(aHHMM(barberia.horaApertura));
  const [horaCierre, setHoraCierre] = useState(aHHMM(barberia.horaCierre));
  const [duracionTurno, setDuracionTurno] = useState<number>(30);
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [exito, setExito] = useState(false);

  function alternarDia(dia: DiaSemana) {
    setDias((previo) => (previo.includes(dia) ? previo.filter((d) => d !== dia) : [...previo, dia]));
    setExito(false);
  }

  const diasValidos = dias.length > 0;
  const horaAperturaValida = REGEX_HORA.test(horaApertura);
  const horaCierreValida = REGEX_HORA.test(horaCierre) && horaCierre > horaApertura;
  const formularioValido = diasValidos && horaAperturaValida && horaCierreValida;

  async function guardar() {
    setIntentoEnviar(true);
    setExito(false);
    if (!formularioValido) {
      return;
    }
    try {
      const actualizada = await actualizar.ejecutar({
        dias,
        horaApertura: `${horaApertura}:00`,
        horaCierre: `${horaCierre}:00`,
        duracionTurno,
      });
      onActualizado(actualizada);
      setExito(true);
    } catch {
      // El mensaje queda en actualizar.error.
    }
  }

  return (
    <View>
      <Text style={formStyles.label}>DÍAS DE ATENCIÓN</Text>
      <View style={estilos.chipsDias}>
        {DIAS_SEMANA.map((dia) => (
          <Chip key={dia} texto={dia.slice(0, 3)} activo={dias.includes(dia)} onPress={() => alternarDia(dia)} />
        ))}
      </View>
      {intentoEnviar && !diasValidos && (
        <Text style={formStyles.mensajeError}>Selecciona al menos un día.</Text>
      )}

      <View style={estilos.filaHoras}>
        <View style={estilos.mitad}>
          <Text style={formStyles.label}>APERTURA</Text>
          <TextInput
            style={[formStyles.input, intentoEnviar && !horaAperturaValida && formStyles.inputConError]}
            placeholder="HH:MM"
            placeholderTextColor={colors.placeholder}
            value={horaApertura}
            onChangeText={(v) => {
              setHoraApertura(v);
              setExito(false);
            }}
            maxLength={5}
          />
        </View>
        <View style={estilos.mitad}>
          <Text style={formStyles.label}>CIERRE</Text>
          <TextInput
            style={[formStyles.input, intentoEnviar && !horaCierreValida && formStyles.inputConError]}
            placeholder="HH:MM"
            placeholderTextColor={colors.placeholder}
            value={horaCierre}
            onChangeText={(v) => {
              setHoraCierre(v);
              setExito(false);
            }}
            maxLength={5}
          />
        </View>
      </View>
      {intentoEnviar && !horaCierreValida && horaAperturaValida && (
        <Text style={formStyles.mensajeError}>La hora de cierre debe ser posterior a la de apertura.</Text>
      )}

      <Text style={[formStyles.label, estilos.espacio]}>DURACIÓN DEL TURNO</Text>
      <View style={estilos.chipsDuracion}>
        {DURACIONES_TURNO.map((minutos) => (
          <Chip
            key={minutos}
            texto={`${minutos} min`}
            activo={duracionTurno === minutos}
            onPress={() => {
              setDuracionTurno(minutos);
              setExito(false);
            }}
          />
        ))}
      </View>

      {actualizar.error !== null && (
        <Text style={[formStyles.mensajeError, estilos.espacio]}>{actualizar.error}</Text>
      )}
      {exito && <Text style={estilos.exito}>El horario se actualizó correctamente.</Text>}

      <TouchableOpacity
        style={[
          formStyles.button,
          estilos.boton,
          (actualizar.cargando || (intentoEnviar && !formularioValido)) && formStyles.buttonDeshabilitado,
        ]}
        activeOpacity={0.8}
        onPress={() => {
          void guardar();
        }}
        disabled={actualizar.cargando}
      >
        {actualizar.cargando && <ActivityIndicator color={colors.surface} style={estilos.spinner} />}
        <Text style={formStyles.buttonText}>
          {actualizar.cargando ? 'Guardando…' : 'Guardar horario'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  chipsDias: { flexDirection: 'row', flexWrap: 'wrap' },
  filaHoras: { flexDirection: 'row', marginTop: spacing.md },
  mitad: { flex: 1, marginRight: spacing.sm },
  espacio: { marginTop: spacing.md },
  chipsDuracion: { flexDirection: 'row', flexWrap: 'wrap' },
  exito: { fontSize: fontSizes.caption, color: '#166534', marginTop: spacing.sm },
  boton: { marginTop: spacing.lg, marginBottom: 0 },
  spinner: { marginRight: spacing.sm },
});
