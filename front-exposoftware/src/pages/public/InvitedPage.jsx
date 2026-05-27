import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ProjectCard from "../../components/ProjectCard";
import ProjectDetailsModal from "../../components/ProjectDetailsModal";
import EventosService from "../../Services/EventosService";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../utils/constants";
import logo from "../../assets/Logo-unicesar.png";

export default function InvitedPage() {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventoInfo, setEventoInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Error en logout:", err);
      navigate("/");
    }
  };

  // Redirigir a home si el usuario se desautentica
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Cargar proyectos públicos del evento
  useEffect(() => {
    const cargarProyectosPublicos = async () => {
      try {
        setLoadingProjects(true);
        setError(null);

        // Obtener todos los eventos primero para obtener el id_evento si no viene en params
        let idEvento = eventoId;
        if (!idEvento) {
          console.log('📅 Obteniendo evento actual...');
          const todosEventos = await EventosService.obtenerEventos();
          if (todosEventos && todosEventos.length > 0) {
            idEvento = todosEventos[0].id_evento;
            setEventoInfo(todosEventos[0]);
          } else {
            throw new Error('No hay eventos disponibles');
          }
        }

        console.log('🔍 Cargando proyectos públicos del evento:', idEvento);

        const response = await fetch(
          `${API_BASE_URL}/api/v1/eventos/${idEvento}/proyectos`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        );

        if (response.ok) {
          const data = await response.json();
          const proyectos = data.data || [];
          setProjects(proyectos);
          console.log('✅ Proyectos públicos cargados:', proyectos.length);

          // Si no tenemos evento info, usar la del primer proyecto
          if (!eventoInfo && proyectos.length > 0) {
            setEventoInfo({
              id_evento: proyectos[0].id_evento,
              nombre_evento: proyectos[0].nombre_evento
            });
          }
        } else {
          throw new Error('Error al obtener proyectos públicos');
        }
      } catch (err) {
        console.error('❌ Error cargando proyectos públicos:', err);
        setError(err.message || 'Error al cargar los proyectos');
      } finally {
        setLoadingProjects(false);
      }
    };

    cargarProyectosPublicos();
  }, [eventoId]);

  const handleViewDetails = async (project) => {
    setShowModal(true);
    let projectEnriched = { ...project };
    setSelectedProject(projectEnriched);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  // Filtrar proyectos por búsqueda
  const filteredProjects = projects.filter(project =>
    project.titulo_proyecto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.nombre_materia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.nombre_grupo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <img src={logo} alt="Logo" className="w-8 sm:w-10" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Expo-software</h1>
                <p className="text-xs text-gray-500">UPC - Invitado</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold">Expo-software</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <i className="pi pi-sign-out"></i>
                  <span className="hidden sm:inline">Salir</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  <i className="pi pi-sign-in"></i>
                  <span className="hidden sm:inline">Ingresar</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Card de Evento */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="pi pi-calendar text-emerald-600"></i>
                Evento
              </h3>
              {eventoInfo ? (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {eventoInfo.nombre_evento}
                  </p>
                  <p className="text-xs text-gray-500">
                    {projects.length} proyecto{projects.length !== 1 ? 's' : ''} publicado{projects.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Cargando evento...</p>
              )}
            </div>

            {/* Card de Información */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-emerald-100">
                <i className="pi pi-eye text-emerald-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-center text-gray-900 mb-1">Invitado</h3>
              <p className="text-sm text-center text-gray-500">Acceso público a proyectos</p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Título y Descripción */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Proyectos Públicos
              </h2>
              <p className="text-gray-600">
                Explora los proyectos presentados en este evento
              </p>
            </div>

            {/* Barra de búsqueda */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center gap-3">
                <i className="pi pi-search text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Buscar por título, materia o grupo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="pi pi-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Mensaje de carga */}
            {loadingProjects && (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando proyectos...</p>
                </div>
              </div>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 flex items-center gap-2">
                  <i className="pi pi-exclamation-circle"></i>
                  {error}
                </p>
              </div>
            )}

            {/* Proyectos */}
            {!loadingProjects && filteredProjects.length > 0 && (
              <>
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Mostrando <span className="font-semibold">{filteredProjects.length}</span> de{" "}
                      <span className="font-semibold">{projects.length}</span> proyectos
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id_proyecto}
                      proyecto={project}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Sin proyectos */}
            {!loadingProjects && filteredProjects.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <i className="pi pi-inbox text-5xl text-gray-300 mb-4 block"></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {projects.length === 0 ? "No hay proyectos disponibles" : "No se encontraron proyectos"}
                </h3>
                <p className="text-gray-600">
                  {projects.length === 0
                    ? "Aún no hay proyectos publicados en este evento."
                    : "Intenta con otros términos de búsqueda."}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal de detalles */}
      <ProjectDetailsModal
        selectedProject={selectedProject}
        eventoInfo={eventoInfo}
        user={null}
        onClose={closeModal}
        onDownloadCertificado={null}
        onDownloadTodosCertificados={null}
        token={null}
      />
    </div>
  );
}
