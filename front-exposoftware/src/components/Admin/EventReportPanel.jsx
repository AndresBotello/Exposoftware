import React, { useState, useEffect, useRef } from 'react';
import { useEventReportGenerator, EventReportGenerator } from './EventReportGenerator';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { fetchApi } from '../../utils/apiClient';
import { getAuthHeaders } from '../../Services/AuthService';
import { API_ENDPOINTS } from '../../utils/constants';

export default function EventReportPanel() {
  const toast = useRef(null);
  const { generateReport, fetchEventData, loading } = useEventReportGenerator();

  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [reportStats, setReportStats] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [loadingEventData, setLoadingEventData] = useState(false);

  // Cargar eventos disponibles
  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      const headers = getAuthHeaders();

      const response = await fetchApi(API_ENDPOINTS.ADMIN_EVENTOS, { headers });
      const res = await response.json();

      let eventosData = [];

      // Manejar diferentes estructuras de respuesta
      if (Array.isArray(res)) {
        eventosData = res;
      } else if (res?.data?.data && Array.isArray(res.data.data)) {
        // Estructura: { data: { data: [...] } }
        eventosData = res.data.data;
      } else if (res?.data && Array.isArray(res.data)) {
        // Estructura: { data: [...] }
        eventosData = res.data;
      } else if (res?.eventos && Array.isArray(res.eventos)) {
        // Estructura: { eventos: [...] }
        eventosData = res.eventos;
      }

      setEventos(eventosData);

      if (eventosData.length === 0) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Sin eventos',
          detail: 'No hay eventos disponibles',
          life: 3000
        });
      } else {
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: `Se cargaron ${eventosData.length} evento(s)`,
          life: 2000
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `No se pudieron cargar los eventos: ${error.message}`,
        life: 5000
      });
    }
  };

  const handleEventoChange = async (e) => {
    const evento = e.value;
    setEventoSeleccionado(evento);
    setReportStats(null);

    if (evento) {
      await loadPreviewData(evento.id_evento);
    }
  };

  const loadPreviewData = async (eventId) => {
    setLoadingEventData(true);
    try {
      const data = await fetchEventData(eventId);
      setReportStats(data);
      setShowPreview(true);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los datos del evento',
        life: 5000
      });
    } finally {
      setLoadingEventData(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!eventoSeleccionado) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor selecciona un evento',
        life: 3000
      });
      return;
    }

    setGeneratingPDF(true);
    try {
      const result = await generateReport(
        eventoSeleccionado.id_evento,
        eventoSeleccionado.nombre_evento
      );

      if (result.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reporte generado y descargado correctamente',
          life: 5000
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.message,
          life: 5000
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al generar el reporte',
        life: 5000
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <Toast ref={toast} />

      {/* Encabezado */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <i className="pi pi-file-pdf text-green-600 text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Generador de Reportes de Evento</h2>
            <p className="text-sm text-gray-500">Crea reportes completos con asistencias, proyectos y estadísticas</p>
          </div>
        </div>
      </div>

      {/* Selector de evento */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Seleccionar Evento
        </label>
        <Dropdown
          value={eventoSeleccionado}
          onChange={handleEventoChange}
          options={eventos}
          optionLabel="nombre_evento"
          placeholder="-- Selecciona un evento --"
          className="w-full"
          disabled={loading || generatingPDF}
        />
      </div>

      {/* Vista previa de estadísticas */}
      {showPreview && reportStats && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Reporte</h3>

          {loadingEventData ? (
            <div className="flex justify-center items-center py-8">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Asistencias */}
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="text-sm text-gray-600">Asistencias</div>
                <div className="text-2xl font-bold text-green-600">
                  {reportStats.stats.totalAsistencias}
                </div>
                <div className="text-xs text-gray-500 mt-1">personas registradas</div>
              </div>

              {/* Total Proyectos */}
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-600">Proyectos</div>
                <div className="text-2xl font-bold text-blue-600">
                  {reportStats.stats.totalProyectos}
                </div>
                <div className="text-xs text-gray-500 mt-1">registrados</div>
              </div>

              {/* Proyectos Aprobados */}
              <div className="bg-white p-4 rounded-lg border border-emerald-200">
                <div className="text-sm text-gray-600">Aprobados</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {reportStats.stats.proyectosAprobados}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {reportStats.stats.totalProyectos > 0
                    ? `${((reportStats.stats.proyectosAprobados / reportStats.stats.totalProyectos) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
              </div>

              {/* Materias */}
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <div className="text-sm text-gray-600">Materias</div>
                <div className="text-2xl font-bold text-amber-600">
                  {reportStats.stats.totalMaterias}
                </div>
                <div className="text-xs text-gray-500 mt-1">involucradas</div>
              </div>
            </div>
          )}

          {/* Tabla de asistencias por rol */}
          {reportStats.attendance && reportStats.attendance.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Asistencias por Rol</h4>
              <div className="bg-white rounded border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-green-50 border-b border-gray-200">
                      <th className="px-4 py-2 text-left font-semibold text-gray-900">Rol/Tipo</th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-900">Cantidad</th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-900">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportStats.attendance.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-gray-900">{item.tipo}</td>
                        <td className="px-4 py-2 text-center font-semibold text-gray-900">
                          {item.cantidad}
                        </td>
                        <td className="px-4 py-2 text-center text-gray-600">
                          {item.porcentaje.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Información de proyectos aprobados */}
          {reportStats.approvedProjects && reportStats.approvedProjects.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Proyectos Aprobados ({reportStats.approvedProjects.length})
              </h4>
              <div className="max-h-48 overflow-y-auto bg-white rounded border border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {reportStats.approvedProjects.slice(0, 10).map((proyecto, idx) => (
                    <li key={idx} className="px-4 py-2 text-sm text-gray-900">
                      <div className="font-semibold">{proyecto.titulo_proyecto}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {proyecto.estado === 'calificado'
                          ? `Calificación: ${proyecto.calificacion || 'N/A'}/100`
                          : 'Pendiente de calificación'}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Información de materias */}
          {reportStats.subjects && reportStats.subjects.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Materias Involucradas ({reportStats.subjects.length})
              </h4>
              <div className="max-h-48 overflow-y-auto bg-white rounded border border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {reportStats.subjects.slice(0, 10).map((materia, idx) => (
                    <li key={idx} className="px-4 py-2 text-sm">
                      <div className="font-semibold text-gray-900">
                        {materia.nombre_materia || 'S/N'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Código: {materia.codigo_materia || 'S/N'} · Proyectos: {materia.totalProyectos || 0}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        {eventoSeleccionado && !showPreview && (
          <Button
            label="Cargar Vista Previa"
            icon="pi pi-eye"
            onClick={() => loadPreviewData(eventoSeleccionado.id_evento)}
            loading={loadingEventData}
            disabled={generatingPDF}
            className="p-button-secondary"
          />
        )}
        <Button
          label="Generar Reporte PDF"
          icon="pi pi-download"
          onClick={handleGenerateReport}
          loading={generatingPDF}
          disabled={!eventoSeleccionado || loading}
          className="p-button-success"
        />
      </div>

      {/* Información de ayuda */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex gap-3">
          <i className="pi pi-info-circle text-blue-600 mt-1"></i>
          <div className="text-sm text-blue-900">
            <p className="font-semibold">Qué incluye el reporte:</p>
            <ul className="mt-2 ml-4 list-disc text-xs">
              <li>Resumen de asistencias por rol/tipo de usuario</li>
              <li>Listado completo de proyectos registrados</li>
              <li>Proyectos aprobados con calificaciones</li>
              <li>Materias asociadas a los proyectos del evento</li>
              <li>Estadísticas y porcentajes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
