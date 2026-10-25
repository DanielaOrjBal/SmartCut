import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-gray-900 mb-4">404</p>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Página no encontrada</h1>
        <p className="text-sm text-gray-500 mb-8">
          El enlace que seguiste no existe o ya no está disponible.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
