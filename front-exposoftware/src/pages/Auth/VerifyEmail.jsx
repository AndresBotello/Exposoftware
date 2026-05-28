import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../utils/constants";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState("verificando"); // verificando, exito, error
  const [mensaje, setMensaje] = useState("Verificando tu cuenta...");

  useEffect(() => {
    const verificarCuenta = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setEstado("error");
        setMensaje("Token no proporcionado. Enlace inválido.");
        return;
      }

      try {
        const response = await fetch(
          `${API_ENDPOINTS.AUTH_VERIFICAR_CUENTA}?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        if (response.ok) {
          setEstado("exito");
          setMensaje("✅ ¡Cuenta verificada exitosamente!");

          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          const data = await response.json().catch(() => ({}));
          setEstado("error");
          setMensaje(
            data.message || data.detail || "Error al verificar la cuenta"
          );
        }
      } catch (error) {
        setEstado("error");
        setMensaje(error.message || "Error de conexión");
      }
    };

    verificarCuenta();
  }, [searchParams, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50 p-4">
      <section className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Verificación de Cuenta
        </h1>

        {estado === "verificando" && (
          <div className="flex flex-col items-center gap-4">
            <Loader size={48} className="text-green-600 animate-spin" />
            <p className="text-gray-600">{mensaje}</p>
          </div>
        )}

        {estado === "exito" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle size={48} className="text-green-600" />
            <p className="text-green-600 font-semibold">{mensaje}</p>
            <p className="text-sm text-gray-500">
              Redirigiendo al login en 3 segundos...
            </p>
          </div>
        )}

        {estado === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle size={48} className="text-red-600" />
            <p className="text-red-600 font-semibold">{mensaje}</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
            >
              Volver al Login
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
