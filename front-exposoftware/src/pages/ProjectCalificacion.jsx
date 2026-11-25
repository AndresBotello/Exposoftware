import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerProyectoPorId } from "../Services/ProjectsService";
import { calificarProyectoAsistente, registrarEscaneoQR } from "../Services/TeacherService";
import * as AuthService from "../Services/AuthService";
import {
  CRITERIOS,
  NOTA_MAX,
  NOTA_MIN,
  aNumeroCriterio,
  calcularNotaIndividual,
  criteriosCompletos,
  criteriosVacios,
} from "../utils/calificacionCriterios";
import logo from "../assets/Logo-unicesar.png";

const rutaSegunRol = (rol) => {
  switch (rol) {
    case "estudiante":
      return "/student/dashboard";
    case "docente":
    case "profesor":
      return "/teacher/dashboard";
    case "administrador":
    case "admin":
      return "/admin/dashboard";
    case "egresado":
      return "/graduate/dashboard";
    default:
      return "/";
  }
};

export default function ProjectCalificacion() {
  const { id_proyecto } = useParams();
  const navigate = useNavigate();

  const [proyecto, setProyecto] = useState(null);
  const [valores, setValores] = useState(criteriosVacios);
  const [comentarios, setComentarios] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [exito, setExito] = useState(false);
  const [notaFinal, setNotaFinal] = useState(null);
  const escaneoRegistrado = useRef(false);

  // Enviar al login y volver a esta página después de iniciar sesión.
  // logout() vacía sessionStorage, así que se cierra la sesión ANTES de guardar
  // la ruta de retorno.
  const irALoginConRetorno = async () => {
    await AuthService.logout();
    sessionStorage.setItem("redirectAfterLogin", `/proyectos/${id_proyecto}/calificar`);
    navigate("/login");
  };

  useEffect(() => {
    // Verificar si el usuario está autenticado (token y datos de usuario)
    const tieneSesion = AuthService.getToken() && AuthService.getUserData();
    if (!tieneSesion) {
      irALoginConRetorno();
      return;
    }
    cargarProyecto();
    registrarEscaneo();
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

  // Escanear el QR cuenta como asistencia al evento. Se hace una sola vez por
  // visita y no bloquea el formulario: si falla, solo se muestra un aviso.
  const registrarEscaneo = async () => {
    if (escaneoRegistrado.current) return;
    escaneoRegistrado.current = true;
    try {
      await registrarEscaneoQR(id_proyecto);
    } catch (err) {
      if (err.status === 401) {
        await irALoginConRetorno();
        return;
      }
      setAviso(err.message || "No se pudo registrar tu asistencia al evento.");
    }
  };

  const cambiarCriterio = (clave, valor) => {
    setValores((prev) => ({ ...prev, [clave]: valor }));
    if (error) setError(null);
  };

  const notaEnVivo = calcularNotaIndividual(valores);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!criteriosCompletos(valores)) {
      setError(`Califica todos los criterios entre ${NOTA_MIN} y ${NOTA_MAX}`);
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      await calificarProyectoAsistente(id_proyecto, valores, comentarios.trim());
      setNotaFinal(notaEnVivo);
      setExito(true);
      setTimeout(() => {
        navigate(rutaSegunRol((AuthService.getUserRole() || "").toLowerCase()));
      }, 3000);
    } catch (err) {
      if (err.status === 401) {
        await irALoginConRetorno();
        return;
      }
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
            Nota final: <span className="font-bold text-emerald-600">{notaFinal}/5.00</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Serás redirigido al inicio en unos momentos...
          </p>
          <button
            onClick={() => navigate(rutaSegunRol((AuthService.getUserRole() || "").toLowerCase()))}
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
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <i className="pi pi-briefcase text-emerald-600 text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Calificar Proyecto</h2>
                  <p className="text-sm text-gray-600">Califica cada criterio de 0 a 5</p>
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
                        proyecto.estado === "aprobado"
                          ? "bg-green-100 text-green-800"
                          : proyecto.estado === "calificado"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {proyecto.estado?.charAt(0).toUpperCase() + proyecto.estado?.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {aviso && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-amber-800 text-sm flex items-center gap-2">
                  <i className="pi pi-info-circle"></i>
                  {aviso}
                </p>
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
              {CRITERIOS.map((criterio) => {
                const valor = valores[criterio.clave];
                const numero = aNumeroCriterio(valor);
                return (
                  <div key={criterio.clave}>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor={criterio.clave}
                        className="text-sm font-medium text-gray-700"
                      >
                        {criterio.nombre}{" "}
                        <span className="text-gray-400">({Math.round(criterio.peso * 100)}%)</span>
                        <span className="text-red-500"> *</span>
                      </label>
                      <input
                        id={criterio.clave}
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min={NOTA_MIN}
                        max={NOTA_MAX}
                        value={valor}
                        onChange={(e) => cambiarCriterio(criterio.clave, e.target.value)}
                        placeholder="0 – 5"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <input
                      type="range"
                      aria-label={`${criterio.nombre} (deslizador)`}
                      min={NOTA_MIN}
                      max={NOTA_MAX}
                      step="0.1"
                      value={numero ?? NOTA_MIN}
                      onChange={(e) => cambiarCriterio(criterio.clave, e.target.value)}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                );
              })}

              {/* Nota en vivo */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-900">Nota ponderada</span>
                <span className="text-2xl font-bold text-emerald-700">
                  {notaEnVivo !== null ? `${notaEnVivo.toFixed(2)} / 5.00` : "—"}
                </span>
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
                  maxLength="300"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {comentarios.length}/300 caracteres
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
                  disabled={enviando || !criteriosCompletos(valores)}
                  className={`px-6 py-3 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 ${
                    enviando || !criteriosCompletos(valores)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700"
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
              <li>• Cada criterio se califica de 0 a 5</li>
              <li>• La nota final pondera los criterios: contenido técnico 20%, organización 20%, diseño UI/UX 15%, utilidad de la idea 30% y comunicación 15%</li>
              <li>• Una vez guardada, la calificación no se puede modificar desde esta página</li>
              <li>• Serás redirigido al inicio después de guardar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
