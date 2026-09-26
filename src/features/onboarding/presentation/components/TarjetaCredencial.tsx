import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';

import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import type { CredencialProvisional } from '../../domain/onboarding';

type Props = {
  credencial: CredencialProvisional;
};

/**
 * Credencial provisional de un barbero.
 *
 * El backend la devuelve UNA sola vez; después solo queda el hash. Por eso la
 * tarjeta permite copiar el bloque completo y el aviso de arriba es tan
 * insistente.
 */
export function TarjetaCredencial({ credencial }: Props) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    await Clipboard.setStringAsync(
      `SmartCut — ${credencial.nombre}\nCorreo: ${credencial.correo}\nContraseña provisional: ${credencial.contrasenaProvisional}`,
    );
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <View style={[formStyles.tarjeta, estilos.tarjeta]}>
      <View style={estilos.encabezado}>
        <Text style={estilos.nombre}>
          {credencial.nombre} {credencial.apellido ?? ''}
        </Text>
        <TouchableOpacity
          style={estilos.botonCopiar}
          onPress={() => {
            void copiar();
          }}
          activeOpacity={0.7}
          accessibilityLabel={`Copiar las credenciales de ${credencial.nombre}`}
        >
          <Feather
            name={copiado ? 'check' : 'copy'}
            size={14}
            color={copiado ? colors.accent : colors.primary}
          />
          <Text style={[estilos.textoCopiar, copiado && estilos.textoCopiado]}>
            {copiado ? 'Copiado' : 'Copiar'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={estilos.etiquetaDato}>CORREO</Text>
      <Text style={estilos.valorDato} selectable>
        {credencial.correo}
      </Text>

      <Text style={estilos.etiquetaDato}>CONTRASEÑA PROVISIONAL</Text>
      <Text style={estilos.valorClave} selectable>
        {credencial.contrasenaProvisional}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    borderColor: colors.primary,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nombre: {
    flex: 1,
    fontSize: fontSizes.body,
    fontWeight: '700',
    color: colors.navy,
  },
  botonCopiar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textoCopiar: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4,
  },
  textoCopiado: {
    color: colors.accent,
  },
  etiquetaDato: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.placeholder,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  valorDato: {
    fontSize: fontSizes.small,
    color: colors.text,
    marginTop: 2,
  },
  valorClave: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.navy,
    letterSpacing: 2,
    marginTop: 2,
  },
});
