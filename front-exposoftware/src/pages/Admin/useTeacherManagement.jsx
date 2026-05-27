import { useState, useEffect, useMemo } from "react";
import colombiaData from "../../data/colombia.json";
import countryList from 'react-select-country-list';
import {
  obtenerDocentes,
  crearDocente,
  actualizarDocente,
  eliminarDocente,
  filtrarDocentes,
  formatearDatosDocente,
  TIPOS_DOCUMENTO,
  GENEROS,
  IDENTIDADES_SEXUALES,
  CATEGORIAS_DOCENTE,
  DEPARTAMENTOS_COLOMBIA
} from "../../Services/CreateTeacher";
import { API_ENDPOINTS } from "../../utils/constants";

// Re-exportar constantes para mantener compatibilidad
export { TIPOS_DOCUMENTO, GENEROS, IDENTIDADES_SEXUALES, CATEGORIAS_DOCENTE, DEPARTAMENTOS_COLOMBIA };

export const PAISES = [
  "Colombia", "Argentina", "Brasil", "Chile", "Ecuador", "México", "Perú",
  "Venezuela", "Estados Unidos", "España", "Otro"
];

/**
 * Custom Hook para gestionar la lógica de creación y manejo de profesores
 */
export function useTeacherManagement() {
  // Opciones de países/nacionalidades
  const opcionesPaises = useMemo(() => countryList().getData(), []);

  // Estados para el formulario - Datos del Usuario (heredados)
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  // Nombres y apellidos separados según tabla DOCENTE
  const [primerNombre, setPrimerNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [genero, setGenero] = useState("");
  const [identidadSexual, setIdentidadSexual] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [nacionalidad, setNacionalidad] = useState("CO"); // Código ISO de Colombia
  const [pais, setPais] = useState("CO"); // Código ISO de Colombia (pais_residencia en backend)
  const [departamento, setDepartamento] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [ciudadResidencia, setCiudadResidencia] = useState("");
  const [direccionResidencia, setDireccionResidencia] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

  // Estados para el formulario - Datos del Docente (propios)
  const [categoriaDocente, setCategoriaDocente] = useState("");
  const [codigoPrograma, setCodigoPrograma] = useState("");
  const [activo, setActivo] = useState(true);

  // Estados para componentes de dirección (tipo_via, numero_via, etc.)
  const [tipoVia, setTipoVia] = useState("");
  const [numeroVia, setNumeroVia] = useState("");
  const [numeroCruce, setNumeroCruce] = useState("");
  const [numeroPlaca, setNumeroPlaca] = useState("");
  const [complemento, setComplemento] = useState("");

  // Estados para manejar municipios dinámicos
  const [municipios, setMunicipios] = useState([]);

  // Catálogos cargados desde la API
  const [paises, setPaises] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipiosApi, setMunicipiosApi] = useState([]);

  // Cargar catálogos de países y departamentos al montar
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [paisesRes, deptoRes] = await Promise.all([
          fetch(API_ENDPOINTS.CATALOGOS_PAISES),
          fetch(API_ENDPOINTS.CATALOGOS_DEPARTAMENTOS),
        ]);

        if (paisesRes.ok) {
          const data = await paisesRes.json();
          const arr = Array.isArray(data) ? data : (data.data || data.paises || []);
          setPaises(arr);
        }

        if (deptoRes.ok) {
          const data = await deptoRes.json();
          setDepartamentos(Array.isArray(data) ? data : (data.data || data.departamentos || []));
        }
      } catch (err) {
      }
    };
    loadCatalogs();
  }, []);

  // Limpiar código de programa cuando la categoría cambie a Invitado o Externo
  useEffect(() => {
    if (categoriaDocente === "Invitado" || categoriaDocente === "Externo") {
      setCodigoPrograma("");
    }
  }, [categoriaDocente]);

  // Actualizar municipios cuando cambie el departamento
  useEffect(() => {
    if (departamento) {
      const deptoEncontrado = departamentos.find(d =>
        d.nombre === departamento ||
        d.nombre_departamento === departamento ||
        d.departamento === departamento ||
        d.codigo === departamento ||
        d.codigo_departamento === departamento
      );

      const deptoCodigo = deptoEncontrado?.codigo || deptoEncontrado?.codigo_departamento || departamento;

      console.log('📍 URL:', API_ENDPOINTS.CATALOGOS_MUNICIPIOS(deptoCodigo));

      fetch(API_ENDPOINTS.CATALOGOS_MUNICIPIOS(deptoCodigo))
        .then((r) => {
          if (!r.ok) {
            throw new Error(`Error ${r.status}: ${r.statusText}`);
          }
          return r.json();
        })
        .then((data) => {
          const municipiosList = Array.isArray(data) ? data : (data.data || data.municipios || []);
          setMunicipiosApi(municipiosList);
        })
        .catch((err) => {
          setMunicipiosApi([]);
        });
    } else {
      setMunicipiosApi([]);
      setMunicipio("");
    }
  }, [departamento, departamentos]);

  // Estado para la lista de profesores
  const [profesores, setProfesores] = useState([]);
  // Estado de carga y mensaje de error del servidor
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Estado para búsqueda/filtro
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar profesores al montar el componente (evitar usar función antes de definirla)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setServerError("");
      try {
        const data = await obtenerDocentes();
        setProfesores(data);
      } catch (error) {
        setProfesores([]);
        setServerError(error.message || 'Error al cargar profesores');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Función para (re)cargar profesores desde el backend — usada por submit/edición/eliminación
  const cargarProfesores = async () => {
    setLoading(true);
    setServerError("");
    try {
      const data = await obtenerDocentes();
      setProfesores(data);
      setServerError("");
    } catch (error) {
      setProfesores([]);
      setServerError(error.message || 'Error al cargar profesores');
    } finally {
      setLoading(false);
    }
  };

  // Limpiar formulario
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
    setNacionalidad("CO"); // Código ISO de Colombia
    setPais("CO"); // Código ISO de Colombia
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
    // Limpiar listas de municipios
    setMunicipios([]);
  };

  // Crear nuevo profesor usando el servicio
  const handleSubmit = async (e, onSuccess = null) => {
    e.preventDefault();

    setLoading(true);
    setServerError("");

    try {
      // Combinar nombres y apellidos separados en campos únicos para el servicio
      const nombresCompletos = `${primerNombre} ${segundoNombre}`.trim();
      const apellidosCompletos = `${primerApellido} ${segundoApellido}`.trim();

      // Buscar códigos de municipios en los catálogos
      const municipioSeleccionado = municipiosApi.find(m =>
        m.nombre === municipio || m.nombre_municipio === municipio || m.municipio === municipio
      );
      const codigoMunicipioRes = municipioSeleccionado?.codigo || municipioSeleccionado?.codigo_municipio || "08001";

      const datosDocente = formatearDatosDocente({
        tipoDocumento,
        identificacion,
        nombres: nombresCompletos,
        apellidos: apellidosCompletos,
        genero,
        identidadSexual,
        fechaNacimiento,
        nacionalidad,
        pais,
        departamento,
        municipio,
        codigoMunicipioResidencia: codigoMunicipioRes,
        codigoMunicipioNacimiento: codigoMunicipioRes,
        ciudadResidencia,
        tipoVia,
        numeroVia,
        numeroCruce,
        numeroPlaca,
        complemento,
        direccionResidencia,
        telefono,
        correo,
        contraseña,
        categoriaDocente,
        codigoPrograma
      });

      await crearDocente(datosDocente);
      await cargarProfesores();
      // éxito: limpiar formulario y resetear errores
      limpiarFormulario();
      setServerError("");
      // Llamar callback de éxito si se proporciona
      if (onSuccess) {
        onSuccess(`✅ Profesor ${nombresCompletos} creado correctamente`);
      }
    } catch (error) {
      setServerError(error.message || 'Error al crear docente');
    }
    finally {
      setLoading(false);
    }
  };

  // Iniciar edición
  const handleEdit = (profesor) => {

    setEditingId(profesor.docente?.id_docente || profesor.id);

    // Los datos están separados en objetos 'usuario' y 'docente'
    const datosUsuario = profesor.usuario || {};
    const datosDocente = profesor.docente || profesor;

    setTipoDocumento(datosUsuario.tipo_documento || "");
    setIdentificacion(datosUsuario.identificacion || "");

    // El backend retorna p_nombre y p_apellido separados
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

  // Guardar edición usando el servicio
  const handleSaveEdit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setServerError("");

    try {
      // Combinar nombres y apellidos separados en campos únicos para el servicio
      const nombresCompletos = `${primerNombre} ${segundoNombre}`.trim();
      const apellidosCompletos = `${primerApellido} ${segundoApellido}`.trim();

      const datosDocente = formatearDatosDocente({
        tipoDocumento,
        identificacion,
        nombres: nombresCompletos,
        apellidos: apellidosCompletos,
        genero,
        identidadSexual,
        fechaNacimiento,
        nacionalidad,
        pais,
        departamento,
        municipio,
        ciudadResidencia,
        tipoVia,
        numeroVia,
        numeroCruce,
        numeroPlaca,
        complemento,
        direccionResidencia,
        telefono,
        correo,
        contraseña,
        categoriaDocente,
        codigoPrograma
      });

      await actualizarDocente(editingId, datosDocente);
      await cargarProfesores();
      setServerError("");
      handleCancelEdit();
    } catch (error) {
      setServerError(error.message || 'Error al actualizar docente');
    }
    finally {
      setLoading(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setShowEditModal(false);
    limpiarFormulario();
  };

  // Eliminar profesor usando el servicio
  const handleDelete = async (id) => {
    const profesorAEliminar = profesores.find(p => (p.docente?.id_docente || p.id) === id);
    
    // El backend retorna 'nombre_completo' en el objeto usuario
    const nombreCompleto = profesorAEliminar?.usuario?.nombre_completo || profesorAEliminar?.usuario?.nombres || profesorAEliminar?.nombres || "profesor";

    if (window.confirm(`¿Está seguro de que desea eliminar al profesor "${nombreCompleto}"?`)) {
      try {
        setLoading(true);
        setServerError("");
        await eliminarDocente(id);
        await cargarProfesores();
        setServerError("");
      } catch (error) {
        setServerError(error.message || 'Error al eliminar docente');
      }
      finally {
        setLoading(false);
      }
    }
  };

  // Cancelar formulario
  const handleCancel = () => {
    limpiarFormulario();
  };

  // Filtrar profesores por búsqueda usando el servicio
  const profesoresFiltrados = filtrarDocentes(profesores, searchTerm);

  return {
    // Estados del formulario - Usuario (heredados)
    tipoDocumento,
    setTipoDocumento,
    identificacion,
    setIdentificacion,
    // Nombres y apellidos separados
    primerNombre,
    setPrimerNombre,
    segundoNombre,
    setSegundoNombre,
    primerApellido,
    setPrimerApellido,
    segundoApellido,
    setSegundoApellido,
    genero,
    setGenero,
    identidadSexual,
    setIdentidadSexual,
    fechaNacimiento,
    setFechaNacimiento,
    nacionalidad,
    setNacionalidad,
    pais,
    setPais,
    departamento,
    setDepartamento,
    municipio,
    setMunicipio,
    ciudadResidencia,
    setCiudadResidencia,
    direccionResidencia,
    setDireccionResidencia,
    telefono,
    setTelefono,
    correo,
    setCorreo,
    contraseña,
    setContraseña,

    // Estados del formulario - Docente (propios)
    categoriaDocente,
    setCategoriaDocente,
    codigoPrograma,
    setCodigoPrograma,
    activo,
    setActivo,

    // Estados de componentes de dirección
    tipoVia,
    setTipoVia,
    numeroVia,
    setNumeroVia,
    numeroCruce,
    setNumeroCruce,
    numeroPlaca,
    setNumeroPlaca,
    complemento,
    setComplemento,

    // Estados de la lista y UI
    profesores,
    searchTerm,
    setSearchTerm,
    profesoresFiltrados,

    // Estados para municipios dinámicos
    municipios,

    // Catálogos
    paises,
    departamentos,
    municipiosApi,

    // Opciones de países/nacionalidades
    opcionesPaises,

    // Estados de edición
    isEditing,
    showEditModal,

    // Funciones
    handleSubmit,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleCancel,
    // UI states
    loading,
    setLoading,
    serverError,
    setServerError,
  };
}
