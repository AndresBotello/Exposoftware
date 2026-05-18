import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-700 mb-1">Total proyectos</p>
                    <h3 className="text-3xl font-bold text-blue-900">
                      {loading ? "..." : metricasProyectos.total}
                    </h3>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="pi pi-folder-open text-white text-xl"></i>
                  </div>
                </div>
              </div>

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfica: Estado de Proyectos */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <i className="pi pi-chart-pie text-white text-sm"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Estado de Proyectos</h3>
                      <p className="text-sm text-gray-600">Distribución por calificación</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        exportarGraficaComoImagen("estado-proyectos-chart", "Estado_Proyectos")
                      }
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors duration-200"
                      title="Exportar como imagen"
                    >
                      <i className="pi pi-image text-lg"></i>
                    </button>
                    <button
                      onClick={() =>
                        exportarGraficaComoPDF(
                          "estado-proyectos-chart",
                          "Estado de Proyectos",
                          pieChartData
                        )
                      }
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200"
                      title="Exportar como PDF"
                    >
                      <i className="pi pi-file-pdf text-lg"></i>
                    </button>
                  </div>
                </div>

                {cargandoProyectos ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : pieChartData.length > 0 ? (
                  <div id="estado-proyectos-chart" className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} proyecto${value !== 1 ? "s" : ""}`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            fontSize: "14px",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={40}
                          formatter={(value, entry) => (
                            <span style={{ color: entry.color, fontWeight: "500" }}>
                              {value}: {entry.payload.value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <div className="text-center">
                      <i className="pi pi-chart-pie text-4xl text-gray-400 mb-2"></i>
                      <p className="text-gray-500 text-sm">No hay datos para mostrar</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Gráfica: Líneas de Investigación */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <i className="pi pi-sitemap text-white text-sm"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Líneas de Investigación</h3>
                      <p className="text-sm text-gray-600">Distribución por línea</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        exportarGraficaComoImagen(
                          "lineas-investigacion-chart",
                          "Lineas_Investigacion"
                        )
                      }
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200"
                      title="Exportar como imagen"
                    >
                      <i className="pi pi-image text-lg"></i>
                    </button>
                    <button
                      onClick={() =>
                        exportarGraficaComoPDF(
                          "lineas-investigacion-chart",
                          "Líneas de Investigación",
                          lineasChartData
                        )
                      }
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200"
                      title="Exportar como PDF"
                    >
                      <i className="pi pi-file-pdf text-lg"></i>
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <i className="pi pi-info-circle text-blue-600 mr-2"></i>
                  {mapasCargados ? (
                    <>
                      <strong>{lineasChartData.length}</strong> líneas •{" "}
                      <strong>{proyectos.length}</strong> proyectos
                    </>
                  ) : (
                    <>
                      <i className="pi pi-spin pi-spinner text-blue-600 mr-1"></i>
                      Cargando nombres de líneas...
                    </>
                  )}
                </p>

                {cargandoProyectos || !mapasCargados ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm text-gray-600">
                        {cargandoProyectos
                          ? "Cargando proyectos..."
                          : "Cargando nombres de líneas..."}
                      </p>
                    </div>
                  </div>
                ) : lineasChartData.length > 0 ? (
                  <div id="lineas-investigacion-chart" className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={lineasChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {lineasChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} proyecto${value !== 1 ? "s" : ""}`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                            fontSize: "14px",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={40}
                          formatter={(value, entry) => (
                            <span
                              style={{
                                color: entry.color,
                                fontWeight: "500",
                                fontSize: "13px",
                              }}
                            >
                              {value}: {entry.payload.value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <div className="text-center">
                      <i className="pi pi-sitemap text-4xl text-gray-400 mb-2"></i>
                      <p className="text-gray-500 text-sm">No hay líneas asignadas</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
