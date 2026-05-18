import { getTeacherProfile } from "../Services/TeacherService";

export const resolveDocenteId = async (user) => {
  let docenteId =
    user?.id_docente || user?.user?.id_usuario || user?.id_usuario || user?.uid;

  if (!user?.id_docente && docenteId) {
    try {
      const perfilCompleto = await getTeacherProfile();
      if (perfilCompleto.id_docente) {
        docenteId = perfilCompleto.id_docente;
      } else if (perfilCompleto.docente?.id_docente) {
        docenteId = perfilCompleto.docente.id_docente;
      }
    } catch (err) {
      console.warn("⚠️ No se pudo obtener perfil completo:", err?.message);
    }
  }

  return docenteId || null;
};

export const getLineaName = (lineasMap, code) => {
  if (!code) return "No asignada";
  return lineasMap.get(code) || `Línea ${code}`;
};

export const getSublineaName = (sublineasMap, code) => {
  if (!code) return "No asignada";
  return sublineasMap.get(code) || `Sublínea ${code}`;
};

export const getAreaName = (areasMap, code) => {
  if (!code) return "No asignada";
  return areasMap.get(code) || `Área ${code}`;
};

export const getEventoName = (eventosMap, id) => {
  if (!id) return "No asignado";
  return eventosMap.get(id) || `Evento ${id}`;
};
