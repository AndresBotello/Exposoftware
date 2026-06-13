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
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [nombreEvento, setNombreEvento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [lugarEvento, setLugarEvento] = useState("");
  const [fechaAperturaInscripciones, setFechaAperturaInscripciones] = useState("");
  const [fechaCierreInscripciones, setFechaCierreInscripciones] = useState("");
  const [cupoMaximo, setCupoMaximo] = useState("");
  const [estado, setEstado] = useState("ACTIVO");
  const [guardandoEvento, setGuardandoEvento] = useState(false);
  const [showCapacidadModal, setShowCapacidadModal] = useState(false);
  const [capacidadInfo, setCapacidadInfo] = useState(null);

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    setLoadingEventos(true);
    try {
      const data = await EventosService.obtenerEventosAdmin();
      const eventosOrdenados = data.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
      setEventos(eventosOrdenados);
      ejecutarFiltrado(filtroEstado, eventosOrdenados);
    } catch (error) {
      setEventos([]);
      setEventosFiltrados([]);
    } finally {
      setLoadingEventos(false);
    }
  };

  // Centralizamos la lógica de filtrado para evitar desfases
  const ejecutarFiltrado = (estadoAFiltrar, listaEventos) => {
    if (estadoAFiltrar === "TODOS") {
      setEventosFiltrados(listaEventos);
    } else {
      setEventosFiltrados(listaEventos.filter(evento => evento.estado === estadoAFiltrar));
    }
  };
  useEffect(() => {
    ejecutarFiltrado(filtroEstado, eventos);
  }, [filtroEstado, eventos]);

  const formatearFechaParaInput = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleEditarEvento = async (evento) => {
    try {
      const eventoCompleto = await EventosService.obtenerEventoPorIdAdmin(evento.id_evento);
      setEventoEditando(eventoCompleto);
      setNombreEvento(eventoCompleto.nombre_evento || "");
      setDescripcion(eventoCompleto.descripcion || "");
      setFechaInicio(formatearFechaParaInput(eventoCompleto.fecha_inicio));
      setFechaFin(formatearFechaParaInput(eventoCompleto.fecha_fin));
      setLugarEvento(eventoCompleto.lugar || "");
      setFechaAperturaInscripciones(formatearFechaParaInput(eventoCompleto.fecha_apertura_inscripciones));
      setFechaCierreInscripciones(formatearFechaParaInput(eventoCompleto.fecha_cierre_inscripciones));
      setCupoMaximo(eventoCompleto.cupo_maximo?.toString() || "");
      setEstado(eventoCompleto.estado || "ACTIVO");
      setShowEditModal(true);
    } catch (error) {
      alert("Error al cargar los datos del evento");
    }
  };

  const isValidStateTransition = (estadoActual, nuevoEstado) => {
    const transiciones = {
      'borrador': ['inscripciones_abiertas', 'cancelado'],
      'inscripciones_abiertas': ['inscripciones_cerradas', 'cancelado'],
      'inscripciones_cerradas': ['en_curso', 'cancelado'],
      'en_curso': ['finalizado', 'cancelado'],
      'finalizado': ['cancelado'],
      'cancelado': []
    };
    return transiciones[estadoActual]?.includes(nuevoEstado) || estadoActual === nuevoEstado;
  };

  const handleGuardarEvento = async (e) => {
    e.preventDefault();
    if (!nombreEvento || !descripcion || !fechaInicio || !fechaFin || !lugarEvento || !fechaAperturaInscripciones || !fechaCierreInscripciones) {
      alert("Por favor completa todos los campos"); return;
    }
    if (new Date(fechaFin) < new Date(fechaInicio)) { alert("La fecha de fin no puede ser anterior a la fecha de inicio"); return; }
    if (new Date(fechaCierreInscripciones) < new Date(fechaAperturaInscripciones)) { alert("La fecha de cierre de inscripciones no puede ser anterior a la apertura"); return; }
    if (new Date(fechaAperturaInscripciones) > new Date(fechaInicio)) { alert("La fecha de apertura de inscripciones no puede ser posterior a la fecha de inicio"); return; }
    if (new Date(fechaCierreInscripciones) > new Date(fechaInicio)) { alert("La fecha de cierre de inscripciones no puede ser posterior a la fecha de inicio del evento"); return; }

    const estadoActual = eventoEditando.estado;
    const huboChangioDeEstado = estadoActual !== estado;

    if (huboChangioDeEstado && !isValidStateTransition(estadoActual, estado)) {
      const transicionesValidas = {
        'borrador': 'inscripciones_abiertas',
        'inscripciones_abiertas': 'inscripciones_cerradas',
        'inscripciones_cerradas': 'en_curso',
        'en_curso': 'finalizado'
      }[estadoActual];
      alert(`Transición no permitida\n\nEstado actual: ${estadoActual}\nEstado solicitado: ${estado}\n\nPróximo estado permitido: ${transicionesValidas || 'ninguno (puede cancelar)'}`);
      return;
    }

    setGuardandoEvento(true);
    try {
      if (huboChangioDeEstado && nombreEvento === eventoEditando.nombre_evento && descripcion === eventoEditando.descripcion && lugarEvento === eventoEditando.lugar) {
        await EventosService.cambiarEstadoEvento(eventoEditando.id_evento, estado);
      } else {
        const convertirFecha = (fechaStr) => {
          if (!fechaStr) return null;
          const [datePart, timePart] = fechaStr.split('T');
          if (!datePart || !timePart) return null;
          const [year, month, day] = datePart.split('-');
          const [hours, minutes] = timePart.split(':');
          try {
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), 0);
            return date.toISOString();
          } catch (e) {
            return null;
          }
        };

        const payload = {
          nombre_evento: nombreEvento.trim(),
          descripcion: descripcion.trim(),
          lugar: lugarEvento.trim()
        };

        const fechaInicioISO = convertirFecha(fechaInicio);
        const fechaFinISO = convertirFecha(fechaFin);
        const fechaAperturaISO = convertirFecha(fechaAperturaInscripciones);
        const fechaCierreISO = convertirFecha(fechaCierreInscripciones);

        if (fechaInicioISO) payload.fecha_inicio = fechaInicioISO;
        if (fechaFinISO) payload.fecha_fin = fechaFinISO;
        if (fechaAperturaISO) payload.fecha_apertura_inscripciones = fechaAperturaISO;
        if (fechaCierreISO) payload.fecha_cierre_inscripciones = fechaCierreISO;

        if (cupoMaximo && cupoMaximo.toString().trim()) {
          const cupo = parseInt(cupoMaximo);
          if (!isNaN(cupo) && cupo > 0) {
            payload.cupo_maximo = cupo;
          }
        }

        await EventosService.actualizarEvento(eventoEditando.id_evento, payload);

        if (huboChangioDeEstado) {
          await EventosService.cambiarEstadoEvento(eventoEditando.id_evento, estado);
        }
      }

      alert("Evento actualizado exitosamente");
      setShowEditModal(false);
      cargarEventos();
    } catch (error) {
      alert(`Error al actualizar evento: ${error.message}`);
    } finally {
      setGuardandoEvento(false);
    }
  };

  const handleCambiarEstado = async (eventoId, nuevoEstado) => {
    if (!window.confirm(`¿Desea cambiar el estado del evento a ${nuevoEstado}?`)) return;
    try {
      await EventosService.cambiarEstadoEvento(eventoId, nuevoEstado);
      alert(`Estado cambiado a ${nuevoEstado}`);
      cargarEventos();
    } catch (error) {
      alert(`Error al cambiar estado: ${error.message}`);
    }
  };

  const handleVerCapacidad = async (eventoId) => {
    try {
      const data = await EventosService.verificarCapacidad(eventoId);
      setCapacidadInfo(data);
      setShowCapacidadModal(true);
    } catch (error) {
      alert("Error al obtener información de capacidad");
    }
  };

  const handleArchivarEvento = async (eventoId) => {
    if (!window.confirm("¿Está seguro de que desea archivar este evento? Esta acción es permanente y lo marcará como histórico.")) return;
    try {
      await EventosService.archivarEvento(eventoId);
      alert("✅ Evento archivado exitosamente");
      cargarEventos();
    } catch (error) {
      alert(`❌ Error al archivar evento: ${error.message}`);
    }
  };

  const formatearFechaDisplay = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getEstadoBadgeColor = (estadoEvento) => {
    const colors = {
      'borrador': 'bg-yellow-100 text-yellow-800',
      'inscripciones_abiertas': 'bg-green-100 text-green-800',
      'inscripciones_cerradas': 'bg-blue-100 text-blue-800',
      'en_curso': 'bg-purple-100 text-purple-800',
      'finalizado': 'bg-gray-100 text-gray-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[estadoEvento] || 'bg-blue-100 text-blue-800';
  };

  return (
    // Agregamos flex-col y min-h-screen para asegurar estabilidad vertical
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader userName={getUserName()} userInitials={getUserInitials()} onLogout={handleLogout} />

      {/* Crecimiento flexible para que el footer o fondo no colapsen */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start"> {/* items-start evita que el sidebar se estire o colapse raro */}
          
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

 
          <main className="lg:col-span-3 space-y-6 min-h-[600px] flex flex-col justify-start">        
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg shadow-lg p-8 w-full block">
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

            <div className="w-full block clear-both">
              <EventsTable
                loadingEventos={loadingEventos}
                eventosFiltrados={eventosFiltrados}
                eventos={eventos}
                filtroEstado={filtroEstado}
                setFiltroEstado={setFiltroEstado}
                formatearFechaDisplay={formatearFechaDisplay}
                getEstadoBadgeColor={getEstadoBadgeColor}
                cargarEventos={cargarEventos}
                handleEditarEvento={handleEditarEvento}
                handleVerCapacidad={handleVerCapacidad}
                handleCambiarEstado={handleCambiarEstado}
                handleArchivarEvento={handleArchivarEvento}
              />
            </div>
            
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
        fechaAperturaInscripciones={fechaAperturaInscripciones} setFechaAperturaInscripciones={setFechaAperturaInscripciones}
        fechaCierreInscripciones={fechaCierreInscripciones} setFechaCierreInscripciones={setFechaCierreInscripciones}
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