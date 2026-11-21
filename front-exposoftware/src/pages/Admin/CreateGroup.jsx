import { useState, useEffect, useMemo } from "react";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { AdminHeader, AdminPageHeader, TabNavigation } from "../../components/Admin/AdminComponents";
import {
  obtenerGrupos,
  obtenerProfesores,
  crearGrupo,
  actualizarGrupo,
  eliminarGrupo,
  filtrarGrupos,
  obtenerMaterias,
  crearAsignacionBulk, // Reemplazamos la función antigua del servicio
  obtenerClasesMateria
} from "../../Services/CreateGroup";
import { eliminarAsignacionDocente } from "../../Services/CreateSubject";
import { TablaGrupos, extractProfessorInfo } from "./GroupHelpers";

export default function CreateGroup() {
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("crear");
  const [codigoGrupo, setCodigoGrupo] = useState("");
  const [idDocente, setIdDocente] = useState("");
  const [grupos, setGrupos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [loadingProfesores, setLoadingProfesores] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIdGrupo, setEditingIdGrupo] = useState(null);
  const [editingNombreGrupo, setEditingNombreGrupo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para crear clase (Asignación Múltiple Bulk)
  const [materias, setMaterias] = useState([]);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [codigoMateriaSeleccionada, setCodigoMateriaSeleccionada] = useState("");
  const [docenteAsignacion, setDocenteAsignacion] = useState("");
  
  // NUEVO: Ahora guardamos un array de strings (IDs de los grupos seleccionados)
  const [gruposSeleccionadosIds, setGruposSeleccionadosIds] = useState([]); 
  
  const [clasesMateria, setClasesMateria] = useState([]);
  const [loadingClases, setLoadingClases] = useState(false);
  const [eliminandoClase, setEliminandoClase] = useState(null);

  useEffect(() => {
    cargarGrupos();
    cargarProfesores();
    cargarMaterias();
  }, []);

  const cargarMaterias = async () => {
    setLoadingMaterias(true);
    try {
      const data = await obtenerMaterias();
      setMaterias(data);
    } catch (error) {
      setMaterias([]);
    } finally {
      setLoadingMaterias(false);
    }
  };

  const cargarGrupos = async () => {
    setLoadingGrupos(true);
    try {
      const data = await obtenerGrupos();
      setGrupos(data);
    } catch (error) {
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
      setProfesores([]);
    } finally {
      setLoadingProfesores(false);
    }
  };

  const limpiarFormulario = () => { setCodigoGrupo(""); setIdDocente(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigoGrupo) {
      alert('❌ Error: Debe ingresar un código de grupo');
      return;
    }
    setSubmitting(true);
    try {
      await crearGrupo(codigoGrupo);
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
    setEditingIdGrupo(grupo.id_grupo);
    setEditingNombreGrupo(grupo.nombre_grupo);
    setCodigoGrupo(grupo.nombre_grupo.toString());
    setIsEditing(true);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!codigoGrupo) {
      alert('❌ Error: El nombre del grupo no puede estar vacío');
      return;
    }
    try {
      await actualizarGrupo(editingIdGrupo, codigoGrupo);
      await cargarGrupos();
      alert("✅ Grupo actualizado exitosamente");
      handleCancelEdit();
    } catch (error) {
      alert(`❌ ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingIdGrupo(null);
    setEditingNombreGrupo(null);
    setShowEditModal(false);
    limpiarFormulario();
  };

  const handleDelete = async (nombreGrupo) => {
    const grupoAEliminar = grupos.find(g => g.nombre_grupo === nombreGrupo);
    if (window.confirm(`¿Está seguro de que desea eliminar el grupo ${grupoAEliminar?.nombre_grupo}?`)) {
      try {
        await eliminarGrupo(nombreGrupo);
        await cargarGrupos();
        alert("✅ Grupo eliminado exitosamente");
      } catch (error) {
        alert(`❌ ${error.message}`);
      }
    }
  };

  const handleMateriaChange = async (e) => {
    const codigo = e.target.value;
    setCodigoMateriaSeleccionada(codigo);
    setDocenteAsignacion("");
    setGruposSeleccionadosIds([]); // Limpiar la selección de grupos
    setClasesMateria([]);

    if (codigo) {
      setLoadingClases(true);
      try {
        const clases = await obtenerClasesMateria(codigo, profesores, grupos);
        setClasesMateria(clases);
      } catch (error) {
        setClasesMateria([]);
      } finally {
        setLoadingClases(false);
      }
    }
  };

  // NUEVO: Manejar la selección/deselección de los checkboxes de grupos
  const handleGrupoCheckboxChange = (idGrupo) => {
    setGruposSeleccionadosIds((prevSelected) => {
      if (prevSelected.includes(idGrupo)) {
        return prevSelected.filter(id => id !== idGrupo);
      } else {
        if (prevSelected.length >= 20) {
          alert("⚠️ Límite excedido: Solo puedes seleccionar un máximo de 20 grupos por petición.");
          return prevSelected;
        }
        return [...prevSelected, idGrupo];
      }
    });
  };

  const limpiarFormularioAsignacion = () => {
    setCodigoMateriaSeleccionada("");
    setDocenteAsignacion("");
    setGruposSeleccionadosIds([]);
  };

  // OPTIMIZADO: Envío masivo de asignaciones (Bulk)
  const handleCrearAsignacion = async (e) => {
    e.preventDefault();
    
    // Validaciones del Frontend exigidas por el Backend
    if (!docenteAsignacion) {
      alert('❌ Error: Debe seleccionar un docente válido (UUID).');
      return;
    }
    if (!codigoMateriaSeleccionada || codigoMateriaSeleccionada.length > 10) {
      alert('❌ Error: La materia es obligatoria y no debe superar los 10 caracteres.');
      return;
    }
    if (gruposSeleccionadosIds.length === 0) {
      alert('❌ Error: Debe seleccionar al menos un (1) grupo.');
      return;
    }

    setSubmitting(true);
    try {
      // Llamada al nuevo endpoint masivo pasándole el payload exacto requerido
      const respuesta = await crearAsignacionBulk({
        id_docente: docenteAsignacion,
        codigo_materia: codigoMateriaSeleccionada,
        id_grupos: gruposSeleccionadosIds
      });

      // Renderizar feedback detallado del procesamiento masivo
      const { total_creadas, total_saltadas, total_fallidas } = respuesta.data;
      alert(`✅ Procesamiento Completado:\n\n` +
            `• Creadas con éxito: ${total_creadas}\n` +
            `• Ya existían (Saltadas): ${total_saltadas}\n` +
            `• Fallidas: ${total_fallidas}\n\n` +
            `${respuesta.message}`);

      limpiarFormularioAsignacion();
      await cargarMaterias();
    } catch (error) {
      alert(`❌ Error al procesar la asignación masiva:\n\n${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminarAsignacion = async (idDocenteMateria, nombreGrupo, nombreDocente) => {
    if (!window.confirm(`¿Estás seguro de que deseas remover la asignación del docente "${nombreDocente}" del grupo "${nombreGrupo}"?\n\nNota: Esta operación no se puede deshacer.`)) {
      return;
    }

    setEliminandoClase(idDocenteMateria);
    try {
      await eliminarAsignacionDocente(idDocenteMateria);
      alert('✅ Asignación eliminada exitosamente');

      // Recargar las clases
      const codigoMateria = codigoMateriaSeleccionada;
      if (codigoMateria) {
        setLoadingClases(true);
        try {
          const clases = await obtenerClasesMateria(codigoMateria);
          setClasesMateria(clases);
        } finally {
          setLoadingClases(false);
        }
      }
    } catch (error) {
      alert('❌ Error al eliminar asignación: ' + error.message);
    } finally {
      setEliminandoClase(null);
    }
  };

  // Se recalcula solo cuando cambian los grupos, la búsqueda o los profesores (antes, en cada render)
  const gruposFiltrados = useMemo(
    () => filtrarGrupos(grupos, searchTerm, profesores),
    [grupos, searchTerm, profesores]
  );
  const spinnerPath = "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z";

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader userName={getUserName()} userInitials={getUserInitials()} onLogout={handleLogout} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          <main className="lg:col-span-3">
            <AdminPageHeader
              icon="pi-users"
              title="Gestión de Grupos"
              subtitle="Crea grupos, asigna clases a docentes y edita los existentes"
            />

            <TabNavigation
              tabs={[
                { id: "crear", label: "Crear Grupo", icon: "➕" },
                { id: "clase", label: "Crear Clase", icon: "🎓" },
                { id: "editar", label: "Editar Grupos", icon: "✏️" },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {activeTab === "crear" && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Nuevo Grupo</h2>
                  <p className="text-sm text-gray-600">Ingresa el código del grupo.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                  <div>
                    <label htmlFor="codigoGrupo" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Grupo <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="codigoGrupo" value={codigoGrupo}
                      onChange={(e) => setCodigoGrupo(e.target.value.toUpperCase())}
                      placeholder="Ej: DEVOPS, CLOUD COMPUTING, PATRONES DE DISEÑO"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Nombre único del grupo. Se convertirá a mayúsculas automáticamente.</p>
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

            {activeTab === "clase" && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Clase (Asignación Masiva)</h2>
                  <p className="text-sm text-gray-600">Asigna un docente a una materia en múltiples grupos de forma simultánea (máximo 20).</p>
                </div>
                <form onSubmit={handleCrearAsignacion} className="space-y-6 max-w-2xl">
                  <div>
                    <label htmlFor="codigoMateria" className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar Materia <span className="text-red-500">*</span>
                    </label>
                    <select id="codigoMateria" value={codigoMateriaSeleccionada} onChange={handleMateriaChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      required disabled={loadingMaterias}
                    >
                      <option value="">-- Selecciona una materia --</option>
                      {materias.map((materia) => (
                        <option key={materia.codigo_materia} value={materia.codigo_materia}>
                          {materia.nombre_materia || materia.codigo_materia}
                        </option>
                      ))}
                    </select>
                  </div>

                  {codigoMateriaSeleccionada && (
                    <>
                      <div>
                        <label htmlFor="docenteAsignacion" className="block text-sm font-medium text-gray-700 mb-2">
                          Seleccionar Docente <span className="text-red-500">*</span>
                        </label>
                        <select id="docenteAsignacion" value={docenteAsignacion} onChange={(e) => setDocenteAsignacion(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                          required disabled={loadingProfesores}
                        >
                          <option value="">-- Selecciona un docente --</option>
                          {profesores.map((profesor) => {
                            const { profesorId, displayText } = extractProfessorInfo(profesor);
                            if (!profesorId) return null;
                            return (
                              <option key={`docente_${profesorId}`} value={profesorId}>
                                {displayText}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* NUEVO PANEL: Selección múltiple mediante Checkboxes Estilizados */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Seleccionar Grupos <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                          Selecciona entre 1 y 20 grupos ({gruposSeleccionadosIds.length} seleccionados)
                        </p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                          {grupos.map((grupo) => {
                            const isChecked = gruposSeleccionadosIds.includes(grupo.id_grupo);
                            return (
                              <label 
                                key={grupo.id_grupo} 
                                className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-all select-none
                                  ${isChecked 
                                    ? "bg-teal-50 border-teal-500 text-teal-900 shadow-sm" 
                                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleGrupoCheckboxChange(grupo.id_grupo)}
                                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                />
                                <span>Grupo {grupo.nombre_grupo}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {loadingClases && <p className="text-sm text-gray-600">Cargando clases existentes...</p>}

                      {clasesMateria.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-blue-900 mb-3">Clases existentes en esta materia:</p>
                          <div className="space-y-2">
                            {clasesMateria.map((clase, idx) => (
                              <div key={idx} className="bg-white rounded p-3 border border-blue-100 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex gap-4 flex-1">
                                    <div>
                                      <span className="font-medium text-gray-700">Docente:</span>
                                      <span className="text-gray-900 ml-2">{clase.docente_nombre || `ID: ${clase.id_docente}`}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700">Grupo:</span>
                                      <span className="text-gray-900 ml-2">{clase.nombre_grupo || clase.codigo_grupo || 'Sin asignar'}</span>
                                    </div>
                                  </div>
                                  {(clase.id_asignacion || clase.id_docente_materia) && (
                                    <button
                                      onClick={() => handleEliminarAsignacion(clase.id_asignacion || clase.id_docente_materia, clase.nombre_grupo || clase.codigo_grupo, clase.docente_nombre || clase.id_docente)}
                                      disabled={eliminandoClase === (clase.id_asignacion || clase.id_docente_materia)}
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all flex-shrink-0 ${
                                        eliminandoClase === (clase.id_asignacion || clase.id_docente_materia)
                                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                          : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                                      }`}
                                      title="Remover asignación"
                                    >
                                      {eliminandoClase === (clase.id_asignacion || clase.id_docente_materia) ? (
                                        <>
                                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                        </>
                                      ) : (
                                        <>
                                          <i className="pi pi-trash text-xs"></i>
                                          Remover
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-4">
                    <button type="submit" disabled={submitting || loadingMaterias || !codigoMateriaSeleccionada || gruposSeleccionadosIds.length === 0}
                      className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d={spinnerPath}></path>
                          </svg>
                          Procesando asignaciones masivas...
                        </span>
                      ) : 'Crear Asignación Múltiple'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Grupo <span className="text-red-500">*</span></label>
                <input type="text" value={codigoGrupo} onChange={(e) => setCodigoGrupo(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="Ej: DEVOPS, CLOUD COMPUTING, PATRONES DE DISEÑO"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleCancelEdit}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >Cancelar</button>
                <button type="submit" disabled={submitting}
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
                  ) : '💾 Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}