import { useState, useEffect, useMemo } from "react";
import countryList from 'react-select-country-list';
import {
  obtenerDocentes,
  crearDocente,
  actualizarDocente,
  eliminarDocente,
  activarDocente,
  desactivarDocente,
  filtrarDocentes,
  filtrarDocentesPorEstado,
  formatearDatosDocente,
  TIPOS_DOCUMENTO,
  GENEROS,
  IDENTIDADES_SEXUALES,
  CATEGORIAS_DOCENTE,
  DEPARTAMENTOS_COLOMBIA
} from "../../Services/CreateTeacher"; // 💡 Verifica que las mayúsculas coincidan con tu sistema de archivos
import { API_ENDPOINTS } from "../../utils/constants";

export { TIPOS_DOCUMENTO, GENEROS, IDENTIDADES_SEXUALES, CATEGORIAS_DOCENTE, DEPARTAMENTOS_COLOMBIA };

export const PAISES = [
  "Colombia", "Argentina", "Brasil", "Chile", "Ecuador", "México", "Perú",
  "Venezuela", "Estados Unidos", "España", "Otro"
];

export function useTeacherManagement() {
  const opcionesPaises = useMemo(() => countryList().getData(), []);

  // Formulario - Datos del Usuario (heredados)
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [primerNombre, setPrimerNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [genero, setGenero] = useState("");
  const [identidadSexual, setIdentidadSexual] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [nacionalidad, setNacionalidad] = useState("CO"); 
  const [pais, setPais] = useState("CO"); 
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [ciudadResidencia, setCiudadResidencia] = useState("");
  const [direccionResidencia, setDireccionResidencia] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

  // Formulario - Datos del Docente (propios)
  const [categoriaDocente, setCategoriaDocente] = useState("");
  const [codigoPrograma, setCodigoPrograma] = useState("");
  const [activo, setActivo] = useState(true);

  // Dirección componentes
  const [tipoVia, setTipoVia] = useState("");
  const [numeroVia, setNumeroVia] = useState("");
  const [numeroCruce, setNumeroCruce] = useState("");
  const [numeroPlaca, setNumeroPlaca] = useState("");
  const [complemento, setComplemento] = useState("");

  const [municipios, setMunicipios] = useState([]);
  const [paises, setPaises] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipiosApi, setMunicipiosApi] = useState([]);

  // ====== ESTADOS PARA CONTROL DE PAGINACIÓN LOCAL ======
  const [currentPageBackend, setCurrentPageBackend] = useState(1);
  const [limitBackend, setLimitBackend] = useState(5); // 👈 Añadido para controlar el selector de filas

  // Lista de profesores y UI States
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Cargar catálogos iniciales
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [paisesRes, deptoRes] = await Promise.all([
          fetch(API_ENDPOINTS.CATALOGOS_PAISES),
          fetch(API_ENDPOINTS.CATALOGOS_DEPARTAMENTOS),
        ]);
        if (paisesRes.ok) {
          const data = await paisesRes.json();
          setPaises(Array.isArray(data) ? data : (data.data || data.paises || []));
        }
        if (deptoRes.ok) {
          const data = await deptoRes.json();
          setDepartamentos(Array.isArray(data) ? data : (data.data || data.departamentos || []));
        }
      } catch (err) {
        console.error("Error al cargar catálogos:", err);
      }
    };
    loadCatalogs();
  }, []);

  useEffect(() => {
    if (categoriaDocente === "Invitado" || categoriaDocente === "Externo") {
      setCodigoPrograma("");
    }
  }, [categoriaDocente]);

  // Municipios dinámicos basados en departamento
  useEffect(() => {
    if (departamento) {
      const deptoEncontrado = departamentos.find(d =>
        d.nombre === departamento || d.nombre_departamento === departamento ||
        d.departamento === departamento || d.codigo === departamento || d.codigo_departamento === departamento
      );
      const deptoCodigo = deptoEncontrado?.codigo || deptoEncontrado?.codigo_departamento || departamento;

      fetch(API_ENDPOINTS.CATALOGOS_MUNICIPIOS(deptoCodigo))
        .then((r) => {
          if (!r.ok) throw new Error(`Error ${r.status}`);
          return r.json();
        })
        .then((data) => {
          setMunicipiosApi(Array.isArray(data) ? data : (data.data || data.municipios || []));
        })
        .catch(() => setMunicipiosApi([]));
    } else {
      setMunicipiosApi([]);
      setMunicipio("");
    }
  }, [departamento, departamentos]);

  // Función de carga unificada (trae los 17 registros de golpe)
  const cargarProfesores = async () => {
    setLoading(true);
    setServerError("");
    try {
      const response = await obtenerDocentes();
      if (response && response.data) {
        setProfesores(response.data);
      } else {
        setProfesores(response || []);
      }
    } catch (error) {
      setProfesores([]);
      setServerError(error.message || 'Error al cargar profesores');
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    cargarProfesores();
  }, []);

  // ====== PROCESAMIENTO Y MATEMÁTICA DE FILTRADO Y PAGINACIÓN LOCAL ======
  
  // 1. Filtramos todo el universo de registros por texto y estado
  const todosLosProfesoresFiltrados = useMemo(() => {
    return filtrarDocentesPorEstado(
      filtroEstado,
      filtrarDocentes(profesores, searchTerm)
    );
  }, [profesores, searchTerm, filtroEstado]);

  // 2. Calculamos las páginas totales dinámicamente basadas en el resultado previo
  const totalPaginasBackend = useMemo(() => {
    return Math.ceil(todosLosProfesoresFiltrados.length / limitBackend) || 1;
  }, [todosLosProfesoresFiltrados, limitBackend]);

  // 3. Reseteamos la página actual si los filtros exceden el nuevo rango
  useEffect(() => {
    if (currentPageBackend > totalPaginasBackend) {
      setCurrentPageBackend(1);
    }
  }, [totalPaginasBackend, currentPageBackend]);

  // 4. Recortamos el array para enviar ÚNICAMENTE las filas de la página activa
  const profesoresFiltrados = useMemo(() => {
    const inicio = (currentPageBackend - 1) * limitBackend;
    const fin = inicio + limitBackend;
    return todosLosProfesoresFiltrados.slice(inicio, fin);
  }, [todosLosProfesoresFiltrados, currentPageBackend, limitBackend]);


  const limpiarFormulario = () => {
    setTipoDocumento("");
    setIdentificacion("");
    setPrimerNombre("");
    setSegundoNombre("");
    setPrimerApellido("");
    setSegundoApellido("");
    setGenero("");
    setIdentidadSexual("");
    setFechaNacimiento("");
    setNacionalidad("CO");
    setPais("CO");
    setDepartamento("");
    setMunicipio("");
    setCiudadResidencia("");
    setDireccionResidencia("");
    setTipoVia("");
    setNumeroVia("");
    setNumeroCruce("");
    setNumeroPlaca("");
    setComplemento("");
    setTelefono("");
    setCorreo("");
    setContraseña("");
    setCategoriaDocente("");
    setCodigoPrograma("");
    setActivo(true);
    setMunicipios([]);
  };

  const handleSubmit = async (e, onSuccess = null) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");
    try {
      const nombresCompletos = `${primerNombre} ${segundoNombre}`.trim();
      const apellidosCompletos = `${primerApellido} ${segundoApellido}`.trim();
      const municipioSeleccionado = municipiosApi.find(m =>
        m.nombre === municipio || m.nombre_municipio === municipio || m.municipio === municipio
      );
      const codigoMunicipioRes = municipioSeleccionado?.codigo || municipioSeleccionado?.codigo_municipio || "08001";

      const datosDocente = formatearDatosDocente({
        tipoDocumento, identificacion, nombres: nombresCompletos, apellidos: apellidosCompletos,
        genero, identidadSexual, fechaNacimiento, nacionalidad, pais, departamento, municipio,
        codigoMunicipioResidencia: codigoMunicipioRes, codigoMunicipioNacimiento: codigoMunicipioRes,
        ciudadResidencia, tipoVia, numeroVia, numeroCruce, numeroPlaca, complemento,
        direccionResidencia, telefono, correo, contraseña, categoriaDocente, codigoPrograma
      });

      await crearDocente(datosDocente);
      setCurrentPageBackend(1);
      await cargarProfesores();
      limpiarFormulario();
      if (onSuccess) onSuccess(`Profesor ${nombresCompletos} creado correctamente`);
    } catch (error) {
      setServerError(error.message || 'Error al crear docente');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (profesor) => {
    setEditingId(profesor.docente?.id_docente || profesor.id);
    const datosUsuario = profesor.usuario || {};
    const datosDocente = profesor.docente || profesor;

    setTipoDocumento(datosUsuario.tipo_documento || "");
    setIdentificacion(datosUsuario.identificacion || "");
    setPrimerNombre(datosUsuario.p_nombre || "");
    setSegundoNombre("");
    setPrimerApellido(datosUsuario.p_apellido || "");
    setSegundoApellido("");
    setGenero(datosUsuario.sexo || datosUsuario.genero || "");
    setIdentidadSexual(datosUsuario.identidad_sexual || "");
    setFechaNacimiento(datosUsuario.fecha_nacimiento || "");
    setNacionalidad(datosUsuario.nacionalidad === "Colombia" ? "CO" : datosUsuario.nacionalidad || "CO");
    setPais(datosUsuario.pais_residencia === "Colombia" ? "CO" : datosUsuario.pais_residencia || "CO");
    setDepartamento(datosUsuario.departamento || "");
    setMunicipio(datosUsuario.municipio || "");
    setCiudadResidencia(datosUsuario.ciudad_residencia || "");
    setDireccionResidencia(datosUsuario.direccion_residencia || "");
    setTipoVia(datosUsuario.tipo_via || datosUsuario.id_tipo_via || "");
    setNumeroVia(datosUsuario.numero_via || "");
    setNumeroCruce(datosUsuario.numero_cruce || "");
    setNumeroPlaca(datosUsuario.numero_placa || "");
    setComplemento(datosUsuario.complemento || "");
    setTelefono(datosUsuario.telefono || "");
    setCorreo(datosUsuario.correo || "");
    setCategoriaDocente(datosDocente.categoria_docente || "");
    setCodigoPrograma(datosDocente.codigo_programa || "");
    setActivo(datosUsuario.activo !== undefined ? datosUsuario.activo : true);
    setIsEditing(true);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");
    try {
      const nombresCompletos = `${primerNombre} ${segundoNombre}`.trim();
      const apellidosCompletos = `${primerApellido} ${segundoApellido}`.trim();
      const datosDocente = formatearDatosDocente({
        tipoDocumento, identificacion, nombres: nombresCompletos, apellidos: apellidosCompletos,
        genero, identidadSexual, fechaNacimiento, nacionalidad, pais, departamento, municipio,
        ciudadResidencia, tipoVia, numeroVia, numeroCruce, numeroPlaca, complemento,
        direccionResidencia, telefono, correo, contraseña, categoriaDocente, codigoPrograma
      });

      await actualizarDocente(editingId, datosDocente);
      await cargarProfesores(); 
      handleCancelEdit();
    } catch (error) {
      setServerError(error.message || 'Error al actualizar docente');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setShowEditModal(false);
    limpiarFormulario();
  };

  const handleDelete = async (id) => {
    const profesorAEliminar = profesores.find(p => (p.docente?.id_docente || p.id) === id);
    const nombreCompleto = profesorAEliminar?.usuario?.nombre_completo || profesorAEliminar?.usuario?.nombres || profesorAEliminar?.nombres || "profesor";

    if (window.confirm(`¿Está seguro de que desea eliminar al profesor "${nombreCompleto}"?`)) {
      try {
        setLoading(true);
        await eliminarDocente(id);
        await cargarProfesores();
      } catch (error) {
        setServerError(error.message || 'Error al eliminar docente');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleActivo = async (profesor) => {
    const id = profesor?.docente?.id_docente || profesor?.id;
    if (!id) return;
    const nombre = profesor?.usuario?.nombre_completo || profesor?.usuario?.p_nombre || 'docente';
    const estaActivo = profesor?.usuario?.activo ?? profesor?.activo ?? false;
    const verbo = estaActivo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Está seguro de que desea ${verbo} al profesor "${nombre}"?`)) return;
    try {
      setLoading(true);
      if (estaActivo) {
        await desactivarDocente(id);
      } else {
        await activarDocente(id);
      }
      await cargarProfesores();
    } catch (error) {
      setServerError(error.message || `Error al ${verbo} docente`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    limpiarFormulario();
  };

  return {
    tipoDocumento, setTipoDocumento, identificacion, setIdentificacion,
    primerNombre, setPrimerNombre, segundoNombre, setSegundoNombre,
    primerApellido, setPrimerApellido, segundoApellido, setSegundoApellido,
    genero, setGenero, identidadSexual, setIdentidadSexual, fechaNacimiento, setFechaNacimiento,
    nacionalidad, setNacionalidad, pais, setPais, departamento, setDepartamento,
    municipio, setMunicipio, ciudadResidencia, setCiudadResidencia,
    direccionResidencia, setDireccionResidencia, 
    telefono, setTelefono, // 🔧 Corregido: antes tenías cruzado setCorreo aquí
    correo, setCorreo,     // 🔧 Corregido: antes tenías cruzado setTelefono aquí
    contraseña, setContraseña,
    categoriaDocente, setCategoriaDocente, codigoPrograma, setCodigoPrograma, activo, setActivo,
    tipoVia, setTipoVia, numeroVia, setNumeroVia, numeroCruce, setNumeroCruce, numeroPlaca, setNumeroPlaca, complemento, setComplemento,
    profesores, searchTerm, setSearchTerm, filtroEstado, setFiltroEstado, profesoresFiltrados,
    municipios, paises, departamentos, municipiosApi, opcionesPaises, isEditing, showEditModal,
    handleSubmit, handleEdit, handleSaveEdit, handleCancelEdit, handleDelete, handleToggleActivo, handleCancel,
    loading, setLoading, serverError, setServerError,
    
    // Variables de paginación sincronizadas
    currentPageBackend,
    setCurrentPageBackend,
    totalPaginasBackend,
    limitBackend,       // 👈 Exportado
    setLimitBackend     // 👈 Exportado
  };
}