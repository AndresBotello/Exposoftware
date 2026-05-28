import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Logo-unicesar.png";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import AssistanceService from "../../Services/AssistanceService";
import EventosService from "../../Services/EventosService";
import * as AuthService from "../../Services/AuthService";
import ReportGenerator from "../../components/ReportGenerator2";
import * as XLSX from 'xlsx';
import AttendanceTable from "./AttendanceTable";
import AttendanceChart from "./AttendanceChart";

export default function EventsAttendance() {
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState("");
  const [registeredPeople, setRegisteredPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const navigate = useNavigate();

  useEffect(() => { cargarEventos(); }, []);

  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) { setUserData(user); } else { navigate('/login'); }
  }, [navigate]);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const response = await EventosService.obtenerEventos();
      let todosLosEventos = [];
      if (response?.data && Array.isArray(response.data)) {
        todosLosEventos = response.data;
      } else if (Array.isArray(response)) {
        todosLosEventos = response;
      }
      setEventos(todosLosEventos);
    } catch (error) {
      setError('No se pudieron cargar los eventos. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventoChange = async (e) => {
    const id = e.target.value;
    setEventoSeleccionado(id);
    setCurrentPage(1);
    if (!id) { setRegisteredPeople([]); return; }
    try {
      const response = await AssistanceService.obtenerAsistenciasEvento(id);
      setRegisteredPeople(response?.data?.asistencias || []);
    } catch (error) {
      setRegisteredPeople([]);
    }
  };

  const formatearFechaHora = (fechaIso) => {
    if (!fechaIso) return { fecha: "-", hora: "-" };
    const fecha = new Date(fechaIso);
    return {
      fecha: fecha.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" }),
      hora: fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    };
  };

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      try { await AuthService.logout(); navigate('/login'); } catch (error) { console.error('❌ Error:', error); }
    }
  };

  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };

  const getUserInitials = () => getUserName().charAt(0).toUpperCase();

  const filteredPeople = registeredPeople.filter(
    (person) =>
      person.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.id_usuario?.includes(searchTerm) ||
      person.correo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPeople.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPeople.length / itemsPerPage);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const procesarDatosGrafica = () => {
    if (!registeredPeople || registeredPeople.length === 0) {
      return { labels: [], datasets: [{ label: 'Asistencias', data: [], backgroundColor: '#10B981', borderColor: '#059669', borderWidth: 1 }] };
    }
    const asistenciasPorHora = {};
    registeredPeople.forEach(persona => {
      if (persona.fecha_asistencia) {
        const hora = new Date(persona.fecha_asistencia).getHours();
        const horaFormateada = `${hora.toString().padStart(2, '0')}:00`;
        asistenciasPorHora[horaFormateada] = (asistenciasPorHora[horaFormateada] || 0) + 1;
      }
    });
    const horasOrdenadas = Object.keys(asistenciasPorHora).sort();
    return {
      labels: horasOrdenadas,
      datasets: [{ label: 'Asistencias por Hora', data: horasOrdenadas.map(h => asistenciasPorHora[h]), backgroundColor: '#10B981', borderColor: '#059669', borderWidth: 1 }]
    };
  };

  const chartData = procesarDatosGrafica();
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12, family: 'Inter, sans-serif' } } },
      tooltip: { callbacks: { label: (ctx) => `Asistencias: ${ctx.parsed.y}` } }
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  const exportarGraficaComoImagen = (chartId, fileName) => ReportGenerator.exportarGraficaComoImagen(chartId, fileName);
  const exportarGraficaComoPDF = (chartId, title, data) => ReportGenerator.exportarGraficaComoPDF(chartId, title, data, { name: getUserName() });

  const exportarAsistenciasExcel = () => {
    if (!registeredPeople || registeredPeople.length === 0) { alert('No hay datos para exportar'); return; }
    const eventoInfo = eventos.find(e => e.id_evento === eventoSeleccionado);
    const data = registeredPeople.map(persona => {
      const fechaRegistro = persona.fecha_asistencia ? new Date(persona.fecha_asistencia) : null;
      return {
        'ID Usuario': persona.id_usuario,
        'Nombre Completo': persona.nombre_completo,
        'Correo Electrónico': persona.correo,
        'Fecha Registro': fechaRegistro ? fechaRegistro.toLocaleDateString('es-CO') : '',
        'Hora Registro': fechaRegistro ? fechaRegistro.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
        'Evento': eventoInfo?.nombre_evento || ''
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencias');
    worksheet['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 25 }];
    XLSX.writeFile(workbook, `Asistencias_${eventoInfo?.nombre_evento || 'Evento'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportarReporteAsistencias = () => {
    const eventoInfo = eventos.find(e => e.id_evento === eventoSeleccionado);
    const asistenciasData = chartData.labels.map((label, index) => ({ hora: label, asistencias: chartData.datasets[0].data[index] }));
    const totalAsistencias = registeredPeople.length;
    const horaPico = chartData.labels.length > 0 ? chartData.labels[chartData.datasets[0].data.indexOf(Math.max(...chartData.datasets[0].data))] : '--:--';
    const promedioPorHora = chartData.labels.length > 0 ? (totalAsistencias / chartData.labels.length).toFixed(1) : '0';
    ReportGenerator.exportarReporteCompleto({
      userInfo: { name: getUserName(), role: 'Administrador' },
      estadisticas: {
        evento: eventoInfo?.nombre_evento || 'Evento no seleccionado',
        descripcion: eventoInfo?.descripcion || '', lugar: eventoInfo?.lugar || '',
        fechaInicio: eventoInfo ? new Date(eventoInfo.fecha_inicio).toLocaleDateString('es-CO') : '',
        horaInicio: eventoInfo ? new Date(eventoInfo.fecha_inicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '',
        fechaFin: eventoInfo ? new Date(eventoInfo.fecha_fin).toLocaleDateString('es-CO') : '',
        horaFin: eventoInfo ? new Date(eventoInfo.fecha_fin).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '',
        estado: eventoInfo?.estado === 'ACTIVO' ? 'Activo' : 'Inactivo',
        totalAsistencias, horaPico, promedioPorHora,
        horasRegistradas: chartData.labels.length,
        asistenciasPorHora: asistenciasData,
        fechaGeneracion: new Date().toLocaleDateString('es-CO'),
        horaGeneracion: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      },
      chartIds: ['asistencias-chart'], chartTitles: ['Distribución de Asistencias por Hora'], chartData: [asistenciasData],
      institutionName: 'Universidad Popular del Cesar',
      eventName: `Reporte de Asistencias - ${eventoInfo?.nombre_evento || 'Evento'}`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  const eventoNombre = eventos.find(e => e.id_evento === eventoSeleccionado)?.nombre_evento || 'Evento';

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:block">{getUserName()}</span>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">{getUserInitials()}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2">
                <i className="pi pi-sign-out"></i>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          <main className="lg:col-span-3">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <i className="pi pi-exclamation-triangle text-red-600 text-xl"></i>
                  <div>
                    <h3 className="text-sm font-semibold text-red-900">Error al cargar datos</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                  <button onClick={cargarEventos} className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Asistencias por Evento</h2>
              <p className="text-gray-600">Selecciona un evento para ver los registros de asistencia</p>
            </div>

            <div className="mb-6">
              <label className="block font-semibold mb-2 text-gray-700">Selecciona un evento:</label>
              <select
                value={eventoSeleccionado}
                onChange={handleEventoChange}
                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="">-- Selecciona un evento --</option>
                {eventos.map((evento) => (
                  <option key={evento.id_evento} value={evento.id_evento}>
                    {evento.nombre_evento} ({evento.fecha_inicio.split("T")[0]})
                  </option>
                ))}
              </select>
            </div>

            <AttendanceTable
              filteredPeople={filteredPeople}
              currentItems={currentItems}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setCurrentPage={setCurrentPage}
              eventoSeleccionado={eventoSeleccionado}
              registeredPeople={registeredPeople}
              currentPage={currentPage}
              totalPages={totalPages}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              goToPage={goToPage}
              prevPage={prevPage}
              nextPage={nextPage}
              formatearFechaHora={formatearFechaHora}
              exportarAsistenciasExcel={exportarAsistenciasExcel}
              exportarGraficaComoImagen={exportarGraficaComoImagen}
              eventoNombre={eventoNombre}
            />

            {eventoSeleccionado && registeredPeople.length > 0 && (
              <AttendanceChart
                registeredPeople={registeredPeople}
                chartData={chartData}
                chartOptions={chartOptions}
                exportarGraficaComoImagen={exportarGraficaComoImagen}
                exportarGraficaComoPDF={exportarGraficaComoPDF}
                exportarReporteAsistencias={exportarReporteAsistencias}
                eventoNombre={eventoNombre}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
