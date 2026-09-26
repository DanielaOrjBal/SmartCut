import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { BotonPrimario } from '../../../../core/components/BotonPrimario';
import { CampoTexto } from '../../../../core/components/CampoTexto';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import type { OnboardingScreenProps } from '../../../../app/navigation/types';
import { DIAS_SEMANA, DURACIONES_TURNO, type DiaSemana } from '../../domain/onboarding';
import {
  aHora12,
  aHoraCorta,
  aHoraLarga,
  horaEsValida,
  INICIAL_DIA,
  ordenarDias,
  resumenDias,
} from '../../domain/horario';
import { useOnboarding } from '../context/OnboardingContext';
import { Chip, PasoLayout } from '../components';

export function HorarioScreen({ navigation }: OnboardingScreenProps<'Horario'>) {
  const { estado, actualizarHorario } = useOnboarding();
  const { horario } = estado;

  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const marcar = (campo: string) => setTocados((previo) => ({ ...previo, [campo]: true }));

  const alternarDia = (dia: DiaSemana) => {
    const yaEsta = horario.dias.includes(dia);
    const dias = yaEsta ? horario.dias.filter((d) => d !== dia) : [...horario.dias, dia];
    actualizarHorario({ dias: ordenarDias(dias) });
  };

  const errorApertura = !horaEsValida(horario.horaApertura)
    ? 'Usa el formato HH:MM en 24 horas.'
    : null;
  const errorCierre = !horaEsValida(horario.horaCierre)
    ? 'Usa el formato HH:MM en 24 horas.'
    : horario.horaCierre <= horario.horaApertura
      ? 'La hora de cierre debe ser posterior a la de apertura.'
      : null;
  const errorDias = horario.dias.length === 0 ? 'Selecciona al menos un día de atención.' : null;

  const esValido = errorApertura === null && errorCierre === null && errorDias === null;

  const continuar = () => {
    if (!esValido) {
      setTocados({ apertura: true, cierre: true });
      return;
    }
    navigation.navigate('Equipo');
  };

  return (
    <PasoLayout
      paso={4}
      titulo="¿Cuándo atiendes?"
      subtitulo="Este horario aplica para toda la barbería y define los turnos que verán tus clientes."
      pie={
        // Paso obligatorio: sin "Omitir por ahora".
        <BotonPrimario texto="Continuar" onPress={continuar} deshabilitado={!esValido} />
      }
    >
      <Text style={formStyles.label}>DÍAS DE ATENCIÓN</Text>
      <View style={estilos.filaChips}>
        {DIAS_SEMANA.map((dia) => (
          <Chip
            key={dia}
            texto={INICIAL_DIA[dia]}
            activo={horario.dias.includes(dia)}
            onPress={() => alternarDia(dia)}
            compacto
          />
        ))}
      </View>
      {errorDias !== null && <Text style={formStyles.mensajeError}>{errorDias}</Text>}

      <View style={estilos.filaHoras}>
        <View style={estilos.mitad}>
          <CampoTexto
            etiqueta="APERTURA"
            placeholder="08:00"
            valor={aHoraCorta(horario.horaApertura)}
            onCambiar={(valor) => actualizarHorario({ horaApertura: aHoraLarga(valor) })}
            onBlur={() => marcar('apertura')}
            error={errorApertura}
            tocado={tocados.apertura}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>
        <View style={estilos.separador} />
        <View style={estilos.mitad}>
          <CampoTexto
            etiqueta="CIERRE"
            placeholder="19:00"
            valor={aHoraCorta(horario.horaCierre)}
            onCambiar={(valor) => actualizarHorario({ horaCierre: aHoraLarga(valor) })}
            onBlur={() => marcar('cierre')}
            error={errorCierre}
            tocado={tocados.cierre}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>
      </View>

      <Text style={formStyles.label}>DURACIÓN DEL TURNO</Text>
      <View style={estilos.filaChips}>
        {DURACIONES_TURNO.map((minutos) => (
          <Chip
            key={minutos}
            texto={`${minutos} min`}
            activo={horario.duracionTurno === minutos}
            onPress={() => actualizarHorario({ duracionTurno: minutos })}
          />
        ))}
      </View>

      <View style={estilos.resumen}>
        <Feather name="clock" size={18} color={colors.accent} />
        <View style={estilos.resumenTexto}>
          <Text style={estilos.resumenDias}>{resumenDias(horario.dias)}</Text>
          <Text style={estilos.resumenHoras}>
            {aHora12(horario.horaApertura)} — {aHora12(horario.horaCierre)} · turnos de{' '}
            {horario.duracionTurno} min
          </Text>
        </View>
      </View>
    </PasoLayout>
  );
}

const estilos = StyleSheet.create({
  filaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  filaHoras: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  mitad: {
    flex: 1,
  },
  separador: {
    width: spacing.md,
  },
  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  resumenTexto: {
    flex: 1,
    marginLeft: spacing.md,
  },
  resumenDias: {
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.navy,
  },
  resumenHoras: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
