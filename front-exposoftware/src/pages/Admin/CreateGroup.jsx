import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Logo-unicesar.png";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import * as AuthService from "../../Services/AuthService";
import { obtenerGrupos, obtenerProfesores, crearGrupo, actualizarGrupo, eliminarGrupo, filtrarGrupos } from "../../Services/CreateGroup";
import { SelectProfesores, TablaGrupos } from "./GroupHelpers";

export default function CreateGroup() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("crear");
  const [codigoGrupo, setCodigoGrupo] = useState("");
  const [idDocente, setIdDocente] = useState("");
  const [grupos, setGrupos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [loadingProfesores, setLoadingProfesores] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCodigoGrupo, setEditingCodigoGrupo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) setUserData(user);
  }, []);

  useEffect(() => {
    cargarGrupos();
    cargarProfesores();
  }, []);

  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };
  const getUserInitials = () => getUserName().charAt(0).toUpperCase();

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      try { await AuthService.logout(); navigate('/login'); } catch (error) { navigate('/login'); }
    }
  };

  const cargarGrupos = async () => {
    setLoadingGrupos(true);
    try {
      const data = await obtenerGrupos();
      setGrupos(data);
    } catch (error) {
      console.error('❌ Error al cargar grupos:', error);
      setGrupos([]);
    } finally {
      setLoadingGrupos(false);
    }
  };

  const cargarProfesores = async () => {
    setLoadingProfesores(true);
    try {
      const data = await obtenerProfesores();
      setProfesores(data);
    } catch (error) {
      console.error('❌ Error al cargar profesores:', error);
      setProfesores([]);
    } finally {
      setLoadingProfesores(false);
    }
  };

  const limpiarFormulario = () => { setCodigoGrupo(""); setIdDocente(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idDocente || idDocente === '' || idDocente.startsWith('temp_')) {
      alert('❌ Error: Debe seleccionar un profesor válido');
      return;
    }
    setSubmitting(true);
    try {
      await crearGrupo(codigoGrupo, idDocente);
      await cargarGrupos();
      alert("✅ Grupo creado exitosamente\n\nEl grupo ha sido registrado en el sistema.");
      limpiarFormulario();
    } catch (error) {
      alert(`❌ Error al crear el grupo:\n\n${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (grupo) => {
    setEditingCodigoGrupo(grupo.codigo_grupo);
    setCodigoGrupo(grupo.codigo_grupo.toString());
    setIdDocente(grupo.id_docente || "");
    setIsEditing(true);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await actualizarGrupo(editingCodigoGrupo, codigoGrupo, idDocente);
      await cargarGrupos();
      alert("✅ Grupo actualizado exitosamente");
      handleCancelEdit();
    } catch (error) {
      alert(`❌ ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCodigoGrupo(null);
    setShowEditModal(false);
    limpiarFormulario();
  };

  const handleDelete = async (codigoGrupo) => {
    const grupoAEliminar = grupos.find(g => g.codigo_grupo === codigoGrupo);
    if (window.confirm(`¿Está seguro de que desea eliminar el ${grupoAEliminar?.nombre_grupo}?`)) {
      try {
        await eliminarGrupo(codigoGrupo);
        await cargarGrupos();
        alert("✅ Grupo eliminado exitosamente");
      } catch (error) {
        alert(`❌ ${error.message}`);
      }
    }
  };

  const gruposFiltrados = filtrarGrupos(grupos, searchTerm, profesores);

  const spinnerPath = "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo Unicesar" className="w-10 h-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Expo-software</h1>
                <p className="text-xs text-gray-500">Universidad Popular del Cesar</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:block">{getUserName()}</span>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">{getUserInitials()}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2">
                <i className="pi pi-sign-out"></i>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-2 mb-6">
              <div className="flex gap-2">
                {[{ key: "crear", label: "➕ Crear Grupo" }, { key: "editar", label: "✏️ Editar Grupos" }].map(({ key, label }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === key ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >{label}</button>
                ))}
              </div>
            </div>

            {activeTab === "crear" && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Nuevo Grupo</h2>
                  <p className="text-sm text-gray-600">Ingresa el código del grupo y la materia asociada.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                  <div>
                    <label htmlFor="codigoGrupo" className="block text-sm font-medium text-gray-700 mb-2">
                      Código del Grupo <span className="text-red-500">*</span>
                    </label>
                    <input type="number" id="codigoGrupo" value={codigoGrupo}
                      onChange={(e) => setCodigoGrupo(e.target.value)}
                      placeholder="Ej: 101, 102, 203"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      required min="1"
                    />
                    <p className="mt-1 text-xs text-gray-500">Código numérico único del grupo (Ej: 101, 102, 203).</p>
                  </div>
                  <div>
                    <label htmlFor="idDocente" className="block text-sm font-medium text-gray-700 mb-2">
                      Asignar Profesor <span className="text-red-500">*</span>
                    </label>
                    <SelectProfesores value={idDocente} onChange={(e) => setIdDocente(e.target.value)} profesores={profesores} loadingProfesores={loadingProfesores} />
                    <p className="mt-1 text-xs text-gray-500">Profesor responsable del grupo</p>
                  </div>
                  <div className="pt-4">
                    <button type="submit" disabled={submitting || loadingProfesores}
                      className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d={spinnerPath}></path>
                          </svg>
                          Creando grupo...
                        </span>
                      ) : loadingProfesores ? 'Cargando datos...' : 'Crear Grupo'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "editar" && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Editar Grupos</h2>
                  <p className="text-sm text-gray-600">Busca y edita la información de los grupos registrados en el sistema.</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Grupos Registrados</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {gruposFiltrados.length} {gruposFiltrados.length === 1 ? 'grupo' : 'grupos'} encontrados
                      </p>
                    </div>
                    <div className="relative w-64">
                      <input type="text" placeholder="Buscar grupos..." value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>
                </div>
                <TablaGrupos gruposFiltrados={gruposFiltrados} loadingGrupos={loadingGrupos} profesores={profesores} onEdit={handleEdit} onDelete={handleDelete} />
              </div>
            )}
          </main>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Editar Grupo</h3>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código del Grupo (ID único)</label>
                <input type="text" value={editingCodigoGrupo || ''} disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  placeholder="Generado automáticamente por Firebase"
                />
                <p className="mt-1 text-xs text-gray-500">Este código se genera automáticamente y no puede modificarse</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asignar Profesor <span className="text-red-500">*</span>
                </label>
                <SelectProfesores value={idDocente} onChange={(e) => setIdDocente(e.target.value)} profesores={profesores} loadingProfesores={loadingProfesores} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleCancelEdit}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >Cancelar</button>
                <button type="submit" disabled={submitting || loadingProfesores}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition disabled:bg-teal-400 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d={spinnerPath}></path>
                      </svg>
                      Guardando...
                    </span>
                  ) : loadingProfesores ? 'Cargando datos...' : '💾 Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
