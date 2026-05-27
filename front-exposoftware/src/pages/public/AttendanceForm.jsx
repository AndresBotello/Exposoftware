import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import EventosService from "../../Services/EventosService";
import * as AuthService from "../../Services/AuthService";
//import getEventoById from "../../Services/EventosPublicService";
import AssistanceService from "../../services/AssistanceService";
import ProjectRatingForm from "./ProjectRatingForm";

export default function AsistenciaForm() {
    const [email, setEmail] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [validando, setValidando] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [evento, setEvento] = useState([]);
    const [asistenciaRegistrada, setAsistenciaRegistrada] = useState(false);
    const { id_evento } = useParams();
    const [params] = useSearchParams();
    const idEvento = id_evento || params.get("id_evento") || params.get("id_sesion");
    const stepParam = params.get("step");
    const response = null;

    useEffect(() => {
        let cargado = false;

        const cargarEventos = async () => {
            if (cargado) return;
            cargado = true;
            try {
                const response = await EventosService.obtenerEventoPorId(idEvento);
                setEvento(response || []);

                // Si viene del login y debe ir a rating, obtener email y registrar asistencia
                if (stepParam === 'rating') {
                    const userData = AuthService.getUserData();
                    if (userData?.correo) {
                        setEmail(userData.correo);
                        // Registrar asistencia automáticamente
                        try {
                            await AssistanceService.registrarAsistencia(idEvento, userData.correo);
                            setAsistenciaRegistrada(true);
                        } catch (err) {
                            console.log('ℹ️ Asistencia ya registrada o error:', err.message);
                            // Mostrar form de calificación de todas formas
                            setAsistenciaRegistrada(true);
                        }
                    }
                }
            } catch (error) {
                console.error("❌ Error al obtener evento:", error);
            }
        };

        cargarEventos();
    }, [idEvento, stepParam]);

    const handleChange = (e) => {
        const val = e.target.value;
        setEmail(val);

        if (val === "") {
            setError("El correo no puede estar vacío.");
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
            setError("Correo inválido. Asegúrate de ingresar un correo válido.");
        } else {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidando(true);
        setMensaje("");

        try {
            const response = await AssistanceService.registrarAsistencia(idEvento, email);
            console.log("✅ Asistencia registrada:", response);
            setAsistenciaRegistrada(true);

        } catch (error) {
            const errorMessages = {
                403: "⚠️ Correo no registrado. Redirigiendo al registro...",
                409: "ℹ️ Ya habías registrado tu asistencia anteriormente.",
                404: "❌ Evento no encontrado.",
                500: "❌ Error del servidor. Por favor, intenta nuevamente."
            };

            const message = errorMessages[error.status] || "❌ Ocurrió un error inesperado.";
            setMensaje(message);

            // Redirigir solo para el caso 403
            if (error.status === 403) {
                setTimeout(() => navigate("/register"), 2000);
            }
        } finally {
            setValidando(false);
        }
    };

    const handleCalificacionCompleta = (cantidad) => {
        setTimeout(() => {
            navigate("/");
        }, 2000);
    };

    const eventoEnCurso = evento && (evento.estado === 'en_curso' || evento.status === 'en_curso');

    // Si la asistencia fue registrada
    if (asistenciaRegistrada) {
        // Solo mostrar calificaciones si el evento está en_curso
        if (eventoEnCurso) {
            return (
                <ProjectRatingForm
                    idEvento={idEvento}
                    email={email}
                    onComplete={handleCalificacionCompleta}
                />
            );
        } else {
            // Evento no está en_curso, mostrar mensaje de confirmación
            return (
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 px-4">
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-md text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                            <i className="pi pi-check-circle text-green-600 text-2xl"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            ¡Asistencia Registrada!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Gracias por participar en el evento. Tu asistencia ha sido registrada correctamente.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Ir a Inicio
                        </button>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-green-700 mb-2">
                    Registro de Asistencia
                </h2>

                {idEvento ? (
                    <p className="text-center text-gray-500 mb-4">
                        Evento: <span className="font-mono">{evento.nombre_evento}</span>
                    </p>
                ) : (
                    <p className="text-center text-red-600 font-medium mb-4">
                        ❌ Enlace inválido. No se proporcionó un ID de evento.
                    </p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Ingresa tu correo institucional"
                        value={email}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
                        required
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    <button
                        type="submit"
                        disabled={validando || !idEvento}
                        className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {validando ? "Verificando..." : "Registrar Asistencia"}
                    </button>
                </form>

                {mensaje && (
                    <p
                        className={`mt-4 text-center font-medium ${mensaje.startsWith("✅")
                            ? "text-green-700"
                            : mensaje.startsWith("⚠️")
                                ? "text-yellow-700"
                                : "text-red-700"
                            }`}
                    >
                        {mensaje}
                    </p>
                )}
            </div>
        </div>
    );
}
