import { useState } from "react";
export function useProjectForm(initialForm = {}) {
  const [form, setForm] = useState({
    titulo_proyecto: "", tipo_actividad: "", id_docente: "", id_estudiantes: [], id_grupo: "",
    codigo_materia: "", codigo_linea: "", codigo_sublinea: "", codigo_area: "", id_evento: "",
    archivoPDF: null, archivoExtra: null, ...initialForm
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.titulo_proyecto.trim()) newErrors.titulo_proyecto = "Obligatorio";
    if (!form.tipo_actividad) newErrors.tipo_actividad = "Obligatorio";
    if (!form.id_docente) newErrors.id_docente = "Obligatorio";
    if (!form.codigo_linea) newErrors.codigo_linea = "Obligatorio";
    if (!form.codigo_sublinea) newErrors.codigo_sublinea = "Obligatorio";
    if (!form.codigo_area) newErrors.codigo_area = "Obligatorio";
    if (!form.id_evento) newErrors.id_evento = "Obligatorio";
    if (!form.archivoPDF) newErrors.archivoPDF = "Obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    form, setForm,
    updateFormField: (field, value) => { setForm(p => ({ ...p, [field]: value })); if (errors[field]) setErrors(p => ({ ...p, [field]: undefined })); },
    toggleStudent: (id) => setForm(s => ({ ...s, id_estudiantes: s.id_estudiantes.includes(id) ? s.id_estudiantes.filter(x => x !== id) : [...s.id_estudiantes, id] })),
    addParticipant: (id) => { if (!id) return; setForm(s => ({ ...s, id_estudiantes: s.id_estudiantes.includes(id) ? s.id_estudiantes : [...s.id_estudiantes, id] })); },
    removeParticipant: (id) => setForm(s => ({ ...s, id_estudiantes: s.id_estudiantes.filter(x => x !== id) })),
    validateForm, errors, resetForm: () => { setForm({ titulo_proyecto: "", tipo_actividad: "", id_docente: "", id_estudiantes: [], id_grupo: "", codigo_materia: "", codigo_linea: "", codigo_sublinea: "", codigo_area: "", id_evento: "", archivoPDF: null, archivoExtra: null, ...initialForm }); setErrors({}); }
  };
}
