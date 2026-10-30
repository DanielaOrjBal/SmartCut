import { useState, useEffect } from 'react';
import { useClientePorCorreo } from '../../../hooks';
import { useWizard } from '../context';
import { ApiError } from '../../../lib/http';

interface Props {
  onSiguiente: () => void;
}

export function StepCliente({ onSiguiente }: Props) {
  const { state, dispatch } = useWizard();
  const [correoInput, setCorreoInput] = useState(state.correo);
  const [correoConfirmado, setCorreoConfirmado] = useState(state.correo);
  const [nombre, setNombre] = useState(state.nombre);
  const [apellido, setApellido] = useState(state.apellido);
  const [telefono, setTelefono] = useState(state.telefono);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [clienteExistente, setClienteExistente] = useState<boolean | null>(null);

  const { data: clienteEncontrado, isFetching, error } = useClientePorCorreo(correoConfirmado);

  // Cuando la consulta devuelve un cliente existente, autocompletar
  useEffect(() => {
    if (!correoConfirmado) return;
    if (clienteEncontrado) {
      setNombre(clienteEncontrado.nombre);
      setApellido(clienteEncontrado.apellido ?? '');
      setTelefono(clienteEncontrado.telefono ?? '');
      setClienteExistente(true);
    } else if (clienteEncontrado === null) {
      setClienteExistente(false);
    }
  }, [clienteEncontrado, correoConfirmado]);

  function validarCorreo(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validarTelefono(v: string) {
    const digits = v.replace(/\s/g, '');
    if (!/^\d{10}$/.test(digits)) return false;
    if (/^(\d)\1+$/.test(digits)) return false; // todos iguales: 1111111111
    let seq = 1;
    for (let i = 1; i < digits.length; i++) {
      const diff = digits.charCodeAt(i) - digits.charCodeAt(i - 1);
      if (diff === 1 || diff === -1) { if (++seq >= 5) return false; }
      else seq = 1;
    }
    return true;
  }

  function validarNombreReal(v: string) {
    const limpio = v.trim();
    if (limpio.length < 2) return false;
    if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s\-']+$/.test(limpio)) return false;
    if (/(.)\1{3,}/i.test(limpio.replace(/\s/g, ''))) return false;
    const solo = limpio.toLowerCase().replace(/[^a-z]/g, '');
    if (solo.length >= 5) {
      let seq = 1;
      for (let i = 1; i < solo.length; i++) {
        if (solo.charCodeAt(i) === solo.charCodeAt(i - 1) + 1) {
          if (++seq >= 5) return false;
        } else {
          seq = 1;
        }
      }
    }
    return true;
  }

  function handleBlurCorreo() {
    if (correoInput && validarCorreo(correoInput)) {
      setCorreoConfirmado(correoInput);
    }
  }

  function validarFormulario() {
    const e: Record<string, string> = {};
    if (!validarCorreo(correoInput)) e.correo = 'Ingresa un correo electrónico válido.';
    if (!validarNombreReal(nombre)) e.nombre = 'Ingresa un nombre real (solo letras, mínimo 2 caracteres).';
    if (apellido.trim() && !validarNombreReal(apellido))
      e.apellido = 'El apellido ingresado no es válido (solo letras).';
    if (telefono.trim() && !validarTelefono(telefono))
      e.telefono = 'Ingresa un número de teléfono real (10 dígitos, sin secuencias como 1234567890).';
    return e;
  }

  function handleSiguiente() {
    const e = validarFormulario();
    if (Object.keys(e).length > 0) { setErrores(e); return; }

    // Si el correo existe pero el usuario indicó que los datos NO son correctos
    // (clienteExistente=true pero cambió nombre/apellido), no actualizamos idCliente
    // porque no permitimos modificar datos por esta vía.
    dispatch({
      type: 'SET_CLIENTE',
      payload: {
        correo: correoInput,
        nombre,
        apellido,
        telefono,
        idCliente: clienteEncontrado?.idCliente ?? null,
        clienteConfirmado: true,
      },
    });
    onSiguiente();
  }

  const errorApi =
    error instanceof ApiError && error.status === 409
      ? 'El correo ingresado ya se encuentra asociado a otro cliente.'
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Tus datos</h2>
        <p className="text-sm text-gray-500">
          Solo necesitamos tu correo para enviarte la confirmación.
        </p>
      </div>

      {/* Correo */}
      <div>
        <label htmlFor="correo" className="label">
          Correo electrónico <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="correo"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={correoInput}
          onChange={(e) => { setCorreoInput(e.target.value); setClienteExistente(null); }}
          onBlur={handleBlurCorreo}
          className={`input ${errores.correo ? 'input-error' : ''}`}
          aria-describedby={errores.correo ? 'correo-error' : undefined}
        />
        {errores.correo && (
          <p id="correo-error" className="mt-1 text-xs text-red-600" role="alert">
            {errores.correo}
          </p>
        )}
        {errorApi && (
          <p className="mt-1 text-xs text-red-600" role="alert">{errorApi}</p>
        )}
        {isFetching && (
          <p className="mt-1 text-xs text-gray-400">Verificando correo…</p>
        )}
      </div>

      {/* Banner cliente existente */}
      {clienteExistente === true && !isFetching && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">
            Encontramos una reserva anterior con este correo.
          </p>
          <p>¿Tus datos son correctos?</p>
        </div>
      )}

      {/* Nombre */}
      <div>
        <label htmlFor="nombre" className="label">
          Nombres <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="nombre"
          type="text"
          autoComplete="given-name"
          placeholder="Juan"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={`input ${errores.nombre ? 'input-error' : ''}`}
          aria-describedby={errores.nombre ? 'nombre-error' : undefined}
          readOnly={clienteExistente === true}
        />
        {errores.nombre && (
          <p id="nombre-error" className="mt-1 text-xs text-red-600" role="alert">
            {errores.nombre}
          </p>
        )}
      </div>

      {/* Apellidos */}
      <div>
        <label htmlFor="apellido" className="label">Apellidos</label>
        <input
          id="apellido"
          type="text"
          autoComplete="family-name"
          placeholder="Pérez"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          className={`input ${errores.apellido ? 'input-error' : ''}`}
          aria-describedby={errores.apellido ? 'apellido-error' : undefined}
          readOnly={clienteExistente === true}
        />
        {errores.apellido && (
          <p id="apellido-error" className="mt-1 text-xs text-red-600" role="alert">
            {errores.apellido}
          </p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="telefono" className="label">Teléfono</label>
        <input
          id="telefono"
          type="tel"
          autoComplete="tel"
          placeholder="3001234567"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className={`input ${errores.telefono ? 'input-error' : ''}`}
          aria-describedby={errores.telefono ? 'telefono-error' : undefined}
          readOnly={clienteExistente === true}
        />
        {errores.telefono && (
          <p id="telefono-error" className="mt-1 text-xs text-red-600" role="alert">
            {errores.telefono}
          </p>
        )}
      </div>

      {clienteExistente === true && (
        <p className="text-xs text-gray-500">
          Si tus datos no son correctos, usa un correo diferente para continuar.
        </p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSiguiente}
          className="btn-primary"
          disabled={isFetching}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
