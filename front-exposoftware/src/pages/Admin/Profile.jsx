import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { AdminHeader } from "../../components/Admin/AdminComponents";
import colombiaData from "../../data/colombia.json";
import countryList from 'react-select-country-list';
import ProfileForm from "./ProfileForm";
import ChangePasswordModal from "./ChangePasswordModal";

export default function AdminProfile() {
  const navigate = useNavigate();
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [opcionesPaises, setOpcionesPaises] = useState([]);
  const [ciudadesResidencia, setCiudadesResidencia] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  const [profileData, setProfileData] = useState({
    tipoDocumento: "", identificacion: "", nombres: "", apellidos: "",
    genero: "", identidadSexual: "", fechaNacimiento: "", telefono: "",
    pais: "CO", nacionalidad: "CO", departamentoResidencia: "",
    ciudadResidencia: "", direccionResidencia: "", departamento: "",
    municipio: "", ciudad: "", correo: "", programa: "N/A",
    semestre: "N/A", fechaIngreso: "", anioIngreso: "", periodo: "",
    activo: true, rol: "Administrador"
  });

  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) {
      setProfileData({
        tipoDocumento: user.tipo_documento || "CC",
        identificacion: user.identificacion || user.documento || "",
        nombres: user.nombre || user.nombres || "",
        apellidos: user.apellido || user.apellidos || "",
        genero: user.genero || "",
        identidadSexual: user.identidad_sexual || "",
        fechaNacimiento: user.fecha_nacimiento || "",
        telefono: user.telefono || "",
        pais: user.pais || "CO",
        nacionalidad: user.nacionalidad || "CO",
        departamentoResidencia: user.departamento_residencia || "",
        ciudadResidencia: user.ciudad_residencia || "",
        direccionResidencia: user.direccion_residencia || "",
        departamento: user.departamento || "",
        municipio: user.municipio || "",
        ciudad: user.ciudad || "",
        correo: user.correo || user.email || "",
        programa: "N/A", semestre: "N/A",
        fechaIngreso: user.fecha_ingreso || "",
        anioIngreso: user.anio_ingreso || "",
        periodo: user.periodo || "",
        activo: user.activo !== undefined ? user.activo : true,
        rol: "Administrador"
      });
    }
  }, []);

  useEffect(() => { setOpcionesPaises(countryList().getData()); }, []);

  useEffect(() => {
    if (profileData.departamentoResidencia) {
      const deptData = colombiaData.find(d => d.departamento === profileData.departamentoResidencia);
      setCiudadesResidencia(deptData ? deptData.ciudades : []);
    } else {
      setCiudadesResidencia([]);
    }
  }, [profileData.departamentoResidencia]);

  useEffect(() => {
    if (profileData.departamento) {
      const deptData = colombiaData.find(d => d.departamento === profileData.departamento);
      setMunicipios(deptData ? deptData.ciudades : []);
    } else {
      setMunicipios([]);
    }
  }, [profileData.departamento]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!profileData.nombres || !profileData.apellidos || !profileData.telefono) {
      alert("Por favor completa los campos obligatorios");
      return;
    }
    console.log("📤 Datos a guardar:", profileData);
    setIsEditing(false);
    alert("✅ Cambios guardados exitosamente");
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert("Por favor completa todos los campos");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Las contraseñas nuevas no coinciden");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    alert("Contraseña cambiada exitosamente");
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
            <ProfileForm
              profileData={profileData}
              isEditing={isEditing}
              handleInputChange={handleInputChange}
              opcionesPaises={opcionesPaises}
              ciudadesResidencia={ciudadesResidencia}
              municipios={municipios}
              handleEdit={() => setIsEditing(true)}
              handleCancel={() => setIsEditing(false)}
              handleSave={handleSave}
              handleOpenPasswordModal={() => setShowPasswordModal(true)}
            />
          </main>
        </div>
      </div>

      <ChangePasswordModal
        show={showPasswordModal}
        passwordForm={passwordForm}
        handlePasswordChange={handlePasswordChange}
        handleSavePassword={handleSavePassword}
        handleClose={() => {
          setShowPasswordModal(false);
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }}
      />
    </div>
  );
}
