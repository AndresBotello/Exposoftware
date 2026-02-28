import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import logo from '../../assets/Logo-unicesar.png';
import * as AuthService from '../../Services/AuthService';
import EventosService from '../../Services/EventosService';
import axios from 'axios';

const API_BASE_URL = 'https://mtfr4g8e3k.execute-api.us-east-2.amazonaws.com';

/**
 * Componente para la gestión administrativa de proyectos
 * - Listar todos los proyectos
 * - Buscar y filtrar proyectos
 * - Ver detalles de proyectos
 * - Filtrar por tipo de actividad y estado de calificación
 */
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

  // Cargar datos del usuario autenticado
  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) {
      setUserData(user);
      console.log('👤 Usuario autenticado:', user);
    } else {
      console.warn('⚠️ No hay usuario autenticado');
      navigate('/login');
    }
  }, [navigate]);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    cargarProyectos();
    cargarEventos();
  }, []);

  /**
   * Cargar todos los proyectos desde el backend
   */
  const cargarProyectos = async () => {
    try {
      setLoading(true);
      const headers = AuthService.getAuthHeaders();
      
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/proyectos`,
        { headers }
      );

      console.log('📦 Proyectos obtenidos:', response.data);
      
      const proyectosData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || response.data?.proyectos || [];

      setProyectos(proyectosData);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Proyectos Cargados',
        detail: `${proyectosData.length} proyecto(s) encontrado(s)`,
        life: 3000
      });

      // Recargar eventos también por si hay cambios
      await cargarEventos();
    } catch (error) {
      console.error('❌ Error al cargar proyectos:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los proyectos',
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar todos los eventos para resolver nombres por ID
   */
  const cargarEventos = async () => {
    try {
      const eventosData = await EventosService.obtenerEventosAdmin();
      console.log('📅 Eventos cargados para resolución de nombres:', eventosData);
      setEventos(eventosData);
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
      // No mostrar toast aquí ya que es carga en background
    }
  };

  // Funciones para cerrar sesión
  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      try {
        await AuthService.logout();
        navigate('/login');
      } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
      }
    }
  };

  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  /**
   * Obtener nombre del evento por ID
   */
  const getNombreEvento = (idEvento) => {
    if (!idEvento) return 'Sin evento asignado';
    const evento = eventos.find(e => e.id_evento === idEvento || e.id === idEvento);
    return evento ? (evento.nombre_evento || 'Evento desconocido') : `Evento no encontrado (ID: ${idEvento})`;
  };

  /**
   * Abrir diálogo de detalles del proyecto
   */
  const verDetalles = (proyecto) => {
    console.log('📋 Ver detalles del proyecto:', proyecto);
    setSelectedProyecto(proyecto);
    setNombreEvento(getNombreEvento(proyecto.id_evento));
    setShowDetalleDialog(true);
  };

  // Templates para columnas del DataTable
  
  /**
   * Template para el tipo de actividad
   */
  const tipoActividadTemplate = (rowData) => {
    const tipos = {
      1: { label: 'Exposoftware', severity: 'success' },
      2: { label: 'Ponencia', severity: 'warning' },
      3: { label: 'Taller', severity: 'danger' },
      4: { label: 'Conferencia', severity: 'info' }
    };
    
    const tipo = tipos[rowData.tipo_actividad] || { label: 'Desconocido', severity: 'secondary' };
    
    return <Tag value={tipo.label} severity={tipo.severity} />;
  };

  /**
   * Template para el estado de calificación
   */
  const estadoCalificacionTemplate = (rowData) => {
    const estados = {
      'pendiente': { severity: 'warning', icon: 'pi-clock' },
      'aprobado': { severity: 'success', icon: 'pi-check-circle' },
      'reprobado': { severity: 'danger', icon: 'pi-times-circle' }
    };
    
    const estado = estados[rowData.estado_calificacion] || estados['pendiente'];
    
    return (
      <Tag 
        value={rowData.estado_calificacion || 'pendiente'} 
        severity={estado.severity}
        icon={`pi ${estado.icon}`}
      />
    );
  };

  /**
   * Template para la calificación
   */
  const calificacionTemplate = (rowData) => {
    if (rowData.calificacion === null || rowData.calificacion === undefined) {
      return <span className="text-gray-400">Sin calificar</span>;
    }

    return (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-blue-600">
          {rowData.calificacion.toFixed(1)}
        </span>
        <i className="pi pi-pencil text-blue-500 text-sm"></i>
      </div>
    );
  };

  /**
   * Template para el nombre del proyecto
   */
  const nombreTemplate = (rowData) => {
    const nombre = rowData.titulo_proyecto || rowData.titulo || rowData.titulo_proyecto || 'Proyecto sin nombre';
    return (
      <div className="flex flex-col gap-1">
        <span className="font-medium text-gray-900">{nombre}</span>
        {rowData.id_proyecto && (
          <span className="text-xs text-gray-500">ID: {rowData.id_proyecto}</span>
        )}
      </div>
    );
  };

  /**
   * Template para las acciones
   */
  const accionesTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          rounded
          outlined
          severity="info"
          tooltip="Ver detalles"
          tooltipOptions={{ position: 'top' }}
          onClick={() => verDetalles(rowData)}
        />
      </div>
    );
  };

  // Header del DataTable
  const header = (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-2">
        <i className="pi pi-briefcase text-2xl text-teal-600"></i>
        <h2 className="text-xl font-bold text-gray-900">
          Gestión de Proyectos
        </h2>
      </div>
      
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full md:w-80"
          />
        </span>
        
        <Button
          icon="pi pi-refresh"
          rounded
          outlined
          tooltip="Actualizar lista"
          tooltipOptions={{ position: 'top' }}
          onClick={cargarProyectos}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo Unicesar" className="w-10 h-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Expo-software  </h1>
                <p className="text-xs text-gray-500">Universidad Popular del Cesar</p>
              </div>
            </div>

            {/* User avatar and logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:block">{getUserName()}</span>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">{getUserInitials()}</span>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
              >
                <i className="pi pi-sign-out"></i>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <AdminSidebar 
            userName={getUserName()} 
            userRole="Administrador" 
          />

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Proyectos</p>
                    <p className="text-2xl font-bold text-gray-900">{proyectos.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <i className="pi pi-briefcase text-teal-600"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {proyectos.filter(p => p.estado_calificacion === 'pendiente').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <i className="pi pi-clock text-yellow-600"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aprobados</p>
                    <p className="text-2xl font-bold text-green-600">
                      {proyectos.filter(p => p.estado_calificacion === 'aprobado').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="pi pi-check-circle text-green-600"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Reprobados</p>
                    <p className="text-2xl font-bold text-red-600">
                      {proyectos.filter(p => p.estado_calificacion === 'reprobado').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="pi pi-times-circle text-red-600"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Proyectos */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="4" />
                    <p className="text-sm text-gray-500 mt-4">Cargando proyectos...</p>
                  </div>
                </div>
              ) : (
                <DataTable
                  value={proyectos}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  header={header}
                  globalFilter={globalFilter}
                  globalFilterFields={[
                    'titulo_proyecto', 
                    'titulo', 
                    'id_proyecto', 
                    'tipo_actividad', 
                    'estado_calificacion',
                    'id_docente.nombre',
                    'nombre_linea',
                    'nombre_area',
                    'codigo_materia'
                  ]}
                  filterDisplay="menu"
                  emptyMessage="No se encontraron proyectos"
                  stripedRows
                  sortField="fecha_creacion"
                  sortOrder={-1}
                  responsiveLayout="scroll"
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proyectos"
                >
                  <Column 
                    field="titulo_proyecto" 
                    header="Nombre del Proyecto" 
                    body={nombreTemplate}
                    sortable 
                    filterField="titulo_proyecto"
                    showFilterMenu={false}
                    style={{ minWidth: '250px' }}
                  />
                  <Column 
                    field="tipo_actividad" 
                    header="Tipo" 
                    body={tipoActividadTemplate}
                    sortable 
                    filterField="tipo_actividad"
                    showFilterMenu={false}
                    style={{ minWidth: '150px' }}
                  />
                  <Column 
                    field="calificacion" 
                    header="Calificación" 
                    body={calificacionTemplate}
                    sortable 
                    filterField="calificacion"
                    showFilterMenu={false}
                    style={{ minWidth: '130px' }}
                  />
                  <Column 
                    field="estado_calificacion" 
                    header="Estado" 
                    body={estadoCalificacionTemplate}
                    sortable 
                    filterField="estado_calificacion"
                    showFilterMenu={false}
                    style={{ minWidth: '150px' }}
                  />
                  <Column 
                    header="Acciones" 
                    body={accionesTemplate}
                    exportable={false}
                    style={{ minWidth: '100px' }}
                  />
                </DataTable>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Diálogo de Detalles del Proyecto */}
      <Dialog
        header="Detalles del Proyecto"
        visible={showDetalleDialog}
        style={{ width: '700px' }}
        onHide={() => setShowDetalleDialog(false)}
        footer={
          <div>
            <Button
              label="Cerrar"
              icon="pi pi-times"
              onClick={() => setShowDetalleDialog(false)}
              className="p-button-text"
            />
          </div>
        }
      >
        {selectedProyecto && (
          <div className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="pi pi-tag text-blue-600"></i>
                  <label className="text-sm font-semibold text-blue-900">Título del Proyecto</label>
                </div>
                <p className="text-base font-medium text-blue-800">
                  {selectedProyecto.titulo_proyecto || selectedProyecto.titulo || 'N/A'}
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="pi pi-hashtag text-purple-600"></i>
                  <label className="text-sm font-semibold text-purple-900">ID del Proyecto</label>
                </div>
                <p className="text-base font-medium text-purple-800">{selectedProyecto.id_proyecto || 'N/A'}</p>
              </div>
            </div>

            {/* Evento */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="pi pi-calendar text-green-600"></i>
                <label className="text-sm font-semibold text-green-900">Evento</label>
              </div>
              <p className="text-base font-medium text-green-800">{nombreEvento}</p>
            </div>

            {/* Docente/Profesor */}
            {selectedProyecto.id_docente && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="pi pi-user text-teal-600"></i>
                  <label className="text-sm font-semibold text-teal-900">Docente Responsable</label>
                </div>
                <p className="text-base font-medium text-teal-800">
                  {selectedProyecto.id_docente.nombre || selectedProyecto.id_docente || 'No asignado'}
                </p>
              </div>
            )}

            {/* Participantes/Estudiantes */}
            {selectedProyecto.id_estudiantes && selectedProyecto.id_estudiantes.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <i className="pi pi-users text-indigo-600"></i>
                  <label className="text-sm font-semibold text-indigo-900">Estudiantes Participantes</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedProyecto.id_estudiantes.map((estudiante, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-md border border-indigo-100">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-600">
                          {(estudiante.nombre || estudiante).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-indigo-800">
                        {estudiante.nombre || estudiante}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="pi pi-cog text-orange-600"></i>
                  <label className="text-sm font-semibold text-orange-900">Tipo de Actividad</label>
                </div>
                <div className="mt-1">{tipoActividadTemplate(selectedProyecto)}</div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="pi pi-info-circle text-yellow-600"></i>
                  <label className="text-sm font-semibold text-yellow-900">Estado</label>
                </div>
                <div className="mt-1">{estadoCalificacionTemplate(selectedProyecto)}</div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="pi pi-pencil text-red-600"></i>
                  <label className="text-sm font-semibold text-red-900">Calificación</label>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-semibold text-red-800">
                    {selectedProyecto.calificacion ? selectedProyecto.calificacion.toFixed(1) : 'Sin calificar'}
                  </span>
                  {selectedProyecto.calificacion && (
                    <i className="pi pi-pencil text-red-500 text-sm"></i>
                  )}
                </div>
              </div>
            </div>

            {/* Información académica */}
            {(selectedProyecto.nombre_linea || selectedProyecto.nombre_area || selectedProyecto.codigo_materia) && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <i className="pi pi-graduation-cap text-slate-600"></i>
                  <label className="text-sm font-semibold text-slate-900">Información Académica</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedProyecto.nombre_linea && (
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Línea de Investigación</p>
                      <p className="text-sm font-medium text-slate-800">{selectedProyecto.nombre_linea}</p>
                    </div>
                  )}
                  {selectedProyecto.nombre_area && (
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Área Temática</p>
                      <p className="text-sm font-medium text-slate-800">{selectedProyecto.nombre_area}</p>
                    </div>
                  )}
                  {selectedProyecto.codigo_materia && (
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Materia</p>
                      <p className="text-sm font-medium text-slate-800">{selectedProyecto.codigo_materia}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Descripción */}
            {selectedProyecto.descripcion && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="pi pi-align-left text-gray-600"></i>
                  <label className="text-sm font-semibold text-gray-900">Descripción</label>
                </div>
                <p className="text-base text-gray-700 leading-relaxed">{selectedProyecto.descripcion}</p>
              </div>
            )}

            {/* Documento PDF */}
            {selectedProyecto.archivo_pdf && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="pi pi-file-pdf text-red-600"></i>
                  <label className="text-sm font-semibold text-red-900">Documento PDF</label>
                </div>
                <a
                  href={selectedProyecto.archivo_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <i className="pi pi-external-link"></i>
                  Ver PDF del Proyecto
                </a>
              </div>
            )}

            {/* Fecha de subida */}
            {selectedProyecto.fecha_subida && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="pi pi-calendar-plus text-cyan-600"></i>
                  <label className="text-sm font-semibold text-cyan-900">Fecha de Subida</label>
                </div>
                <p className="text-base font-medium text-cyan-800">
                  {new Date(selectedProyecto.fecha_subida).toLocaleString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
