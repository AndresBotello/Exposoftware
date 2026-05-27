import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as AuthService from '../../Services/AuthService';
import RatingService from '../../Services/RatingService';

export default function ProjectRatingForm({ idEvento, email, onComplete }) {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calificaciones, setCalificaciones] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar si está autenticado
    const token = AuthService.getToken();
    if (!token) {
      // Guardar URL actual y redirigir al login
      const returnUrl = `/asistencia/registrar/${idEvento}?step=rating`;
      sessionStorage.setItem('redirectAfterLogin', returnUrl);
      navigate('/login');
      return;
    }

    cargarProyectos();
  }, [idEvento, navigate]);

  const cargarProyectos = async () => {
    try {
      setLoading(true);
      const data = await RatingService.obtenerProyectosDelEvento(idEvento);
      setProyectos(Array.isArray(data) ? data : []);
      setCalificaciones({});
    } catch (err) {
      setError('No se pudieron cargar los proyectos para calificar');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalificacion = (idProyecto, valor) => {
    setCalificaciones({
      ...calificaciones,
      [idProyecto]: valor
    });
  };

  const enviarCalificaciones = async () => {
    try {
      setEnviando(true);
      let calificacionesEnviadas = 0;

      for (const [idProyecto, calificacion] of Object.entries(calificaciones)) {
        if (calificacion) {
          try {
            await RatingService.calificarProyecto(idProyecto, calificacion);
            calificacionesEnviadas++;
          } catch (err) {
            console.error(`Error calificando proyecto ${idProyecto}:`, err);
          }
        }
      }

      if (calificacionesEnviadas > 0) {
        if (onComplete) {
          onComplete(calificacionesEnviadas);
        }
      } else {
        setError('Por favor califica al menos un proyecto');
      }
    } catch (err) {
      setError('Error al enviar calificaciones');
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const saltarCalificacion = () => {
    if (onComplete) {
      onComplete(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
          </div>
          <p className="text-gray-600 mt-4">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <i className="pi pi-star-fill text-yellow-600 text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Califica los Proyectos
          </h2>
          <p className="text-gray-600">
            Tu opinión ayuda a los participantes a mejorar. Puedes calificar de 1 a 5 estrellas.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <i className="pi pi-exclamation-triangle text-red-600 mt-1"></i>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {proyectos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <i className="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600 text-lg">No hay proyectos para calificar en este evento.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 mb-8">
              {proyectos.map((proyecto) => (
                <div
                  key={proyecto.id_proyecto}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {proyecto.titulo_proyecto || proyecto.titulo || 'Proyecto sin nombre'}
                      </h3>
                      {proyecto.id_docente?.nombre && (
                        <p className="text-sm text-gray-500 mt-1">
                          Director: <span className="font-medium">{proyecto.id_docente.nombre}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-2">Tu calificación:</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {calificaciones[proyecto.id_proyecto] || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((valor) => (
                      <button
                        key={valor}
                        onClick={() => handleCalificacion(proyecto.id_proyecto, valor)}
                        className={`text-3xl transition-transform transform hover:scale-110 ${
                          calificaciones[proyecto.id_proyecto] >= valor
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      >
                        <i className="pi pi-star-fill"></i>
                      </button>
                    ))}
                  </div>

                  {calificaciones[proyecto.id_proyecto] && (
                    <div className="mt-3 text-sm text-gray-600">
                      {calificaciones[proyecto.id_proyecto] === 5 && '¡Excelente trabajo!'}
                      {calificaciones[proyecto.id_proyecto] === 4 && 'Muy buen proyecto'}
                      {calificaciones[proyecto.id_proyecto] === 3 && 'Proyecto aceptable'}
                      {calificaciones[proyecto.id_proyecto] === 2 && 'Necesita mejoras'}
                      {calificaciones[proyecto.id_proyecto] === 1 && 'No cumple con los estándares'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={saltarCalificacion}
                className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Saltar por ahora
              </button>
              <button
                onClick={enviarCalificaciones}
                disabled={enviando || Object.values(calificaciones).filter(Boolean).length === 0}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {enviando ? (
                  <>
                    <i className="pi pi-spin pi-spinner"></i> Enviando...
                  </>
                ) : (
                  <>
                    <i className="pi pi-send"></i> Enviar Calificaciones
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
