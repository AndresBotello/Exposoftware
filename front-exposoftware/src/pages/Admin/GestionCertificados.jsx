import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { AdminHeader } from '../../components/Admin/AdminComponents';
import CertificadosService from '../../Services/CertificadosService';
import CertificadosList from './CertificadosList';
import CertificadosDialog from './CertificadosDialog';

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
  const topScrollbarRef = useRef(null);
  const tableRef = useRef(null);
  const toast = useRef(null);

  useEffect(() => {
    cargarLotes();
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
      console.log('📦 Respuesta completa:', response);

      let lotesData = [];

      if (response.status === 'success' && response.data) {
        if (response.data.lotes && Array.isArray(response.data.lotes)) {
          lotesData = response.data.lotes;
        } else if (Array.isArray(response.data)) {
          lotesData = response.data;
        } else {
          console.warn('⚠️ Estructura de datos inesperada:', response.data);
          lotesData = [];
        }
      } else if (Array.isArray(response)) {
        lotesData = response;
      }

      setLotes(lotesData);
      console.log('✅ Lotes procesados:', lotesData);

      toast.current?.show({
        severity: 'success',
        summary: 'Lotes cargados',
        detail: `Se cargaron ${lotesData.length} lote(s) de certificados`,
        life: 3000
      });
    } catch (error) {
      console.error('Error al cargar lotes:', error);
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

  const descargarLote = async (id_lote) => {
    try {
      toast.current?.show({
        severity: 'info',
        summary: 'Descargando',
        detail: 'Preparando descarga de certificados...',
        life: 3000
      });

      await CertificadosService.descargarLoteCertificados(id_lote);

      toast.current?.show({
        severity: 'success',
        summary: 'Descarga completa',
        detail: 'Los certificados se han descargado correctamente',
        life: 3000
      });
    } catch (error) {
      console.error('Error al descargar lote:', error);

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
      const response = await CertificadosService.enviarCertificadosPorCorreo(
        selectedLote.id_lote,
        asuntoEmail,
        mensajePersonalizado
      );

      console.log('📨 Respuesta de envío:', response);

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
      console.error('Error al enviar certificados:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);

      let errorMessage = 'No se pudieron enviar los certificados por correo';

      if (error.response?.status === 400) {
        const errorData = error.response.data;
        console.log('Error data type:', typeof errorData);
        console.log('Error data:', errorData);

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

          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    <i className="pi pi-file-pdf mr-2 text-teal-600"></i>
                    Gestión de Certificados
                  </h1>
                  <p className="text-sm text-gray-600">
                    Administra los lotes de certificados generados
                  </p>
                </div>
                <Button
                  icon="pi pi-refresh"
                  label="Recargar"
                  className="p-button-outlined p-button-sm"
                  onClick={cargarLotes}
                  loading={loading}
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
