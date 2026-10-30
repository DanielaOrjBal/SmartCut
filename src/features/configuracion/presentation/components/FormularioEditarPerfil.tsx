import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSizes, radii, spacing } from '../../../../core/theme/tokens';
import { formStyles } from '../../../../core/theme/formStyles';
import { CampoTexto } from '../../../../core/components/CampoTexto';
import { nombreValido, telefonoValido } from '../../../../core/validacion/campos';
import { useActualizarPerfil } from '../hooks/useActualizarPerfil';
import type { PerfilUsuario } from '../../../dashboard/domain/dashboard';

type Props = {
  perfil: PerfilUsuario;
  onActualizado: (perfilNuevo: PerfilUsuario) => void;
};

/**
 * Formulario para editar nombre, apellido y teléfono.
 * Se pre-carga con los valores actuales del perfil.
 * El correo NO es editable (está en el JWT activo).
 */
export function FormularioEditarPerfil({ perfil, onActualizado }: Props) {
  const mutacion = useActualizarPerfil();

  const [nombre, setNombre] = useState(perfil.nombre);
  const [apellido, setApellido] = useState(perfil.apellido ?? '');
  const [telefono, setTelefono] = useState(perfil.telefono ?? '');
  const [tocado, setTocado] = useState({ nombre: false, apellido: false, telefono: false });
  const [exito, setExito] = useState(false);

  // Si el perfil cambia desde afuera (ej. refetch), re-sincronizar los campos
  useEffect(() => {
    setNombre(perfil.nombre);
    setApellido(perfil.apellido ?? '');
    setTelefono(perfil.telefono ?? '');
  }, [perfil.nombre, perfil.apellido, perfil.telefono]);

  const errorNombre = tocado.nombre ? nombreValido(nombre, 'El nombre') : null;
  const errorApellido = tocado.apellido && apellido.trim().length > 0
    ? nombreValido(apellido, 'El apellido')
    : null;
  const errorTelefono = tocado.telefono && telefono.trim().length > 0
    ? telefonoValido(telefono, false)
    : null;

  // El botón se ve deshabilitado solo si los campos tocados tienen error,
  // para no bloquear usuarios cuyo teléfono o apellido guardado no cumple el
  // nuevo formato — solo se validan cuando el usuario los modifica.
  const formularioValido =
    nombreValido(nombre, 'El nombre') === null &&
    (!tocado.apellido || apellido.trim().length === 0 || nombreValido(apellido, 'El apellido') === null) &&
    (!tocado.telefono || telefono.trim().length === 0 || telefonoValido(telefono, false) === null);

  const sinCambios =
    nombre.trim() === perfil.nombre &&
    (apellido.trim() || null) === (perfil.apellido ?? null) &&
    (telefono.trim() || null) === (perfil.telefono ?? null);

  async function guardar() {
    setTocado({ nombre: true, apellido: true, telefono: true });
    setExito(false);
    mutacion.limpiarError();

    // Los campos opcionales solo se validan si el usuario los modificó.
    const telefonoModificado = (telefono.trim() || null) !== (perfil.telefono ?? null);
    const apellidoModificado = (apellido.trim() || null) !== (perfil.apellido ?? null);

    const todoCorrecto =
      nombreValido(nombre, 'El nombre') === null &&
      (!apellidoModificado || apellido.trim().length === 0 || nombreValido(apellido, 'El apellido') === null) &&
      (!telefonoModificado || telefono.trim().length === 0 || telefonoValido(telefono, false) === null);

    if (!todoCorrecto) return;

    try {
      const perfilNuevo = await mutacion.ejecutar({
        nombre: nombre.trim(),
        apellido: apellido.trim() || null,
        telefono: telefono.trim() || null,
      });
      setExito(true);
      onActualizado(perfilNuevo);
    } catch {
      // El error ya lo captura mutacion.error
    }
  }

  return (
    <View>
      <CampoTexto
        etiqueta="NOMBRE"
        valor={nombre}
        onCambiar={(valor) => {
          setNombre(valor);
          setExito(false);
        }}
        onBlur={() => setTocado((t) => ({ ...t, nombre: true }))}
        error={errorNombre}
        tocado={tocado.nombre}
        autoCapitalize="words"
        maxLength={80}
      />

      <CampoTexto
        etiqueta="APELLIDO"
        valor={apellido}
        onCambiar={(valor) => {
          setApellido(valor);
          setExito(false);
        }}
        onBlur={() => setTocado((t) => ({ ...t, apellido: true }))}
        error={errorApellido}
        tocado={tocado.apellido}
        autoCapitalize="words"
        maxLength={80}
      />

      <CampoTexto
        etiqueta="TELÉFONO"
        placeholder="3001234567"
        valor={telefono}
        onCambiar={(valor) => {
          setTelefono(valor);
          setExito(false);
        }}
        onBlur={() => setTocado((t) => ({ ...t, telefono: true }))}
        error={errorTelefono}
        tocado={tocado.telefono}
        keyboardType="phone-pad"
        maxLength={10}
      />

      {mutacion.error !== null && (
        <Text style={[formStyles.mensajeError, estilos.espacio]}>{mutacion.error}</Text>
      )}
      {exito && (
        <View style={estilos.exito}>
          <Feather name="check-circle" size={16} color="#16A34A" />
          <Text style={estilos.exitoTexto}>Datos actualizados correctamente.</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          formStyles.button,
          estilos.boton,
          (mutacion.cargando || sinCambios || !formularioValido) && formStyles.buttonDeshabilitado,
        ]}
        activeOpacity={0.8}
        onPress={() => {
          void guardar();
        }}
        disabled={mutacion.cargando || sinCambios}
      >
        {mutacion.cargando && <ActivityIndicator color={colors.surface} style={estilos.spinner} />}
        <Text style={formStyles.buttonText}>
          {mutacion.cargando ? 'Guardando…' : 'Guardar cambios'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  espacio: { marginTop: -spacing.sm, marginBottom: spacing.md },
  exito: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  exitoTexto: { fontSize: fontSizes.caption, color: '#166534', marginLeft: spacing.sm, flex: 1 },
  boton: { marginBottom: 0 },
  spinner: { marginRight: spacing.sm },
});
