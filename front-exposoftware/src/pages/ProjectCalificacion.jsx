import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { obtenerProyectoPorId } from "../Services/ProjectsService";
import { calificarProyectoAsistente } from "../Services/TeacherService";
import * as AuthService from "../Services/AuthService";
import logo from "../assets/Logo-unicesar.png";

export default function ProjectCalificacion() {
  const { id_proyecto } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [proyecto, setProyecto] = useState(null);
  const [calificacion, setCalificacion] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const user = AuthService.getUserData();
    if (!user) {
      // Guardar la URL actual en sessionStorage para redirigir después de login
      sessionStorage.setItem('redirectAfterLogin', `/proyectos/${id_proyecto}/calificar`);
      // Redirigir a login
      navigate('/login');
      return;
    }
    setUserData(user);
    cargarProyecto();
  }, [id_proyecto, navigate]);

  const cargarProyecto = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerProyectoPorId(id_proyecto);
      setProyecto(data);
    } catch (err) {
      setError(err.message || "Error al cargar el proyecto");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!calificacion) {
      setError("Por favor ingresa una calificación");
      return;
    }

    const calificacionNum = parseFloat(calificacion);
    if (isNaN(calificacionNum) || calificacionNum < 0 || calificacionNum > 5) {
      setError("La calificación debe estar entre 0 y 5");
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      await calificarProyectoAsistente(id_proyecto, calificacionNum, comentarios.trim());
      setExito(true);

      // Redirigir según el rol del usuario después de 3 segundos
      setTimeout(() => {
        const userRole = AuthService.getUserRole();
        const rol = userRole ? userRole.toLowerCase() : '';

        switch(rol) {
          case 'estudiante':
            navigate('/student/dashboard');
            break;
          case 'docente':
          case 'profesor':
            navigate('/teacher/dashboard');
            break;
          case 'administrador':
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'egresado':
            navigate('/graduate/dashboard');
            break;
          default:
            navigate('/');
        }
      }, 3000);
    } catch (err) {
      setError(err.message || "Error al guardar la calificación");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <i className="pi pi-spinner text-4xl text-emerald-600"></i>
          </div>
          <p className="text-gray-600">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <i className="pi pi-check-circle text-green-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Calificación Registrada!
          </h2>
          <p className="text-gray-600 mb-2">
            Proyecto: <span className="font-semibold">{proyecto?.titulo_proyecto}</span>
          </p>
          <p className="text-gray-600 mb-6">
            Calificación: <span className="font-bold text-emerald-600">{calificacion}/5.0</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Serás redirigido al inicio en unos momentos...
          </p>
          <button
            onClick={() => {
              const userRole = AuthService.getUserRole();
              const rol = userRole ? userRole.toLowerCase() : '';

              switch(rol) {
                case 'estudiante':
                  navigate('/student/dashboard');
                  break;
                case 'docente':
                case 'profesor':
                  navigate('/teacher/dashboard');
                  break;
                case 'administrador':
                case 'admin':
                  navigate('/admin/dashboard');
                  break;
                case 'egresado':
                  navigate('/graduate/dashboard');
                  break;
                default:
                  navigate('/');
              }
            }}
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            Ir a Mi Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo Unicesar" className="w-10 h-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Expo-software</h1>
                <p className="text-xs text-gray-500">Universidad Popular del Cesar</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              <i className="pi pi-home"></i>
              Inicio
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Project Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <i className="pi pi-briefcase text-emerald-600 text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Calificar Proyecto</h2>
                  <p className="text-sm text-gray-600">Ingresa la calificación del proyecto</p>
                </div>
              </div>
            </div>

            {/* Project Info */}
            {proyecto && (
              <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg p-6 mb-8 border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Nombre del Proyecto</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {proyecto.titulo_proyecto}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Estado Actual</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        proyecto.estado === 'aprobado'
                          ? 'bg-green-100 text-green-800'
                          : proyecto.estado === 'calificado'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {proyecto.estado?.charAt(0).toUpperCase() + proyecto.estado?.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 font-medium flex items-center gap-2">
                  <i className="pi pi-exclamation-triangle"></i>
                  {error}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Calificación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={calificacion}
                    onChange={(e) => {
                      setCalificacion(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Ejemplo: 4.5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-semibold"
                    required
                  />
                  <span className="absolute right-4 top-3 text-gray-500 text-lg font-semibold">/5.0</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Ingresa un valor entre 0 y 5</p>
              </div>

              {/* Comentarios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios (Opcional)
                </label>
                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Agrega comentarios sobre la evaluación del proyecto..."
                  rows="4"
                  maxLength="500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {comentarios.length}/500 caracteres
                </p>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  disabled={enviando}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || !calificacion}
                  className={`px-6 py-3 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 ${
                    enviando || !calificacion
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {enviando ? (
                    <>
                      <i className="pi pi-spinner animate-spin"></i>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="pi pi-check"></i>
                      Guardar Calificación
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <i className="pi pi-info-circle"></i>
              Información Importante
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• La calificación debe estar entre 0 y 5 puntos</li>
              <li>• Los comentarios son opcionales pero recomendados</li>
              <li>• Una vez guardada, la calificación no se puede modificar desde esta página</li>
              <li>• Serás redirigido al inicio después de guardar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
