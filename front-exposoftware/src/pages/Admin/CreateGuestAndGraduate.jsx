import { useState } from 'react';
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { AdminHeader, TabNavigation } from "../../components/Admin/AdminComponents";
import { useGuestAndGraduateManagement } from "./useGuestAndGraduateManagement";
import GuestForm from "./GuestForm";
import GraduateForm from "./GraduateForm";
import GuestAndGraduateList from "./GuestAndGraduateList";

export default function CreateGuestAndGraduate() {
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();
  const [userType, setUserType] = useState("invitado"); // invitado | egresado
  const [activeTab, setActiveTab] = useState("crear"); // crear | ver

  const {
    usuarios,
    searchTerm,
    setSearchTerm,
    usuariosFiltrados,
    loading,
    serverError,
    handleDelete,
    handleSubmit,
    handleCancel,
    // Estados del formulario - Usuario
    tipoDocumento,
    setTipoDocumento,
    identificacion,
    setIdentificacion,
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
    // Estados específicos para Invitados
    esProfesorExtranjero,
    setEsProfesorExtranjero,
    idSector,
    setIdSector,
    nombreEmpresa,
    setNombreEmpresa,
    // Estados específicos para Egresados
    anioFinalizacion,
    setAnioFinalizacion,
    codigoPrograma,
    setCodigoPrograma,
    titulado,
    setTitulado,
    // Catálogos
    paises: paisesCatalogo,
    departamentos,
    municipiosApi,
    sectores,
    facultades,
    programas,
    idFacultad,
    setIdFacultad,
  } = useGuestAndGraduateManagement(userType);

  const [successMessage, setSuccessMessage] = useState("");

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e, (message) => {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 4000);
      setActiveTab("ver");
    });
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
                { id: "crear", label: "Crear Invitado/Egresado", icon: "➕" },
                { id: "ver", label: "Ver Invitados/Egresados", icon: "👁️" }
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            {/* ========== TAB 1: CREAR ========== */}
            {activeTab === "crear" && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tipo de Usuario a Crear
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setUserType("invitado")}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        userType === "invitado"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      👥 Invitado
                    </button>
                    <button
                      onClick={() => setUserType("egresado")}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                        userType === "egresado"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      🎓 Egresado
                    </button>
                  </div>
                </div>

                {successMessage && (
                  <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    ✅ {successMessage}
                  </div>
                )}

                {userType === "invitado" ? (
                  <GuestForm
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
                    esProfesorExtranjero={esProfesorExtranjero}
                    setEsProfesorExtranjero={setEsProfesorExtranjero}
                    idSector={idSector}
                    setIdSector={setIdSector}
                    nombreEmpresa={nombreEmpresa}
                    setNombreEmpresa={setNombreEmpresa}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancel}
                    departamentos={departamentos}
                    paises={paisesCatalogo}
                    sectores={sectores}
                  />
                ) : (
                  <GraduateForm
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
                    anioFinalizacion={anioFinalizacion}
                    setAnioFinalizacion={setAnioFinalizacion}
                    codigoPrograma={codigoPrograma}
                    setCodigoPrograma={setCodigoPrograma}
                    titulado={titulado}
                    setTitulado={setTitulado}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancel}
                    departamentos={departamentos}
                    paises={paisesCatalogo}
                    facultades={facultades}
                    idFacultad={idFacultad}
                    setIdFacultad={setIdFacultad}
                    programas={programas}
                  />
                )}
              </div>
            )}

            {/* ========== TAB 2: VER ========== */}
            {activeTab === "ver" && (
              <GuestAndGraduateList
                userType={userType}
                setUserType={setUserType}
                usuariosFiltrados={usuariosFiltrados}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                loading={loading}
                serverError={serverError}
                handleDelete={handleDelete}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
