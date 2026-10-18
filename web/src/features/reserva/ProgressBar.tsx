const PASOS = ['Tus datos', 'Barbería', 'Barbero y servicios', 'Fecha y hora', 'Confirmación'];

interface Props {
  pasoActual: number; // 1-based
}

export function ProgressBar({ pasoActual }: Props) {
  return (
    <nav aria-label="Progreso de la reserva" className="mb-8">
      {/* Barra de progreso visible en móvil */}
      <div className="flex items-center justify-between mb-2 md:hidden">
        <span className="text-sm font-medium text-gray-700">
          Paso {pasoActual} de {PASOS.length}
        </span>
        <span className="text-sm text-gray-500">{PASOS[pasoActual - 1]}</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden md:hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-300"
          style={{ width: `${(pasoActual / PASOS.length) * 100}%` }}
        />
      </div>

      {/* Stepper horizontal en desktop */}
      <ol className="hidden md:flex items-center gap-0">
        {PASOS.map((nombre, i) => {
          const num = i + 1;
          const completado = num < pasoActual;
          const activo = num === pasoActual;
          return (
            <li key={nombre} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1 min-w-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border-2 transition-colors
                    ${completado ? 'bg-brand-500 border-brand-500 text-white'
                      : activo ? 'border-brand-500 text-brand-600 bg-white'
                      : 'border-gray-300 text-gray-400 bg-white'}`}
                  aria-current={activo ? 'step' : undefined}
                >
                  {completado ? '✓' : num}
                </div>
                <span
                  className={`text-xs text-center leading-tight ${
                    activo ? 'font-medium text-brand-600' : 'text-gray-500'
                  }`}
                >
                  {nombre}
                </span>
              </div>
              {i < PASOS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mt-[-14px] mx-1 ${
                    completado ? 'bg-brand-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
