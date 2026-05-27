import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';

const TIPOS_ACTIVIDAD = {
  1: { label: 'Exposoftware', severity: 'success' },
  2: { label: 'Ponencia', severity: 'warning' },
  3: { label: 'Taller', severity: 'danger' },
  4: { label: 'Conferencia', severity: 'info' },
};

const ESTADOS_CALIFICACION = {
  pendiente: { severity: 'warning', icon: 'pi-clock' },
  aprobado: { severity: 'success', icon: 'pi-check-circle' },
  reprobado: { severity: 'danger', icon: 'pi-times-circle' },
};

export default function ProyectosTable({ proyectos, loading, globalFilter, setGlobalFilter, cargarProyectos, onVerDetalles }) {
  const tipoActividadTemplate = (rowData) => {
    const tipo = TIPOS_ACTIVIDAD[rowData.tipo_actividad] || { label: 'Desconocido', severity: 'secondary' };
    return <Tag value={tipo.label} severity={tipo.severity} />;
  };

  const estadoCalificacionTemplate = (rowData) => {
    const estado = ESTADOS_CALIFICACION[rowData.estado_calificacion] || ESTADOS_CALIFICACION['pendiente'];
    return <Tag value={rowData.estado_calificacion || 'pendiente'} severity={estado.severity} icon={`pi ${estado.icon}`} />;
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

  const header = (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-2">
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
  );

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
      value: proyectos.filter(p => p.estado_calificacion === 'pendiente').length,
      bgGradient: 'from-amber-500 to-amber-600',
      icon: 'pi-clock',
      textColor: 'text-white'
    },
    {
      label: 'Aprobados',
      value: proyectos.filter(p => p.estado_calificacion === 'aprobado').length,
      bgGradient: 'from-green-500 to-green-600',
      icon: 'pi-check-circle',
      textColor: 'text-white'
    },
    {
      label: 'Reprobados',
      value: proyectos.filter(p => p.estado_calificacion === 'reprobado').length,
      bgGradient: 'from-red-500 to-red-600',
      icon: 'pi-times-circle',
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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
              <p className="text-sm text-gray-500 mt-4">Cargando proyectos...</p>
            </div>
          </div>
        ) : proyectos.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <i className="pi pi-inbox text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay proyectos</h3>
            <p className="text-gray-600">Aún no se ha registrado ningún proyecto en el sistema</p>
          </div>
        ) : (
          <DataTable
            value={proyectos} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
            header={header} globalFilter={globalFilter}
            globalFilterFields={['titulo_proyecto', 'titulo', 'tipo_actividad', 'estado_calificacion', 'id_docente.nombre', 'nombre_linea', 'nombre_area', 'codigo_materia']}
            filterDisplay="menu"
            stripedRows sortField="fecha_creacion" sortOrder={-1} responsiveLayout="scroll"
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proyectos"
            size="small"
            className="p-datatable-striped"
            rowClassName={(rowData) => rowData.estado_calificacion === 'aprobado' ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}
          >
            <Column field="titulo_proyecto" header="Nombre del Proyecto" body={nombreTemplate} sortable style={{ minWidth: '280px' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600' }} />
            <Column field="tipo_actividad" header="Tipo" body={tipoActividadTemplate} sortable style={{ minWidth: '140px' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600' }} />
            <Column field="calificacion" header="Calificación" body={calificacionTemplate} sortable style={{ minWidth: '120px', textAlign: 'center' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600', textAlign: 'center' }} />
            <Column field="estado_calificacion" header="Estado" body={estadoCalificacionTemplate} sortable style={{ minWidth: '130px' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600' }} />
            <Column header="Acciones" body={accionesTemplate} exportable={false} style={{ minWidth: '80px', textAlign: 'center' }} headerStyle={{ backgroundColor: '#f8fafc', fontWeight: '600', textAlign: 'center' }} />
          </DataTable>
        )}
      </div>
    </>
  );
}
