import { useState, useEffect } from "react";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { useSubjectManagement, CICLOS_SEMESTRALES } from "./useSubjectManagement";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { AdminHeader, AdminPageHeader, TabNavigation } from "../../components/Admin/AdminComponents";
import SubjectListTab from "./SubjectListTab";
import SubjectEditModal from "./SubjectEditModal";
import MateriaAsignacionesModal from "./MateriaAsignacionesModal";

export default function CreateSubject() {
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("crear");

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
      <AdminHeader userName={getUserName()} userInitials={getUserInitials()} onLogout={handleLogout} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          <main className="lg:col-span-3 space-y-6">
            <AdminPageHeader
              icon="pi-book"
              title="Gestión de Materias"
              subtitle="Crea materias y administra sus grupos y docentes"
            />

            <TabNavigation
              tabs={[
                { id: "crear", label: "Crear Materia", icon: "➕" },
                { id: "editar", label: "Editar Materias", icon: "✏️" },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

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
