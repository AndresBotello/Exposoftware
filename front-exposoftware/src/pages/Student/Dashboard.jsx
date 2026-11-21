import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useStudentMetrics } from "../../hooks/Student/useStudentMetrics";
import StudentHeader from "../../components/Student/StudentHeader";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentLayout from "../../components/Student/StudentLayout";
import ReportGenerator from "../../components/ReportGenerator";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { EVENTO_TODOS } from "../../utils/eventoActual";
import html2canvas from "html2canvas";

/* ------------------------------------------------------------------ */
/* Componentes de presentación.                                        */
/* Antes se definían dentro del render y se volvían a montar en cada   */
/* actualización (parpadeo en las gráficas); ahora viven fuera.        */
/* ------------------------------------------------------------------ */

const saludo = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
};

function MetricCard({ title, value, subtitle, icon, gradient, bgColor, barColor, porcentaje, cargando, to }) {
  if (cargando) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-9 w-14 rounded bg-gray-200" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-gray-200" />
        </div>
        <div className="h-2 rounded-full bg-gray-200" />
      </div>
    );
  }

  const contenido = (
    <>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium opacity-90">{title}</p>
            <h3 className="text-4xl font-bold mt-2">{value}</h3>
          </div>
          <div
            className={`${gradient} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            <i className={`pi ${icon} text-white text-lg`}></i>
          </div>
        </div>
        {porcentaje !== null && (
          <div className="mb-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
              <div
                className={`h-full rounded-full ${barColor} transition-all duration-700`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
        )}
        <p className="text-xs font-semibold opacity-75">
          {subtitle}
          {porcentaje !== null ? ` · ${porcentaje}%` : ""}
        </p>
      </div>
    </>
  );

  const clases = `group ${bgColor} block rounded-2xl border p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`;

  return to ? (
    <Link to={to} className={clases} aria-label={`${title}: ${value}. Ver mis proyectos`}>
      {contenido}
    </Link>
  ) : (
    <div className={clases}>{contenido}</div>
  );
}

function ChartComponent({ title, icon, data, chartId, exportFn, cargando }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
            <i className={`pi ${icon} text-white`}></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <button
          onClick={() => exportFn(chartId, title)}
          disabled={cargando || data.length === 0}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Descargar como imagen"
          aria-label={`Descargar ${title} como imagen`}
        >
          <i className="pi pi-download text-gray-600"></i>
        </button>
      </div>

      {cargando ? (
        <div className="h-72 animate-pulse rounded-xl bg-gray-100" />
      ) : data.length > 0 ? (
        <div id={chartId} className="bg-white">
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="88%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} proyecto${v !== 1 ? "s" : ""}`, "Cantidad"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{total}</span>
              <span className="text-xs text-gray-500">proyecto{total !== 1 ? "s" : ""}</span>
            </div>
          </div>

          <ul className="mt-4 max-h-40 space-y-1.5 overflow-y-auto pr-1">
            {data.map((d) => (
              <li
                key={d.name}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2 text-gray-700">
                  <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="truncate" title={d.name}>
                    {d.name}
                  </span>
                </span>
                <span className="ml-3 font-semibold text-gray-900">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="h-72 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center">
          <i className={`pi ${icon} mb-2 text-4xl text-gray-300`}></i>
          <p className="text-sm text-gray-500">Aún no hay datos para esta gráfica</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, getFullName, getInitials, logout, loading } = useAuth();
  const {
    metricasEstudiante,
    cargandoMetricas,
    proyectosPorMateriaData,
    proyectosPorSublineaData,
    eventosDisponibles,
    selectedEvento,
  } = useStudentMetrics(user);
  const eventoSel = eventosDisponibles.find((e) => e.id === String(selectedEvento));

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );

  const exportChartImage = async (chartId, title) => {
    try {
      const element = document.getElementById(chartId);
      if (!element) {
        alert("Gráfica no encontrada");
        return;
      }
      const canvas = await html2canvas(element, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.download = `${title}_${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    } catch (error) {
      alert("Error al exportar la imagen");
    }
  };

  const exportFullReport = async () => {
    try {
      await ReportGenerator.exportarReporteCompleto({
        userInfo: { name: getFullName(), role: "Estudiante", email: user?.correo },
        estadisticas: {
          totalProyectos: metricasEstudiante?.totalProyectos,
          aprobados: metricasEstudiante?.proyectosAprobados,
          reprobados: metricasEstudiante?.proyectosReprobados,
          pendientes: metricasEstudiante?.proyectosPendientes,
        },
        chartIds: ["chart-materias", "chart-sublineas"],
        chartTitles: ["Proyectos por Materia", "Sublíneas de Investigación"],
        chartData: [proyectosPorMateriaData, proyectosPorSublineaData],
      });
    } catch (error) {
    }
  };

  const total = metricasEstudiante?.totalProyectos || 0;
  const aprobados = metricasEstudiante?.proyectosAprobados || 0;
  const pendientes = metricasEstudiante?.proyectosPendientes || 0;
  const reprobados = metricasEstudiante?.proyectosReprobados || 0;
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const sinProyectos = !cargandoMetricas && total === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <StudentHeader user={user} getFullName={getFullName} getInitials={getInitials} logout={logout} />
      <StudentLayout>
        <StudentSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          getInitials={getInitials}
          getFullName={getFullName}
        />
        <main className="lg:col-span-3">
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Bienvenida */}
              <div
                className="relative overflow-hidden rounded-2xl border border-emerald-200 p-6 text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, rgba(12, 183, 106, 0.95) 0%, rgba(12, 183, 106, 0.85) 100%)" }}
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-12 right-24 h-28 w-28 rounded-full bg-white/10"></div>
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                      <i className="pi pi-chart-bar text-2xl"></i>
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                        {saludo()}
                        {user?.nombres ? `, ${user.nombres}` : ""}
                      </h2>
                      <p className="text-white/80">XXIII Feria Tecnológica Exposoftware · UPC</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/student/register-project"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow transition hover:bg-emerald-50"
                    >
                      <i className="pi pi-plus"></i>
                      Registrar proyecto
                    </Link>
                    <Link
                      to="/student/proyectos"
                      className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/25"
                    >
                      <i className="pi pi-folder-open"></i>
                      Mis proyectos
                    </Link>
                  </div>
                </div>
              </div>

              {/* Estado vacío o aviso de pendientes */}
              {sinProyectos && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
                      <i className="pi pi-lightbulb text-lg text-emerald-600"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-900">
                        {selectedEvento === EVENTO_TODOS || !eventoSel
                          ? "Aún no has inscrito proyectos"
                          : `Aún no tienes proyectos en ${eventoSel.nombre}`}
                      </p>
                      <p className="text-sm text-emerald-700">
                        Registra tu proyecto para que aparezca aquí con su estado y calificación.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/student/register-project"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
                  >
                    Inscribir mi proyecto <i className="pi pi-arrow-right text-xs"></i>
                  </Link>
                </div>
              )}
              {!cargandoMetricas && pendientes > 0 && (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <i className="pi pi-clock text-amber-600"></i>
                  </div>
                  <p className="text-sm text-amber-900">
                    Tienes <span className="font-semibold">{pendientes}</span> proyecto{pendientes !== 1 ? "s" : ""} en
                    proceso de evaluación.
                  </p>
                </div>
              )}

              {/* Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Proyectos"
                  value={total}
                  subtitle="Inscritos en plataforma"
                  icon="pi-folder"
                  gradient="bg-gradient-to-br from-blue-600 to-blue-700"
                  bgColor="bg-blue-50 border-blue-200 text-blue-900"
                  porcentaje={null}
                  cargando={cargandoMetricas}
                  to="/student/proyectos"
                />
                <MetricCard
                  title="Aprobados"
                  value={aprobados}
                  subtitle="Calificación ≥ 3.0"
                  icon="pi-check-circle"
                  gradient="bg-gradient-to-br from-emerald-600 to-emerald-700"
                  bgColor="bg-emerald-50 border-emerald-200 text-emerald-900"
                  barColor="bg-emerald-500"
                  porcentaje={pct(aprobados)}
                  cargando={cargandoMetricas}
                />
                <MetricCard
                  title="Pendientes"
                  value={pendientes}
                  subtitle="En proceso de evaluación"
                  icon="pi-clock"
                  gradient="bg-gradient-to-br from-amber-600 to-amber-700"
                  bgColor="bg-amber-50 border-amber-200 text-amber-900"
                  barColor="bg-amber-500"
                  porcentaje={pct(pendientes)}
                  cargando={cargandoMetricas}
                />
                <MetricCard
                  title="Reprobados"
                  value={reprobados}
                  subtitle="Calificación < 3.0"
                  icon="pi-times-circle"
                  gradient="bg-gradient-to-br from-red-600 to-red-700"
                  bgColor="bg-red-50 border-red-200 text-red-900"
                  barColor="bg-red-500"
                  porcentaje={pct(reprobados)}
                  cargando={cargandoMetricas}
                />
              </div>

              {/* Gráficas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartComponent
                  title="Proyectos por Materia"
                  icon="pi-chart-pie"
                  data={proyectosPorMateriaData}
                  chartId="chart-materias"
                  exportFn={exportChartImage}
                  cargando={cargandoMetricas}
                />
                <ChartComponent
                  title="Sublíneas de Investigación"
                  icon="pi-chart-pie"
                  data={proyectosPorSublineaData}
                  chartId="chart-sublineas"
                  exportFn={exportChartImage}
                  cargando={cargandoMetricas}
                />
              </div>

              {/* Reporte */}
              <div className="flex justify-end">
                <button
                  onClick={exportFullReport}
                  disabled={cargandoMetricas || total === 0}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="pi pi-file-pdf"></i>
                  Descargar Reporte Completo
                </button>
              </div>
            </div>
          )}
        </main>
      </StudentLayout>
    </div>
  );
}
