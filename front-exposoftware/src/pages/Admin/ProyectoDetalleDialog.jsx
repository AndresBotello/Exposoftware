import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { obtenerCalificacionPopular } from '../../Services/TeacherService';
import { getRolName } from '../../utils/constants';

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

export default function ProyectoDetalleDialog({ showDetalleDialog, setShowDetalleDialog, selectedProyecto, nombreEvento, onEliminar, onEdit, isAdmin }) {

  const [calificacionPopular, setCalificacionPopular] = useState(null);
  const [loadingVotos, setLoadingVotos] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    titulo_proyecto: selectedProyecto?.titulo_proyecto || '',
    codigo_area: selectedProyecto?.codigo_area || '',
    codigo_linea: selectedProyecto?.codigo_linea || '',
    codigo_sublinea: selectedProyecto?.codigo_sublinea || '',
    id_tipo_actividad: selectedProyecto?.id_tipo_actividad || ''
  });
  const [archivoPDF, setArchivoPDF] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (showDetalleDialog && selectedProyecto?.id_proyecto) {
      cargarCalificacionPopular();
    }
  }, [showDetalleDialog, selectedProyecto?.id_proyecto]);

  useEffect(() => {
    if (selectedProyecto) {
      setEditData({
        titulo_proyecto: selectedProyecto?.titulo_proyecto || '',
        codigo_area: selectedProyecto?.codigo_area || '',
        codigo_linea: selectedProyecto?.codigo_linea || '',
        codigo_sublinea: selectedProyecto?.codigo_sublinea || '',
        id_tipo_actividad: selectedProyecto?.id_tipo_actividad || ''
      });
      setEditMode(false);
      setArchivoPDF(null);
    }
  }, [selectedProyecto]);

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

  const handleEliminar = () => {
    if (window.confirm(`⚠️ ADVERTENCIA: Esta acción no se puede deshacer.\n\nEliminará permanentemente:\n• El proyecto "${selectedProyecto.titulo_proyecto}"\n• Todos sus datos relacionados\n• Integrantes, clases asignadas, historial\n\n¿Está seguro de que desea continuar?`)) {
      onEliminar(selectedProyecto.id_proyecto);
      setShowDetalleDialog(false);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await onEdit(editData, archivoPDF);
      setEditMode(false);
      setArchivoPDF(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header="Detalles del Proyecto"
      visible={showDetalleDialog}
      style={{ width: '700px' }}
      onHide={() => setShowDetalleDialog(false)}
      footer={
        <div className="flex gap-2 justify-end">
          {editMode ? (
            <>
              <Button
                label="Cancelar"
                icon="pi pi-times"
                onClick={() => {
                  setEditMode(false);
                  setArchivoPDF(null);
                  setEditData({
                    titulo_proyecto: selectedProyecto?.titulo_proyecto || '',
                    codigo_area: selectedProyecto?.codigo_area || '',
                    codigo_linea: selectedProyecto?.codigo_linea || '',
                    codigo_sublinea: selectedProyecto?.codigo_sublinea || '',
                    id_tipo_actividad: selectedProyecto?.id_tipo_actividad || ''
                  });
                }}
                className="p-button-outlined"
                disabled={saving}
              />
              <Button
                label={saving ? 'Guardando...' : 'Guardar'}
                icon="pi pi-save"
                severity="success"
                onClick={handleSaveEdit}
                disabled={saving}
              />
            </>
          ) : (
            <>
              <Button label="Cerrar" icon="pi pi-times" onClick={() => setShowDetalleDialog(false)} className="p-button-text" />
              {isAdmin && onEdit && (
                <Button
                  label="Editar"
                  icon="pi pi-pencil"
                  severity="info"
                  onClick={() => setEditMode(true)}
                />
              )}
              {onEliminar && (
                <Button
                  label="Eliminar Permanentemente"
                  icon="pi pi-trash"
                  severity="danger"
                  onClick={handleEliminar}
                />
              )}
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Modo Edición */}
        {editMode && isAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <h5 className="text-lg font-semibold text-blue-900">Editar Proyecto</h5>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Título del Proyecto</label>
              <input
                type="text"
                value={editData.titulo_proyecto}
                onChange={(e) => setEditData({...editData, titulo_proyecto: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Título del proyecto"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Actividad</label>
                <select
                  value={editData.id_tipo_actividad}
                  onChange={(e) => setEditData({...editData, id_tipo_actividad: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value={1}>Exposoftware</option>
                  <option value={2}>Ponencia</option>
                  <option value={3}>Taller</option>
                  <option value={4}>Conferencia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código de Área</label>
                <input
                  type="number"
                  value={editData.codigo_area}
                  onChange={(e) => setEditData({...editData, codigo_area: Number(e.target.value) || ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Código de área"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código de Línea</label>
                <input
                  type="number"
                  value={editData.codigo_linea}
                  onChange={(e) => setEditData({...editData, codigo_linea: Number(e.target.value) || ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Código de línea"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código de Sublínea</label>
                <input
                  type="number"
                  value={editData.codigo_sublinea}
                  onChange={(e) => setEditData({...editData, codigo_sublinea: Number(e.target.value) || ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Código de sublínea"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">PDF del Proyecto (Opcional)</label>
              {selectedProyecto?.url_cloudinary && (
                <div className="mb-3 p-3 bg-white border border-gray-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <i className="pi pi-file-pdf text-red-600 text-xl"></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">PDF Actual</p>
                      <a href={selectedProyecto.url_cloudinary} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                        Ver documento
                      </a>
                    </div>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setArchivoPDF(e.target.files[0]);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              {archivoPDF && (
                <p className="text-xs text-green-700 font-medium mt-2">
                  ✓ Nuevo PDF: {archivoPDF.name} ({(archivoPDF.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>
        )}

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

        {/* Evento y Docentes */}
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
              <i className="pi pi-users text-teal-600"></i>
              <label className="text-sm font-semibold text-teal-900">Docentes Responsables ({selectedProyecto.docentes_materias?.length || 0})</label>
            </div>
            <div className="space-y-2">
              {selectedProyecto.docentes_materias && selectedProyecto.docentes_materias.length > 0 ? (
                selectedProyecto.docentes_materias.map((docente, idx) => (
                  <div key={idx} className="text-sm font-medium text-teal-900 bg-white p-2 rounded border border-teal-100">
                    <p className="font-semibold">{docente.nombre_docente}</p>
                    {docente.nombre_materia && (
                      <p className="text-xs text-teal-700 mt-1">
                        <i className="pi pi-book text-xs mr-1"></i>
                        {docente.nombre_materia} (Grupo {docente.nombre_grupo})
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-base font-medium text-teal-800">No asignado</p>
              )}
            </div>
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
                          {getRolName(rol)}: <span className="font-medium">{datos.count} voto{datos.count !== 1 ? 's' : ''}</span>
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
