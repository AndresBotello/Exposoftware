import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Logo-unicesar.png";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { useSubjectManagement, CICLOS_SEMESTRALES } from "./useSubjectManagement";
import * as AuthService from "../../Services/AuthService";
import SubjectListTab from "./SubjectListTab";
import SubjectEditModal from "./SubjectEditModal";
import MateriaAsignacionesModal from "./MateriaAsignacionesModal";

export default function CreateSubject() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("crear");

  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) setUserData(user);
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

  const {
    codigoMateria, setCodigoMateria,
    nombreMateria, setNombreMateria,
    cicloSemestral, setCicloSemestral,
    gruposDisponibles, gruposSeleccionados,
    materiasFiltradas, materias, profesores,
    showEditModal,
    showAsignacionesModal, materiaSeleccionada,
    searchTerm, setSearchTerm,
    getDocenteNombre,
    agregarGrupoSeleccionado, eliminarGrupoSeleccionado,
    handleSubmit, handleEdit, handleSaveEdit, handleCancelEdit, handleDelete, handleCancel,
    handleAbrirAsignaciones, handleCerrarAsignaciones,
    cargarMaterias, cargarGrupos, cargarProfesores,
  } = useSubjectManagement();

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      await Promise.all([cargarMaterias(), cargarGrupos(), cargarProfesores()]);
    };
    cargarDatosIniciales();
  }, []);

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

          <main className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-2">
              <div className="flex gap-2">
                {[{ key: "crear", label: "➕ Crear Materia" }, { key: "editar", label: "✏️ Editar Materias" }].map(({ key, label }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === key ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >{label}</button>
                ))}
              </div>
            </div>

            {activeTab === "crear" && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Nueva Materia</h2>
                  <p className="text-sm text-gray-600">Complete los siguientes campos para añadir una nueva materia al sistema.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="codigoMateria" className="block text-sm font-medium text-gray-700 mb-2">
                        Código de la Materia <span className="text-red-500">*</span>
                      </label>
                      <input type="text" id="codigoMateria" value={codigoMateria}
                        onChange={(e) => setCodigoMateria(e.target.value)}
                        placeholder="Ej: PROG3, BD2, IA1"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cicloSemestral" className="block text-sm font-medium text-gray-700 mb-2">
                        Ciclo Semestral <span className="text-red-500">*</span>
                      </label>
                      <select id="cicloSemestral" value={cicloSemestral}
                        onChange={(e) => setCicloSemestral(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        required
                      >
                        <option value="">Seleccione un ciclo</option>
                        {CICLOS_SEMESTRALES.map((ciclo) => <option key={ciclo} value={ciclo}>{ciclo}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="nombreMateria" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Materia <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="nombreMateria" value={nombreMateria}
                      onChange={(e) => setNombreMateria(e.target.value)}
                      placeholder="Ingrese el nombre completo de la materia"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <i className="pi pi-info-circle text-blue-600 text-lg mt-0.5"></i>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Asignación de Grupos</h4>
                        <p className="text-xs text-blue-700">Una vez creada la materia, podrá asignarle grupos desde la lista de materias haciendo clic en el botón "Editar".</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={handleCancel}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
                    >Cancelar</button>
                    <button type="submit"
                      className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-all shadow-md"
                    >Crear Materia</button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "editar" && (
              <SubjectListTab
                materiasFiltradas={materiasFiltradas}
                materias={materias}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                gruposDisponibles={gruposDisponibles}
                getDocenteNombre={getDocenteNombre}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleAbrirAsignaciones={handleAbrirAsignaciones}
              />
            )}
          </main>
        </div>
      </div>

      <SubjectEditModal
        showEditModal={showEditModal}
        codigoMateria={codigoMateria}
        nombreMateria={nombreMateria}
        cicloSemestral={cicloSemestral} setCicloSemestral={setCicloSemestral}
        handleSaveEdit={handleSaveEdit}
        handleCancelEdit={handleCancelEdit}
      />

      <MateriaAsignacionesModal
        isOpen={showAsignacionesModal}
        codigoMateria={materiaSeleccionada?.codigo_materia}
        nombreMateria={materiaSeleccionada?.nombre_materia}
        profesores={profesores}
        onClose={handleCerrarAsignaciones}
        onAsignacionCreada={() => {
          cargarMaterias();
          cargarGrupos();
        }}
      />
    </div>
  );
}
