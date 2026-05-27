import { useState, useEffect, useMemo } from "react";
import countryList from 'react-select-country-list';
import { API_ENDPOINTS } from "../../utils/constants";
import * as AuthService from "../../Services/AuthService";
import colombiaData from "../../data/colombia.json";

const COUNTRY_CODE_MAP = {
  'CO': 'COL',
  'US': 'USA',
  'MX': 'MEX',
  'AR': 'ARG',
  'BR': 'BRA',
  'CL': 'CHL',
  'PE': 'PER',
  'VE': 'VEN',
  'EC': 'ECU',
  'BO': 'BOL',
  'PY': 'PRY',
  'UY': 'URY',
  'GY': 'GUY',
  'SR': 'SUR',
  'FR': 'FRA',
  'ES': 'ESP',
  'IT': 'ITA',
  'DE': 'DEU',
  'GB': 'GBR',
  'JP': 'JPN',
  'CN': 'CHN',
  'IN': 'IND',
  'RU': 'RUS',
  'CA': 'CAN',
  'AU': 'AUS',
  'NZ': 'NZL',
};

const convertCountryCode = (code) => {
  if (!code) return code;
  if (code.length === 3) return code;
  return COUNTRY_CODE_MAP[code] || code;
};

export const TIPOS_DOCUMENTO = [
  { value: 1, label: "Cédula de Ciudadanía" },
  { value: 2, label: "Pasaporte" },
  { value: 3, label: "Documento de Identidad Extranjero" }
];

export const GENEROS = [
  { value: 1, label: "Masculino" },
  { value: 2, label: "Femenino" },
  { value: 3, label: "Otro" }
];

export const TIPOS_VIA = [
  { value: 1, label: "Calle" },
  { value: 2, label: "Carrera" },
  { value: 3, label: "Avenida" },
  { value: 4, label: "Transversal" }
];

