import { AlertCircle, CheckCircle } from "lucide-react";

const MessageAlerts = ({ mensajeExito, mensajeError }) => {
  return (
    <>
      {mensajeExito && (
        <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 sm:gap-3 animate-fadeIn">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-green-700 font-medium text-sm sm:text-base">{mensajeExito}</p>
        </div>
      )}

      {mensajeError && (
        <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3 animate-fadeIn">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 font-medium text-sm sm:text-base">{mensajeError}</p>
        </div>
      )}
    </>
  );
};

export default MessageAlerts;