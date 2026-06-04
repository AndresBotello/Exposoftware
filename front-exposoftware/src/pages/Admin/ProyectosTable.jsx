import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useState } from 'react';
import { generateApprovedProyectosPDF } from '../../utils/generateProyectosPDF';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { fetchApi } from '../../utils/apiClient';
import { getAuthHeaders } from '../../Services/AuthService';
import { API_BASE_URL } from '../../utils/constants';
import QRCalificacionModal from '../Teacher/QRCalificacionModal';

const TIPOS_ACTIVIDAD = {
  1: { label: 'Exposoftware', severity: 'success' },
  2: { label: 'Ponencia', severity: 'warning' },
  3: { label: 'Taller', severity: 'danger' },
  4: { label: 'Conferencia', severity: 'info' },
};

const ESTADOS = {
  pendiente: { severity: 'warning', icon: 'pi-clock', label: 'Pendiente' },
  aprobado: { severity: 'success', icon: 'pi-check-circle', label: 'Aprobado' },
  calificado: { severity: 'info', icon: 'pi-star-fill', label: 'Calificado' },
  rechazado: { severity: 'danger', icon: 'pi-times-circle', label: 'Rechazado' },
};

export default function ProyectosTable({ proyectos, loading, globalFilter, setGlobalFilter, cargarProyectos, onVerDetalles, onEliminar }) {
  const toast = useRef(null);
  const [estadoFilter, setEstadoFilter] = useState('');
  const [docenteFilter, setDocenteFilter] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedProjectForQR, setSelectedProjectForQR] = useState(null);

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      await generateApprovedProyectosPDF(proyectos);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'PDF generado correctamente', life: 3000 });
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al generar el PDF', life: 5000 });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getEstadosPermitidos = (estadoActual) => {
    const transiciones = {
      pendiente: [
        { label: 'Aprobado', value: 'aprobado' },
        { label: 'Rechazado', value: 'rechazado' },
        { label: 'Calificado', value: 'calificado' }
      ],
      aprobado: [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Rechazado', value: 'rechazado' },
        { label: 'Calificado', value: 'calificado' }
      ],
      rechazado: [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Aprobado', value: 'aprobado' }
      ],
      calificado: [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Aprobado', value: 'aprobado' }
      ]
    };
    return transiciones[estadoActual] || [];
  };

  const cambiarEstadoProyecto = async () => {
    if (!selectedProyecto || !nuevoEstado) {
      toast.current?.show({ severity: 'warn', summary: 'Advertencia', detail: 'Selecciona un nuevo estado', life: 3000 });
      return;
    }

    setCambiandoEstado(true);
    try {
      const endpoint = `/api/v1/proyectos/${selectedProyecto.id_proyecto}`;

      console.log('Intentando cambiar estado:', {
        endpoint,
        proyecto: selectedProyecto.id_proyecto,
        nuevoEstado
      });

      const response = await fetchApi(endpoint, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: `Proyecto "${selectedProyecto.titulo_proyecto}" cambió a "${nuevoEstado}"`,
        life: 3000
      });

      setShowEstadoModal(false);
      setNuevoEstado('');
      setSelectedProyecto(null);
      cargarProyectos();
    } catch (error) {
      console.error('Error completo al cambiar estado:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `No se pudo cambiar el estado: ${error.message}`,
        life: 5000
      });
    } finally {
      setCambiandoEstado(false);
    }
  };

  const abrirModalCambioEstado = (proyecto) => {
    setSelectedProyecto(proyecto);
    setNuevoEstado('');
    setShowEstadoModal(true);
  };

  const handleOpenQRModal = (project) => {
    setSelectedProjectForQR(project);
    setShowQRModal(true);
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setSelectedProjectForQR(null);
  };

  const tipoActividadTemplate = (rowData) => {
    const tipo = TIPOS_ACTIVIDAD[rowData.tipo_actividad] || { label: 'Desconocido', severity: 'secondary' };
    return <Tag value={tipo.label} severity={tipo.severity} />;
  };

  const estadoTemplate = (rowData) => {
    const estado = ESTADOS[rowData.estado] || ESTADOS['pendiente'];
    return <Tag value={estado.label} severity={estado.severity} icon={`pi ${estado.icon}`} />;
  };

  const calificacionTemplate = (rowData) => {
    if (rowData.calificacion === null || rowData.calificacion === undefined) {
      return <span className="text-gray-400">Sin calificar</span>;
    }
    return (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-blue-600">{rowData.calificacion.toFixed(1)}</span>
        <i className="pi pi-pencil text-blue-500 text-sm"></i>
      </div>
    );
  };

  const nombreTemplate = (rowData) => {
    const nombre = rowData.titulo_proyecto || rowData.titulo || 'Proyecto sin nombre';
    return (
      <div className="flex flex-col gap-1">
        <span className="font-medium text-gray-900">{nombre}</span>
      </div>
    );
  };

  const docenteTemplate = (rowData) => {
    const docente = rowData.docentes_materias?.[0]?.nombre_docente;
    if (!docente) {
      return <span className="text-gray-400">No asignado</span>;
    }
    return <span className="text-gray-900">{docente}</span>;
  };

  const accionesTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-check-circle"
        rounded
        outlined
        severity="success"
        tooltip="Cambiar estado"
        tooltipOptions={{ position: 'top' }}
        onClick={() => abrirModalCambioEstado(rowData)}
        disabled={getEstadosPermitidos(rowData.estado).length === 0}
      />
      <Button
        icon="pi pi-eye"
        rounded
        outlined
        severity="info"
        tooltip="Ver detalles"
        tooltipOptions={{ position: 'top' }}
        onClick={() => onVerDetalles(rowData)}
      />
      {rowData.estado === 'aprobado' && (
        <Button
          icon="pi pi-qrcode"
          rounded
          outlined
          severity="warning"
          tooltip="Generar QR de calificación"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleOpenQRModal(rowData)}
        />
      )}
      <Button
        icon="pi pi-trash"
        rounded
        outlined
        severity="danger"
        tooltip="Eliminar permanentemente"
        tooltipOptions={{ position: 'top' }}
        onClick={() => {
          if (window.confirm(`⚠️ ADVERTENCIA: Esta acción no se puede deshacer.\n\nEliminará permanentemente:\n• El proyecto "${rowData.titulo_proyecto}"\n• Todos sus datos relacionados\n• Integrantes, clases asignadas, historial\n\n¿Está seguro de que desea continuar?`)) {
            onEliminar(rowData.id_proyecto);
          }
        }}
      />
    </div>
  );

  const filteredProyectos = proyectos.filter(p => {
    const estadoMatch = !estadoFilter || p.estado === estadoFilter;
    const docenteMatch = !docenteFilter ||
      p.docentes_materias?.[0]?.nombre_docente
        ?.toLowerCase()
        .includes(docenteFilter.toLowerCase());
    return estadoMatch && docenteMatch;
  });

  const statCards = [
    {
      label: 'Total Proyectos',
      value: proyectos.length,
      bgGradient: 'from-teal-500 to-teal-600',
      icon: 'pi-briefcase',
      textColor: 'text-white'
    },
    {
      label: 'Pendientes',
      value: proyectos.filter(p => p.estado === 'pendiente').length,
      bgGradient: 'from-amber-500 to-amber-600',
      icon: 'pi-clock',
      textColor: 'text-white'
    },
    {
      label: 'Aprobados',
      value: proyectos.filter(p => p.estado === 'aprobado').length,
      bgGradient: 'from-green-500 to-green-600',
      icon: 'pi-check-circle',
      textColor: 'text-white'
    },
    {
      label: 'Calificados',
      value: proyectos.filter(p => p.estado === 'calificado').length,
      bgGradient: 'from-blue-500 to-blue-600',
      icon: 'pi-star-fill',
      textColor: 'text-white'
    },
    {
      label: 'Rechazados',
      value: proyectos.filter(p => p.estado === 'rechazado').length,
      bgGradient: 'from-red-500 to-red-600',
      icon: 'pi-times-circle',
      textColor: 'text-white'
    },
  ];

  return (
    <>
      <Toast ref={toast} />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {statCards.map(({ label, value, bgGradient, icon, textColor }) => (
          <div key={label} className={`bg-gradient-to-br ${bgGradient} rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white opacity-90">{label}</p>
                <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className={`pi ${icon} text-xl text-white`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <i className="pi pi-briefcase text-lg text-white"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Proyectos</h2>
                <p className="text-xs text-gray-500">Gestión y visualización de proyectos</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="p-input-icon-left w-full md:w-auto">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar proyectos..." className="w-full" />
              </span>
              <Button
                icon={generatingPDF ? 'pi pi-spin pi-spinner' : 'pi pi-file-pdf'}
                rounded
                outlined
                severity="warning"
                tooltip="Descargar informe PDF"
                tooltipOptions={{ position: 'top' }}
                onClick={handleGeneratePDF}
                disabled={generatingPDF}
              />
              <Button icon="pi pi-refresh" rounded outlined severity="secondary" tooltip="Actualizar lista" tooltipOptions={{ position: 'top' }} onClick={cargarProyectos} />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="calificado">Calificado</option>
              <option value="rechazado">Rechazado</option>
            </select>

            <input
              type="text"
              placeholder="Filtrar por nombre de docente..."
              value={docenteFilter}
              onChange={(e) => setDocenteFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white flex-1 md:flex-none md:w-64"
            />
          </div>
        </div>

        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
              <p className="text-sm text-gray-500 mt-4">Cargando proyectos...</p>
            </div>
          </div>
        ) : filteredProyectos.length === 0 ? (
          
          <div className="text-center py-16 px-4 border-t border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <i className="pi pi-inbox text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay proyectos</h3>
            <p className="text-gray-600">
              {estadoFilter || docenteFilter
                ? `No hay proyectos que coincidan con los filtros aplicados${estadoFilter ? ` (estado: "${estadoFilter}")` : ''}${docenteFilter ? ` (docente: "${docenteFilter}")` : ''}`
                : 'Aún no se ha registrado ningún proyecto en el sistema'}
            </p>
            {(estadoFilter || docenteFilter) && (
              <button
                onClick={() => {
                  setEstadoFilter('');
                  setDocenteFilter('');
                }}
                className="mt-4 text-sm font-semibold text-teal-600 hover:text-teal-700 underline focus:outline-none"
              >
                Restablecer filtros
              </button>
            )}
          </div>
        ) : (
        
          <DataTable
            value={filteredProyectos} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
            globalFilter={globalFilter}
            globalFilterFields={['titulo_proyecto', 'titulo', 'id_tipo_actividad', 'estado', 'nombre_docente', 'nombre_linea', 'nombre_area', 'nombre_materia']}
            filterDisplay="menu"
            stripedRows sortField="created_at" sortOrder={-1} responsiveLayout="scroll"
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proyectos"
            size="small"
            className="p-datatable-striped"
            rowClassName={(rowData) => rowData.estado === 'aprobado' ? 'bg-green-50/50 hover:bg-green-100/70 transition-colors' : 'hover:bg-gray-50 transition-colors'}
          >
            <Column field="titulo_proyecto" header="Nombre del Proyecto" body={nombreTemplate} sortable style={{ minWidth: '280px' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600' }} />
            <Column field="id_tipo_actividad" header="Tipo" body={tipoActividadTemplate} sortable style={{ minWidth: '140px' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600' }} />
            <Column field="docentes_materias" header="Docente Responsable" body={docenteTemplate} sortable style={{ minWidth: '200px' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600' }} />
            <Column field="calificacion" header="Calificación" body={calificacionTemplate} sortable style={{ minWidth: '120px', textAlign: 'center' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600', textAlign: 'center' }} />
            <Column field="estado" header="Estado" body={estadoTemplate} sortable style={{ minWidth: '130px' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600' }} />
            <Column header="Acciones" body={accionesTemplate} exportable={false} style={{ minWidth: '80px', textAlign: 'center' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600', textAlign: 'center' }} />
          </DataTable>
        )}
      </div>

      <Dialog
        visible={showEstadoModal}
        onHide={() => {
          setShowEstadoModal(false);
          setNuevoEstado('');
          setSelectedProyecto(null);
        }}
        header="Cambiar Estado del Proyecto"
        modal
        style={{ width: '35vw' }}
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
      >
        {selectedProyecto && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Proyecto:</p>
              <p className="text-base font-medium text-gray-900">{selectedProyecto.titulo_proyecto}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Estado Actual:</p>
              <Tag
                value={ESTADOS[selectedProyecto.estado]?.label || 'Desconocido'}
                severity={ESTADOS[selectedProyecto.estado]?.severity || 'secondary'}
                icon={`pi ${ESTADOS[selectedProyecto.estado]?.icon || ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nuevo Estado:
              </label>
              <Dropdown
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.value)}
                options={getEstadosPermitidos(selectedProyecto.estado)}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecciona un nuevo estado"
                className="w-full"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
              <Button
                label="Cancelar"
                severity="secondary"
                onClick={() => {
                  setShowEstadoModal(false);
                  setNuevoEstado('');
                  setSelectedProyecto(null);
                }}
                disabled={cambiandoEstado}
              />
              <Button
                label="Cambiar Estado"
                severity="success"
                loading={cambiandoEstado}
                disabled={!nuevoEstado || cambiandoEstado}
                onClick={cambiarEstadoProyecto}
              />
            </div>
          </div>
        )}
      </Dialog>

      <QRCalificacionModal
        isOpen={showQRModal}
        projectId={selectedProjectForQR?.id_proyecto}
        projectName={selectedProjectForQR?.titulo_proyecto}
        onClose={handleCloseQRModal}
      />
    </>
  );
}