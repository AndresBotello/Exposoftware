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

  const [successMessage, setSuccessMessage] = useState("");
  const [programas, setProgramas] = useState([]);
  const [loadingProgramas, setLoadingProgramas] = useState(false);

  useEffect(() => {
    const loadProgramas = async () => {
      setLoadingProgramas(true);
      try {
        const response = await fetch(API_ENDPOINTS.ADMIN_FACULTADES, {
          credentials: 'include',
          headers: AuthService.getAuthHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          const facultades = Array.isArray(data) ? data : (data.data || data.facultades || []);
          let allPrograms = [];
          for (const faculty of facultades) {
            if (faculty.id_facultad || faculty.codigo_facultad) {
              const facultyId = faculty.id_facultad || faculty.codigo_facultad;
              try {
                const progRes = await fetch(
                  API_ENDPOINTS.ADMIN_PROGRAMAS_BY_FACULTAD(facultyId),
                  {
                    credentials: 'include',
                    headers: AuthService.getAuthHeaders(),
                  }
                );
                if (progRes.ok) {
                  const progData = await progRes.json();
                  const progs = Array.isArray(progData) ? progData : (progData.data || progData.programas || []);
                  allPrograms = [...allPrograms, ...progs];
                }
              } catch (err) {}
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

  const options = useMemo(() => countryList().getData(), []);
  const [activeTab, setActiveTab] = useState("crear");
  const [errors, setErrors] = useState({});

  // Desestructuración completa del Custom Hook unificado
  const {
    tipoDocumento, setTipoDocumento,
    identificacion, setIdentificacion,
    primerNombre, setPrimerNombre,
    segundoNombre, setSegundoNombre,
    primerApellido, setPrimerApellido,
    segundoApellido, setSegundoApellido,
    genero, setGenero,
    identidadSexual, setIdentidadSexual,
    fechaNacimiento, setFechaNacimiento,
    nacionalidad, setNacionalidad,
    pais, setPais,
    departamento, setDepartamento,
    municipio, setMunicipio,
    ciudadResidencia, setCiudadResidencia,
    direccionResidencia, setDireccionResidencia,
    tipoVia, setTipoVia,
    numeroVia, setNumeroVia,
    numeroCruce, setNumeroCruce,
    numeroPlaca, setNumeroPlaca,
    complemento, setComplemento,
    telefono, setTelefono,
    correo, setCorreo,
    contraseña, setContraseña,
    categoriaDocente, setCategoriaDocente,
    codigoPrograma, setCodigoPrograma,
    activo, setActivo,
    searchTerm, setSearchTerm,
    filtroEstado, setFiltroEstado,
    profesoresFiltrados,
    municipiosApi,
    departamentos,
    isEditing, showEditModal, loading, serverError,
    handleSubmit, handleEdit, handleSaveEdit, handleCancelEdit, handleDelete, handleToggleActivo, handleCancel,
    
    // Estados globales vinculados
    currentPageBackend,
    setCurrentPageBackend,
    totalPaginasBackend,
    limitBackend,
    setLimitBackend
  } = useTeacherManagement();

  const handleInputChange = (fieldName, value, setter) => {
    const filteredValue = filterInput(fieldName, value);
    setter(filteredValue);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e, (message) => {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 4000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader userName={getUserName()} userInitials={getUserInitials()} onLogout={handleLogout} />

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

            {activeTab === "crear" && (
              <TeacherForm
                successMessage={successMessage} serverError={serverError}
                tipoDocumento={tipoDocumento} setTipoDocumento={setTipoDocumento}
                identificacion={identificacion} setIdentificacion={setIdentificacion}
                primerNombre={primerNombre} setPrimerNombre={setPrimerNombre}
                segundoNombre={segundoNombre} setSegundoNombre={setSegundoNombre}
                primerApellido={primerApellido} setPrimerApellido={setPrimerApellido}
                segundoApellido={segundoApellido} setSegundoApellido={setSegundoApellido}
                genero={genero} setGenero={setGenero}
                identidadSexual={identidadSexual} setIdentidadSexual={setIdentidadSexual}
                fechaNacimiento={fechaNacimiento} setFechaNacimiento={setFechaNacimiento}
                nacionalidad={nacionalidad} setNacionalidad={setNacionalidad}
                pais={pais} setPais={setPais}
                departamento={departamento} setDepartamento={setDepartamento}
                municipio={municipio} setMunicipio={setMunicipio}
                municipiosDisponibles={municipiosApi}
                ciudadResidencia={ciudadResidencia} setCiudadResidencia={setCiudadResidencia}
                direccionResidencia={direccionResidencia} setDireccionResidencia={setDireccionResidencia}
                tipoVia={tipoVia} setTipoVia={setTipoVia}
                numeroVia={numeroVia} setNumeroVia={setNumeroVia}
                numeroCruce={numeroCruce} setNumeroCruce={setNumeroCruce}
                numeroPlaca={numeroPlaca} setNumeroPlaca={setNumeroPlaca}
                complemento={complemento} setComplemento={setComplemento}
                telefono={telefono} setTelefono={setTelefono}
                correo={correo} setCorreo={setCorreo}
                contraseña={contraseña} setContraseña={setContraseña}
                categoriaDocente={categoriaDocente} setCategoriaDocente={setCategoriaDocente}
                codigoPrograma={codigoPrograma} setCodigoPrograma={setCodigoPrograma}
                activo={activo} setActivo={setActivo}
                errors={errors} loading={loading} isEditing={isEditing}
                onSubmit={handleFormSubmit} onCancel={handleCancel}
                handleInputChange={handleInputChange} options={options}
                departamentos={departamentos} programas={programas}
                loadingProgramas={loadingProgramas}
              />
            )}

            {activeTab === "editar" && (
            <TeacherList
              profesoresFiltrados={profesoresFiltrados}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filtroEstado={filtroEstado}
              setFiltroEstado={setFiltroEstado}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleToggleActivo={handleToggleActivo}
              
              // 🌟 REVISA QUE ESTAS 5 LÍNEAS ESTÉN EXACTAMENTE ASÍ:
              currentPage={currentPageBackend}
              totalPages={totalPaginasBackend}
              onPageChange={setCurrentPageBackend}
              limit={limitBackend}
              onLimitChange={(nuevoLimite) => {
                setLimitBackend(nuevoLimite);
                setCurrentPageBackend(1); // Al cambiar el tamaño de filas, resetea a la pág 1
              }}
            />
          )}
          </main>
        </div>
      </div>

      <EditTeacherModal
        show={showEditModal} onSave={handleSaveEdit} onCancel={handleCancelEdit}
        programas={programas} loadingProgramas={loadingProgramas}
        identificacion={identificacion} setIdentificacion={setIdentificacion}
        primerNombre={primerNombre} setPrimerNombre={setPrimerNombre}
        primerApellido={primerApellido} setPrimerApellido={setPrimerApellido}
        telefono={telefono} setTelefono={setTelefono}
        correo={correo} setCorreo={setCorreo}
        categoriaDocente={categoriaDocente} setCategoriaDocente={setCategoriaDocente}
        codigoPrograma={codigoPrograma} setCodigoPrograma={setCodigoPrograma}
      />
    </div>
  );
}