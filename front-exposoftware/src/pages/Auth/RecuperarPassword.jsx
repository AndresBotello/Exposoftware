import React, { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../utils/constants";

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo.trim()) {
      setError("El correo electrónico es obligatorio");
      return;
    }

    setLoading(true);
    setError("");
    setMensaje("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/recuperar-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();

      if (res.ok || res.status === 200) {
        setEnviado(true);
        setMensaje(
          "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos. Revisa tu bandeja de entrada (y spam)."
        );
        setCorreo("");
      } else if (res.status === 429) {
        setError("Demasiados intentos. Por favor, intenta en 1 hora.");
      } else if (res.status === 422) {
        setError(data.message || "Formato de correo inválido");
      } else {
        setError(data.message || "Error al solicitar la recuperación");
      }
    } catch (err) {
      setError("Error de conexión. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Volver al login</span>
        </Link>

        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-gray-500">
            Ingresa tu correo electrónico para recibir un enlace de recuperación
          </p>
        </header>

        {enviado ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-center font-medium">
                {mensaje}
              </p>
            </div>
            <button
              onClick={() => setEnviado(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Intentar con otro correo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="usuario@unicesar.edu.co"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                "Enviar enlace"
              )}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
