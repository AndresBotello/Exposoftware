import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import { AdminHeader, AdminPageHeader } from "../../components/Admin/AdminComponents";
import * as AuthService from '../../Services/AuthService';
import EventosService from '../../Services/EventosService';
import { API_ENDPOINTS } from '../../utils/constants';
import axios from 'axios';
import { eliminarProyectoPermanentemente, actualizarProyectoConArchivo } from '../../Services/ProjectsService';
import ProyectosTable from './ProyectosTable';
import ProyectoDetalleDialog from './ProyectoDetalleDialog';
import DescargarQRsLote from '../../components/Admin/DescargarQRsLote';
import { confirmarCierreSesion } from "../../utils/confirmDialog.jsx";
import { ordenarEventos, etiquetaEstadoEvento, elegirEventoActual, idEvento as idEventoDe } from '../../utils/eventoActual';

export default function GestionProyectos() {
  const navigate = useNavigate();
  const toast = useRef(null);
  const [userData, setUserData] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [showDetalleDialog, setShowDetalleDialog] = useState(false);
  const [nombreEvento, setNombreEvento] = useState('');
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [eventoFiltro, setEventoFiltro] = useState('');
  const eventoFiltroRef = useRef('');

  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) { setUserData(user); } else { navigate('/login'); }
  }, [navigate]);

  // Al entrar: primero se conocen los eventos y se abre el evento actual
  // (inscripciones abiertas > en curso > cerradas > finalizado), en vez de listar todos
  // los proyectos, donde aparecía primero lo del evento anterior.
  useEffect(() => {
    const iniciar = async () => {
      let idActual = '';
      try {
        const eventosData = await EventosService.obtenerEventosAdmin();
        const lista = Array.isArray(eventosData) ? eventosData : [];
        setEventos(ordenarEventos(lista));
        const actual = elegirEventoActual(lista);
        if (actual) idActual = String(idEventoDe(actual));
      } catch (error) {
        // Si no se pueden leer los eventos, se cargan todos los proyectos como antes
      }
      eventoFiltroRef.current = idActual;
      setEventoFiltro(idActual);
      await cargarProyectos(idActual);
    };
    iniciar();
  }, []);

  const cargarProyectos = async (arg) => {
    // Si no se indica un evento (texto), se usa el que está elegido en el selector
    const idEventoFiltro = typeof arg === 'string' ? arg : eventoFiltroRef.current;
    try {
      setLoading(true);
      const headers = AuthService.getAuthHeaders();
      let allProyectos = [];
      let pagina = 1;
      let tieneMas = true;

      // Construir URL con filtro de evento si existe
      const filtroEvento = idEventoFiltro ? `&id_evento=${idEventoFiltro}` : '';

      // Paginar hasta traer todos los proyectos
      while (tieneMas) {
        const response = await axios.get(`${API_ENDPOINTS.PROYECTOS}?page=${pagina}&limit=100${filtroEvento}`, {
          headers,
          withCredentials: true
        });

        const proyectosData = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        allProyectos = [...allProyectos, ...proyectosData];

        // Si trae menos de 100, es la última página
        if (proyectosData.length < 100) {
          tieneMas = false;
        }

        pagina++;
      }

      // El backend no siempre respeta el parámetro id_evento: se filtra también aquí para
      // que, con un evento elegido, nunca se mezclen proyectos de eventos anteriores.
      if (idEventoFiltro) {
        allProyectos = allProyectos.filter((p) => String(p.id_evento) === String(idEventoFiltro));
      }

      setProyectos(allProyectos);
      const textoEvento = idEventoFiltro ? ` del evento seleccionado` : '';
      toast.current?.show({ severity: 'success', summary: 'Proyectos Cargados', detail: `${allProyectos.length} proyecto(s) encontrado(s)${textoEvento}`, life: 3000 });
      await cargarEventos();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos', life: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const cargarEventos = async () => {
    try {
      const eventosData = await EventosService.obtenerEventosAdmin();
      setEventos(ordenarEventos(eventosData));
    } catch (error) {
    }
  };

  const handleEditProject = async (editData, archivoPDF = null) => {
    if (!selectedProyecto) return;

    try {
      const datosActualizacion = {
        titulo_proyecto: editData.titulo_proyecto,
        codigo_area: editData.codigo_area,
        codigo_linea: editData.codigo_linea,
        codigo_sublinea: editData.codigo_sublinea,
        id_tipo_actividad: editData.id_tipo_actividad
      };

      await actualizarProyectoConArchivo(selectedProyecto.id_proyecto, datosActualizacion, archivoPDF);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Proyecto actualizado correctamente', life: 5000 });
      setShowDetalleDialog(false);
      setSelectedProyecto(null);
      await cargarProyectos();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: `No se pudo actualizar: ${error.message}`, life: 5000 });
    }
  };

  const handleEliminarProyecto = async (projectId) => {
    try {
      await eliminarProyectoPermanentemente(projectId);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Proyecto eliminado permanentemente', life: 5000 });
      await cargarProyectos();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: `No se pudo eliminar: ${error.message}`, life: 5000 });
    }
  };

  const handleLogout = async () => {
    if (await confirmarCierreSesion()) {
      try { await AuthService.logout(); navigate('/login'); } catch (error) { console.error('❌ Error:', error); }
    }
  };

  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };

  const getUserInitials = () => getUserName().charAt(0).toUpperCase();

  const getNombreEvento = (idEvento) => {
    if (!idEvento) return 'Sin evento asignado';
    const evento = eventos.find(e => e.id_evento === idEvento || e.id === idEvento);
    return evento ? (evento.nombre_evento || 'Evento desconocido') : `Evento no encontrado (ID: ${idEvento})`;
  };

  const verDetalles = (proyecto) => {
    setSelectedProyecto(proyecto);
    setNombreEvento(getNombreEvento(proyecto.id_evento));
    setShowDetalleDialog(true);
  };

  const handleEventoFiltroChange = async (idEvento) => {
    eventoFiltroRef.current = idEvento;
    setEventoFiltro(idEvento);
    await cargarProyectos(idEvento);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />

      <AdminHeader userName={getUserName()} userInitials={getUserInitials()} onLogout={handleLogout} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />
          <main className="lg:col-span-3">
            <AdminPageHeader
              icon="pi-briefcase"
              title="Gestión de Proyectos"
              subtitle="Consulta, edita y administra los proyectos inscritos por evento"
            />

            {/* Sección de Filtro por Evento */}
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Filtrar Proyectos por Evento</h3>
                  <p className="text-xs text-gray-600 mb-3">Por defecto se muestra el evento actual. Elige otro evento o "Todos los eventos" para ver los anteriores</p>
                  <select
                    value={eventoFiltro}
                    onChange={(e) => handleEventoFiltroChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">-- Todos los eventos --</option>
                    {eventos.map((evento) => (
                      <option key={evento.id_evento || evento.id} value={evento.id_evento || evento.id}>
                        {evento.nombre_evento}
                        {etiquetaEstadoEvento(evento) ? ` · ${etiquetaEstadoEvento(evento)}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sección de Descargar QRs */}
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Descargar QRs de Proyectos Aprobados</h3>
                  <p className="text-xs text-gray-600">Selecciona un evento para descargar los QRs de calificación de todos los proyectos aprobados en formato ZIP</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                  <select
                    value={eventoSeleccionado?.id_evento || ''}
                    onChange={(e) => {
                      const evento = eventos.find(ev => ev.id_evento === e.target.value);
                      setEventoSeleccionado(evento);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">-- Seleccionar evento --</option>
                    {eventos.map((evento) => (
                      <option key={evento.id_evento} value={evento.id_evento}>
                        {evento.nombre_evento}
                      </option>
                    ))}
                  </select>
                  {eventoSeleccionado && (
                    <DescargarQRsLote
                      idEvento={eventoSeleccionado.id_evento}
                      nombreEvento={eventoSeleccionado.nombre_evento}
                    />
                  )}
                </div>
              </div>
            </div>

            <ProyectosTable
              proyectos={proyectos}
              loading={loading}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              cargarProyectos={cargarProyectos}
              onVerDetalles={verDetalles}
              onEliminar={handleEliminarProyecto}
            />
          </main>
        </div>
      </div>

      <ProyectoDetalleDialog
        showDetalleDialog={showDetalleDialog}
        setShowDetalleDialog={setShowDetalleDialog}
        selectedProyecto={selectedProyecto}
        nombreEvento={nombreEvento}
        onEliminar={handleEliminarProyecto}
        onEdit={handleEditProject}
        isAdmin={true}
      />
    </div>
  );
}