export function useGuestAndGraduateManagement(userType = 'invitado') {
  const opcionesPaises = useMemo(() => countryList().getData(), []);

  // Estados para el formulario - Datos del Usuario
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [primerNombre, setPrimerNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [genero, setGenero] = useState("");
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
  const [tipoVia, setTipoVia] = useState("");
  const [numeroVia, setNumeroVia] = useState("");
  const [numeroCruce, setNumeroCruce] = useState("");
  const [numeroPlaca, setNumeroPlaca] = useState("");
  const [complemento, setComplemento] = useState("");

  // Estados específicos para Invitados
  const [esProfesorExtranjero, setEsProfesorExtranjero] = useState(false);
  const [idSector, setIdSector] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");

  // Estados específicos para Egresados
  const [anioFinalizacion, setAnioFinalizacion] = useState("");
  const [codigoPrograma, setCodigoPrograma] = useState("");
  const [titulado, setTitulado] = useState(false);

  // Estados para catálogos
  const [paises, setPaises] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipiosApi, setMunicipiosApi] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [idFacultad, setIdFacultad] = useState("");

  // Estados de listas
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Cargar catálogos
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [paisesRes, deptoRes, sectoresRes, facultadesRes] = await Promise.all([
          fetch(API_ENDPOINTS.CATALOGOS_PAISES),
          fetch(API_ENDPOINTS.CATALOGOS_DEPARTAMENTOS),
          fetch(API_ENDPOINTS.ADMIN_SECTORES, {
            headers: AuthService.getAuthHeaders(),
            credentials: 'include'
          }),
          fetch(API_ENDPOINTS.ADMIN_FACULTADES, {
            headers: AuthService.getAuthHeaders(),
            credentials: 'include'
          })
        ]);

        if (paisesRes.ok) {
          const data = await paisesRes.json();
          setPaises(Array.isArray(data) ? data : (data.data || data.paises || []));
        }

        if (deptoRes.ok) {
          const data = await deptoRes.json();
          setDepartamentos(Array.isArray(data) ? data : (data.data || data.departamentos || []));
        }

        if (sectoresRes.ok) {
          const data = await sectoresRes.json();
          const sectoresData = Array.isArray(data) ? data : (data.data || data.sectores || []);
          setSectores(sectoresData);
        }

        if (facultadesRes.ok) {
          const data = await facultadesRes.json();
          const facultadesData = Array.isArray(data) ? data : (data.data || data.facultades || []);
          setFacultades(facultadesData);
        }
      } catch (err) {
        setServerError("Error al cargar catálogos");
      }
    };

    loadCatalogs();
  }, []);

  // Cargar municipios cuando cambia el departamento
  useEffect(() => {
    if (departamento) {
      const loadMunicipios = async () => {
        try {
          const response = await fetch(
            API_ENDPOINTS.CATALOGOS_MUNICIPIOS(departamento)
          );

          if (response.ok) {
            const data = await response.json();
            setMunicipiosApi(Array.isArray(data) ? data : (data.data || data.municipios || []));
          }
        } catch (err) {
        }
      };

      loadMunicipios();
    }
  }, [departamento]);

  // Cargar programas cuando se selecciona una facultad
  useEffect(() => {
    if (idFacultad) {
      const loadProgramas = async () => {
        try {
          const response = await fetch(
            API_ENDPOINTS.ADMIN_PROGRAMAS_BY_FACULTAD(idFacultad),
            { headers: AuthService.getAuthHeaders(), credentials: 'include' }
          );

          if (response.ok) {
            const data = await response.json();
            const programasData = Array.isArray(data) ? data : (data.data || data.programas || []);
            setProgramas(programasData);
          }
        } catch (err) {
          setProgramas([]);
        }
      };

      loadProgramas();
    } else {
      setProgramas([]);
    }
  }, [idFacultad]);

  // Cargar lista de usuarios
  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const endpoint = userType === 'invitado' ? API_ENDPOINTS.ADMIN_INVITADOS : API_ENDPOINTS.ADMIN_EGRESADOS;
      const response = await fetch(endpoint, {
        headers: AuthService.getAuthHeaders(),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();

        const usuarios = Array.isArray(data) ? data : (data.data || data.usuarios || []);

        if (usuarios.length > 0) {
        }

        setUsuarios(usuarios);
      } else {
        setServerError("Error al cargar la lista");
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [userType]);

  const usuariosFiltrados = usuarios.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (u.usuario?.p_nombre?.toLowerCase().includes(searchLower)) ||
      (u.usuario?.p_apellido?.toLowerCase().includes(searchLower)) ||
      (u.usuario?.correo?.toLowerCase().includes(searchLower)) ||
      (u.usuario?.identificacion?.includes(searchTerm))
    );
  });

  const handleSubmit = async (e, onSuccess) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");

    try {
      const endpoint = userType === 'invitado' ? API_ENDPOINTS.ADMIN_INVITADOS : API_ENDPOINTS.ADMIN_EGRESADOS;

      const payload = {
        usuario: {
          id_tipo_doc: parseInt(tipoDocumento),
          identificacion,
          p_nombre: primerNombre,
          s_nombre: segundoNombre || undefined,
          p_apellido: primerApellido,
          s_apellido: segundoApellido || undefined,
          id_genero: parseInt(genero),
          fecha_nacimiento: fechaNacimiento,
          codigo_pais_nacionalidad: convertCountryCode(nacionalidad),
          codigo_pais_residencia: convertCountryCode(pais),
          codigo_pais_nacimiento: convertCountryCode(nacionalidad),
          codigo_municipio_nacimiento: municipio,
          codigo_municipio_residencia: municipio,
          id_tipo_via: parseInt(tipoVia) || 1,
          numero_via: numeroVia || "0",
          numero_cruce: numeroCruce || "0",
          numero_placa: numeroPlaca || "0",
          telefono,
          correo,
          contrasena: contraseña,
          activo: true
        },
        perfil: userType === 'invitado'
          ? {
              es_profesor_extranjero: esProfesorExtranjero,
              id_sector: parseInt(idSector),
              nombre_empresa: nombreEmpresa
            }
          : {
              anio_finalizacion: parseInt(anioFinalizacion),
              codigo_programa: codigoPrograma,
              titulado
            }
      };

      console.log('📤 Enviando payload:', JSON.stringify(payload, null, 2));
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...AuthService.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      console.log('📥 Datos de respuesta:', JSON.stringify(responseData, null, 2));

      if (response.ok) {
        onSuccess?.(`${userType === 'invitado' ? 'Invitado' : 'Egresado'} creado exitosamente`);
        handleCancel();
        loadUsuarios();
      } else {
        setServerError(responseData.detail || responseData.message || JSON.stringify(responseData) || `Error al crear ${userType === 'invitado' ? 'invitado' : 'egresado'}`);
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTipoDocumento("");
    setIdentificacion("");
    setPrimerNombre("");
    setSegundoNombre("");
    setPrimerApellido("");
    setSegundoApellido("");
    setGenero("");
    setFechaNacimiento("");
    setNacionalidad("CO");
    setPais("CO");
    setDepartamento("");
    setMunicipio("");
    setCiudadResidencia("");
    setDireccionResidencia("");
    setTelefono("");
    setCorreo("");
    setContraseña("");
    setTipoVia("");
    setNumeroVia("");
    setNumeroCruce("");
    setNumeroPlaca("");
    setComplemento("");

    if (userType === 'invitado') {
      setEsProfesorExtranjero(false);
      setIdSector("");
      setNombreEmpresa("");
    } else {
      setAnioFinalizacion("");
      setCodigoPrograma("");
      setTitulado(false);
    }

    setIsEditing(false);
    setServerError("");
  };

  const handleEdit = (usuario) => {
    setTipoDocumento(usuario.usuario?.id_tipo_doc?.toString() || "");
    setIdentificacion(usuario.usuario?.identificacion || "");
    setPrimerNombre(usuario.usuario?.p_nombre || "");
    setSegundoNombre(usuario.usuario?.s_nombre || "");
    setPrimerApellido(usuario.usuario?.p_apellido || "");
    setSegundoApellido(usuario.usuario?.s_apellido || "");
    setGenero(usuario.usuario?.id_genero?.toString() || "");
    setFechaNacimiento(usuario.usuario?.fecha_nacimiento || "");
    const nacionalidadCode = usuario.usuario?.codigo_pais_nacionalidad;
    const paisCode = usuario.usuario?.codigo_pais_residencia;
    setNacionalidad(nacionalidadCode ? Object.keys(COUNTRY_CODE_MAP).find(k => COUNTRY_CODE_MAP[k] === nacionalidadCode) || nacionalidadCode : "CO");
    setPais(paisCode ? Object.keys(COUNTRY_CODE_MAP).find(k => COUNTRY_CODE_MAP[k] === paisCode) || paisCode : "CO");
    setMunicipio(usuario.usuario?.codigo_municipio_residencia || "");
    setTelefono(usuario.usuario?.telefono || "");
    setCorreo(usuario.usuario?.correo || "");
    setTipoVia(usuario.usuario?.id_tipo_via?.toString() || "");
    setNumeroVia(usuario.usuario?.numero_via || "");
    setNumeroCruce(usuario.usuario?.numero_cruce || "");
    setNumeroPlaca(usuario.usuario?.numero_placa || "");

    if (userType === 'invitado' && usuario.invitado) {
      setEsProfesorExtranjero(usuario.invitado.es_profesor_extranjero || false);
      setIdSector(usuario.invitado.id_sector?.toString() || "");
      setNombreEmpresa(usuario.invitado.nombre_empresa || "");
    } else if (userType === 'egresado' && usuario.egresado) {
      setAnioFinalizacion(usuario.egresado.anio_finalizacion?.toString() || "");
      setCodigoPrograma(usuario.egresado.codigo_programa || "");
      setTitulado(usuario.egresado.titulado || false);
    }

    setEditingId(usuario.id);
    setIsEditing(true);
    setShowEditModal(true);
  };

  const handleDelete = async (usuarioId) => {
    if (!window.confirm(`¿Desactivas este ${userType === 'invitado' ? 'invitado' : 'egresado'}?`)) {
      return;
    }

    try {
      const endpoint = userType === 'invitado'
        ? API_ENDPOINTS.ADMIN_INVITADO_DESACTIVAR(usuarioId)
        : API_ENDPOINTS.ADMIN_EGRESADO_DESACTIVAR(usuarioId);

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          ...AuthService.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ razon: 'Desactivado por administrador' })
      });

      if (response.ok) {
        loadUsuarios();
      } else {
        setServerError(`Error al desactivar ${userType === 'invitado' ? 'invitado' : 'egresado'}`);
      }
    } catch (err) {
      setServerError(err.message);
    }
  };

  return {
    // Estados del usuario
    tipoDocumento, setTipoDocumento,
    identificacion, setIdentificacion,
    primerNombre, setPrimerNombre,
    segundoNombre, setSegundoNombre,
    primerApellido, setPrimerApellido,
    segundoApellido, setSegundoApellido,
    genero, setGenero,
    fechaNacimiento, setFechaNacimiento,
    nacionalidad, setNacionalidad,
    pais, setPais,
    departamento, setDepartamento,
    municipio, setMunicipio,
    ciudadResidencia, setCiudadResidencia,
    direccionResidencia, setDireccionResidencia,
    telefono, setTelefono,
    correo, setCorreo,
    contraseña, setContraseña,
    tipoVia, setTipoVia,
    numeroVia, setNumeroVia,
    numeroCruce, setNumeroCruce,
    numeroPlaca, setNumeroPlaca,
    complemento, setComplemento,

    // Estados específicos para guest
    esProfesorExtranjero, setEsProfesorExtranjero,
    idSector, setIdSector,
    nombreEmpresa, setNombreEmpresa,

    // Estados específicos para graduate
    anioFinalizacion, setAnioFinalizacion,
    codigoPrograma, setCodigoPrograma,
    titulado, setTitulado,

    // Catálogos
    paises,
    departamentos,
    municipiosApi,
    sectores,
    facultades,
    programas,
    idFacultad, setIdFacultad,
    opcionesPaises,

    // Lista y búsqueda
    usuarios,
    searchTerm, setSearchTerm,
    usuariosFiltrados,

    // UI
    loading,
    serverError,
    isEditing,
    showEditModal, setShowEditModal,
    editingId,

    // Funciones
    handleSubmit,
    handleCancel,
    handleEdit,
    handleDelete,
    loadUsuarios
  };
}
