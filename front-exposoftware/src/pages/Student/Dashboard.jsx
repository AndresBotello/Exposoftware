import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useStudentMetrics } from "../../hooks/Student/useStudentMetrics";
import StudentHeader from "../../components/Student/StudentHeader";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentLayout from "../../components/Student/StudentLayout";
import ReportGenerator from "../../components/ReportGenerator";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import html2canvas from 'html2canvas';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, getFullName, getInitials, logout, loading } = useAuth();
  const { metricasEstudiante, cargandoMetricas, proyectosPorMateriaData, proyectosPorSublineaData } = useStudentMetrics(user);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p>Cargando...</p></div></div>;

  const exportChartImage = async (chartId, title) => {
    try {
      const element = document.getElementById(chartId);
      if (!element) {
        alert('Gráfica no encontrada');
        return;
      }
      const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2 });
      const link = document.createElement('a');
      link.href = canvas.toDataURL();
      link.download = `${title}_${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (error) {
      alert('Error al exportar la imagen');
    }
  };

  const exportFullReport = async () => {
    try {
      await ReportGenerator.exportarReporteCompleto({
        userInfo: { name: getFullName(), role: 'Estudiante', email: user?.correo },
        estadisticas: { totalProyectos: metricasEstudiante?.totalProyectos, aprobados: metricasEstudiante?.proyectosAprobados, reprobados: metricasEstudiante?.proyectosReprobados, pendientes: metricasEstudiante?.proyectosPendientes },
        chartIds: ['chart-materias', 'chart-sublineas'],
        chartTitles: ['Proyectos por Materia', 'Sublíneas de Investigación'],
        chartData: [proyectosPorMateriaData, proyectosPorSublineaData]
      });
    } catch (error) {
    }
  };

  const MetricCard = ({ title, value, subtitle, icon, gradient, bgColor }) => (
    <div className={`${bgColor} rounded-2xl border p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium opacity-90">{title}</p>
            <h3 className="text-4xl font-bold mt-2">{cargandoMetricas ? '...' : value}</h3>
          </div>
          <div className={`${gradient} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
            <i className={`pi ${icon} text-white text-lg`}></i>
          </div>
        </div>
        <p className="text-xs font-semibold opacity-75">{subtitle}</p>
      </div>
    </div>
  );

  const ChartComponent = ({ title, icon, data, chartId, exportFn }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
            <i className={`pi ${icon} text-white`}></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <button onClick={() => exportFn(chartId, title)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Descargar como imagen">
          <i className="pi pi-download text-gray-600"></i>
        </button>
      </div>
      {cargandoMetricas ? <div className="h-80 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div></div> : data.length > 0 ? <div id={chartId} className="h-96"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} cx="50%" cy="45%" outerRadius={85} paddingAngle={3} dataKey="value">{data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip formatter={(v) => [`${v} proyecto${v !== 1 ? 's' : ''}`, 'Cant']} /><Legend /></PieChart></ResponsiveContainer></div> : <div className="h-96 flex items-center justify-center bg-gray-50 rounded-xl"><p className="text-gray-500">Sin datos</p></div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <StudentHeader user={user} getFullName={getFullName} getInitials={getInitials} logout={logout} />
      <StudentLayout>
        <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} getInitials={getInitials} getFullName={getFullName} />
        <main className="lg:col-span-3">
          {activeTab === "dashboard" && (
            <>
              <div className="rounded-2xl border border-emerald-200 p-6 mb-8 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(12, 183, 106, 0.95) 0%, rgba(12, 183, 106, 0.85) 100%)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <i className="pi pi-chart-bar text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-1">¡Bienvenido, {user?.nombres}!</h2>
                    <p className="text-white/80">XXI Jornada de Investigación - UPC</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard title="Total Proyectos" value={metricasEstudiante?.totalProyectos || 0} subtitle="Inscritos en plataforma" icon="pi-folder" gradient="bg-gradient-to-br from-blue-600 to-blue-700" bgColor="bg-blue-50 border-blue-200 text-blue-900" />
                <MetricCard title="Aprobados" value={metricasEstudiante?.proyectosAprobados || 0} subtitle="Calificación ≥ 3.0" icon="pi-check-circle" gradient="bg-gradient-to-br from-emerald-600 to-emerald-700" bgColor="bg-emerald-50 border-emerald-200 text-emerald-900" />
                <MetricCard title="Pendientes" value={metricasEstudiante?.proyectosPendientes || 0} subtitle="En proceso de evaluación" icon="pi-clock" gradient="bg-gradient-to-br from-amber-600 to-amber-700" bgColor="bg-amber-50 border-amber-200 text-amber-900" />
                <MetricCard title="Reprobados" value={metricasEstudiante?.proyectosReprobados || 0} subtitle="Calificación < 3.0" icon="pi-times-circle" gradient="bg-gradient-to-br from-red-600 to-red-700" bgColor="bg-red-50 border-red-200 text-red-900" />
              </div>

              <div className="flex justify-end mb-8">
                <button onClick={exportFullReport} className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200/40">
                  <i className="pi pi-file-pdf"></i>
                  Descargar Reporte Completo
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartComponent title="Proyectos por Materia" icon="pi-chart-pie" data={proyectosPorMateriaData} chartId="chart-materias" exportFn={exportChartImage} />
                <ChartComponent title="Sublíneas de Investigación" icon="pi-chart-pie" data={proyectosPorSublineaData} chartId="chart-sublineas" exportFn={exportChartImage} />
              </div>
            </>
          )}
        </main>
      </StudentLayout>
    </div>
  );
}
