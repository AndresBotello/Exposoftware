import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { obtenerMiPerfilInvitado } from "../../Services/GuestService";
import { SECTORES } from "../../data/sectores";
import { obtenerProyectos } from "../../Services/ProjectsService";
import ResearchLinesService from "../../Services/ResearchLinesService";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import logo from "../../assets/Logo-unicesar.png";
import ReportGenerator from "../../components/ReportGenerator";
import ProjectsGrid from "../../components/ProjectsGrid";
import { confirmarCierreSesion } from "../../utils/confirmDialog.jsx";
import { API_BASE_URL } from "../../utils/constants";
import { CalendarDays, MapPin } from "lucide-react";

const ESTADOS_EVENTO = {
  en_curso: "En curso",
  inscripciones_abiertas: "Inscripciones abiertas",
  inscripciones_cerradas: "Inscripciones cerradas",
};

const formatearFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    : "";

export default function GuestDashboard() {
  const { logout, user, setGuestProfile } = useAuth();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados para las gráficas
  const [todosProyectos, setTodosProyectos] = useState([]);
  const [lineasInvestigacion, setLineasInvestigacion] = useState([]);
  const [cargandoGraficas, setCargandoGraficas] = useState(true);

  // Eventos activos para la sección de evento.
  const [eventosActivos, setEventosActivos] = useState([]);
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState(null);
  const [cargandoEventos, setCargandoEventos] = useState(true);
  const eventoActivo =
    eventosActivos.find((e) => e.id_evento === eventoSeleccionadoId) || eventosActivos[0] || null;

  useEffect(() => {
    cargarPerfil();
  }, []);

  // Cargar eventos activos (si hay uno, se muestra por defecto)
  useEffect(() => {
    const cargarEventosActivos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/eventos/en-curso`, { credentials: "include" });
        if (!response.ok) throw new Error("No se pudieron cargar los eventos");
        const body = await response.json();
        setEventosActivos(body.data || []);
      } catch (err) {
        console.error("Error cargando eventos activos:", err);
        setEventosActivos([]);
      } finally {
        setCargandoEventos(false);
      }
    };
    cargarEventosActivos();
  }, []);

  // Cargar datos para gráficas al montar el componente
  useEffect(() => {
    cargarDatosGraficas();
  }, []);

  const cargarPerfil = async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await obtenerMiPerfilInvitado();
      setPerfil(datos);

      // Guardar en el contexto de autenticación para acceso desde otras páginas
      setGuestProfile(datos);

    } catch (err) {
      setError(err.message);
      // Si no hay token o falla la autenticación, redirigir al login
      if (err.message.includes('token') || err.message.includes('Sesión')) {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } finally {
      setCargando(false);
    }
  };

  // Cargar datos para las gráficas
  const cargarDatosGraficas = async () => {
    try {
      setCargandoGraficas(true);
      
      // Cargar todos los proyectos
      const proyectos = await obtenerProyectos();
      setTodosProyectos(proyectos);
      
      // Cargar líneas de investigación
      const lineas = await ResearchLinesService.obtenerLineas();
      setLineasInvestigacion(lineas);
    } catch (error) {
    } finally {
      setCargandoGraficas(false);
    }
  };

  const handleLogout = async () => {
    if (await confirmarCierreSesion()) {
      logout();
      navigate("/login");
    }
  };

  // Funciones de exportación usando ReportGenerator
  const exportarGraficaComoImagen = (chartId, fileName) => {
    ReportGenerator.exportarGraficaComoImagen(chartId, fileName);
  };

  const exportarGraficaComoPDF = (chartId, title, data) => {
    ReportGenerator.exportarGraficaComoPDF(chartId, title, data, {
      name: `${invitadoData.nombres} ${invitadoData.apellidos}`,
      company: invitadoData.nombre_empresa,
      sector: invitadoData.sector_nombre
    });
  };

  const exportarReporteCompleto = () => {
    ReportGenerator.exportarReporteCompleto({
      userInfo: {
        name: `${invitadoData.nombres} ${invitadoData.apellidos}`,
        role: 'Invitado',
        company: invitadoData.nombre_empresa,
        sector: invitadoData.sector_nombre,
        email: invitadoData.correo
      },
      estadisticas: {
        totalProyectos: todosProyectos.length,
        lineasInvestigacion: lineasInvestigacion.length,
        tiposProyecto: tiposProyectosData.length
      },
      chartIds: ['tipos-proyectos-chart', 'proyectos-linea-chart'],
      chartTitles: ['Tipos de Proyectos', 'Proyectos por Línea de Investigación'],
      chartData: [tiposProyectosData, proyectosPorLineaData],
      institutionName: 'Universidad Popular del Cesar',
      eventName: 'Expo-software 2026'
    });
  };

  // Catálogos
  const sectores = SECTORES;

  // Datos del invitado - ahora desde el perfil real
  const invitadoData = perfil || {
    id_invitado: "Cargando...",
    nombres: user?.primer_nombre || "Invitado",
    apellidos: user?.primer_apellido || "Usuario",
    nombre_empresa: "Cargando...",
    id_sector: "...",
    sector_nombre: sectores.find(s => s.id.toString() === perfil?.id_sector)?.nombre || "No especificado",
    correo: user?.correo || user?.email || "",
    rol: user?.rol || "Invitado"
  };

  // Datos para la gráfica de tipos de proyectos
  const tiposProyectosData = todosProyectos.reduce((acc, proyecto) => {
    const tipo = proyecto.tipo_actividad || 'Sin tipo';
    const tipoNombre = {
      1: 'Proyecto (Exposoftware)',
      2: 'Taller',
      3: 'Ponencia',
      4: 'Conferencia'
    }[tipo] || 'Otro';
    
    const existing = acc.find(item => item.name === tipoNombre);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: tipoNombre, value: 1 });
    }
    return acc;
  }, []);

  // Datos para la gráfica de proyectos por línea de investigación
  const proyectosPorLineaData = lineasInvestigacion.map(linea => {
    // Contar proyectos que pertenecen a esta línea
    const proyectosEnLinea = todosProyectos.filter(proyecto => {
      // Comparar el codigo_linea del proyecto con el codigo_linea de la línea
      return proyecto.codigo_linea === linea.codigo_linea;
    }).length;
    
    return {
      name: linea.nombre_linea,
      value: proyectosEnLinea,
      codigo: linea.codigo_linea
    };
  }).filter(item => item.value > 0); // Solo mostrar líneas con proyectos

const coloresTipos = [
  '#228B22', // verde oscuro aproximado al Pantone 362
  '#32CD32', // verde medio como Pantone 356 / 364
  '#7CFC00', // verde claro / limón-verde para variar
  '#F9E03B', // amarillo para el elemento humano (cabeza del símbolo) — aproximado
  '#006400'  // verde aún más oscuro para contraste
];

// Colores para líneas (gama complementaria / secundaria)
const coloresLineas = [
  '#197e60ff', // verde profundo
  '#4CAF50', // verde más brillante
  '#D4E157', // amarillo verdoso suave
  '#FDD835', // amarillo más fuerte
  '#8BC34A', // verde lima suave
  '#388E3C', // verde hoja
  '#AEEA00'  // verde-lima muy claro
];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo Unicesar" className="w-10 h-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Expo-software </h1>
                <p className="text-xs text-gray-500">Universidad Popular del Cesar</p>
              </div>
            </div>

            {/* User avatar and info */}
            <div className="flex items-center gap-4">

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:block">
                  {invitadoData.nombres} {invitadoData.apellidos}
                </span>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">
                    {invitadoData.nombres.charAt(0)}{invitadoData.apellidos.charAt(0)}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
              >
                <i className="pi pi-sign-out"></i>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <nav className="space-y-1">
                <Link
                  to="/guest/dashboard"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-green-50 text-green-700"
                >
                  <i className="pi pi-home text-base"></i>
                  Dashboard
                </Link>
                <Link
                  to="/guest/proyectos"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
                >
                  <i className="pi pi-book text-base"></i>
                  Ver Proyectos
                </Link>
                <Link
                  to="/guest/profile"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50"
                >
                  <i className="pi pi-cog text-base"></i>
                  Configuración
                </Link>
              </nav>
            </div>

            {/* User Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-700 font-bold text-2xl">
                    {invitadoData.nombres.charAt(0)}{invitadoData.apellidos.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">
                  {invitadoData.nombres} {invitadoData.apellidos}
                </h3>
                <p className="text-sm text-green-600 font-medium mt-1 flex items-center justify-center gap-1">
                  <i className="pi pi-user"></i>
                  {invitadoData.rol}
                </p>
              </div>
              
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex items-start gap-2">
                  <i className="pi pi-building text-green-600 text-sm mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Empresa/Institución</p>
                    <p className="text-sm text-gray-900 font-medium">{invitadoData.nombre_empresa}</p>
                  </div>
                </div>
                
                      <div className="flex items-start gap-2">
                        <i className="pi pi-tag text-green-600 text-sm mt-0.5"></i>
                        <div className="flex-1">
                          <p className="text-xs text-black-500">Sector</p>
                          <p className="text-sm text-black font-semibold capitalize">
                            {invitadoData.sector_nombre}
                          </p>
                        </div>
                      </div>
                
                <div className="flex items-start gap-2">
                  <i className="pi pi-envelope text-green-600 text-sm mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Correo</p>
                    <p className="text-sm text-gray-900 font-medium break-all">{invitadoData.correo}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            
            {/* Estado de carga */}
            {cargando && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center mb-6">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600">Cargando información del perfil...</p>
              </div>
            )}

            {/* Error */}
            {error && !cargando && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <i className="pi pi-exclamation-triangle text-red-600 text-xl"></i>
                  <div>
                    <h3 className="text-sm font-semibold text-red-900">Error al cargar perfil</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Welcome Section - Solo si hay datos */}
            {!cargando && perfil && (
              <>
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 mb-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">
                      ¡Bienvenido, {invitadoData.nombres}!
                    </h2>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                      👤 {invitadoData.rol}
                    </span>
                  </div>
                  <p className="text-green-50 mb-2">
                    Explora los increíbles proyectos de nuestros estudiantes en Expo-software 2026
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <i className="pi pi-building"></i>
                      <span>{invitadoData.nombre_empresa || 'No especificado'}</span>
                    </div>
                      <div className="flex items-start gap-2">
                        <i className="pi pi-tag text-black-600 text-sm mt-0.5"></i>
                        <div className="flex-1">
                          <p className="text-xs text-black-500">Sector</p>
                          <p className="text-sm text-black font-semibold capitalize">
                            {invitadoData.sector_nombre}
                          </p>
                        </div>
                      </div>
                  </div>
                </div>

              </>
            )}

            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Total Proyectos</p>
                    <h3 className="text-3xl font-bold text-blue-900">
                      {cargandoGraficas ? "..." : todosProyectos.length}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-blue-600">Registrados</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="pi pi-folder-open text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">Líneas Activas</p>
                    <h3 className="text-3xl font-bold text-green-900">
                      {cargandoGraficas ? "..." : lineasInvestigacion.length}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-green-600">De investigación</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="pi pi-sitemap text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Tipos de Proyecto</p>
                    <h3 className="text-3xl font-bold text-purple-900">
                      {cargandoGraficas ? "..." : tiposProyectosData.length}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-purple-600">Categorías</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="pi pi-tags text-white text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón Exportar Reporte Completo */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={exportarReporteCompleto}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <i className="pi pi-file-pdf"></i>
                    Exportar Reporte Completo
                  </button>
                </div>

            {/* Gráficas de Estadísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              
              {/* Gráfica de Tipos de Proyectos */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <i className="pi pi-chart-pie text-white text-sm"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Tipos de Proyectos</h3>
                      <p className="text-sm text-gray-600">Distribución por tipo de actividad</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportarGraficaComoImagen('tipos-proyectos-chart', 'Tipos_Proyectos')}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200"
                      title="Exportar como imagen"
                    >
                      <i className="pi pi-image text-lg"></i>
                    </button>
                    <button
                      onClick={() => exportarGraficaComoPDF('tipos-proyectos-chart', 'Tipos de Proyectos', tiposProyectosData)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200"
                      title="Exportar como PDF"
                    >
                      <i className="pi pi-file-pdf text-lg"></i>
                    </button>
                  </div>
                </div>

                {cargandoGraficas ? (
                  <div className="flex justify-center items-center h-80">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : tiposProyectosData.length > 0 ? (
                  <div id="tipos-proyectos-chart" className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tiposProyectosData}
                          cx="50%"
                          cy="45%"
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => percent > 0.5 ? name : `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {tiposProyectosData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={coloresTipos[index % coloresTipos.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} proyecto${value !== 1 ? 's' : ''}`, name]}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                            fontSize: '12px'
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value, entry) => (
                            <span style={{ color: entry.color, fontWeight: '500', fontSize: '12px' }}>
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="pi pi-chart-pie text-4xl text-gray-300 mb-2"></i>
                    <p className="text-gray-500 text-sm">No hay datos disponibles</p>
                  </div>
                )}
              </div>

              {/* Gráfica de Proyectos por Línea de Investigación */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <i className="pi pi-chart-pie text-white text-sm"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Proyectos por Línea</h3>
                      <p className="text-sm text-gray-600">Distribución por línea de investigación</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportarGraficaComoImagen('proyectos-linea-chart', 'Proyectos_por_Linea')}
                      className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors duration-200"
                      title="Exportar como imagen"
                    >
                      <i className="pi pi-image text-lg"></i>
                    </button>
                    <button
                      onClick={() => exportarGraficaComoPDF('proyectos-linea-chart', 'Proyectos por Línea de Investigación', proyectosPorLineaData)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200"
                      title="Exportar como PDF"
                    >
                      <i className="pi pi-file-pdf text-lg"></i>
                    </button>
                  </div>
                </div>

                {cargandoGraficas ? (
                  <div className="flex justify-center items-center h-80">
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : proyectosPorLineaData.length > 0 ? (
                  <div id="proyectos-linea-chart" className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={proyectosPorLineaData}
                          cx="50%"
                          cy="45%"
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {proyectosPorLineaData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={coloresLineas[index % coloresLineas.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} proyecto${value !== 1 ? 's' : ''}`, name]}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                            fontSize: '14px'
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={60}
                          formatter={(value, entry) => (
                            <span style={{ color: entry.color, fontWeight: '500', fontSize: '12px' }}>
                              {value.length > 20 ? `${value.substring(0, 20)}...` : value}
                            </span>
                          )}
                          wrapperStyle={{ paddingTop: '20px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="pi pi-chart-pie text-4xl text-gray-300 mb-2"></i>
                    <p className="text-gray-500 text-sm">No hay datos disponibles</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sección de Proyectos en Tarjetas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <i className="pi pi-briefcase text-white text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Explora Todos los Proyectos</h3>
                    <p className="text-sm text-gray-600">Descubre las iniciativas de nuestros estudiantes</p>
                  </div>
                </div>
              </div>
              
              <ProjectsGrid
                projects={todosProyectos}
                loading={cargandoGraficas}
                error={null}
                columns={3}
                onProjectClick={(project) => {
                  // Aquí puedes agregar funcionalidad para ver detalles del proyecto
                }}
              />
            </div>

            {/* Evento activo */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Evento activo</h3>
                {eventosActivos.length > 1 && (
                  <select
                    value={eventoActivo?.id_evento || ""}
                    onChange={(e) => setEventoSeleccionadoId(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                    aria-label="Seleccionar evento activo"
                  >
                    {eventosActivos.map((evento) => (
                      <option key={evento.id_evento} value={evento.id_evento}>
                        {evento.nombre_evento}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {cargandoEventos ? (
                <p className="text-sm text-gray-500">Cargando evento...</p>
              ) : !eventoActivo ? (
                <p className="text-sm text-gray-500">No hay eventos activos en este momento.</p>
              ) : (
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{eventoActivo.nombre_evento}</h4>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-green-700" aria-hidden="true" />
                      {formatearFecha(eventoActivo.fecha_inicio)} – {formatearFecha(eventoActivo.fecha_fin)}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-700" aria-hidden="true" />
                      {eventoActivo.lugar}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-0.5 text-xs font-semibold text-green-700">
                      {ESTADOS_EVENTO[eventoActivo.estado] || eventoActivo.estado}
                    </span>
                  </div>
                  {eventoActivo.descripcion && (
                    <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {eventoActivo.descripcion}
                    </p>
                  )}
                </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}