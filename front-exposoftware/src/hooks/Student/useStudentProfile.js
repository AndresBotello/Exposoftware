import { useState, useEffect } from "react";
import * as StudentProfileService from "../../Services/StudentProfileService";

export function useStudentProfile(user, updateUser) {
  const [profileData, setProfileData] = useState({
    tipoDocumento: "", identificacion: "", primer_nombre: "", segundo_nombre: "", primer_apellido: "", segundo_apellido: "",
    sexo: "", identidad_sexual: "", fechaNacimiento: "", telefono: "", pais: "", nacionalidad: "",
    departamentoResidencia: "", ciudadResidencia: "", direccionResidencia: "", departamento: "", municipio: "", ciudad: "",
    correo: "", codigoPrograma: "", semestre: 0, fechaIngreso: "", anioIngreso: "", periodo: "", rol: "Estudiante"
  });
  const [loading, setLoading] = useState(false);

  const normalizeDateForInput = (raw) => {
    if (!raw) return ""; try { const d = new Date(raw); return isNaN(d) ? "" : d.toISOString().slice(0, 10); } catch (e) { return ""; }
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      setLoading(true);
      try {
        const resultado = await StudentProfileService.obtenerMiPerfil();
        if (resultado.success && resultado.data) {
          const perfilProcesado = StudentProfileService.procesarDatosPerfil(resultado.data);
          updateUser(perfilProcesado);
          setProfileData({
            tipoDocumento: perfilProcesado.tipo_documento || "", identificacion: perfilProcesado.identificacion || "",
            primer_nombre: perfilProcesado.primer_nombre || "", segundo_nombre: perfilProcesado.segundo_nombre || "",
            primer_apellido: perfilProcesado.primer_apellido || "", segundo_apellido: perfilProcesado.segundo_apellido || "",
            sexo: perfilProcesado.sexo || "", identidad_sexual: perfilProcesado.identidad_sexual || "",
            fechaNacimiento: normalizeDateForInput(perfilProcesado.fecha_nacimiento), telefono: perfilProcesado.telefono || "",
            pais: perfilProcesado.pais_residencia || "", nacionalidad: perfilProcesado.nacionalidad || "",
            departamentoResidencia: perfilProcesado.departamento || "", ciudadResidencia: perfilProcesado.ciudad_residencia || "",
            direccionResidencia: perfilProcesado.direccion_residencia || "", departamento: perfilProcesado.departamento || "",
            municipio: perfilProcesado.municipio || "", ciudad: perfilProcesado.ciudad_residencia || "",
            correo: perfilProcesado.correo || "", codigoPrograma: perfilProcesado.codigo_programa || "",
            semestre: perfilProcesado.semestre || "", fechaIngreso: normalizeDateForInput(perfilProcesado.fecha_ingreso),
            anio_ingreso: perfilProcesado.anio_ingreso || "", periodo: perfilProcesado.periodo || "", rol: perfilProcesado.rol || "Estudiante"
          });
        }
      } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
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
    } catch (error) { throw error; } finally { setLoading(false); }
  };

  return { profileData, setProfileData, loading, handleInputChange, handleSave };
}
