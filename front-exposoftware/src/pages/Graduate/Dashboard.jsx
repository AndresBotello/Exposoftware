import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/Logo-unicesar.png";
import * as AuthService from "../../Services/AuthService";
import * as GraduateService from "../../Services/GraduateService";
import * as ProjectsService from "../../Services/ProjectsService";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function GraduateDashboard() {
  const navigate = useNavigate();
  const { user, getFullName, getInitials, logout, loading, setGraduateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [perfil, setPerfil] = useState(null);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [proyectos, setProyectos] = useState([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);

  // Estado para métricas del egresado
  const [metricasEgresado, setMetricasEgresado] = useState({
    totalProyectos: 0,
    proyectosActivos: 0,
    proyectosInactivos: 0
  });
  const [cargandoMetricas, setCargandoMetricas] = useState(false);

  // Datos para la gráfica de proyectos por nombre
  const proyectosPorNombreData = useMemo(() => {
    // Colores variados para los proyectos
    const coloresProyectos = [
      '#10B981', // Verde emerald
      '#059669', // Verde emerald oscuro
      '#047857', // Verde emerald más oscuro
      '#065F46', // Verde emerald muy oscuro
      '#3B82F6', // Azul
      '#2563EB', // Azul más oscuro
      '#1D4ED8', // Azul aún más oscuro
      '#F59E0B', // Amarillo/ámbar
      '#D97706', // Amarillo/ámbar oscuro
      '#B45309', // Amarillo/ámbar más oscuro
      '#92400E', // Amarillo/ámbar muy oscuro
      '#16A34A', // Verde adicional
      '#15803D', // Verde adicional oscuro
      '#166534', // Verde adicional muy oscuro
      '#14532D', // Verde adicional muy muy oscuro
      '#22C55E', // Verde lime
      '#16A34A', // Verde adicional
      '#DC2626', // Rojo
      '#B91C1C', // Rojo oscuro
      '#7C3AED', // Violeta
    ];

    return proyectos.map((proyecto, index) => ({
      name: proyecto.titulo_proyecto,
      value: 1, // Cada proyecto cuenta como 1
      color: coloresProyectos[index % coloresProyectos.length]
    }));
  }, [proyectos]);

  // Cargar perfil del egresado al montar
  useEffect(() => {
    const cargarPerfil = async () => {
      if (!user) {
        console.log('⏳ Esperando datos del usuario...');
        return;
      }
      try {
        setLoadingPerfil(true);
        console.log('📋 Cargando perfil completo del egresado...');
        // Usar SIEMPRE la función correcta que valida token y procesa datos
        const datos = await GraduateService.obtenerMiPerfilEgresado();
        setPerfil(datos);
        // Guardar en el contexto para acceso desde otras páginas
        setGraduateProfile(datos);
        console.log('✅ Perfil completo del egresado cargado:', datos);
      } catch (error) {
        console.error('❌ Error cargando perfil:', error);
        // Si falla, usar datos mínimos del contexto
        if (user) {
          setPerfil({
            nombre_completo: getFullName(),
            correo: user.correo || user.email || '',
            id_egresado: user.id_egresado || user.id_usuario || ''
          });
        }
      } finally {
        setLoadingPerfil(false);
      }
    };
    if (!loading) {
      cargarPerfil();
    }
  }, [user, loading, getFullName]);

  // Cargar proyectos del egresado
  useEffect(() => {
    const cargarProyectos = async () => {
      if (!user?.id_egresado) {
        console.log('⏳ Esperando ID del egresado...');
        return;
      }

      try {
        setLoadingProyectos(true);
        console.log('🔍 Cargando proyectos del egresado:', user.id_egresado);
        
        // Usar el mismo servicio que para estudiantes, ya que debería funcionar igual
        const misProyectos = await ProjectsService.obtenerMisProyectos(user.id_egresado);
        
        console.log('✅ Proyectos del egresado cargados:', misProyectos.length);
        setProyectos(misProyectos);
        
        // Calcular métricas del egresado
        const totalProyectos = misProyectos.length;
        const proyectosActivos = misProyectos.filter(p => p.activo === true || p.activo === 1).length;
        const proyectosInactivos = misProyectos.filter(p => p.activo === false || p.activo === 0).length;
        
        setMetricasEgresado({
          totalProyectos,
          proyectosActivos,
          proyectosInactivos
        });
        
        console.log('📊 Métricas del egresado calculadas:', {
          totalProyectos,
          proyectosActivos,
          proyectosInactivos
        });
      } catch (error) {
        console.error('❌ Error cargando proyectos del egresado:', error);
        setProyectos([]);
      } finally {
        setLoadingProyectos(false);
      }
    };

    if (!loading && user?.id_egresado) {
      cargarProyectos();
    }
  }, [user?.id_egresado, loading]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      try {
        await AuthService.logout();
        console.log('✅ Sesión cerrada exitosamente');
        navigate('/login');
      } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        // Aunque falle, redirigir al login
        navigate('/login');
      }
    }
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
                <h1 className="text-lg font-bold text-gray-900">Expo-software</h1>
                <p className="text-xs text-gray-500">Universidad Popular del Cesar</p>
              </div>
            </div>

    
            {/* Action button then user quick badge (avatar + name) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">
                    {loadingPerfil || loading ? '...' : getInitials()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {loadingPerfil || loading ? 'Cargando...' : (perfil?.nombre_completo || getFullName())}
                  </p>
                  <p className="text-xs text-gray-500">Egresado</p>
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
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "dashboard"
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <i className="pi pi-home text-base"></i>
                  Dashboard
                </button>
                <Link
                  to="/graduate/proyectos"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50`}
                >
                  <i className="pi pi-book text-base"></i>
                  Mis Proyectos
                </Link>
                <Link
                  to="/graduate/profile"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50`}
                >
                  <i className="pi pi-cog text-base"></i>
                  Configuración
                </Link>
              </nav>
            </div>

            {/* Botón de Postular Proyecto */}
            <Link 
              to="/graduate/register-project" 
              className="w-full inline-block text-center bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 hover:shadow-lg hover:scale-105 transition-all duration-300 transform animate-pulse hover:animate-none mt-4"
            >
              <span className="flex items-center justify-center gap-2">
                <i className="pi pi-plus-circle"></i>
                Postular Proyecto
              </span>
            </Link>

            {/* User Info Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold text-2xl">{getInitials()}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{perfil?.nombre_completo || getFullName()}</h3>
                <p className="text-sm text-gray-500">Egresado UPC</p>
                {perfil?.anio_graduacion && (
                  <p className="text-xs text-gray-400 mt-1">Promoción {perfil.anio_graduacion}</p>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 mb-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Bienvenido, {perfil?.primer_nombre || getFullName().split(' ')[0]}</h2>
              <p className="text-green-50 mb-4">
                Comparte tu experiencia profesional y proyectos innovadores con la comunidad universitaria
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <i className="pi pi-calendar"></i>
                  Egresado desde {perfil?.anio_graduacion || '2024'}
                </span>
                <span className="flex items-center gap-2">
                  <i className="pi pi-envelope"></i>
                  {perfil?.correo || user?.email || 'Sin correo'}
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Card 1 - Total Proyectos */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Total Proyectos</p>
                    <h3 className="text-3xl font-bold text-blue-900">
                      {loadingProyectos ? "..." : metricasEgresado.totalProyectos}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-blue-600">Presentados</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="pi pi-folder-open text-white text-xl"></i>
                  </div>
                </div>
              </div>

              {/* Card 2 - Proyectos Activos */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700 mb-1">Proyectos Activos</p>
                    <h3 className="text-3xl font-bold text-emerald-900">
                      {loadingProyectos ? "..." : metricasEgresado.proyectosActivos}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-emerald-600">En convocatoria</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="pi pi-check text-white text-xl"></i>
                  </div>
                </div>
              </div>

              {/* Card 3 - Proyectos Inactivos */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Proyectos Inactivos</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {loadingProyectos ? "..." : metricasEgresado.proyectosInactivos}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-gray-600">Finalizados</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="pi pi-pause text-white text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Convocatoria Activa */}
            {activeTab === "dashboard" && (
              <>
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Convocatoria para Egresados
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <i className="pi pi-calendar"></i>
                        Expo-software 2025
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Activa
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <i className="pi pi-briefcase text-green-600"></i>
                      Descripción
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Invitamos a los egresados de Ingeniería de Sistemas a compartir sus proyectos profesionales, 
                      desarrollos innovadores y experiencias en el sector tecnológico. Esta es una oportunidad única 
                      para conectar con la comunidad académica, inspirar a estudiantes actuales y fortalecer la red de alumni.
                    </p>
                  </div>


                </div>

                {/* Mis Proyectos */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <i className="pi pi-book text-green-600"></i>
                      Mis Proyectos
                    </h3>
                    <Link 
                      to="/graduate/proyectos"
                      className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                    >
                      Ver todos <i className="pi pi-arrow-right"></i>
                    </Link>
                  </div>

                  {loadingProyectos ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando proyectos...</p>
                    </div>
                  ) : proyectos.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="pi pi-book text-4xl text-gray-400"></i>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No tienes proyectos registrados</h4>
                      <p className="text-gray-600 mb-4">
                        Comparte tu experiencia profesional postulando tu primer proyecto
                      </p>
                      <Link 
                        to="/graduate/register-project"
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <i className="pi pi-plus"></i>
                        Postular Proyecto
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {proyectos.slice(0, 4).map(proyecto => {
                        // Mapear tipo_actividad a nombre legible
                        const tipoActividad = {
                          1: 'Proyecto (Exposoftware)',
                          2: 'Taller',
                          3: 'Ponencia',
                          4: 'Conferencia'
                        }[proyecto.tipo_actividad] || 'Tipo Desconocido';

                        // Formatear fecha
                        const fechaSubida = proyecto.fecha_subida 
                          ? new Date(proyecto.fecha_subida).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'Fecha no disponible';

                        return (
                          <div key={proyecto.id_proyecto} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-900 flex-1 line-clamp-2">
                                {proyecto.titulo_proyecto}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                                proyecto.activo 
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {proyecto.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>

                            <div className="space-y-2 text-xs text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <i className="pi pi-briefcase text-green-600"></i>
                                <span>{tipoActividad}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <i className="pi pi-calendar text-green-600"></i>
                                <span>{fechaSubida}</span>
                              </div>
                              {proyecto.id_estudiantes && (
                                <div className="flex items-center gap-2">
                                  <i className="pi pi-users text-green-600"></i>
                                  <span>{proyecto.id_estudiantes.length} participante{proyecto.id_estudiantes.length !== 1 ? 's' : ''}</span>
                                </div>
                              )}
                            </div>

                            <Link 
                              to="/graduate/proyectos"
                              className="w-full bg-green-600 text-white text-xs px-3 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <i className="pi pi-eye"></i>
                              Ver detalles
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {proyectos.length > 4 && (
                    <div className="text-center mt-4">
                      <Link 
                        to="/graduate/proyectos"
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Ver {proyectos.length - 4} proyecto{proyectos.length - 4 !== 1 ? 's' : ''} más →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Gráfica de Proyectos por Nombre */}
                {proyectos.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <i className="pi pi-chart-pie text-white text-sm"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Distribución de Proyectos</h3>
                        <p className="text-sm text-gray-600">Vista general de todos tus proyectos registrados</p>
                      </div>
                    </div>

                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={proyectosPorNombreData}
                            cx="50%"
                            cy="45%"
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {proyectosPorNombreData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [`Proyecto: ${name}`, '']}
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
                  </div>
                )}
              </>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
