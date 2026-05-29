import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useState } from 'react';

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
};

export default function ProyectosTable({ proyectos, loading, globalFilter, setGlobalFilter, cargarProyectos, onVerDetalles }) {
  const [estadoFilter, setEstadoFilter] = useState('');

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

  const accionesTemplate = (rowData) => (
    <Button icon="pi pi-eye" rounded outlined severity="info" tooltip="Ver detalles" tooltipOptions={{ position: 'top' }} onClick={() => onVerDetalles(rowData)} />
  );

  const filteredProyectos = estadoFilter
    ? proyectos.filter(p => p.estado === estadoFilter)
    : proyectos;

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
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            </select>
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
              {estadoFilter ? `No hay proyectos con el estado "${estadoFilter}"` : 'Aún no se ha registrado ningún proyecto en el sistema'}
            </p>
            {estadoFilter && (
              <button 
                onClick={() => setEstadoFilter('')}
                className="mt-4 text-sm font-semibold text-teal-600 hover:text-teal-700 underline focus:outline-none"
              >
                Restablecer filtro de estado
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
            <Column field="calificacion" header="Calificación" body={calificacionTemplate} sortable style={{ minWidth: '120px', textAlign: 'center' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600', textAlign: 'center' }} />
            <Column field="estado" header="Estado" body={estadoTemplate} sortable style={{ minWidth: '130px' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600' }} />
            <Column header="Acciones" body={accionesTemplate} exportable={false} style={{ minWidth: '80px', textAlign: 'center' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600', textAlign: 'center' }} />
          </DataTable>
        )}
      </div>
    </>
  );
}