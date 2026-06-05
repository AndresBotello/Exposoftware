import { useState } from 'react';
import AdminQRService from '../../Services/AdminQRService';

export default function DescargarQRsLote({ idEvento, nombreEvento }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDescargarQRs = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AdminQRService.descargarQRsEvento(
        idEvento,
        window.location.origin,
        nombreEvento || 'evento'
      );

      // Mostrar éxito
      alert(`✅ Descargados ${result.total} QRs en ZIP`);
    } catch (err) {
      const mensaje = err.message || 'Error desconocido';
      setError(mensaje);
      alert(`❌ Error: ${mensaje}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDescargarQRs}
        disabled={loading || !idEvento}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
          loading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
        }`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Generando QRs...
          </>
        ) : (
          <>
            <i className="pi pi-download"></i>
            Descargar QRs en ZIP
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <i className="pi pi-exclamation-circle"></i>
          {error}
        </p>
      )}
    </div>
  );
}
