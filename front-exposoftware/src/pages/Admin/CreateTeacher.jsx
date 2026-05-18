import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import { useState, useEffect, useMemo } from 'react';
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { AdminHeader, TabNavigation } from "../../components/Admin/AdminComponents";
import countryList from "react-select-country-list";
import colombia from "../../assets/colombia-json-master/colombia.json";
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

export default function CreateTeacher() {
  const navigate = useNavigate();
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();

  // Estado para mostrar mensaje de éxito
  const [successMessage, setSuccessMessage] = useState("");

  // Estado para programas académicos
  const [programas, setProgramas] = useState([]);
  const [loadingProgramas, setLoadingProgramas] = useState(false);

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
    if (departamento) {
      // Buscar el departamento en el array de Colombia
      const deptoEncontrado = colombia.find((d) => d.departamento === departamento);
      
      if (deptoEncontrado && Array.isArray(deptoEncontrado.ciudades)) {
        setMunicipiosDisponibles(deptoEncontrado.ciudades);
        
        // Si el municipio actual no está en la lista, limpiarlo
        if (municipio && !deptoEncontrado.ciudades.includes(municipio)) {
          setMunicipio("");
        }
      } else {
        setMunicipiosDisponibles([]);
        setMunicipio("");
      }
    } else {
      setMunicipiosDisponibles([]);
      setMunicipio("");
    }
  }, [departamento, municipio, setMunicipio]);

  // Cargar programas académicos al montar el componente
  useEffect(() => {
    const cargarProgramas = async () => {
      setLoadingProgramas(true);
      try {
        // Primero cargar las facultades
        const facultadesResponse = await fetch(API_ENDPOINTS.FACULTADES, {
          method: 'GET',
          headers: AuthService.getAuthHeaders(),
        });

        if (!facultadesResponse.ok) {
          throw new Error(`Error ${facultadesResponse.status}: ${facultadesResponse.statusText}`);
        }

        const facultadesData = await facultadesResponse.json();
        console.log('✅ Facultades cargadas:', facultadesData);
        console.log('📊 Tipo de datos:', typeof facultadesData);
        console.log('📊 Es array:', Array.isArray(facultadesData));
        
        // Manejar diferentes estructuras de respuesta
        let facultades = [];
        if (Array.isArray(facultadesData)) {
          facultades = facultadesData;
        } else if (facultadesData && typeof facultadesData === 'object') {
          // Si es un objeto, buscar la propiedad que contenga el array
          facultades = facultadesData.facultades || facultadesData.data || facultadesData.results || [];
        }

        console.log('📚 Total de facultades:', facultades.length);
        console.log('🔍 Primera facultad:', facultades[0]);

        // Cargar programas de cada facultad
        const todasLosProgramas = [];
        
        for (const facultad of facultades) {
          const facultadId = facultad.id_facultad || facultad.id;
          console.log(`🔄 Cargando programas de facultad: ${facultad.nombre_facultad} (${facultadId})`);
          
          try {
            const url = API_ENDPOINTS.PROGRAMAS_BY_FACULTAD(facultadId);
            console.log(`📡 URL: ${url}`);
            
            const programasResponse = await fetch(url, {
              method: 'GET',
              headers: AuthService.getAuthHeaders(),
            });

            console.log(`📊 Status programas facultad ${facultadId}:`, programasResponse.status);

            if (programasResponse.ok) {
              const programasData = await programasResponse.json();
              console.log(`📦 Datos programas facultad ${facultadId}:`, programasData);
              
              // Manejar diferentes estructuras de respuesta para programas
              let programasFacultad = [];
              if (Array.isArray(programasData)) {
                programasFacultad = programasData;
              } else if (programasData && typeof programasData === 'object') {
                programasFacultad = programasData.programas || programasData.data || programasData.results || [];
              }
              
              if (programasFacultad.length > 0) {
                console.log(`✅ Facultad ${facultad.nombre_facultad}: ${programasFacultad.length} programas`);
                todasLosProgramas.push(...programasFacultad);
              }
            }
          } catch (error) {
            console.warn(`⚠️ Error cargando programas de facultad ${facultadId}:`, error);
          }
        }

        console.log('✅ Total de programas cargados:', todasLosProgramas.length);
        console.log('🔍 Primer programa:', todasLosProgramas[0]);
        setProgramas(todasLosProgramas);
      } catch (error) {
        console.error("❌ Error al cargar programas:", error);
        setProgramas([]);
      } finally {
        setLoadingProgramas(false);
      }
    };

    cargarProgramas();
  }, []);
  

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
    
    console.log('🚀 Formulario enviado');
    console.log('📋 Categoría Docente:', categoriaDocente);
    console.log('📋 Código Programa:', codigoPrograma);

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

    console.log('📦 Datos del formulario:', formData);

    // Validar todos los campos requeridos
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key], formData);
      if (error) {
        newErrors[key] = error;
      }
    });

    console.log('❌ Errores encontrados:', newErrors);
    console.log('❌ Cantidad de errores:', Object.keys(newErrors).length);
    
    // Mostrar cada error específico
    Object.keys(newErrors).forEach(campo => {
      console.log(`   ⚠️ Campo "${campo}": ${newErrors[campo]}`);
    });
    
    setErrors(newErrors);

    // Si hay errores, no enviar el formulario
    if (hasErrors(newErrors)) {
      console.log('⛔ Formulario NO enviado - hay errores de validación');
      // Scroll al primer error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    console.log('✅ Validación pasada - enviando al servidor');
    
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
                municipiosDisponibles={municipiosDisponibles}
                ciudadResidencia={ciudadResidencia}
                setCiudadResidencia={setCiudadResidencia}
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
                handleFormSubmit={handleFormSubmit}
                handleCancel={handleCancel}
                handleInputChange={handleInputChange}
                options={options}
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
