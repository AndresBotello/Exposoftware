import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

export default function CertificadosDialog({
  showEmailDialog,
  onHideEmail,
  selectedLote,
  asuntoEmail,
  onAsuntoChange,
  mensajePersonalizado,
  onMensajeChange,
  sendingEmails,
  onEnviar,
  showErrorDialog,
  onHideError,
  errorDetails,
}) {
  return (
    <>
      {/* Diálogo para enviar por correo */}
      <Dialog
        header="Enviar Certificados por Correo"
        visible={showEmailDialog}
        style={{ width: '650px' }}
        onHide={onHideEmail}
        footer={
          <div>
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text"
              onClick={onHideEmail}
            />
            <Button
              label="Enviar"
              icon="pi pi-send"
              className="p-button-success"
              onClick={onEnviar}
              loading={sendingEmails}
            />
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lote seleccionado
            </label>
            <div className="bg-gray-100 p-3 rounded">
              <p className="font-semibold">{selectedLote?.proyecto?.nombre_proyecto || selectedLote?.nombre_proyecto}</p>
              <p className="text-sm text-gray-600">
                {selectedLote?.cantidad_certificados} certificado(s) para {selectedLote?.cantidad_certificados} estudiante(s)
              </p>
              <p className="text-sm text-gray-600 mt-1">
                ID: {selectedLote?.id_lote}
              </p>
            </div>
          </div>

          {/* Campo de Asunto */}
          <div>
            <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-2">
              Asunto del Correo <span className="text-red-500">*</span>
            </label>
            <InputText
              id="asunto"
              value={asuntoEmail}
              onChange={(e) => onAsuntoChange(e.target.value)}
              placeholder="Ej: Certificado de Participación - ExpoSoftware"
              className="w-full"
            />
            <small className="text-gray-500">
              Este será el asunto que verán los destinatarios en su correo.
            </small>
          </div>

          {/* Campo de Mensaje Personalizado */}
          <div>
            <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje Personalizado <span className="text-red-500">*</span>
            </label>
            <InputTextarea
              id="mensaje"
              value={mensajePersonalizado}
              onChange={(e) => onMensajeChange(e.target.value)}
              rows={5}
              placeholder="Escriba el mensaje que acompañará el certificado..."
              className="w-full"
            />
            <small className="text-gray-500">
              Este mensaje se incluirá en el cuerpo del correo electrónico.
            </small>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-start gap-2">
              <i className="pi pi-info-circle text-blue-600 mt-0.5"></i>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Envío automático</p>
                <p>El sistema enviará los certificados con el asunto y mensaje que especificaste a los correos de todos los estudiantes del lote.</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-sm text-green-800">
              <i className="pi pi-check-circle mr-2"></i>
              Los certificados se enviarán en formato PDF adjunto por correo electrónico
            </p>
          </div>
        </div>
      </Dialog>

      {/* Diálogo de detalles de errores */}
      <Dialog
        header="Detalles de Errores de Envío"
        visible={showErrorDialog}
        style={{ width: '600px' }}
        onHide={onHideError}
        footer={
          <Button
            label="Cerrar"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHideError}
          />
        }
      >
        {errorDetails && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="flex items-start gap-2">
                <i className="pi pi-exclamation-triangle text-red-600 mt-0.5"></i>
                <div>
                  <p className="font-semibold text-red-900">
                    {errorDetails.enviados_exitosamente} exitosos / {errorDetails.envios_fallidos} fallidos
                  </p>
                  <p className="text-sm text-red-700 mt-1">{errorDetails.mensaje}</p>
                </div>
              </div>
            </div>

            {errorDetails.detalles_fallidos && errorDetails.detalles_fallidos.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Envíos Fallidos:</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {errorDetails.detalles_fallidos.map((detalle, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded p-3">
                      <div className="flex items-start gap-2">
                        <i className="pi pi-times-circle text-red-500 mt-0.5"></i>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {detalle.estudiante || 'Estudiante desconocido'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {detalle.correo || 'Sin correo'}
                          </p>
                          <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                            <strong>Error:</strong> {detalle.error}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800">
                <i className="pi pi-info-circle mr-2"></i>
                <strong>Posibles causas:</strong> Correos inválidos, servicio de email no configurado, límite de envíos excedido, o problemas de conectividad.
              </p>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
