import { useState, useEffect } from "react";
import * as SubjectService from "../../Services/CreateSubject";

// Opciones de ciclo semestral
export const CICLOS_SEMESTRALES = [
  "Ciclo Básico",
  "Ciclo Profesional",
  "Ciclo de Profundización"
];

// Mapeo de ciclo a ID numérico para el API
export const CICLOS_ID_MAP = {
  "Ciclo Básico": 1,
  "Ciclo Profesional": 2,
  "Ciclo de Profundización": 3
};

// Mapeo inverso de ID a ciclo
export const ID_CICLOS_MAP = {
  1: "Ciclo Básico",
  2: "Ciclo Profesional",
  3: "Ciclo de Profundización"
};


export const useSubjectManagement = () => {

  const [codigoMateria, setCodigoMateria] = useState("");
  const [nombreMateria, setNombreMateria] = useState("");
  const [cicloSemestral, setCicloSemestral] = useState("");

  // Estados para grupos disponibles y seleccionados
  const [gruposDisponibles, setGruposDisponibles] = useState([]);
  const [gruposSeleccionados, setGruposSeleccionados] = useState([]);
  const [profesores, setProfesores] = useState([]);

  // Estado para la lista de materias
  const [materias, setMaterias] = useState([]);

  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estados para asignaciones
  const [showAsignacionesModal, setShowAsignacionesModal] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

  // Estado para búsqueda/filtro
  const [searchTerm, setSearchTerm] = useState("");



  /**
   * Obtener nombre del docente por ID (maneja estructura anidada {docente, usuario})
   */
  const getDocenteNombre = (docenteId) => {
    if (!docenteId) return "Sin asignar";
    
    
    // Buscar en el array de profesores (estructura anidada del backend)
    const profesorInfo = profesores.find(item => {
      const docente = item?.docente || item;
      const idDocente = docente?.id_docente || docente?.id;
      return idDocente === docenteId;
    });
    
    if (profesorInfo) {
      // Extraer nombre del usuario anidado
      const usuario = profesorInfo?.usuario || {};
      const nombreCompleto = usuario?.nombre_completo || '';
      const correo = usuario?.correo || '';
      const nombre = nombreCompleto || correo?.split('@')[0] || 'Docente asignado';
      
      return nombre;
    }
    
    return `Docente ${docenteId.substring(0, 8)}...`;
  };

  /**
   * Obtener grupo completo por código
   */
  const getGrupoCompleto = (codigoGrupo) => {
    return gruposDisponibles.find(g => g.codigo_grupo === codigoGrupo);
  };

  /**
   * Agregar grupo seleccionado
   */
  const agregarGrupoSeleccionado = (codigoGrupo) => {
    if (!codigoGrupo) return;

    // Comparar como strings ya que el backend devuelve strings
    const grupo = gruposDisponibles.find(g => String(g.codigo_grupo) === String(codigoGrupo));
    
    
    if (grupo && !gruposSeleccionados.find(g => String(g.codigo_grupo) === String(grupo.codigo_grupo))) {
      setGruposSeleccionados([...gruposSeleccionados, { 
        codigo_grupo: grupo.codigo_grupo, 
        id_docente: grupo.id_docente 
      }]);
    } else if (!grupo) {
    } else {
    }
  };

  /**
   * Eliminar grupo seleccionado
   */
  const eliminarGrupoSeleccionado = (codigoGrupo) => {
    setGruposSeleccionados(gruposSeleccionados.filter(g => String(g.codigo_grupo) !== String(codigoGrupo)));
  };

  const limpiarFormulario = () => {
    setCodigoMateria("");
    setNombreMateria("");
    setCicloSemestral("");
    setGruposSeleccionados([]);
  };



  /**
   * Cargar materias desde el backend usando el servicio
   */
  const cargarMaterias = async () => {
    try {
      const data = await SubjectService.obtenerMaterias();
      setMaterias(data);
    } catch (error) {
      // No mostrar alert para no bloquear la UI
      setMaterias([]);
    }
  };

  /**
   * Cargar grupos desde el backend usando el servicio
   */
  const cargarGrupos = async () => {
    try {
      const data = await SubjectService.obtenerGrupos();
      setGruposDisponibles(data);
    } catch (error) {
      setGruposDisponibles([]);
    }
  };

  /**
   * Cargar profesores desde el backend usando el servicio
   */
  const cargarProfesores = async () => {
    try {
      const data = await SubjectService.obtenerDocentes();
      setProfesores(data);
    } catch (error) {
      setProfesores([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos usando el servicio
    const validacion = SubjectService.validarDatosMateria({
      codigo_materia: codigoMateria,
      nombre_materia: nombreMateria,
      ciclo_semestral: cicloSemestral
    });

    if (!validacion.valido) {
      alert('⚠️ Por favor complete todos los campos requeridos:\n\n' + validacion.errores.join('\n'));
      return;
    }

    try {
      const resultado = await SubjectService.crearMateria({
        codigo_materia: codigoMateria,
        nombre_materia: nombreMateria,
        ciclo_semestral: cicloSemestral
      });

      if (resultado.success) {
        await cargarMaterias();
        alert("✅ " + resultado.message + "\n\nLa materia ha sido creada exitosamente. Ahora puede asignarle grupos desde la pestaña 'Editar Materias'.");
        limpiarFormulario();
      }
    } catch (error) {
      alert("❌ Error al crear la materia:\n\n" + error.message);
    }
  };

  /**
   * Iniciar edición de materia (para asignar grupos)
   */
  const handleEdit = (materia) => {
    
    // El ID de la materia ES su codigo_materia (no tiene campo "id")
    setEditingId(materia.codigo_materia);
    setCodigoMateria(materia.codigo_materia);
    setNombreMateria(materia.nombre_materia);
    setCicloSemestral(materia.ciclo_semestral);
    
    // Cargar grupos asignados - convertir de códigos a objetos completos
    const gruposAsignados = materia.grupos_asignados || [];
    
    // Buscar los objetos completos de grupo en gruposDisponibles
    const gruposCompletos = gruposAsignados
      .map(codigoGrupo => gruposDisponibles.find(g => String(g.codigo_grupo) === String(codigoGrupo)))
      .filter(Boolean); // Eliminar undefined
    
    setGruposSeleccionados(gruposCompletos);
    
    setIsEditing(true);
    setShowEditModal(true);
    
  };

  /**
   * Guardar edición de materia (actualizar solo el ciclo)
   */
  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!cicloSemestral) {
      alert('Por favor selecciona un ciclo semestral');
      return;
    }

    try {
      // Convertir ciclo a ID numérico
      const idCiclo = CICLOS_ID_MAP[cicloSemestral];

      await SubjectService.actualizarMateria(editingId, {
        nombre_materia: nombreMateria,
        id_ciclo: idCiclo
      });

      // 2. Recargar materias para actualizar la UI
      await cargarMaterias();
      alert("✅ Ciclo actualizado exitosamente");
      handleCancelEdit();
      
    } catch (error) {
      alert("❌ Error al actualizar la materia: " + error.message);
    }
  };

  /**
   * Cancelar edición
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setShowEditModal(false);
    limpiarFormulario();
  };

  /**
   * Eliminar materia usando el servicio
   */
  const handleDelete = async (id) => {
    const materiaAEliminar = materias.find(m => m.id === id);
    
    if (window.confirm(`¿Está seguro de que desea eliminar la materia "${materiaAEliminar?.nombre_materia}"? Esta acción también eliminará todos los grupos asociados.`)) {
      try {
        const resultado = await SubjectService.eliminarMateria(id);
        
        if (resultado.success) {
          await cargarMaterias();
          alert("✅ " + resultado.message);
        }
      } catch (error) {
        alert("❌ Error al eliminar la materia: " + error.message);
      }
    }
  };

  const handleCancel = () => {
    limpiarFormulario();
  };

  /**
   * Abrir modal de asignaciones de materia
   */
  const handleAbrirAsignaciones = (materia) => {
    setMateriaSeleccionada(materia);
    setShowAsignacionesModal(true);
  };

  /**
   * Cerrar modal de asignaciones
   */
  const handleCerrarAsignaciones = () => {
    setShowAsignacionesModal(false);
    setMateriaSeleccionada(null);
  };

  useEffect(() => {
    cargarMaterias();
    cargarGrupos();
    cargarProfesores();
  }, []);

  // Filtrar materias usando el servicio
  const materiasFiltradas = SubjectService.filtrarMaterias(materias, searchTerm);


  return {
    // Estados del formulario
    codigoMateria,
    setCodigoMateria,
    nombreMateria,
    setNombreMateria,
    cicloSemestral,
    setCicloSemestral,

    // Estados de grupos
    gruposDisponibles,
    gruposSeleccionados,
    profesores,

    // Estados de materias
    materias,
    materiasFiltradas,

    // Estados de edición
    isEditing,
    editingId,
    showEditModal,

    // Estados de asignaciones
    showAsignacionesModal,
    materiaSeleccionada,

    // Estado de búsqueda
    searchTerm,
    setSearchTerm,

    // Funciones auxiliares
    getDocenteNombre,
    getGrupoCompleto,
    agregarGrupoSeleccionado,
    eliminarGrupoSeleccionado,

    // Funciones CRUD
    handleSubmit,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleCancel,

    // Funciones de asignaciones
    handleAbrirAsignaciones,
    handleCerrarAsignaciones,

    // Funciones de carga
    cargarMaterias,
    cargarGrupos,
    cargarProfesores,
  };
};
