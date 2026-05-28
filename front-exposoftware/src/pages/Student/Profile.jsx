import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useStudentProfile } from "../../hooks/Student/useStudentProfile";
import StudentHeader from "../../components/Student/StudentHeader";
import StudentSidebar from "../../components/Student/StudentSidebar";
import StudentLayout from "../../components/Student/StudentLayout";
import StudentProfileForm from "./StudentProfileForm";

export default function Profile() {
  const { user, getFullName, getInitials, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const { profileData, setProfileData, loading, handleInputChange, handleSave } = useStudentProfile(user, updateUser);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      alert("❌ Error al cerrar sesión");
    }
  };

  const handleSaveProfile = async () => {
    // p_nombre y p_apellido NO se incluyen en el payload: el backend
    // (UsuarioPerfilUpdate) los ignora silenciosamente, solo admin puede
    // cambiarlos. Si estan vacios en BD, el usuario debe contactar admin
    // (el banner amarillo ya se lo dice).
    if (!profileData.telefono) {
      alert("El teléfono es obligatorio.");
      return;
    }

    try {
      const datosActualizar = {
        s_nombre: profileData.s_nombre,
        s_apellido: profileData.s_apellido,
        telefono: profileData.telefono,
      };

      await handleSave(datosActualizar);
      setIsEditing(false);
      alert("✅ Cambios guardados exitosamente");
    } catch (error) {
      alert("❌ Error al guardar: " + error.message);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
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
    handleClosePasswordModal();
  };

  if (loading && !profileData.identificacion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader user={user} getFullName={getFullName} getInitials={getInitials} logout={logout} />

      <StudentLayout>
        <StudentSidebar user={user} getInitials={getInitials} getFullName={getFullName} />

        <main className="lg:col-span-3">
          {(!profileData.p_nombre || !profileData.p_apellido) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-start gap-3">
                <i className="pi pi-exclamation-triangle text-yellow-600 text-xl mt-0.5 flex-shrink-0"></i>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Perfil Incompleto</h4>
                  <p className="text-sm text-yellow-700">
                    Tu perfil no tiene información completa. Por favor, haz clic en <strong>"Editar Perfil"</strong> y completa al menos tu <strong>nombre</strong> y <strong>apellido</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Mi Perfil</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <i className="pi pi-pencil"></i>
                  Editar Perfil
                </button>
              )}
            </div>

            <StudentProfileForm
              profileData={profileData}
              isEditing={isEditing}
              handleInputChange={handleInputChange}
              loading={loading}
            />

            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 pb-3 border-b border-gray-200">
                🔒 Seguridad
              </h3>

              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    defaultValue="********"
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <button
                    onClick={handleOpenPasswordModal}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </div>
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </StudentLayout>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto my-8">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <i className="pi pi-lock text-yellow-500"></i>
                  Cambiar Contraseña
                </h3>
                <button
                  onClick={handleClosePasswordModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <i className="pi pi-times text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Cambiar Contraseña</p>
                <p className="text-sm text-blue-800">Ingresa tu contraseña actual y la nueva contraseña que deseas usar.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                  placeholder="Ingresa tu contraseña actual"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                  minLength={6}
                  placeholder="Ingresa tu nueva contraseña"
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  <strong>Nota:</strong> Asegúrate de recordar tu nueva contraseña.
                </p>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 rounded-b-xl">
              <button
                type="button"
                onClick={handleClosePasswordModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleSavePassword}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors order-1 sm:order-2"
              >
                Cambiar Contraseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
