import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { AdminHeader } from '../../components/Admin/AdminComponents';
import CertificadosService from '../../Services/CertificadosService';
import CertificadosList from './CertificadosList';
import CertificadosDialog from './CertificadosDialog';
import { obtenerProyectos } from '../../Services/ProjectsService';
import { API_ENDPOINTS } from '../../utils/constants';

const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export default function GestionCertificados() {
  const navigate = useNavigate();
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLote, setSelectedLote] = useState(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [asuntoEmail, setAsuntoEmail] = useState('');
  const [mensajePersonalizado, setMensajePersonalizado] = useState('');

  // Estados para generar certificados
  const [proyectos, setProyectos] = useState([]);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [directorEvento, setDirectorEvento] = useState('');
  const [coordinadorGeneral, setCoordinadorGeneral] = useState('');
  const [incluirCalificacion, setIncluirCalificacion] = useState(false);
  const [generandoCertificados, setGenerandoCertificados] = useState(false);

  const topScrollbarRef = useRef(null);
  const tableRef = useRef(null);
  const toast = useRef(null);

  useEffect(() => {
    cargarLotes();
    cargarProyectos();
  }, []);

  useEffect(() => {
    const setupScrollbar = () => {
      const topScrollbar = topScrollbarRef.current;
      const tableContainer = tableRef.current;

      if (topScrollbar && tableContainer) {
        const scrollableView = tableContainer.querySelector('.p-datatable-scrollable-view');

        if (scrollableView) {
          const adjustScrollbar = () => {
            const tableWidth = scrollableView.scrollWidth;
            const containerWidth = scrollableView.clientWidth;

            if (tableWidth > containerWidth) {
              topScrollbar.style.width = `${containerWidth}px`;
              topScrollbar.style.display = 'block';
              topScrollbar.querySelector('.top-scrollbar-content').style.width = `${tableWidth}px`;
            } else {
              topScrollbar.style.display = 'none';
            }
          };

          setTimeout(adjustScrollbar, 100);

          const resizeObserver = new ResizeObserver(adjustScrollbar);
          resizeObserver.observe(scrollableView);

          return () => resizeObserver.disconnect();
        }
      }
    };

    const timeoutId = setTimeout(setupScrollbar, 300);
    return () => clearTimeout(timeoutId);
  }, [lotes]);

  const cargarLotes = async () => {
    setLoading(true);
    try {
      const response = await CertificadosService.obtenerLotesCertificados();

      let lotesData = [];

      if (response.status === 'success' && response.data) {
        if (response.data.lotes && Array.isArray(response.data.lotes)) {
          lotesData = response.data.lotes;
        } else if (Array.isArray(response.data)) {
          lotesData = response.data;
        } else {
          lotesData = [];
        }
      } else if (Array.isArray(response)) {
        lotesData = response;
      }

      setLotes(lotesData);

      toast.current?.show({
        severity: 'success',
        summary: 'Lotes cargados',
        detail: `Se cargaron ${lotesData.length} lote(s) de certificados`,
        life: 3000
      });
    } catch (error) {
      setLotes([]);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.detail || 'No se pudieron cargar los lotes de certificados',
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarProyectos = async () => {
    setLoadingProyectos(true);
    try {
      const proyectosData = await obtenerProyectos();

      // Obtener eventos para filtrar por estado
      const eventosResponse = await fetch(
        API_ENDPOINTS.ADMIN_EVENTOS,
        {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );

      let eventosMap = {};
      if (eventosResponse.ok) {
        const eventosData = await eventosResponse.json();
        const eventos = Array.isArray(eventosData) ? eventosData : (eventosData.data || []);

        // Crear mapa de eventos por ID para búsqueda rápida
        eventos.forEach(evento => {
          const eventoId = evento.id_evento || evento.id;
          eventosMap[eventoId] = evento;
        });

      }

      // Filtrar proyectos cuyo evento esté en_curso o finalizado
      const proyectosFiltrados = proyectosData.filter(proyecto => {
        const idEvento = proyecto.id_evento;
        const evento = eventosMap[idEvento];

        if (!evento) {
          return false;
        }

        const estadoValido = evento.estado === 'en_curso' || evento.estado === 'finalizado';

        return estadoValido;
      });

      setProyectos(proyectosFiltrados);
    } catch (error) {
      setProyectos([]);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los proyectos',
        life: 5000
      });
    } finally {
      setLoadingProyectos(false);
    }
  };

  const generarCertificados = async () => {
    if (!selectedProyecto) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Proyecto Requerido',
        detail: 'Por favor selecciona un proyecto',
        life: 3000
      });
      return;
    }

    if (!directorEvento.trim() || !coordinadorGeneral.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos Requeridos',
        detail: 'Por favor completa el director del evento y coordinador general',
        life: 3000
      });
      return;
    }

    setGenerandoCertificados(true);
    try {
      const idProyecto = selectedProyecto?.id_proyecto || selectedProyecto?.id || selectedProyecto;
      const response = await CertificadosService.generarCertificadosPorProyecto(
        idProyecto,
        incluirCalificacion,
        directorEvento,
        coordinadorGeneral
      );


      toast.current?.show({
        severity: 'success',
        summary: 'Certificados Generados',
        detail: response.mensaje || 'Los certificados se han generado exitosamente',
        life: 5000
      });

      // Limpiar formulario
      setSelectedProyecto(null);
      setDirectorEvento('');
      setCoordinadorGeneral('');
      setIncluirCalificacion(false);

      // Recargar lotes para mostrar el nuevo
      cargarLotes();
    } catch (error) {

      let errorMessage = 'No se pudieron generar los certificados';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.current?.show({
        severity: 'error',
        summary: 'Error al generar',
        detail: errorMessage,
        life: 6000
      });
    } finally {
      setGenerandoCertificados(false);
    }
  };

  const descargarLote = async (lote) => {
    try {
      const idProyecto = lote?.id_proyecto || lote?.proyecto?.id_proyecto;

      if (!idProyecto) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo obtener el ID del proyecto',
          life: 3000
        });
        return;
      }

      toast.current?.show({
        severity: 'info',
        summary: 'Descargando',
        detail: 'Preparando descarga de certificados...',
        life: 3000
      });

      await CertificadosService.descargarLoteCertificados(idProyecto);

      toast.current?.show({
        severity: 'success',
        summary: 'Descarga completa',
        detail: 'Los certificados se han descargado correctamente',
        life: 3000
      });
    } catch (error) {

      let errorMessage = 'No se pudo descargar el lote de certificados';

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 502) {
        errorMessage = 'El servidor está experimentando problemas. Por favor, intenta más tarde.';
      } else if (error.response?.status === 404) {
        errorMessage = 'El lote de certificados no existe o ya fue eliminado.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor al generar los certificados.';
      }

      toast.current?.show({
        severity: 'error',
        summary: 'Error en descarga',
        detail: errorMessage,
        life: 6000
      });
    }
  };

  const abrirDialogoEmail = (lote) => {
    console.log('📬 Lote seleccionado para envío:', {
      id_lote: lote?.id_lote,
      id_proyecto: lote?.id_proyecto,
      titulo_proyecto: lote?.titulo_proyecto,
      cantidad_certificados: lote?.cantidad_certificados
    });
    setSelectedLote(lote);
    setAsuntoEmail('Certificado de Participación - ExpoSoftware');
    setMensajePersonalizado('Estimado/a estudiante,\n\nAdjunto encontrará su certificado de participación en ExpoSoftware.\n\nSaludos cordiales.');
    setShowEmailDialog(true);
  };

  const cerrarDialogoEmail = () => {
    setShowEmailDialog(false);
    setAsuntoEmail('');
    setMensajePersonalizado('');
  };

  const enviarPorCorreo = async () => {
    if (!selectedLote) return;

    if (!asuntoEmail.trim() || !mensajePersonalizado.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Campos Requeridos',
        detail: 'Por favor complete el asunto y el mensaje personalizado',
        life: 3000
      });
      return;
    }

    setSendingEmails(true);
    try {
      const idProyecto = selectedLote?.id_proyecto || selectedLote?.proyecto?.id_proyecto;
      const response = await CertificadosService.enviarCertificadosPorCorreo(
        idProyecto,
        asuntoEmail,
        mensajePersonalizado
      );


      const totalEnviados = response.data?.enviados_exitosamente || 0;
      const totalFallidos = response.data?.envios_fallidos || 0;
      const detallesFallidos = response.data?.detalles_fallidos || [];

      if (totalEnviados > 0) {
        toast.current?.show({
          severity: 'success',
          summary: 'Certificados enviados',
          detail: `Se enviaron exitosamente ${totalEnviados} certificado(s)${totalFallidos > 0 ? `. ${totalFallidos} envío(s) fallaron.` : ''}`,
          life: 6000
        });
      } else if (totalFallidos > 0) {
        let errorDetail = `No se pudo enviar ningún certificado. ${totalFallidos} envío(s) fallaron.`;

        setErrorDetails(response.data);

        if (detallesFallidos.length > 0) {
          const primerosErrores = detallesFallidos.slice(0, 2).map(f => f.error).join(', ');
          errorDetail += ` Errores: ${primerosErrores}`;
        }

        toast.current?.show({
          severity: 'warn',
          summary: 'Error en envíos',
          detail: errorDetail,
          life: 8000
        });

        setShowErrorDialog(true);
      } else {
        toast.current?.show({
          severity: 'info',
          summary: 'Operación completada',
          detail: response.mensaje || 'Se procesó la solicitud de envío',
          life: 5000
        });
      }

      setShowEmailDialog(false);
      setSelectedLote(null);

      cargarLotes();
    } catch (error) {

      let errorMessage = 'No se pudieron enviar los certificados por correo';

      if (error.response?.status === 400) {
        const errorData = error.response.data;

        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData && typeof errorData === 'object') {
          errorMessage = errorData.mensaje || errorData.detail || errorData.message || JSON.stringify(errorData);
        }
      } else if (error.response?.status === 404) {
        errorMessage = 'El lote de certificados no fue encontrado. Puede que haya sido eliminado.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor. Es posible que el servicio de correo no esté configurado correctamente.';
      } else if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object') {
          errorMessage = errorData.detail || errorData.mensaje || errorData.message || JSON.stringify(errorData);
        }
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }

      if (typeof errorMessage !== 'string') {
        errorMessage = 'Error desconocido al enviar certificados';
      }

      toast.current?.show({
        severity: 'error',
        summary: 'Error al enviar',
        detail: errorMessage,
        life: 6000
      });
    } finally {
      setSendingEmails(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        .top-scrollbar-container::-webkit-scrollbar {
          height: 16px;
        }
        .top-scrollbar-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .top-scrollbar-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
          border: 2px solid #f1f5f9;
        }
        .top-scrollbar-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .custom-datatable .p-datatable-scrollable-wrapper .p-datatable-scrollable-view::-webkit-scrollbar {
          height: 16px;
        }
        .custom-datatable .p-datatable-scrollable-wrapper .p-datatable-scrollable-view::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .custom-datatable .p-datatable-scrollable-wrapper .p-datatable-scrollable-view::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
          border: 2px solid #f1f5f9;
        }
        .custom-datatable .p-datatable-scrollable-wrapper .p-datatable-scrollable-view::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <Toast ref={toast} />

      <AdminHeader
        userName={getUserName()}
        userInitials={getUserInitials()}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar
            userName={getUserName()}
            userRole="Administrador"
          />

          <main className="lg:col-span-3 space-y-6">
            {/* Sección: Generar Certificados */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg border border-blue-200 shadow-md p-6">
              <div className="mb-6 pb-4 border-b border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      <i className="pi pi-plus-circle mr-2 text-teal-600"></i>
                      Generar Certificados por Proyecto
                    </h2>
                    <p className="text-sm text-gray-600">
                      Selecciona un proyecto y completa los datos para generar los certificados
                    </p>
                  </div>
                  <div className="text-4xl text-blue-100">
                    <i className="pi pi-file-pdf"></i>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center">
                    <i className="pi pi-book text-teal-600 mr-2"></i>
                    Selecciona el Proyecto
                  </label>
                  <Dropdown
                    value={selectedProyecto}
                    onChange={(e) => setSelectedProyecto(e.value)}
                    options={proyectos}
                    optionLabel={(option) =>
                      option?.titulo_proyecto || option?.nombre_proyecto || option?.nombre || 'Sin nombre'
                    }
                    placeholder="Selecciona un proyecto..."
                    filter
                    loading={loadingProyectos}
                    className="w-full"
                    style={{ width: '100%' }}
                  />
                  {selectedProyecto && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                      <i className="pi pi-check-circle mr-2"></i>
                      Proyecto seleccionado: {selectedProyecto?.titulo_proyecto || selectedProyecto?.nombre}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center">
                    <i className="pi pi-user text-teal-600 mr-2"></i>
                    Director del Evento
                  </label>
                  <InputText
                    value={directorEvento}
                    onChange={(e) => setDirectorEvento(e.target.value)}
                    placeholder="Ej: Dr. Juan Pérez"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center">
                    <i className="pi pi-users text-teal-600 mr-2"></i>
                    Coordinador General
                  </label>
                  <InputText
                    value={coordinadorGeneral}
                    onChange={(e) => setCoordinadorGeneral(e.target.value)}
                    placeholder="Ej: Ing. María González"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-5 border border-gray-200">
                <div className="flex items-center gap-3">
                  <Checkbox
                    inputId="incluirCalif"
                    checked={incluirCalificacion}
                    onChange={(e) => setIncluirCalificacion(e.checked)}
                  />
                  <label htmlFor="incluirCalif" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                    <span className="block font-semibold text-gray-800">Incluir calificación</span>
                    <span className="block text-xs text-gray-600 mt-1">Muestra la calificación del proyecto en el certificado</span>
                  </label>
                </div>
              </div>

              <Button
                label={generandoCertificados ? "Generando certificados..." : "Generar Certificados"}
                icon="pi pi-check"
                onClick={generarCertificados}
                loading={generandoCertificados}
                className="w-full p-button-lg bg-gradient-to-r from-teal-500 to-teal-600 border-0 hover:from-teal-600 hover:to-teal-700"
                disabled={!selectedProyecto || !directorEvento.trim() || !coordinadorGeneral.trim() || generandoCertificados}
              />
            </div>

            {/* Sección: Lotes Generados */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
                    <i className="pi pi-folder-open mr-3 text-teal-600 text-xl"></i>
                    Lotes de Certificados Generados
                  </h2>
                  <p className="text-sm text-gray-600">
                    Visualiza y gestiona todos los lotes de certificados creados
                  </p>
                </div>
                <Button
                  icon="pi pi-refresh"
                  label="Recargar"
                  className="p-button-outlined p-button-sm"
                  onClick={cargarLotes}
                  loading={loading}
                  severity="secondary"
                />
              </div>

              <CertificadosList
                lotes={lotes}
                loading={loading}
                onDescargar={descargarLote}
                onEnviar={abrirDialogoEmail}
                topScrollbarRef={topScrollbarRef}
                tableRef={tableRef}
              />
            </div>
          </main>
        </div>
      </div>

      <CertificadosDialog
        showEmailDialog={showEmailDialog}
        onHideEmail={cerrarDialogoEmail}
        selectedLote={selectedLote}
        asuntoEmail={asuntoEmail}
        onAsuntoChange={setAsuntoEmail}
        mensajePersonalizado={mensajePersonalizado}
        onMensajeChange={setMensajePersonalizado}
        sendingEmails={sendingEmails}
        onEnviar={enviarPorCorreo}
        showErrorDialog={showErrorDialog}
        onHideError={() => setShowErrorDialog(false)}
        errorDetails={errorDetails}
      />
    </div>
  );
}
