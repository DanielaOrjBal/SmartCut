import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing } from '../theme/tokens';
import { formStyles } from '../theme/formStyles';

type Props = {
  etiqueta: string;
  valor: string;
  onCambiar: (valor: string) => void;
  placeholder?: string;
  /** Mensaje debajo del input. Se muestra solo si `tocado` es true. */
  error?: string | null;
  tocado?: boolean;
  onBlur?: () => void;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  secreto?: boolean;
  /** Muestra el ojo para alternar visibilidad. Solo tiene efecto con `secreto`. */
  alternarVisibilidad?: boolean;
  maxLength?: number;
};

/**
 * Input con etiqueta y error debajo.
 *
 * El error se pinta bajo el campo, nunca en un Alert, y el borde se tiñe de
 * rojo. Solo aparece cuando el campo ya fue tocado, para no regañar al usuario
 * por lo que todavía no ha alcanzado a llenar.
 */
export function CampoTexto({
  etiqueta,
  valor,
  onCambiar,
  placeholder,
  error,
  tocado = false,
  onBlur,
  keyboardType,
  autoCapitalize = 'sentences',
  secreto = false,
  alternarVisibilidad = false,
  maxLength,
}: Props) {
  const [visible, setVisible] = React.useState(false);
  const mostrarError = tocado && typeof error === 'string' && error.length > 0;

  return (
    <View style={estilos.contenedor}>
      <Text style={formStyles.label}>{etiqueta}</Text>

      <View>
        <TextInput
          style={[
            formStyles.input,
            mostrarError && formStyles.inputConError,
            secreto && alternarVisibilidad && estilos.inputConIcono,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={valor}
          onChangeText={onCambiar}
          onBlur={onBlur}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={!secreto}
          secureTextEntry={secreto && !visible}
          maxLength={maxLength}
        />

        {secreto && alternarVisibilidad && (
          <TouchableOpacity
            style={estilos.iconoOjo}
            onPress={() => setVisible((previo) => !previo)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Feather name={visible ? 'eye-off' : 'eye'} size={18} color={colors.placeholder} />
          </TouchableOpacity>
        )}
      </View>

      {mostrarError && <Text style={formStyles.mensajeError}>{error}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    marginBottom: 18,
  },
  inputConIcono: {
    paddingRight: 48,
  },
  iconoOjo: {
    position: 'absolute',
    right: spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
