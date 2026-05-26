import { useTeacherDashboard } from "../../hooks/Teacher/useTeacherDashboard";
import { TeacherHeader, TeacherSidebar } from "../../components/Teacher/TeacherLayout";

export default function TeacherDashboard() {
  const {
    user,
    getFullName,
    getInitials,
    loading,
    metricasProyectos,
    cargandoProyectos,
    mapasCargados,
    proyectos,
    pieChartData,
    lineasChartData,
    teachingLoad,
    myGroups,
    handleLogout,
    exportarGraficaComoImagen,
    exportarGraficaComoPDF,
    exportarReporteCompleto,
  } = useTeacherDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherHeader
        getInitials={getInitials}
        getFullName={getFullName}
        user={user}
        handleLogout={handleLogout}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          <TeacherSidebar
            activePage="dashboard"
            getInitials={getInitials}
            getFullName={getFullName}
            user={user}
          />

          {/* Contenido principal */}
          <main className="lg:col-span-3">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="pi pi-chart-line text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Bienvenido, {user?.nombres || "Docente"}
                  </h2>
                  <p className="text-gray-600">
                    Resumen completo de la convocatoria y proyectos
                  </p>
                </div>
              </div>
              <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
            </div>

            {/* Tarjetas de métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-700 mb-1">Aprobados</p>
                    <h3 className="text-3xl font-bold text-emerald-900">
                      {cargandoProyectos ? "..." : metricasProyectos.aprobados}
                    </h3>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="pi pi-check text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-700 mb-1">Pendientes</p>
                    <h3 className="text-3xl font-bold text-amber-900">
                      {cargandoProyectos ? "..." : metricasProyectos.pendientes}
                    </h3>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="pi pi-clock text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-700 mb-1">Reprobados</p>
                    <h3 className="text-3xl font-bold text-red-900">
                      {cargandoProyectos ? "..." : metricasProyectos.reprobados}
                    </h3>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="pi pi-times text-white text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-700 mb-1">Proyectos Asignados</p>
                    <h3 className="text-3xl font-bold text-purple-900">
                      {cargandoProyectos ? "..." : metricasProyectos.asignados}
                    </h3>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="pi pi-briefcase text-white text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón exportar reporte */}
            <div className="flex justify-end mb-4">
              <button
                onClick={exportarReporteCompleto}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <i className="pi pi-file-pdf"></i>
                Exportar Reporte Completo
              </button>
            </div>

            {/* Sección: Carga Académica */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <i className="pi pi-book text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Carga Académica</h3>
              </div>

              {cargandoProyectos ? (
                <div className="flex items-center justify-center p-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : teachingLoad.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teachingLoad.map((clase, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-blue-600 font-medium mb-1 uppercase">Materia</p>
                          <h4 className="text-base font-bold text-gray-900 mb-2">
                            {clase.nombre_materia || clase.codigo_materia || "Sin nombre"}
                          </h4>
                          <div className="flex gap-3 text-sm text-gray-700">
                            <span className="flex items-center gap-1">
                              <i className="pi pi-tag text-xs"></i>
                              {clase.codigo_materia}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="pi pi-users text-xs"></i>
                              Grupo {clase.nombre_grupo || clase.id_grupo || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i className="pi pi-check-circle text-blue-600"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <i className="pi pi-book text-4xl text-blue-300 mb-2"></i>
                  <p className="text-blue-700">No hay clases asignadas</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
