import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { AdminHeader } from "../../components/Admin/AdminComponents";
import EventosService from "../../Services/EventosService";
import EventsTable from "./EventsTable";
import EventModals from "./EventModals";

export default function ManageEvents() {
  const navigate = useNavigate();
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();

  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const [showEditModal, setShowEditModal] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [nombreEvento, setNombreEvento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [lugarEvento, setLugarEvento] = useState("");
  const [cupoMaximo, setCupoMaximo] = useState("");
  const [estado, setEstado] = useState("ACTIVO");
  const [guardandoEvento, setGuardandoEvento] = useState(false);

  const [showCapacidadModal, setShowCapacidadModal] = useState(false);
  const [capacidadInfo, setCapacidadInfo] = useState(null);

  useEffect(() => { cargarEventos(); }, []);

  const cargarEventos = async () => {
    setLoadingEventos(true);
    try {
      const data = await EventosService.obtenerEventosAdmin();
      const eventosOrdenados = data.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
      setEventos(eventosOrdenados);
      setEventosFiltrados(eventosOrdenados);
    } catch (error) {
      console.error("❌ Error al cargar eventos:", error);
      setEventos([]);
      setEventosFiltrados([]);
    } finally {
      setLoadingEventos(false);
    }
  };

  useEffect(() => {
    if (filtroEstado === "TODOS") {
      setEventosFiltrados(eventos);
    } else {
      setEventosFiltrados(eventos.filter(evento => evento.estado === filtroEstado));
    }
  }, [filtroEstado, eventos]);

  useEffect(() => {
    if (eventos.length > 0) {
      const ahora = new Date();
      setEstadisticas({
        total_eventos: eventos.length,
        eventos_activos: eventos.filter(e => e.estado === 'ACTIVO').length,
        eventos_proximos: eventos.filter(e => new Date(e.fecha_inicio) > ahora && e.estado === 'ACTIVO').length,
        eventos_finalizados: eventos.filter(e => new Date(e.fecha_fin) < ahora).length
      });
    }
  }, [eventos]);

  const handleEditarEvento = async (evento) => {
    try {
      const eventoCompleto = await EventosService.obtenerEventoPorIdAdmin(evento.id_evento);
      setEventoEditando(eventoCompleto);
      setNombreEvento(eventoCompleto.nombre_evento || "");
      setDescripcion(eventoCompleto.descripcion || "");
      const formatearFecha = (fecha) => fecha ? new Date(fecha).toISOString().slice(0, 16) : "";
      setFechaInicio(formatearFecha(eventoCompleto.fecha_inicio));
      setFechaFin(formatearFecha(eventoCompleto.fecha_fin));
      setLugarEvento(eventoCompleto.lugar || "");
      setCupoMaximo(eventoCompleto.cupo_maximo?.toString() || "");
      setEstado(eventoCompleto.estado || "ACTIVO");
      setShowEditModal(true);
    } catch (error) {
      console.error("❌ Error al cargar evento:", error);
      alert("Error al cargar los datos del evento");
    }
  };

  const handleGuardarEvento = async (e) => {
    e.preventDefault();
    if (!nombreEvento || !descripcion || !fechaInicio || !fechaFin || !lugarEvento || !cupoMaximo) {
      alert("Por favor completa todos los campos"); return;
    }
    const cupo = parseInt(cupoMaximo);
    if (isNaN(cupo) || cupo < 1) { alert("El cupo máximo debe ser un número mayor a 0"); return; }
    if (new Date(fechaFin) < new Date(fechaInicio)) { alert("La fecha de fin no puede ser anterior a la fecha de inicio"); return; }

    const payload = {
      nombre_evento: nombreEvento, descripcion, lugar: lugarEvento, cupo_maximo: cupo, estado,
      fecha_inicio: new Date(fechaInicio).toISOString(),
      fecha_fin: new Date(fechaFin).toISOString(),
    };

    setGuardandoEvento(true);
    try {
      await EventosService.actualizarEvento(eventoEditando.id_evento, payload);
      alert("✅ Evento actualizado exitosamente");
      setShowEditModal(false);
      cargarEventos();
    } catch (error) {
      console.error("❌ Error al actualizar evento:", error);
      alert(`❌ Error al actualizar evento: ${error.message}`);
    } finally {
      setGuardandoEvento(false);
    }
  };

  const handleCambiarEstado = async (eventoId, nuevoEstado) => {
    if (!window.confirm(`¿Desea cambiar el estado del evento a ${nuevoEstado}?`)) return;
    try {
      await EventosService.cambiarEstadoEvento(eventoId, nuevoEstado);
      alert(`✅ Estado cambiado a ${nuevoEstado}`);
      cargarEventos();
    } catch (error) {
      console.error("❌ Error al cambiar estado:", error);
      alert(`❌ Error al cambiar estado: ${error.message}`);
    }
  };

  const handleVerCapacidad = async (eventoId) => {
    try {
      const data = await EventosService.verificarCapacidad(eventoId);
      setCapacidadInfo(data);
      setShowCapacidadModal(true);
    } catch (error) {
      console.error("❌ Error al verificar capacidad:", error);
      alert("Error al obtener información de capacidad");
    }
  };

  const formatearFechaDisplay = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getEstadoBadgeColor = (estadoEvento) => {
    const colors = { 'ACTIVO': 'bg-green-100 text-green-800', 'INACTIVO': 'bg-gray-100 text-gray-800', 'CANCELADO': 'bg-red-100 text-red-800' };
    return colors[estadoEvento] || 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader userName={getUserName()} userInitials={getUserInitials()} onLogout={handleLogout} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          <main className="lg:col-span-3 space-y-6">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <i className="pi pi-calendar-plus text-3xl text-white"></i>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Gestión de Eventos</h2>
                  <p className="text-teal-50 mt-1">Administra y controla todos los eventos del sistema</p>
                </div>
              </div>
            </div>

            <EventsTable
              loadingEventos={loadingEventos}
              eventosFiltrados={eventosFiltrados}
              eventos={eventos}
              filtroEstado={filtroEstado}
              setFiltroEstado={setFiltroEstado}
              estadisticas={estadisticas}
              formatearFechaDisplay={formatearFechaDisplay}
              getEstadoBadgeColor={getEstadoBadgeColor}
              cargarEventos={cargarEventos}
              handleEditarEvento={handleEditarEvento}
              handleVerCapacidad={handleVerCapacidad}
              handleCambiarEstado={handleCambiarEstado}
            />
          </main>
        </div>
      </div>

      <EventModals
        showEditModal={showEditModal} setShowEditModal={setShowEditModal}
        nombreEvento={nombreEvento} setNombreEvento={setNombreEvento}
        descripcion={descripcion} setDescripcion={setDescripcion}
        fechaInicio={fechaInicio} setFechaInicio={setFechaInicio}
        fechaFin={fechaFin} setFechaFin={setFechaFin}
        lugarEvento={lugarEvento} setLugarEvento={setLugarEvento}
        cupoMaximo={cupoMaximo} setCupoMaximo={setCupoMaximo}
        estado={estado} setEstado={setEstado}
        guardandoEvento={guardandoEvento}
        handleGuardarEvento={handleGuardarEvento}
        showCapacidadModal={showCapacidadModal} setShowCapacidadModal={setShowCapacidadModal}
        capacidadInfo={capacidadInfo}
      />
    </div>
  );
}
