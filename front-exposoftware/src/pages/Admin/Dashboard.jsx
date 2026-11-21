import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/Logo-unicesar.png";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import * as AuthService from "../../Services/AuthService";
import DashboardService from "../../Services/DashboardService";
import { ProgressSpinner } from 'primereact/progressspinner';
import { Chart } from 'primereact/chart';
import ReportGenerator from "../../components/ReportGenerator";
import { confirmarCierreSesion } from "../../utils/confirmDialog.jsx";

const saludo = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const ACCESOS_RAPIDOS = [
  { to: '/admin/gestionar-eventos', label: 'Eventos', icono: 'pi-calendar', gradiente: 'from-teal-500 to-cyan-600' },
  { to: '/admin/proyectos', label: 'Proyectos', icono: 'pi-briefcase', gradiente: 'from-emerald-500 to-teal-600' },
  { to: '/admin/ranking', label: 'Ranking', icono: 'pi-star', gradiente: 'from-amber-500 to-orange-500' },
  { to: '/admin/certificados', label: 'Certificados', icono: 'pi-verified', gradiente: 'from-purple-500 to-indigo-600' },
  { to: '/admin/reportes', label: 'Reportes', icono: 'pi-file-pdf', gradiente: 'from-blue-500 to-blue-600' },
];

const TONOS = {
  teal: { caja: 'from-teal-50 to-white', nota: 'text-teal-600', icono: 'bg-teal-100 text-teal-600' },
  blue: { caja: 'from-blue-50 to-white', nota: 'text-blue-600', icono: 'bg-blue-100 text-blue-600' },
  purple: { caja: 'from-purple-50 to-white', nota: 'text-purple-600', icono: 'bg-purple-100 text-purple-600' },
};

