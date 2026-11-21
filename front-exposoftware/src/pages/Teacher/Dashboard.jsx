import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useTeacherDashboard } from "../../hooks/Teacher/useTeacherDashboard";
import { TeacherHeader, TeacherSidebar } from "../../components/Teacher/TeacherLayout";

/* ------------------------------------------------------------------ */
/* Piezas de presentación (solo diseño: no tocan datos ni autenticación) */
/* ------------------------------------------------------------------ */

const TONOS = {
  emerald: {
    card: "from-emerald-50 to-emerald-100 border-emerald-200",
    label: "text-emerald-700",
    value: "text-emerald-900",
    icon: "from-emerald-500 to-emerald-600",
    bar: "bg-emerald-500",
    track: "bg-emerald-200/70",
  },
  amber: {
    card: "from-amber-50 to-amber-100 border-amber-200",
    label: "text-amber-700",
    value: "text-amber-900",
    icon: "from-amber-500 to-amber-600",
    bar: "bg-amber-500",
    track: "bg-amber-200/70",
  },
  red: {
    card: "from-red-50 to-red-100 border-red-200",
    label: "text-red-700",
    value: "text-red-900",
    icon: "from-red-500 to-red-600",
    bar: "bg-red-500",
    track: "bg-red-200/70",
  },
  purple: {
    card: "from-purple-50 to-purple-100 border-purple-200",
    label: "text-purple-700",
    value: "text-purple-900",
    icon: "from-purple-500 to-purple-600",
    bar: "bg-purple-500",
    track: "bg-purple-200/70",
  },
};

function MetricCard({ tono, label, value, icono, porcentaje, cargando, to }) {
  const t = TONOS[tono];

  if (cargando) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-md animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-8 w-12 rounded bg-gray-200" />
          </div>
          <div className="h-14 w-14 rounded-xl bg-gray-200" />
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-gray-200" />
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`group block rounded-xl border bg-gradient-to-br ${t.card} p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
      aria-label={`${label}: ${value}. Ver proyectos`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`mb-1 text-sm font-medium ${t.label}`}>{label}</p>
          <h3 className={`text-3xl font-bold ${t.value}`}>{value}</h3>
        </div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${t.icon} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          <i className={`pi ${icono} text-xl text-white`} />
        </div>
      </div>

      {porcentaje !== null && (
        <div className="mt-4">
          <div className={`h-1.5 w-full overflow-hidden rounded-full ${t.track}`}>
            <div
              className={`h-full rounded-full ${t.bar} transition-all duration-700`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <p className={`mt-1 text-xs ${t.label}`}>{porcentaje}% del total</p>
        </div>
      )}
    </Link>
  );
}

function Panel({ titulo, icono, gradiente, children, id, acciones }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${gradiente}`}>
            <i className={`pi ${icono} text-white`} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{titulo}</h3>
        </div>
        {acciones}
      </div>
      <div id={id}>{children}</div>
    </section>
  );
}

function SinDatos({ icono, texto }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-center">
      <i className={`pi ${icono} mb-2 text-4xl text-gray-300`} />
      <p className="text-sm text-gray-500">{texto}</p>
    </div>
  );
}

const saludo = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
};

/* ------------------------------------------------------------------ */

