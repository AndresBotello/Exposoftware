import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Logo-unicesar.png";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import AssistanceService from "../../services/AssistanceService";
import EventosService from "../../Services/EventosService";
import * as AuthService from "../../Services/AuthService";
import QRPanel from "./QRPanel";
import AttendanceTableSection from "./AttendanceTableSection";

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
        setEventos(eventosEnCurso);
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
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      try { await AuthService.logout(); navigate('/login'); } catch (error) { console.error('❌ Error al cerrar sesión:', error); }
    }
  };

  const buildQRData = (qrInfo, customDate = null, customHour = null) => {
    const fecha = customDate || new Date().toLocaleDateString("es-CO");
    const hora = customHour || new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    return { evento: qrInfo.evento_nombre, id_sesion: qrInfo.evento_id, link: qrInfo.url_qr, fecha, hora };
  };

  const getQRImage = (qrInfo) => qrInfo.qr_base64 ? `data:image/png;base64,${qrInfo.qr_base64}` : qrInfo.url_qr;

  const generarQR = async () => {
    if (!eventoSeleccionado) { alert("⚠️ Debes seleccionar un evento antes de generar el código QR."); return; }
    setIsGenerating(true);
    try {
      const response = await AssistanceService.generarQrEvento(eventoSeleccionado);
      const qrInfo = response?.data;
      if (!qrInfo) throw new Error("Respuesta del servidor inválida");
      setQrCodeUrl(getQRImage(qrInfo));
      setQrData(buildQRData(qrInfo));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert("Hubo un error al generar el código QR");
    } finally {
      setIsGenerating(false);
    }
  };

  const descargarQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.download = `QR-Asistencia-${new Date().toLocaleDateString("es-CO")}.png`;
    link.href = qrCodeUrl;
    link.click();
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
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Control de Asistencia</h2>
              <p className="text-gray-600">Genera y gestiona el código QR para el registro de asistencia diaria</p>
            </div>

            <div className="mb-6">
              <label className="block font-semibold mb-2 text-gray-700">Selecciona un evento:</label>
              <select value={eventoSeleccionado} onChange={handleEventoChange}
                className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Selecciona un evento --</option>
                {eventos.map((evento) => (
                  <option key={evento.id_evento} value={evento.id_evento}>
                    {evento.nombre_evento} ({evento.fecha_inicio.split("T")[0]})
                  </option>
                ))}
              </select>
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
