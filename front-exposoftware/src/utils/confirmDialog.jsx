import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { LogOut, AlertTriangle } from "lucide-react";

/**
 * Diálogo de confirmación con el estilo de la plataforma.
 * Reemplaza a window.confirm pero es asíncrono:
 *
 *   if (await confirmar({ message: "¿Seguro?" })) { ... }
 */

function ConfirmModal({ title, message, confirmText, cancelText, variant, onResult }) {
  const esLogout = variant === "logout";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onResult(false);
      if (e.key === "Enter") onResult(true);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onResult]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => onResult(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center"
        style={{ animation: "confirmPop 0.18s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes confirmPop { from { opacity: 0; transform: scale(.94) translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${
            esLogout ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {esLogout ? <LogOut size={30} /> : <AlertTriangle size={30} />}
        </div>
        <h3 id="confirm-title" className="text-xl font-bold text-gray-800 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base mb-6 whitespace-pre-line">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onResult(false)}
            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => onResult(true)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-white font-semibold shadow-md transition-colors ${
              esLogout ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function confirmar({
  title = "¿Está seguro?",
  message = "",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  variant = "danger",
} = {}) {
  return new Promise((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    let cerrado = false;

    const onResult = (valor) => {
      if (cerrado) return;
      cerrado = true;
      resolve(valor);
      root.unmount();
      host.remove();
    };

    root.render(
      <ConfirmModal
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        variant={variant}
        onResult={onResult}
      />
    );
  });
}

export const confirmarCierreSesion = () =>
  confirmar({
    title: "Cerrar sesión",
    message: "¿Está seguro de que desea cerrar sesión?",
    confirmText: "Sí, cerrar sesión",
    cancelText: "Cancelar",
    variant: "logout",
  });