function StatCard({ titulo, valor, nota, notaIcono, icono, tono, cargando, to }) {
  const t = TONOS[tono];

  if (cargando) {
    return (
      <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-3 w-32 rounded bg-gray-200"></div>
            <div className="h-8 w-16 rounded bg-gray-200"></div>
            <div className="h-3 w-24 rounded bg-gray-100"></div>
          </div>
          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`group block rounded-xl border border-gray-200 bg-gradient-to-br ${t.caja} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500`}
      aria-label={`${titulo}: ${valor}. Ver detalle`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-1 text-sm text-gray-600">{titulo}</p>
          <h3 className="text-3xl font-bold text-gray-900">{valor}</h3>
          <div className="mt-2 flex items-center gap-1">
            <i className={`pi ${notaIcono} text-xs ${t.nota}`}></i>
            <span className={`text-xs font-medium ${t.nota}`}>{nota}</span>
          </div>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${t.icono} transition-transform duration-300 group-hover:scale-110`}
        >
          <i className={`pi ${icono} text-xl`}></i>
        </div>
      </div>
    </Link>
  );
}

// Main Dashboard Component
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalProyectos: 0,
    totalEstudiantes: 0,
    totalProfesores: 0,
    proyectosPorLinea: {
      labels: [],
      valores: [],
      total: 0,
      proyectos: []
    }
  });
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(true);
  const [errorEstadisticas, setErrorEstadisticas] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  // Cargar datos del usuario autenticado
  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) {
      setUserData(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Cargar estadísticas del dashboard
  useEffect(() => {
    cargarEstadisticas();
    
    // Actualizar estadísticas cada 5 minutos
    const intervalo = setInterval(() => {
      cargarEstadisticas();
    }, 300000); // 300000ms = 5 minutos

    return () => clearInterval(intervalo);
  }, []);

  // Función para cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      setLoadingEstadisticas(true);
      setErrorEstadisticas(false);
      const stats = await DashboardService.getEstadisticasCompletas();
      setEstadisticas(stats);
      setUltimaActualizacion(new Date());
    } catch (error) {
      setErrorEstadisticas(true);
    } finally {
      setLoadingEstadisticas(false);
    }
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    if (await confirmarCierreSesion()) {
      try {
        await AuthService.logout();
        navigate('/login');
      } catch (error) {
      }
    }
  };

  // Funciones de exportación usando ReportGenerator
  const exportarGraficaComoImagen = (chartId, fileName) => {
    ReportGenerator.exportarGraficaComoImagen(chartId, fileName);
  };

  const exportarGraficaComoPDF = (chartId, title, data) => {
    ReportGenerator.exportarGraficaComoPDF(chartId, title, data, { name: getUserName() });
  };

  const exportarReporteCompleto = () => {
    const lineasData = estadisticas.proyectosPorLinea?.labels?.map((label, index) => ({
      name: label,
      value: estadisticas.proyectosPorLinea?.valores?.[index] || 0
    })) || [];

    ReportGenerator.exportarReporteCompleto({
      userInfo: {
        name: getUserName(),
        role: 'Administrador'
      },
      estadisticas: {
        totalProyectos: estadisticas.totalProyectos,
        totalEstudiantes: estadisticas.totalEstudiantes,
        totalProfesores: estadisticas.totalProfesores,
        proyectosPorLinea: lineasData
      },
      chartIds: ['proyectos-linea-chart'],
      chartTitles: ['Proyectos por Línea de Investigación'],
      chartData: [lineasData],
      institutionName: 'Universidad Popular del Cesar',
      eventName: 'Expo-software 2026'
    });
  };

  // Obtener nombre e iniciales del usuario
  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  // Datos derivados para exportar y listar (misma lógica que antes, calculada una sola vez)
  const lineasData =
    estadisticas.proyectosPorLinea?.labels?.map((label, index) => ({
      name: label,
      value: estadisticas.proyectosPorLinea?.valores?.[index] || 0
    })) || [];
  const proyectosRecientes = (estadisticas.proyectosPorLinea?.proyectos || []).slice(0, 5);

  // Configuración de la gráfica de dona (donut chart)
  const chartData = {
    labels: estadisticas.proyectosPorLinea?.labels || [],
    datasets: [
      {
        data: estadisticas.proyectosPorLinea?.valores || [],
        backgroundColor: [
          '#10B981', // Verde
          '#F59E0B', // Amarillo
          '#EF4444', // Rojo
          '#3B82F6', // Azul
          '#8B5CF6', // Púrpura
          '#EC4899'  // Rosa
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%' // Tamaño del agujero central (donut)
  };

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

            {/* User avatar and logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:block">{getUserName()}</span>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">{getUserInitials()}</span>
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
          
          {/* Sidebar Component */}
          <AdminSidebar 
            userName={getUserName()} 
            userRole="Administrador" 
          />

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Encabezado */}
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
                    <i className="pi pi-chart-line text-xl text-white"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      {saludo()}, {getUserName()}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Panel de Administración
                      {ultimaActualizacion && (
                        <span className="ml-2 text-gray-400">
                          · Actualizado a las{' '}
                          {ultimaActualizacion.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={cargarEstadisticas}
                    disabled={loadingEstadisticas}
                    className="flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2 font-medium text-teal-700 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Actualizar estadísticas"
                  >
                    <i className={`pi pi-refresh ${loadingEstadisticas ? 'pi-spin' : ''}`}></i>
                    <span className="hidden sm:inline">Actualizar</span>
                  </button>
                  <button
                    onClick={exportarReporteCompleto}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
                  >
                    <i className="pi pi-file-pdf"></i>
                    <span className="hidden sm:inline">Exportar reporte completo</span>
                    <span className="sm:hidden">Reporte</span>
                  </button>
                </div>
              </div>
              <div className="h-1 w-24 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600"></div>
            </div>

            {/* Aviso si falló la carga (antes se quedaban los ceros sin explicación) */}
            {errorEstadisticas && !loadingEstadisticas && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <p className="flex items-center gap-2 text-sm text-red-700">
                  <i className="pi pi-exclamation-triangle"></i>
                  No se pudieron cargar las estadísticas. Las cifras pueden estar incompletas.
                </p>
                <button
                  onClick={cargarEstadisticas}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <StatCard
                titulo="Total Proyectos Registrados"
                valor={estadisticas.totalProyectos}
                nota="Datos en tiempo real"
                notaIcono="pi-chart-line"
                icono="pi-briefcase"
                tono="teal"
                cargando={loadingEstadisticas}
                to="/admin/proyectos"
              />
              <StatCard
                titulo="Estudiantes Inscritos"
                valor={estadisticas.totalEstudiantes}
                nota="Usuarios activos"
                notaIcono="pi-users"
                icono="pi-users"
                tono="blue"
                cargando={loadingEstadisticas}
                to="/admin/estudiantes"
              />
              <StatCard
                titulo="Docentes Inscritos"
                valor={estadisticas.totalProfesores}
                nota="Profesores activos"
                notaIcono="pi-user"
                icono="pi-id-card"
                tono="purple"
                cargando={loadingEstadisticas}
                to="/admin/crear-profesor"
              />
            </div>

            {/* Accesos rápidos */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">Accesos rápidos</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {ACCESOS_RAPIDOS.map((a) => (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="group flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${a.gradiente} shadow transition-transform duration-200 group-hover:scale-110`}
                    >
                      <i className={`pi ${a.icono} text-white`}></i>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 sm:text-sm">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Analytics Power BI */}
            <div>
              <div className="mb-3">
                <h2 className="text-xl font-bold text-gray-900">Analytics en tiempo real</h2>
                <p className="text-sm text-gray-500">Gráficas interactivas desde Power BI</p>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <i className="pi pi-chart-bar text-teal-600"></i>
                    Dashboard Exposoftware
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                    En vivo
                  </span>
                </div>
                <div style={{ height: '541px', position: 'relative' }}>
                  <iframe
                    title="DASHBOARD  - SISTEMAS DE INFORMACION EXPOSOFTWARE"
                    src="https://app.powerbi.com/reportEmbed?reportId=498afa32-93b1-487f-9f01-d67b9297c30f&autoAuth=true&ctid=e2bf1c48-1dae-47ba-9808-67da61e2588d"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen={true}
                    style={{ border: 'none', display: 'block' }}
                  />
                </div>
              </div>
            </div>

            {/* Proyectos por línea de investigación */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600">
                    <i className="pi pi-chart-pie text-sm text-white"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Proyectos por línea de investigación</h3>
                    <p className="text-sm text-gray-500">
                      Distribución de {estadisticas.proyectosPorLinea?.total || 0} proyectos registrados
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportarGraficaComoImagen('proyectos-linea-chart', 'Proyectos_por_Linea')}
                    className="rounded-lg bg-teal-50 p-2 text-teal-600 transition-colors duration-200 hover:bg-teal-100"
                    title="Exportar como imagen"
                    aria-label="Exportar gráfica como imagen"
                  >
                    <i className="pi pi-image text-lg"></i>
                  </button>
                  <button
                    onClick={() => exportarGraficaComoPDF('proyectos-linea-chart', 'Proyectos por Línea de Investigación', lineasData)}
                    className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors duration-200 hover:bg-red-100"
                    title="Exportar como PDF"
                    aria-label="Exportar gráfica como PDF"
                  >
                    <i className="pi pi-file-pdf text-lg"></i>
                  </button>
                </div>
              </div>

              {loadingEstadisticas ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="mx-auto h-72 w-72 animate-pulse rounded-full bg-gray-100"></div>
                  <div className="space-y-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100"></div>
                    ))}
                  </div>
                </div>
              ) : estadisticas.proyectosPorLinea?.total > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Gráfica circular */}
                  <div className="flex items-center justify-center">
                    <div id="proyectos-linea-chart" style={{ width: '100%', maxWidth: '350px', height: '350px' }}>
                      <Chart type="doughnut" data={chartData} options={chartOptions} />
                    </div>
                  </div>

                  {/* Proyectos recientes */}
                  <div>
                    <h4 className="text-md mb-4 font-semibold text-gray-800">Proyectos recientes</h4>
                    <div className="space-y-3">
                      {proyectosRecientes.map((proyecto, index) => {
                        const nombreProyecto = proyecto.titulo_proyecto || 'Proyecto sin nombre';
                        const nombreLinea =
                          proyecto.id_linea_investigacion?.nombre ||
                          proyecto.linea_investigacion?.nombre ||
                          proyecto.nombre_linea ||
                          'Sin línea definida';
                        const nota = Number(proyecto.calificacion);
                        return (
                          <div
                            key={proyecto.id_proyecto || index}
                            className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                          >
                            <div className="mt-1 flex-shrink-0">
                              <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900" title={nombreProyecto}>
                                {nombreProyecto}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="inline-flex items-center rounded bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800">
                                  {nombreLinea}
                                </span>
                                {Number.isFinite(nota) && nota > 0 && (
                                  <span className="text-xs text-gray-500">⭐ {nota.toFixed(1)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {estadisticas.proyectosPorLinea?.total > 5 && (
                      <div className="mt-4 text-center">
                        <Link
                          to="/admin/proyectos"
                          className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
                        >
                          Ver todos los proyectos
                          <i className="pi pi-arrow-right text-xs"></i>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-gray-500">
                  <div className="text-center">
                    <i className="pi pi-folder mb-3 text-4xl text-gray-400"></i>
                    <p className="font-medium">No hay proyectos registrados</p>
                    <p className="text-sm">Los proyectos aparecerán aquí una vez sean creados</p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
