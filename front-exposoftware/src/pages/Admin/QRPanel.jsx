export default function QRPanel({
  qrCodeUrl, qrData, isGenerating, generarQR, descargarQR,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Panel QR */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <i className="pi pi-qrcode text-green-600 text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Código QR de Asistencia</h3>
            <p className="text-sm text-gray-500">Válido por 24 horas</p>
          </div>
        </div>

        {!qrCodeUrl ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="pi pi-qrcode text-gray-400 text-4xl"></i>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No hay código QR activo</h4>
            <p className="text-sm text-gray-500 mb-6">
              Genera un nuevo código QR para el registro de asistencia de hoy
            </p>
            <button
              onClick={generarQR}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <><i className="pi pi-spin pi-spinner"></i> Generando...</>
              ) : (
                <><i className="pi pi-plus-circle"></i> Generar Código QR</>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border-2 border-green-200 inline-block mb-4">
              <img src={qrCodeUrl} alt="Código QR de Asistencia" className="w-64 h-64" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={descargarQR}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <i className="pi pi-download"></i> Descargar QR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Panel de información */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i className="pi pi-info-circle text-blue-600 text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Información del Código</h3>
            <p className="text-sm text-gray-500">Detalles de la sesión actual</p>
          </div>
        </div>

        {qrData ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Evento</p>
              <p className="text-sm font-medium text-gray-900">{qrData.evento}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Fecha</p>
              <p className="text-sm font-medium text-gray-900">{qrData.fecha}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Hora</p>
              <p className="text-sm font-medium text-gray-900">{qrData.hora}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">ID de Sesión</p>
              <p className="text-sm font-mono text-gray-900 break-all">{qrData.id_sesion}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <i className="pi pi-check-circle text-green-600 text-lg mt-0.5"></i>
              <div>
                <p className="text-sm font-medium text-green-900">Código Activo</p>
                <p className="text-xs text-green-700 mt-1">Este código es válido hasta las 11:59 PM</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="pi pi-info-circle text-gray-400 text-3xl"></i>
            </div>
            <p className="text-sm text-gray-500">No hay información disponible</p>
            <p className="text-xs text-gray-400 mt-1">Genera un código QR para ver los detalles</p>
          </div>
        )}
      </div>
    </div>
  );
}
