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
        {rowData.id_proyecto && <span className="text-xs text-gray-500">ID: {rowData.id_proyecto}</span>}
      </div>
    );
  };

  const accionesTemplate = (rowData) => (
    <Button icon="pi pi-eye" rounded outlined severity="info" tooltip="Ver detalles" tooltipOptions={{ position: 'top' }} onClick={() => onVerDetalles(rowData)} />
  );

  const header = (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-2">
        <i className="pi pi-briefcase text-2xl text-teal-600"></i>
        <h2 className="text-xl font-bold text-gray-900">Gestión de Proyectos</h2>
      </div>
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar proyectos..." className="w-full md:w-80" />
        </span>
        <Button icon="pi pi-refresh" rounded outlined tooltip="Actualizar lista" tooltipOptions={{ position: 'top' }} onClick={cargarProyectos} />
      </div>
    </div>
  );

  const statCards = [
    { label: 'Total Proyectos', value: proyectos.length, color: 'teal', icon: 'pi-briefcase', textColor: 'text-gray-900' },
    { label: 'Pendientes', value: proyectos.filter(p => p.estado_calificacion === 'pendiente').length, color: 'yellow', icon: 'pi-clock', textColor: 'text-yellow-600' },
    { label: 'Aprobados', value: proyectos.filter(p => p.estado_calificacion === 'aprobado').length, color: 'green', icon: 'pi-check-circle', textColor: 'text-green-600' },
    { label: 'Reprobados', value: proyectos.filter(p => p.estado_calificacion === 'reprobado').length, color: 'red', icon: 'pi-times-circle', textColor: 'text-red-600' },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, color, icon, textColor }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
              </div>
              <div className={`w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center`}>
                <i className={`pi ${icon} text-${color}-600`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
              <p className="text-sm text-gray-500 mt-4">Cargando proyectos...</p>
            </div>
          </div>
        ) : (
          <DataTable
            value={proyectos} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
            header={header} globalFilter={globalFilter}
            globalFilterFields={['titulo_proyecto', 'titulo', 'id_proyecto', 'tipo_actividad', 'estado_calificacion', 'id_docente.nombre', 'nombre_linea', 'nombre_area', 'codigo_materia']}
            filterDisplay="menu" emptyMessage="No se encontraron proyectos"
            stripedRows sortField="fecha_creacion" sortOrder={-1} responsiveLayout="scroll"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proyectos"
          >
            <Column field="titulo_proyecto" header="Nombre del Proyecto" body={nombreTemplate} sortable style={{ minWidth: '250px' }} />
            <Column field="tipo_actividad" header="Tipo" body={tipoActividadTemplate} sortable style={{ minWidth: '150px' }} />
            <Column field="calificacion" header="Calificación" body={calificacionTemplate} sortable style={{ minWidth: '130px' }} />
            <Column field="estado_calificacion" header="Estado" body={estadoCalificacionTemplate} sortable style={{ minWidth: '150px' }} />
            <Column header="Acciones" body={accionesTemplate} exportable={false} style={{ minWidth: '100px' }} />
          </DataTable>
        )}
      </div>
    </>
  );
}
