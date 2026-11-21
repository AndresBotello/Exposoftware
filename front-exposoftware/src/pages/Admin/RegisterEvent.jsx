import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { AdminHeader, AdminPageHeader } from "../../components/Admin/AdminComponents";
import * as AuthService from "../../Services/AuthService";
import EventosService from "../../Services/EventosService";
import { confirmarCierreSesion } from "../../utils/confirmDialog.jsx";

export default function RegisterAttendance() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  
  // Cargar datos del usuario autenticado
  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) {
      setUserData(user);
    }
  }, []);

  // Obtener nombre del usuario
  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    if (await confirmarCierreSesion()) {
      try {
        await AuthService.logout();
        navigate('/login');
      } catch (error) {
      }
    }
  };

  // Estados para crear evento (Administrador)
  const [nombreEvento, setNombreEvento] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [lugarEvento, setLugarEvento] = useState("");
  const [fechaAperturaInscripciones, setFechaAperturaInscripciones] = useState("");
  const [fechaCierreInscripciones, setFechaCierreInscripciones] = useState("");
  const [cargandoEvento, setCargandoEvento] = useState(false);

  // Estados para listar eventos
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(false);

  // Función para generar código QR alfanumérico automático
  const generarCodigoAlfanumerico = () => {
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";
    for (let i = 0; i < 12; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  };

  // Cargar eventos al montar el componente
  useEffect(() => {
    cargarEventos();
  }, []);

  // Función para cargar eventos desde el backend
  const cargarEventos = async () => {
    setLoadingEventos(true);
    try {
      const data = await EventosService.obtenerEventos();
      setEventos(data);
    } catch (error) {
      setEventos([]);
    } finally {
      setLoadingEventos(false);
    }
  };

  // Crear evento (Administrador)
  const handleCrearEvento = async (e) => {
    e.preventDefault();

    // Validar campos requeridos
    if (!nombreEvento || !fechaInicio || !fechaFin || !fechaAperturaInscripciones || !fechaCierreInscripciones) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    // Validaciones de fechas
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      alert("La fecha de fin no puede ser anterior a la fecha de inicio");
      return;
    }

    if (new Date(fechaCierreInscripciones) < new Date(fechaAperturaInscripciones)) {
      alert("La fecha de cierre de inscripciones no puede ser anterior a la apertura");
      return;
    }

    if (new Date(fechaAperturaInscripciones) > new Date(fechaInicio)) {
      alert("La fecha de apertura de inscripciones no puede ser posterior a la fecha de inicio");
      return;
    }

    // Convertir fechas a ISO string con hora
    const convertirFechaISO = (dateString) => {
      const fecha = new Date(dateString);
      return fecha.toISOString();
    };

    const payload = {
      nombre_evento: nombreEvento,
      fecha_inicio: convertirFechaISO(fechaInicio),
      fecha_fin: convertirFechaISO(fechaFin),
      fecha_apertura_inscripciones: convertirFechaISO(fechaAperturaInscripciones),
      fecha_cierre_inscripciones: convertirFechaISO(fechaCierreInscripciones)
    };

    // Agregar campos opcionales
    if (descripcion && descripcion.trim()) {
      payload.descripcion = descripcion.trim();
    }

    if (lugarEvento && lugarEvento.trim()) {
      payload.lugar = lugarEvento.trim();
    }


    setCargandoEvento(true);
    try {
      await EventosService.crearEvento(payload);
      alert("✅ Evento creado exitosamente");
      
      // Limpiar formulario
      limpiarFormularioEvento();

      // Recargar lista de eventos
      cargarEventos();
    } catch (error) {
      alert(`❌ Error al crear evento: ${error.message}`);
    } finally {
      setCargandoEvento(false);
    }
  };

  // Limpiar formulario de creación de evento
  const limpiarFormularioEvento = () => {
    setNombreEvento("");
    setDescripcion("");
    setFechaInicio("");
    setFechaFin("");
    setLugarEvento("");
    setFechaAperturaInscripciones("");
    setFechaCierreInscripciones("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader userName={getUserName()} userInitials={getUserInitials()} onLogout={handleLogout} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            <AdminPageHeader
              icon="pi-calendar-plus"
              title="Gestión de Eventos"
              subtitle="Crea eventos y genera su código QR de asistencia"
            />

            {/* Sección 1: Crear Evento con Código QR (Administrador) */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎫 Crear Evento
                </h2>
                <p className="text-sm text-gray-600">
                  Crea un nuevo evento. Se generará automáticamente un código QR único para el control de asistencia.
                </p>
              </div>

              <form onSubmit={handleCrearEvento} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre del Evento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Evento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nombreEvento}
                      onChange={(e) => setNombreEvento(e.target.value)}
                      placeholder="Ej: Expo-software 2026"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  {/* Lugar del Evento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lugar del Evento <span className="text-gray-500">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={lugarEvento}
                      onChange={(e) => setLugarEvento(e.target.value)}
                      placeholder="Ej: Auditorio Principal"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Fecha de Inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  {/* Fecha de Fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Fin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  {/* Fecha Apertura Inscripciones */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Apertura Inscripciones <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={fechaAperturaInscripciones}
                      onChange={(e) => setFechaAperturaInscripciones(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  {/* Fecha Cierre Inscripciones */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Cierre Inscripciones <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={fechaCierreInscripciones}
                      onChange={(e) => setFechaCierreInscripciones(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  {/* Descripción del Evento */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción <span className="text-gray-500">(Opcional)</span>
                    </label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe el evento..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Botón de creación */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={cargandoEvento}
                    className={`px-6 py-3 text-white rounded-lg font-semibold transition shadow-md ${
                      cargandoEvento
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700'
                    }`}
                  >
                    {cargandoEvento ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Creando...
                      </span>
                    ) : (
                      '🎫 Crear Evento'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