export default function TeacherDashboard() {
  const {
    user,
    getFullName,
    getInitials,
    loading,
    metricasProyectos,
    cargandoProyectos,
    error,
    eventoActual,
    proyectos,
    pieChartData,
    lineasChartData,
    teachingLoad,
    handleLogout,
    exportarReporteCompleto,
  } = useTeacherDashboard();

  const total = metricasProyectos.aprobados + metricasProyectos.pendientes + metricasProyectos.reprobados;
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

  // Carga académica agrupada por materia, con sus grupos como "chips"
  const materias = useMemo(() => {
    const mapa = new Map();
    (teachingLoad || []).forEach((clase) => {
      const clave = clase.codigo_materia || clase.nombre_materia || "sin-codigo";
      if (!mapa.has(clave)) {
        mapa.set(clave, {
          codigo: clase.codigo_materia,
          nombre: clase.nombre_materia || clase.codigo_materia || "Sin nombre",
          grupos: [],
        });
      }
      const grupo = clase.nombre_grupo || clase.id_grupo || "N/A";
      const entrada = mapa.get(clave);
      if (!entrada.grupos.some((g) => g.nombre === grupo)) {
        const cantidad = (proyectos || []).filter(
          (p) =>
            (p.codigo_materia === clase.codigo_materia || !p.codigo_materia) &&
            (p.id_grupo === clase.id_grupo || p.nombre_grupo === clase.nombre_grupo)
        ).length;
        entrada.grupos.push({ nombre: String(grupo), proyectos: cantidad });
      }
    });
    return Array.from(mapa.values());
  }, [teachingLoad, proyectos]);

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

  const nombre = user?.nombres || "Docente";
  const hayPendientes = !cargandoProyectos && metricasProyectos.pendientes > 0;

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
          <main className="lg:col-span-3 space-y-6">
            {/* Encabezado con acción de exportar */}
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                    <i className="pi pi-chart-line text-xl text-white"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      {saludo()}, {nombre}
                    </h2>
                    <p className="text-gray-600">Resumen completo de la convocatoria y proyectos</p>
                    {eventoActual && (
                      <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-800">
                        <i className="pi pi-calendar text-[11px]"></i>
                        {eventoActual.nombre}
                        {eventoActual.estadoTexto ? ` · ${eventoActual.estadoTexto}` : ""}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={exportarReporteCompleto}
                  disabled={cargandoProyectos}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <i className="pi pi-file-pdf"></i>
                  Exportar informe completo
                </button>
              </div>
              <div className="h-1 w-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>
            </div>

            {/* Aviso de error de carga (antes se veían ceros sin explicación) */}
            {error && !cargandoProyectos && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <p className="flex items-center gap-2 text-sm text-red-700">
                  <i className="pi pi-exclamation-triangle" />
                  No pudimos cargar todos tus datos. Es posible que las cifras estén incompletas.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Acción requerida */}
            {hayPendientes && (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
                    <i className="pi pi-bell text-lg text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900">
                      Tienes {metricasProyectos.pendientes} proyecto
                      {metricasProyectos.pendientes !== 1 ? "s" : ""} pendiente
                      {metricasProyectos.pendientes !== 1 ? "s" : ""} por revisar
                    </p>
                    <p className="text-sm text-amber-700">Revísalos para que tus estudiantes avancen en la convocatoria.</p>
                  </div>
                </div>
                <Link
                  to="/teacher/proyectos"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-amber-600"
                >
                  Revisar ahora <i className="pi pi-arrow-right text-xs" />
                </Link>
              </div>
            )}

            {/* Tarjetas de métricas */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                tono="emerald"
                label="Aprobados"
                icono="pi-check"
                value={metricasProyectos.aprobados}
                porcentaje={pct(metricasProyectos.aprobados)}
                cargando={cargandoProyectos}
                to="/teacher/proyectos"
              />
              <MetricCard
                tono="amber"
                label="Pendientes"
                icono="pi-clock"
                value={metricasProyectos.pendientes}
                porcentaje={pct(metricasProyectos.pendientes)}
                cargando={cargandoProyectos}
                to="/teacher/proyectos"
              />
              <MetricCard
                tono="red"
                label="Reprobados"
                icono="pi-times"
                value={metricasProyectos.reprobados}
                porcentaje={pct(metricasProyectos.reprobados)}
                cargando={cargandoProyectos}
                to="/teacher/proyectos"
              />
              <MetricCard
                tono="purple"
                label="Proyectos asignados"
                icono="pi-briefcase"
                value={metricasProyectos.asignados}
                porcentaje={null}
                cargando={cargandoProyectos}
                to="/teacher/proyectos"
              />
            </div>

            {/* Gráficas (los ids son los que usa el informe PDF para capturarlas) */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Panel
                titulo="Estado de proyectos"
                icono="pi-chart-pie"
                gradiente="from-emerald-500 to-teal-600"
                id="estado-proyectos-chart"
              >
                {cargandoProyectos ? (
                  <div className="h-56 animate-pulse rounded-lg bg-gray-100" />
                ) : pieChartData.length > 0 ? (
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="relative h-56 w-full sm:w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius="60%"
                            outerRadius="90%"
                            paddingAngle={3}
                            stroke="none"
                          >
                            {pieChartData.map((d) => (
                              <Cell key={d.name} fill={d.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">{total}</span>
                        <span className="text-xs text-gray-500">proyectos</span>
                      </div>
                    </div>
                    <ul className="w-full space-y-2 sm:w-1/2">
                      {pieChartData.map((d) => (
                        <li key={d.name} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                          <span className="flex items-center gap-2 text-gray-700">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                            {d.name}
                          </span>
                          <span className="font-semibold text-gray-900">{d.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <SinDatos icono="pi-chart-pie" texto="Aún no hay proyectos con estado para graficar" />
                )}
              </Panel>

              <Panel
                titulo="Líneas de investigación"
                icono="pi-chart-bar"
                gradiente="from-teal-500 to-cyan-600"
                id="lineas-investigacion-chart"
              >
                {cargandoProyectos ? (
                  <div className="h-56 animate-pulse rounded-lg bg-gray-100" />
                ) : lineasChartData.length > 0 ? (
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={lineasChartData.slice(0, 6)} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={110}
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => (String(v).length > 16 ? `${String(v).slice(0, 15)}…` : v)}
                        />
                        <Tooltip cursor={{ fill: "rgba(16,185,129,0.08)" }} />
                        <Bar dataKey="value" name="Proyectos" radius={[0, 6, 6, 0]}>
                          {lineasChartData.slice(0, 6).map((d) => (
                            <Cell key={d.name} fill={d.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <SinDatos icono="pi-chart-bar" texto="Aún no hay proyectos con línea de investigación" />
                )}
              </Panel>
            </div>

            {/* Carga académica agrupada por materia */}
            <Panel titulo="Carga académica" icono="pi-book" gradiente="from-blue-500 to-cyan-600">
              {cargandoProyectos ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : materias.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {materias.map((m) => (
                    <div
                      key={m.codigo || m.nombre}
                      className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 transition-shadow duration-200 hover:shadow-md"
                    >
                      <p className="mb-1 text-xs font-medium uppercase text-blue-600">Materia</p>
                      <h4 className="mb-1 text-base font-bold text-gray-900">{m.nombre}</h4>
                      {m.codigo && (
                        <p className="mb-3 flex items-center gap-1 text-sm text-gray-600">
                          <i className="pi pi-tag text-xs" />
                          {m.codigo}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {m.grupos.map((g) => (
                          <span
                            key={g.nombre}
                            className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            <i className="pi pi-users text-[10px]" />
                            Grupo {g.nombre}
                            {g.proyectos > 0 && (
                              <span className="rounded-full bg-emerald-100 px-1.5 text-emerald-700">
                                {g.proyectos}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
                  <i className="pi pi-book mb-2 text-4xl text-blue-300"></i>
                  <p className="font-medium text-blue-700">Aún no tienes clases asignadas</p>
                  <p className="text-sm text-blue-600">Cuando la administración te asigne materias aparecerán aquí.</p>
                </div>
              )}
            </Panel>
          </main>
        </div>
      </div>
    </div>
  );
}
