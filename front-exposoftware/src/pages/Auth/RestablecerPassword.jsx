import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Check, X, ArrowLeft } from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../utils/constants";

const PASSWORD_RULES = {
  minLength: { regex: /.{8,}/, label: "Mínimo 8 caracteres" },
  maxLength: { regex: /^.{0,128}$/, label: "Máximo 128 caracteres" },
  uppercase: { regex: /[A-Z]/, label: "Una mayúscula" },
  lowercase: { regex: /[a-z]/, label: "Una minúscula" },
  number: { regex: /[0-9]/, label: "Un dígito" },
  special: { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, label: "Un carácter especial" },
};

export default function RestablecerPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [validationRules, setValidationRules] = useState({});

  useEffect(() => {
    if (!token) {
      setError("Enlace inválido. No se encontró el token de recuperación.");
    }
  }, [token]);

  useEffect(() => {
    const newRules = {};
    Object.keys(PASSWORD_RULES).forEach((key) => {
      newRules[key] = PASSWORD_RULES[key].regex.test(password);
    });
    setValidationRules(newRules);
  }, [password]);

  const allRulesValid = Object.values(validationRules).every((v) => v === true);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const canSubmit = allRulesValid && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      setError("Por favor, completa todos los requisitos y confirma la contraseña");
      return;
    }

    setLoading(true);
    setError("");
    setMensaje("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/restablecer-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          token,
          password_nueva: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje("Contraseña restablecida correctamente.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (res.status === 401) {
        if (data.code === "EXPIRED_TOKEN") {
          setError(
            "El enlace expiró. Solicita uno nuevo desde la página de recuperación."
          );
        } else {
          setError("Enlace inválido. Solicita uno nuevo.");
        }
      } else if (res.status === 403) {
        setError("Esta cuenta está deshabilitada. Contacta al administrador.");
      } else if (res.status === 422) {
        if (data.errors && data.errors.length > 0) {
          setError(data.errors[0].message || data.message);
        } else {
          setError(data.message || "Contraseña no válida");
        }
      } else if (res.status === 429) {
        setError("Demasiados intentos. Espera unos minutos e intenta nuevamente.");
      } else {
        setError(data.message || "Error al restablecer la contraseña");
      }
    } catch (err) {
      setError("Error de conexión. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <section className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">Enlace inválido</h1>
            <p className="text-gray-500">
              No se encontró el token de recuperación. Por favor, solicita un nuevo enlace.
            </p>
            <Link
              to="/recuperar-password"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        </section>
      </main>
    );
  }

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
            Restablecer Contraseña
          </h1>
          <p className="text-gray-500">
            Crea una nueva contraseña segura para tu cuenta
          </p>
        </header>

        {mensaje && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm mb-4">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            <p className="font-semibold mb-1">Error</p>
            <p>{error}</p>
            {error.includes("expiró") && (
              <Link
                to="/recuperar-password"
                className="text-red-700 font-medium underline hover:text-red-800 block mt-2"
              >
                Solicitar nuevo enlace
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="Ingresa nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                aria-label={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                aria-label={showConfirm ? "Ocultar" : "Mostrar"}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {password && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Requisitos de contraseña:
              </p>
              {Object.entries(PASSWORD_RULES).map(([key, rule]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 text-sm"
                >
                  {validationRules[key] ? (
                    <Check size={18} className="text-green-600 flex-shrink-0" />
                  ) : (
                    <X size={18} className="text-gray-300 flex-shrink-0" />
                  )}
                  <span
                    className={
                      validationRules[key]
                        ? "text-green-700"
                        : "text-gray-500"
                    }
                  >
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {confirmPassword && password !== confirmPassword && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              Las contraseñas no coinciden
            </div>
          )}

          {passwordsMatch && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              ✓ Las contraseñas coinciden
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Restableciendo...
              </>
            ) : (
              "Restablecer Contraseña"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
