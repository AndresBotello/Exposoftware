import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { AdminHeader, AdminPageHeader } from "../../components/Admin/AdminComponents";
import AssistanceService from "../../Services/AssistanceService";
import EventosService from "../../Services/EventosService";
import AdminQRService from "../../Services/AdminQRService";
import * as AuthService from "../../Services/AuthService";
import { saveAs } from "file-saver";
import QRPanel from "./QRPanel";
import AttendanceTableSection from "./AttendanceTableSection";
import { confirmarCierreSesion } from "../../utils/confirmDialog.jsx";
import { ordenarEventos } from "../../utils/eventoActual";

export default function AttendanceAdmin() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState("");
  const [eventos, setEventos] = useState([]);
  const [registeredPeople, setRegisteredPeople] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [searchTerm, setSearchTerm] = useState("");
  const [nombreEventoActual, setNombreEventoActual] = useState("");
  const [qrBase64Original, setQrBase64Original] = useState(null);

  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) { setUserData(user); } else { navigate('/login'); }
  }, [navigate]);

  useEffect(() => {
    let cargado = false;
    const cargarEventos = async () => {
      if (cargado) return;
      cargado = true;
      try {
        const response = await EventosService.obtenerEventosAdmin();
        const eventosEnCurso = (response || []).filter(evento => evento.estado === 'en_curso');
        setEventos(ordenarEventos(eventosEnCurso));
      } catch (error) {
        setEventos([]);
      }
    };
    cargarEventos();
  }, []);

  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };
  const getUserInitials = () => getUserName().charAt(0).toUpperCase();

  const handleLogout = async () => {
    if (await confirmarCierreSesion()) {
      try { await AuthService.logout(); navigate('/login'); } catch (error) { console.error('❌ Error al cerrar sesión:', error); }
    }
  };

  const buildQRData = (qrInfo, customDate = null, customHour = null) => {
    const fecha = customDate || new Date().toLocaleDateString("es-CO");
    const hora = customHour || new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    return { evento: qrInfo.evento_nombre, id_sesion: qrInfo.evento_id, link: window.location.href, fecha, hora };
  };

  const getQRImage = (qrInfo) => qrInfo.qr_base64 ? `data:image/png;base64,${qrInfo.qr_base64}` : qrInfo.url_qr;

  const generarQR = async () => {
    if (!eventoSeleccionado) { alert("⚠️ Debes seleccionar un evento antes de generar el código QR."); return; }
    setIsGenerating(true);
    try {
      const response = await AssistanceService.generarQrEvento(eventoSeleccionado, window.location.origin);
      const qrInfo = response?.data;
      if (!qrInfo) throw new Error("Respuesta del servidor inválida");
      setQrCodeUrl(getQRImage(qrInfo));
      setQrData(buildQRData(qrInfo));

      // Obtener nombre completo del evento desde el array de eventos
      const eventoCompleto = eventos.find(e => e.id_evento === eventoSeleccionado || e.id === eventoSeleccionado);
      const nombreEvento = eventoCompleto?.nombre_evento || qrInfo.evento_nombre || "Evento";
      setNombreEventoActual(nombreEvento);

      if (qrInfo.qr_base64) {
        setQrBase64Original(qrInfo.qr_base64);
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert("Hubo un error al generar el código QR");
    } finally {
      setIsGenerating(false);
    }
  };

  const descargarQR = async () => {
    if (!qrCodeUrl || !qrBase64Original) return;

    try {
      // Crear QR con el nombre del evento
      const blob = await AdminQRService.crearQRConTitulo(
        qrBase64Original,
        nombreEventoActual || "Código QR de Asistencia"
      );

      // Descargar
      const filename = `QR-Asistencia-${nombreEventoActual || "evento"}-${new Date().toLocaleDateString("es-CO")}.png`;
      saveAs(blob, filename);
    } catch (error) {
      console.error("Error descargando QR:", error);
      alert("Error al procesar el QR");
    }
  };

  const handleEventoChange = async (e) => {
    const id = e.target.value;
    setEventoSeleccionado(id);
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
      hora: fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
    };
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader userName={getUserName()} userInitials={getUserInitials()} onLogout={handleLogout} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          <main className="lg:col-span-3">
            <AdminPageHeader
              icon="pi-qrcode"
              title="Control de Asistencia"
              subtitle="Genera y gestiona el código QR para el registro de asistencia diaria"
            />

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <label htmlFor="evento-asistencia" className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <i className="pi pi-calendar text-teal-600"></i>
                Selecciona un evento
              </label>
              <select id="evento-asistencia" value={eventoSeleccionado} onChange={handleEventoChange}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Selecciona un evento --</option>
                {eventos.map((evento) => (
                  <option key={evento.id_evento} value={evento.id_evento}>
                    {evento.nombre_evento} ({(evento.fecha_inicio || "").split("T")[0]})
                  </option>
                ))}
              </select>
              {eventos.length === 0 && (
                <p className="mt-2 text-xs text-gray-500">No hay eventos en curso. Solo se puede registrar asistencia en eventos en curso.</p>
              )}
            </div>

            {showSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
                <i className="pi pi-check-circle text-green-600 text-xl"></i>
                <p className="text-green-800 font-medium">¡Código QR generado exitosamente!</p>
              </div>
            )}

            <QRPanel
              qrCodeUrl={qrCodeUrl}
              qrData={qrData}
              isGenerating={isGenerating}
              generarQR={generarQR}
              descargarQR={descargarQR}
            />

            <AttendanceTableSection
              filteredPeople={filteredPeople}
              currentItems={currentItems}
              currentPage={currentPage}
              totalPages={totalPages}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setCurrentPage={setCurrentPage}
              goToPage={goToPage}
              nextPage={nextPage}
              prevPage={prevPage}
              formatearFechaHora={formatearFechaHora}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
