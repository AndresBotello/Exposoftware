import { useState, useEffect } from "react";
import { generarQRCalificacion } from "../../Services/ProjectsService";

export default function QRCalificacionModal({ projectId, projectName, onClose, isOpen }) {
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && projectId) {
      generarQR();
    }
  }, [isOpen, projectId]);

  const generarQR = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generarQRCalificacion(projectId, window.location.origin);

      // El QR puede venir como base64 en diferentes formatos
      let qrData = result.qr_base64 || result.qr || result.data?.qr_base64 || result.data?.qr;

      // Si no tiene el prefijo, agregarlo
      if (qrData && !qrData.startsWith('data:image')) {
        qrData = `data:image/png;base64,${qrData}`;
      }

      setQrImage(qrData);
    } catch (err) {
      setError(err.message || "Error al generar el código QR");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const descargarQR = () => {
    if (!qrImage) return;

    const link = document.createElement("a");
    link.download = `QR-Calificacion-${projectName}-${new Date().toLocaleDateString("es-CO")}.png`;
    link.href = qrImage;
    link.click();
  };

  const copiarEnlace = async () => {
    // Mostrar un mensaje de que se copió
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = "¡Copiado!";

    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-blue-600 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Código QR de Calificación</h2>
            <p className="text-emerald-100 text-sm mt-1">{projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
          >
            <i className="pi pi-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin">
                <i className="pi pi-spinner text-4xl text-emerald-600"></i>
              </div>
              <p className="text-gray-600 mt-4">Generando código QR...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium flex items-center gap-2">
                <i className="pi pi-exclamation-triangle"></i>
                {error}
              </p>
              <button
                onClick={generarQR}
                className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Reintentar
              </button>
            </div>
          )}

          {qrImage && !loading && (
            <>
              {/* QR Image */}
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg border-2 border-emerald-200">
                <img
                  src={qrImage}
                  alt="Código QR de Calificación"
                  className="w-64 h-64"
                />
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Instrucciones:</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Escanea este código con tu dispositivo móvil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Si no estás logueado, accede con tus credenciales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Completa la calificación del proyecto</span>
                  </li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={descargarQR}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  <i className="pi pi-download"></i>
                  Descargar
                </button>
                <button
                  onClick={generarQR}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition"
                >
                  <i className="pi pi-refresh"></i>
                  Regenerar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
