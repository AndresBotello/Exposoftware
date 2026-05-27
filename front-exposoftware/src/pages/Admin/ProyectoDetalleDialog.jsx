import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { obtenerCalificacionPopular } from '../../Services/TeacherService';

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

function TipoActividadTag({ tipoActividad }) {
  const tipo = TIPOS_ACTIVIDAD[tipoActividad] || { label: 'Desconocido', severity: 'secondary' };
  return <Tag value={tipo.label} severity={tipo.severity} />;
}

function EstadoTag({ estado }) {
  const estadoData = ESTADOS[estado] || ESTADOS['pendiente'];
  return <Tag value={estadoData.label} severity={estadoData.severity} icon={`pi ${estadoData.icon}`} />;
}

export default function ProyectoDetalleDialog({ showDetalleDialog, setShowDetalleDialog, selectedProyecto, nombreEvento }) {
  const [calificacionPopular, setCalificacionPopular] = useState(null);
  const [loadingVotos, setLoadingVotos] = useState(false);

  useEffect(() => {
    if (showDetalleDialog && selectedProyecto?.id_proyecto) {
      cargarCalificacionPopular();
    }
  }, [showDetalleDialog, selectedProyecto?.id_proyecto]);

  const cargarCalificacionPopular = async () => {
    try {
      setLoadingVotos(true);
      const data = await obtenerCalificacionPopular(selectedProyecto.id_proyecto);
      setCalificacionPopular(data);
    } catch (error) {
      console.error('Error cargando calificación popular:', error);
    } finally {
      setLoadingVotos(false);
    }
  };

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
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Título y ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-tag text-blue-600"></i>
              <label className="text-sm font-semibold text-blue-900">Título del Proyecto</label>
            </div>
            <p className="text-base font-medium text-blue-800">{selectedProyecto.titulo_proyecto || 'N/A'}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-hash text-purple-600"></i>
              <label className="text-sm font-semibold text-purple-900">ID</label>
            </div>
            <p className="text-xs font-mono text-purple-800 break-all">{selectedProyecto.id_proyecto || 'N/A'}</p>
          </div>
        </div>

        {/* Evento y Docente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-calendar text-green-600"></i>
              <label className="text-sm font-semibold text-green-900">Evento</label>
            </div>
            <p className="text-base font-medium text-green-800">{selectedProyecto.nombre_evento || nombreEvento || 'N/A'}</p>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-user text-teal-600"></i>
              <label className="text-sm font-semibold text-teal-900">Docente Responsable</label>
            </div>
            <p className="text-base font-medium text-teal-800">{selectedProyecto.nombre_docente || 'No asignado'}</p>
          </div>
        </div>

        {/* Estado, Calificación, Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-cog text-orange-600"></i>
              <label className="text-sm font-semibold text-orange-900">Tipo de Actividad</label>
            </div>
            <div className="mt-1"><TipoActividadTag tipoActividad={selectedProyecto.id_tipo_actividad} /></div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-info-circle text-yellow-600"></i>
              <label className="text-sm font-semibold text-yellow-900">Estado</label>
            </div>
            <div className="mt-1"><EstadoTag estado={selectedProyecto.estado} /></div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-star text-red-600"></i>
              <label className="text-sm font-semibold text-red-900">Calificación</label>
            </div>
            <div className="mt-1">
              <span className="font-semibold text-red-800 text-lg">
                {selectedProyecto.calificacion ? selectedProyecto.calificacion.toFixed(1) : 'Sin calificar'}
              </span>
            </div>
          </div>
        </div>

        {/* Integrantes */}
        {selectedProyecto.integrantes?.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="pi pi-users text-indigo-600"></i>
              <label className="text-sm font-semibold text-indigo-900">Integrantes del Proyecto</label>
            </div>
            <div className="space-y-2">
              {selectedProyecto.integrantes.map((integrante, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-md border border-indigo-100">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600">{integrante.nombre_completo?.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-900">{integrante.nombre_completo}</p>
                    <p className="text-xs text-indigo-600">{integrante.correo}</p>
                    {integrante.es_lider && <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">Líder</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información Académica */}
        {(selectedProyecto.nombre_linea || selectedProyecto.nombre_sublinea || selectedProyecto.nombre_area || selectedProyecto.nombre_materia) && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="pi pi-graduation-cap text-slate-600"></i>
              <label className="text-sm font-semibold text-slate-900">Información Académica</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedProyecto.nombre_linea && <div><p className="text-xs text-slate-600 font-medium mb-1">Línea de Investigación</p><p className="text-sm text-slate-800">{selectedProyecto.nombre_linea}</p></div>}
              {selectedProyecto.nombre_sublinea && <div><p className="text-xs text-slate-600 font-medium mb-1">Sublínea</p><p className="text-sm text-slate-800">{selectedProyecto.nombre_sublinea}</p></div>}
              {selectedProyecto.nombre_area && <div><p className="text-xs text-slate-600 font-medium mb-1">Área Temática</p><p className="text-sm text-slate-800">{selectedProyecto.nombre_area}</p></div>}
              {selectedProyecto.nombre_materia && <div><p className="text-xs text-slate-600 font-medium mb-1">Materia</p><p className="text-sm text-slate-800">{selectedProyecto.nombre_materia}</p></div>}
              {selectedProyecto.nombre_grupo && <div><p className="text-xs text-slate-600 font-medium mb-1">Grupo</p><p className="text-sm text-slate-800">{selectedProyecto.nombre_grupo}</p></div>}
            </div>
          </div>
        )}

        {/* Documento */}
        {selectedProyecto.url_cloudinary && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-file-pdf text-red-600"></i>
              <label className="text-sm font-semibold text-red-900">Documento del Proyecto</label>
            </div>
            <a href={selectedProyecto.url_cloudinary} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm mt-2"
            >
              <i className="pi pi-external-link"></i> Ver Documento
            </a>
          </div>
        )}

        {/* Fechas */}
        {(selectedProyecto.created_at || selectedProyecto.updated_at) && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="pi pi-calendar text-cyan-600"></i>
              <label className="text-sm font-semibold text-cyan-900">Información de Fechas</label>
            </div>
            <div className="space-y-2">
              {selectedProyecto.created_at && <div><p className="text-xs text-cyan-600">Creado</p><p className="text-sm text-cyan-800">{new Date(selectedProyecto.created_at).toLocaleString('es-CO')}</p></div>}
              {selectedProyecto.updated_at && <div><p className="text-xs text-cyan-600">Última actualización</p><p className="text-sm text-cyan-800">{new Date(selectedProyecto.updated_at).toLocaleString('es-CO')}</p></div>}
            </div>
          </div>
        )}

        {/* Calificación Popular */}
        {calificacionPopular && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="pi pi-users text-purple-600"></i>
              <label className="text-sm font-semibold text-purple-900">Calificación Popular (Votos)</label>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded p-3 border border-purple-100">
                  <p className="text-xs text-purple-600 font-medium">Promedio Ponderado</p>
                  <p className="text-2xl font-bold text-purple-800">{calificacionPopular.promedio_ponderado?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-purple-500 mt-1">/5.0</p>
                </div>
                <div className="bg-white rounded p-3 border border-purple-100">
                  <p className="text-xs text-purple-600 font-medium">Total Votos</p>
                  <p className="text-2xl font-bold text-purple-800">{calificacionPopular.total_calificaciones || 0}</p>
                  <p className="text-xs text-purple-500 mt-1">personas votaron</p>
                </div>
              </div>
              {calificacionPopular.desglose_por_rol && Object.keys(calificacionPopular.desglose_por_rol).length > 0 && (
                <div className="bg-white rounded p-3 border border-purple-100">
                  <p className="text-xs text-purple-600 font-medium mb-2">Desglose por Rol</p>
                  <div className="space-y-1">
                    {Object.entries(calificacionPopular.desglose_por_rol).map(([rol, datos]) => (
                      <div key={rol} className="flex items-center justify-between text-sm">
                        <span className="text-purple-700">
                          Rol {rol}: <span className="font-medium">{datos.count} voto{datos.count !== 1 ? 's' : ''}</span>
                        </span>
                        <span className="text-purple-900 font-medium">{datos.promedio?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
