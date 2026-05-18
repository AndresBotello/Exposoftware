import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

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

function TipoActividadTag({ tipoActividad }) {
  const tipo = TIPOS_ACTIVIDAD[tipoActividad] || { label: 'Desconocido', severity: 'secondary' };
  return <Tag value={tipo.label} severity={tipo.severity} />;
}

function EstadoCalificacionTag({ estadoCalificacion }) {
  const estado = ESTADOS_CALIFICACION[estadoCalificacion] || ESTADOS_CALIFICACION['pendiente'];
  return <Tag value={estadoCalificacion || 'pendiente'} severity={estado.severity} icon={`pi ${estado.icon}`} />;
}

export default function ProyectoDetalleDialog({ showDetalleDialog, setShowDetalleDialog, selectedProyecto, nombreEvento }) {
  if (!selectedProyecto) return null;

  return (
    <Dialog
      header="Detalles del Proyecto"
      visible={showDetalleDialog}
      style={{ width: '700px' }}
      onHide={() => setShowDetalleDialog(false)}
      footer={
        <Button label="Cerrar" icon="pi pi-times" onClick={() => setShowDetalleDialog(false)} className="p-button-text" />
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-tag text-blue-600"></i>
              <label className="text-sm font-semibold text-blue-900">Título del Proyecto</label>
            </div>
            <p className="text-base font-medium text-blue-800">{selectedProyecto.titulo_proyecto || selectedProyecto.titulo || 'N/A'}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-hashtag text-purple-600"></i>
              <label className="text-sm font-semibold text-purple-900">ID del Proyecto</label>
            </div>
            <p className="text-base font-medium text-purple-800">{selectedProyecto.id_proyecto || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="pi pi-calendar text-green-600"></i>
            <label className="text-sm font-semibold text-green-900">Evento</label>
          </div>
          <p className="text-base font-medium text-green-800">{nombreEvento}</p>
        </div>

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

        {selectedProyecto.id_estudiantes?.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="pi pi-users text-indigo-600"></i>
              <label className="text-sm font-semibold text-indigo-900">Estudiantes Participantes</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedProyecto.id_estudiantes.map((estudiante, index) => (
                <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-md border border-indigo-100">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-600">{(estudiante.nombre || estudiante).charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-indigo-800">{estudiante.nombre || estudiante}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-cog text-orange-600"></i>
              <label className="text-sm font-semibold text-orange-900">Tipo de Actividad</label>
            </div>
            <div className="mt-1"><TipoActividadTag tipoActividad={selectedProyecto.tipo_actividad} /></div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-info-circle text-yellow-600"></i>
              <label className="text-sm font-semibold text-yellow-900">Estado</label>
            </div>
            <div className="mt-1"><EstadoCalificacionTag estadoCalificacion={selectedProyecto.estado_calificacion} /></div>
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
              {selectedProyecto.calificacion && <i className="pi pi-pencil text-red-500 text-sm"></i>}
            </div>
          </div>
        </div>

        {(selectedProyecto.nombre_linea || selectedProyecto.nombre_area || selectedProyecto.codigo_materia) && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="pi pi-graduation-cap text-slate-600"></i>
              <label className="text-sm font-semibold text-slate-900">Información Académica</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedProyecto.nombre_linea && <div><p className="text-xs text-slate-600 mb-1">Línea de Investigación</p><p className="text-sm font-medium text-slate-800">{selectedProyecto.nombre_linea}</p></div>}
              {selectedProyecto.nombre_area && <div><p className="text-xs text-slate-600 mb-1">Área Temática</p><p className="text-sm font-medium text-slate-800">{selectedProyecto.nombre_area}</p></div>}
              {selectedProyecto.codigo_materia && <div><p className="text-xs text-slate-600 mb-1">Materia</p><p className="text-sm font-medium text-slate-800">{selectedProyecto.codigo_materia}</p></div>}
            </div>
          </div>
        )}

        {selectedProyecto.descripcion && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-align-left text-gray-600"></i>
              <label className="text-sm font-semibold text-gray-900">Descripción</label>
            </div>
            <p className="text-base text-gray-700 leading-relaxed">{selectedProyecto.descripcion}</p>
          </div>
        )}

        {selectedProyecto.archivo_pdf && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-file-pdf text-red-600"></i>
              <label className="text-sm font-semibold text-red-900">Documento PDF</label>
            </div>
            <a href={selectedProyecto.archivo_pdf} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <i className="pi pi-external-link"></i> Ver PDF del Proyecto
            </a>
          </div>
        )}

        {selectedProyecto.fecha_subida && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-calendar-plus text-cyan-600"></i>
              <label className="text-sm font-semibold text-cyan-900">Fecha de Subida</label>
            </div>
            <p className="text-base font-medium text-cyan-800">
              {new Date(selectedProyecto.fecha_subida).toLocaleString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
