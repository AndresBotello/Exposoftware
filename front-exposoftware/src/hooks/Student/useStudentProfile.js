import { useState, useEffect } from "react";
import * as StudentProfileService from "../../Services/StudentProfileService";

export function useStudentProfile(user, updateUser) {
  const [profileData, setProfileData] = useState({
    identificacion: "",
    p_nombre: "",
    p_apellido: "",
    correo: "",
    telefono: "",
    codigoPrograma: "",
    semestre: 0,
    rol: "Estudiante"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarPerfil = async () => {
      setLoading(true);
      try {
        const resultado = await StudentProfileService.obtenerMiPerfil();
        if (resultado.success && resultado.data) {
          const perfilProcesado = StudentProfileService.procesarDatosPerfil(resultado.data);
          updateUser(perfilProcesado);
          setProfileData({
            identificacion: perfilProcesado.identificacion || "",
            p_nombre: perfilProcesado.primer_nombre || "",
            p_apellido: perfilProcesado.primer_apellido || "",
            correo: perfilProcesado.correo || "",
            telefono: perfilProcesado.telefono || "",
            codigoPrograma: perfilProcesado.codigo_programa || "",
            semestre: perfilProcesado.semestre || 0,
            rol: perfilProcesado.rol || "Estudiante"
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarPerfil();
  }, []);

  const handleInputChange = (field, value) => setProfileData(prev => ({ ...prev, [field]: value }));

  const handleSave = async (datosActualizar) => {
    setLoading(true);
    try {
      const resultado = await StudentProfileService.actualizarMiPerfil(datosActualizar);
      if (resultado.success && resultado.data) {
        const perfilProcesado = StudentProfileService.procesarDatosPerfil(resultado.data);
        updateUser(perfilProcesado);
      }
      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { profileData, setProfileData, loading, handleInputChange, handleSave };
}

