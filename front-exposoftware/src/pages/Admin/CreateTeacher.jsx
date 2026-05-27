import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import { useState, useEffect, useMemo } from 'react';
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { AdminHeader, TabNavigation } from "../../components/Admin/AdminComponents";
import countryList from "react-select-country-list";
import {
  useTeacherManagement,
  TIPOS_DOCUMENTO,
  GENEROS,
  IDENTIDADES_SEXUALES,
  CATEGORIAS_DOCENTE,
} from "./useTeacherManagement";
import EditTeacherModal from "./EditTeacherModal";
import TeacherForm from "./TeacherForm";
import TeacherList from "./TeacherList";
import {
  validateField,
  filterInput,
  hasErrors
} from "../../utils/teacherValidations";
import { API_ENDPOINTS } from "../../utils/constants";
import * as AuthService from "../../Services/AuthService";

export default function CreateTeacher() {
  const navigate = useNavigate();
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();

  // Estado para mostrar mensaje de éxito
  const [successMessage, setSuccessMessage] = useState("");

  // Estado para programas académicos
  const [programas, setProgramas] = useState([]);
  const [loadingProgramas, setLoadingProgramas] = useState(false);

  // Cargar programas al montar el componente
  useEffect(() => {
    const loadProgramas = async () => {
      setLoadingProgramas(true);
      try {
        // Intentar cargar todos los programas
        const response = await fetch(API_ENDPOINTS.ADMIN_FACULTADES, {
          headers: AuthService.getAuthHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          const facultades = Array.isArray(data) ? data : (data.data || data.facultades || []);

          // Extraer todos los programas de todas las facultades
          let allPrograms = [];
          for (const faculty of facultades) {
            if (faculty.id_facultad || faculty.codigo_facultad) {
              const facultyId = faculty.id_facultad || faculty.codigo_facultad;
              try {
                const progRes = await fetch(
                  API_ENDPOINTS.ADMIN_PROGRAMAS_BY_FACULTAD(facultyId),
                  { headers: AuthService.getAuthHeaders() }
                );
                if (progRes.ok) {
                  const progData = await progRes.json();
                  const progs = Array.isArray(progData) ? progData : (progData.data || progData.programas || []);
                  allPrograms = [...allPrograms, ...progs];
                }
              } catch (err) {
              }
            }
          }
          setProgramas(allPrograms);
        }
      } catch (err) {
      } finally {
        setLoadingProgramas(false);
      }
    };

    loadProgramas();
  }, []);

  // Opciones de países usando react-select-country-list (igual que Register)
  const options = useMemo(() => countryList().getData(), []);

  // Estado para municipios dinámicos según departamento seleccionado
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState([]);

  // Estado para tabs
  const [activeTab, setActiveTab] = useState("crear"); // crear | editar

  // Estado para errores de validación
  const [errors, setErrors] = useState({});

  const {
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
    // Estados de la lista y UI
    profesores,
    searchTerm,
    setSearchTerm,
    profesoresFiltrados,
    // Estados para municipios dinámicos
    municipios,
    // Catálogos
    paises: paisesCatalogo,
    departamentos: departamentosCatalogo,
    municipiosApi,
    // Opciones de países/nacionalidades
    opcionesPaises,
    // Estados de edición
    isEditing,
    showEditModal,
  loading,
  serverError,
    // Funciones
    handleSubmit,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleCancel,
  } = useTeacherManagement();
  
  // Efecto para actualizar municipios cuando cambia el departamento
  // DEBE estar DESPUÉS de useTeacherManagement para acceder a departamento y municipio
  useEffect(() => {
    if (departamento && municipiosApi.length > 0) {
      const municipiosDelDepto = municipiosApi.filter(m =>
        m.codigo_departamento === departamento ||
        m.departamento === departamento
      );
    }
  }, [departamento, municipiosApi]);
  

  // Función para manejar cambios con validación
  const handleInputChange = (fieldName, value, setter) => {
    // Filtrar entrada según el tipo de campo
    const filteredValue = filterInput(fieldName, value);
    setter(filteredValue);

    // Validar el campo - combinar nombres para validación
    const nombresCompletos = fieldName === 'primerNombre' || fieldName === 'segundoNombre' 
      ? `${fieldName === 'primerNombre' ? value : primerNombre} ${fieldName === 'segundoNombre' ? value : segundoNombre}`.trim()
      : `${primerNombre} ${segundoNombre}`.trim();
    
    const apellidosCompletos = fieldName === 'primerApellido' || fieldName === 'segundoApellido'
      ? `${fieldName === 'primerApellido' ? value : primerApellido} ${fieldName === 'segundoApellido' ? value : segundoApellido}`.trim()
      : `${primerApellido} ${segundoApellido}`.trim();

    const formData = {
      nombres: nombresCompletos,
      apellidos: apellidosCompletos,
      identificacion,
      telefono,
      correo,
      fechaNacimiento,
      ciudadResidencia,
      municipio,
      codigoPrograma,
      categoriaDocente,
    };
    
    const error = validateField(fieldName, filteredValue, formData);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  // Validar antes de enviar el formulario
  const handleFormSubmit = (e) => {
    e.preventDefault();
    

    // Combinar nombres y apellidos para validación
    const nombresCompletos = `${primerNombre} ${segundoNombre}`.trim();
    const apellidosCompletos = `${primerApellido} ${segundoApellido}`.trim();

    // Crear objeto con todos los datos del formulario
    const formData = {
      nombres: nombresCompletos,
      apellidos: apellidosCompletos,
      identificacion,
      telefono,
      correo,
      fechaNacimiento,
      ciudadResidencia,
      municipio,
      codigoPrograma,
      tipoDocumento,
      genero,
      identidadSexual,
      nacionalidad,
      pais,
      departamento,
      direccionResidencia,
      categoriaDocente,
      activo,
    };


    // Validar todos los campos requeridos
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key], formData);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Mostrar cada error específico
    Object.keys(newErrors).forEach(campo => {
    });
    
    setErrors(newErrors);

    // Si hay errores, no enviar el formulario
    if (hasErrors(newErrors)) {
      // Scroll al primer error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    
    // Si no hay errores, proceder con el envío con callback de éxito
    handleSubmit(e, (message) => {
      setSuccessMessage(message);
      // Auto-ocultar el mensaje después de 4 segundos
      setTimeout(() => setSuccessMessage(""), 4000);
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        userName={getUserName()}
        userInitials={getUserInitials()}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          <main className="lg:col-span-3">
            <TabNavigation
              tabs={[
                { id: "crear", label: "Crear Profesor", icon: "➕" },
                { id: "editar", label: "Editar Profesores", icon: "✏️" }
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {/* ========== TAB 1: CREAR PROFESOR ========== */}
            {activeTab === "crear" && (
              <TeacherForm
                successMessage={successMessage}
                serverError={serverError}
                tipoDocumento={tipoDocumento}
                setTipoDocumento={setTipoDocumento}
                identificacion={identificacion}
                setIdentificacion={setIdentificacion}
                primerNombre={primerNombre}
                setPrimerNombre={setPrimerNombre}
                segundoNombre={segundoNombre}
                setSegundoNombre={setSegundoNombre}
                primerApellido={primerApellido}
                setPrimerApellido={setPrimerApellido}
                segundoApellido={segundoApellido}
                setSegundoApellido={setSegundoApellido}
                genero={genero}
                setGenero={setGenero}
                identidadSexual={identidadSexual}
                setIdentidadSexual={setIdentidadSexual}
                fechaNacimiento={fechaNacimiento}
                setFechaNacimiento={setFechaNacimiento}
                nacionalidad={nacionalidad}
                setNacionalidad={setNacionalidad}
                pais={pais}
                setPais={setPais}
                departamento={departamento}
                setDepartamento={setDepartamento}
                municipio={municipio}
                setMunicipio={setMunicipio}
                municipiosDisponibles={municipiosApi}
                ciudadResidencia={ciudadResidencia}
                setCiudadResidencia={setCiudadResidencia}
                tipoVia={tipoVia}
                setTipoVia={setTipoVia}
                numeroVia={numeroVia}
                setNumeroVia={setNumeroVia}
                numeroCruce={numeroCruce}
                setNumeroCruce={setNumeroCruce}
                numeroPlaca={numeroPlaca}
                setNumeroPlaca={setNumeroPlaca}
                complemento={complemento}
                setComplemento={setComplemento}
                direccionResidencia={direccionResidencia}
                setDireccionResidencia={setDireccionResidencia}
                telefono={telefono}
                setTelefono={setTelefono}
                correo={correo}
                setCorreo={setCorreo}
                contraseña={contraseña}
                setContraseña={setContraseña}
                categoriaDocente={categoriaDocente}
                setCategoriaDocente={setCategoriaDocente}
                codigoPrograma={codigoPrograma}
                setCodigoPrograma={setCodigoPrograma}
                activo={activo}
                setActivo={setActivo}
                errors={errors}
                loading={loading}
                isEditing={isEditing}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                handleInputChange={handleInputChange}
                options={options}
                departamentos={departamentosCatalogo}
                programas={programas}
                loadingProgramas={loadingProgramas}
              />
            )}

            {/* ========== TAB 2: EDITAR PROFESORES ========== */}
            {activeTab === "editar" && (
              <TeacherList
                profesoresFiltrados={profesoresFiltrados}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modal de Edición - Componente Separado */}
      <EditTeacherModal
        show={showEditModal}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        // Listas dinámicas
        municipios={municipios}
        opcionesPaises={opcionesPaises}
        departamentos={departamentosCatalogo}
        programas={programas}
        loadingProgramas={loadingProgramas}
        // Estados del formulario - Usuario
        tipoDocumento={tipoDocumento}
        setTipoDocumento={setTipoDocumento}
        identificacion={identificacion}
        setIdentificacion={setIdentificacion}
        // Nombres y apellidos separados
        primerNombre={primerNombre}
        setPrimerNombre={setPrimerNombre}
        segundoNombre={segundoNombre}
        setSegundoNombre={setSegundoNombre}
        primerApellido={primerApellido}
        setPrimerApellido={setPrimerApellido}
        segundoApellido={segundoApellido}
        setSegundoApellido={setSegundoApellido}
        genero={genero}
        setGenero={setGenero}
        identidadSexual={identidadSexual}
        setIdentidadSexual={setIdentidadSexual}
        fechaNacimiento={fechaNacimiento}
        setFechaNacimiento={setFechaNacimiento}
        nacionalidad={nacionalidad}
        setNacionalidad={setNacionalidad}
        pais={pais}
        setPais={setPais}
        departamento={departamento}
        setDepartamento={setDepartamento}
        municipio={municipio}
        setMunicipio={setMunicipio}
        ciudadResidencia={ciudadResidencia}
        setCiudadResidencia={setCiudadResidencia}
        tipoVia={tipoVia}
        setTipoVia={setTipoVia}
        numeroVia={numeroVia}
        setNumeroVia={setNumeroVia}
        numeroCruce={numeroCruce}
        setNumeroCruce={setNumeroCruce}
        numeroPlaca={numeroPlaca}
        setNumeroPlaca={setNumeroPlaca}
        complemento={complemento}
        setComplemento={setComplemento}
        direccionResidencia={direccionResidencia}
        setDireccionResidencia={setDireccionResidencia}
        telefono={telefono}
        setTelefono={setTelefono}
        correo={correo}
        setCorreo={setCorreo}
        contraseña={contraseña}
        setContraseña={setContraseña}
        // Estados del formulario - Docente
        categoriaDocente={categoriaDocente}
        setCategoriaDocente={setCategoriaDocente}
        codigoPrograma={codigoPrograma}
        setCodigoPrograma={setCodigoPrograma}
        activo={activo}
        setActivo={setActivo}
      />
    </div>
  );
}
