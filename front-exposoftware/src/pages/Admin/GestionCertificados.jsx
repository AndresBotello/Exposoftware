import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
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

  // Estados para generar certificados por proyecto
  const [proyectos, setProyectos] = useState([]);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [directorEvento, setDirectorEvento] = useState('');
  const [coordinadorGeneral, setCoordinadorGeneral] = useState('');
  const [incluirCalificacion, setIncluirCalificacion] = useState(false);
  const [generandoCertificados, setGenerandoCertificados] = useState(false);
  const [generandoZipGeneral, setGenerandoZipGeneral] = useState(false);

  // Estados para generar certificados por evento
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [directorEventoMasivo, setDirectorEventoMasivo] = useState('');
  const [coordinadorGeneralMasivo, setCoordinadorGeneralMasivo] = useState('');
  const [generandoCertificadosMasivo, setGenerandoCertificadosMasivo] = useState(false);
  const [resultadosCertificados, setResultadosCertificados] = useState(null);
  const [showResultadosDialog, setShowResultadosDialog] = useState(false);

  const topScrollbarRef = useRef(null);
  const tableRef = useRef(null);
  const toast = useRef(null);

  useEffect(() => {
    cargarLotes();
    cargarProyectos();
    cargarEventos();
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
      // Cargar todos los proyectos sin filtrar por estado del evento
      setProyectos(proyectosData || []);
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

  const cargarEventos = async () => {
    setLoadingEventos(true);
    try {
      const response = await fetch(
        API_ENDPOINTS.ADMIN_EVENTOS,
        {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Error loading events');

      const eventosData = await response.json();
      const eventosArray = Array.isArray(eventosData) ? eventosData : (eventosData.data || []);

      // Filtrar eventos en estado finalizado o en_curso que sean elegibles para certificados
      const eventosFiltrados = eventosArray.filter(evento =>
        evento.estado === 'en_curso' || evento.estado === 'finalizado'
      );

      setEventos(eventosFiltrados);
    } catch (error) {
      setEventos([]);
      console.error('Error cargando eventos:', error);
    } finally {
      setLoadingEventos(false);
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

  const generarCertificadosPorEvento = async () => {
    if (!selectedEvento) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Evento Requerido',
        detail: 'Por favor selecciona un evento',
        life: 3000
      });
      return;
    }

    setGenerandoCertificadosMasivo(true);
    toast.current?.show({
      severity: 'info',
      summary: 'Procesando',
      detail: 'Generando certificados para todos los proyectos... Esta operación puede tomar hasta 10 minutos.',
      life: 10000
    });

    try {
      const idEvento = selectedEvento?.id_evento || selectedEvento?.id;
      const response = await CertificadosService.generarCertificadosPorEvento(
        idEvento,
        false,
        directorEventoMasivo,
        coordinadorGeneralMasivo
      );

      setResultadosCertificados(response?.data || response);
      setShowResultadosDialog(true);

      toast.current?.show({
        severity: 'success',
        summary: 'Proceso completado',
        detail: response?.message || 'Los certificados se han generado correctamente',
        life: 5000
      });

      // Limpiar formulario
      setSelectedEvento(null);
      setDirectorEventoMasivo('');
      setCoordinadorGeneralMasivo('');

      // Recargar lotes
      cargarLotes();
    } catch (error) {
      let errorMessage = 'No se pudieron generar los certificados por evento';

      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      }

      toast.current?.show({
        severity: 'error',
        summary: 'Error en generación masiva',
        detail: errorMessage,
        life: 8000
      });
    } finally {
      setGenerandoCertificadosMasivo(false);
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

  const descargarTodosLosCertificados = async () => {
    if (!lotes.length) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Sin lotes',
        detail: 'No hay lotes de certificados para comprimir',
        life: 3000
      });
      return;
    }

    setGenerandoZipGeneral(true);
    toast.current?.show({
      severity: 'info',
      summary: 'Generando ZIP',
      detail: 'Se está preparando el archivo con todos los certificados. Esto puede tardar unos minutos.',
      life: 6000
    });

    try {
      const result = await CertificadosService.descargarTodosLosCertificadosEnZip(lotes);

      toast.current?.show({
        severity: 'success',
        summary: 'ZIP descargado',
        detail: `Se incluyeron ${result.lotesProcesados} lote(s)${result.lotesFallidos > 0 ? `, ${result.lotesFallidos} fallido(s)` : ''}`,
        life: 5000
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error al generar ZIP',
        detail: error.message || 'No se pudo crear el ZIP con todos los certificados',
        life: 6000
      });
    } finally {
      setGenerandoZipGeneral(false);
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
            {/* Sección: Generar Certificados Masivos por Evento */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-300 shadow-lg p-6">
              <div className="mb-6 pb-4 border-b border-purple-300">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      <i className="pi pi-bolt mr-2 text-purple-600"></i>
                      Generar Certificados por Evento (Masivo)
                    </h2>
                    <p className="text-sm text-gray-700">
                      Genera certificados para TODOS los proyectos del evento. Idempotente: no duplica si ya existen.
                    </p>
                  </div>
                  <div className="text-4xl text-purple-200">
                    <i className="pi pi-send"></i>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center">
                    <i className="pi pi-calendar text-purple-600 mr-2"></i>
                    Selecciona el Evento
                  </label>
                  <Dropdown
                    value={selectedEvento}
                    onChange={(e) => setSelectedEvento(e.value)}
                    options={eventos}
                    optionLabel={(option) => option?.nombre_evento || option?.nombre || 'Sin nombre'}
                    placeholder="Selecciona un evento..."
                    filter
                    loading={loadingEventos}
                    className="w-full"
                    style={{ width: '100%' }}
                  />
                  {selectedEvento && (
                    <div className="mt-2 p-3 bg-purple-100 border border-purple-300 rounded text-xs text-purple-800">
                      <i className="pi pi-check-circle mr-2"></i>
                      Evento seleccionado: {selectedEvento?.nombre_evento || selectedEvento?.nombre}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center">
                    <i className="pi pi-user text-purple-600 mr-2"></i>
                    Director del Evento <span className="text-gray-500 font-normal ml-1">(opcional)</span>
                  </label>
                  <InputText
                    value={directorEventoMasivo}
                    onChange={(e) => setDirectorEventoMasivo(e.target.value)}
                    placeholder="Ej: Dr. Juan Pérez"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center">
                    <i className="pi pi-users text-purple-600 mr-2"></i>
                    Coordinador General <span className="text-gray-500 font-normal ml-1">(opcional)</span>
                  </label>
                  <InputText
                    value={coordinadorGeneralMasivo}
                    onChange={(e) => setCoordinadorGeneralMasivo(e.target.value)}
                    placeholder="Ej: Ing. María González"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5">
                <div className="flex gap-3">
                  <i className="pi pi-info-circle text-yellow-600 mt-1"></i>
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Tiempo estimado: 5-10 minutos</p>
                    <p>El sistema procesará todos los proyectos del evento y generará certificados para los integrantes con asistencia.</p>
                  </div>
                </div>
              </div>

              <Button
                label={generandoCertificadosMasivo ? "Generando certificados..." : "Generar Certificados Masivos"}
                icon="pi pi-lightning"
                onClick={generarCertificadosPorEvento}
                loading={generandoCertificadosMasivo}
                className="w-full p-button-lg bg-gradient-to-r from-purple-500 to-purple-600 border-0 hover:from-purple-600 hover:to-purple-700"
                disabled={!selectedEvento || generandoCertificadosMasivo}
              />
            </div>

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
                <Button
                  icon="pi pi-download"
                  label="Descargar todo ZIP"
                  className="p-button-outlined p-button-sm"
                  onClick={descargarTodosLosCertificados}
                  loading={generandoZipGeneral}
                  severity="help"
                  disabled={loading || lotes.length === 0}
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

      {/* Diálogo de Resultados de Generación Masiva */}
      <Dialog
        visible={showResultadosDialog}
        onHide={() => setShowResultadosDialog(false)}
        header="Resultados de Generación de Certificados"
        modal
        style={{ width: '90vw', maxWidth: '1000px' }}
        className="p-dialog-large"
      >
        {resultadosCertificados && (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-600 font-semibold uppercase">Certificados Creados</p>
                <p className="text-2xl font-bold text-green-700">{resultadosCertificados.total_certificados_nuevos || 0}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-600 font-semibold uppercase">Certificados Reutilizados</p>
                <p className="text-2xl font-bold text-blue-700">{resultadosCertificados.total_certificados_existentes || 0}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-xs text-orange-600 font-semibold uppercase">Proyectos con Error</p>
                <p className="text-2xl font-bold text-orange-700">{resultadosCertificados.proyectos_con_error || 0}</p>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Evento</p>
                  <p className="font-semibold text-gray-900">{resultadosCertificados.nombre_evento}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Proyectos</p>
                  <p className="font-semibold text-gray-900">{resultadosCertificados.total_proyectos}</p>
                </div>
                <div>
                  <p className="text-gray-600">Procesados</p>
                  <p className="font-semibold text-gray-900">{resultadosCertificados.proyectos_procesados}</p>
                </div>
                <div>
                  <p className="text-gray-600">Fecha</p>
                  <p className="font-semibold text-gray-900">{new Date(resultadosCertificados.fecha_generacion).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Tabla de Proyectos */}
            {resultadosCertificados.proyectos && resultadosCertificados.proyectos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Detalle por Proyecto</h3>
                <DataTable
                  value={resultadosCertificados.proyectos}
                  scrollable
                  scrollHeight="300px"
                  className="text-sm"
                  stripedRows
                >
                  <Column field="titulo_proyecto" header="Proyecto" style={{ width: '40%' }} />
                  <Column
                    field="certificados_creados"
                    header="Creados"
                    style={{ width: '15%' }}
                    className="text-center"
                  />
                  <Column
                    field="certificados_ya_existian"
                    header="Existentes"
                    style={{ width: '15%' }}
                    className="text-center"
                  />
                  <Column
                    field="error"
                    header="Error"
                    style={{ width: '30%' }}
                    body={(rowData) =>
                      rowData.error ? (
                        <span className="text-red-600 text-xs font-medium">{rowData.error}</span>
                      ) : (
                        <span className="text-green-600 text-xs font-medium">✓ OK</span>
                      )
                    }
                  />
                </DataTable>
              </div>
            )}

            {/* Mensaje de resumen */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <i className="pi pi-info-circle mr-2"></i>
                {resultadosCertificados.message}
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button
                label="Cerrar"
                onClick={() => setShowResultadosDialog(false)}
                className="p-button-outlined"
              />
              <Button
                label="Cerrar y Recargar Lotes"
                onClick={() => {
                  setShowResultadosDialog(false);
                  cargarLotes();
                }}
                className="p-button-success"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
