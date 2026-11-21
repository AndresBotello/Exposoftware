import { useEvento } from "../../contexts/EventContext";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { useState } from "react";
import logo from "../../assets/Logo-unicesar.png";

export default function AdminEvento() {
  const { evento, setEvento } = useEvento();
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvento((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setMensaje("✅ Evento actualizado correctamente");
    setTimeout(() => setMensaje(""), 3000); // Limpia el mensaje a los 3 segundos
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo Unicesar" className="w-10 h-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Expo-software 2026</h1>
                <p className="text-xs text-gray-500">Universidad Popular del Cesar</p>
              </div>
            </div>

            {/* User avatar and logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:block">Carlos</span>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">C</span>
                </div>
              </div>
              
              <button className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2">
                <i className="pi pi-sign-out"></i>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <AdminSidebar userName="Administrador" userRole="Admin" />

        {/* MAIN */}
        <main className="bg-white rounded-lg shadow-md p-6 border border-gray-200 lg:col-span-3">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Editar información del evento
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nombre del Evento
              </label>
              <input
                type="text"
                name="nombre"
                value={evento.nombre}
                onChange={handleChange}
                className="w-full mt-1 border rounded-md p-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Edición</label>
              <input
                type="text"
                name="edicion"
                value={evento.edicion}
                onChange={handleChange}
                className="w-full mt-1 border rounded-md p-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Periodo</label>
              <input
                type="text"
                name="periodo"
                value={evento.periodo}
                onChange={handleChange}
                className="w-full mt-1 border rounded-md p-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Fecha de Inicio</label>
              <input
                type="date"
                name="fechaInicio"
                value={evento.fechaInicio}
                onChange={handleChange}
                className="w-full mt-1 border rounded-md p-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Fecha de Fin</label>
              <input
                type="date"
                name="fechaFin"
                value={evento.fechaFin}
                onChange={handleChange}
                className="w-full mt-1 border rounded-md p-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Total de Proyectos
              </label>
              <input
                type="number"
                name="totalProyectos"
                value={evento.totalProyectos}
                onChange={handleChange}
                className="w-full mt-1 border rounded-md p-2"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">
              Descripción del evento
            </label>
            <textarea
              name="descripcion"
              value={evento.descripcion}
              onChange={handleChange}
              className="w-full mt-1 border rounded-md p-2"
              rows="3"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition"
            >
              Guardar Cambios
            </button>
          </div>

          {mensaje && (
            <p className="mt-4 text-green-700 font-medium text-center bg-green-50 p-2 rounded-md">
              {mensaje}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
