import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS, API_BASE_URL } from "../../utils/constants";
import RegisterProjectService from "../../Services/RegisterProjectService";
import EventosService from "../../Services/EventosService";
import { obtenerMaterias } from "../../Services/CreateGroup";
import { obtenerAsignacionesMateria } from "../../Services/CreateSubject";

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const TIPOS_ACTIVIDAD = [
  { id: 1, name: "Poster", descripcion: "Artículo en PDF", archivos: ["pdf"] },
];

export function useRegisterProject() {
  const navigate = useNavigate();
  const { user, getFullName } = useAuth();

  const [open, setOpen] = useState(true);
  const [form, setForm] = useState({
    titulo_proyecto: "",
    tipo_actividad: "",
    id_docente: "",
    id_estudiantes: [],
    id_grupo: "",
    codigo_materia: "",
    codigo_linea: "",
    codigo_sublinea: "",
    codigo_area: "",
    id_evento: "",
    archivoPDF: null,
    archivoExtra: null,
  });

  const [estudiantes, setEstudiantes] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [lineas, setLineas] = useState([]);
  const [sublineas, setSublineas] = useState([]);
  const [sublineasFiltradas, setSublineasFiltradas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [todosLosGrupos, setTodosLosGrupos] = useState([]);
  const [clasesDisponibles, setClasesDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Cerrar el modal navega hacia atrás
  useEffect(() => {
    if (!open) navigate(-1);
  }, [open, navigate]);

  // Carga inicial de catálogos
  useEffect(() => {
    const cargarCatalogos = async () => {
      setLoadingData(true);
      setError(null);

      try {

        // 1️⃣ Árbol de investigación
        const arbolInvestigacion = await RegisterProjectService.obtenerArbolInvestigacion();

        const lineasData = arbolInvestigacion.map((linea) => ({
          codigo: linea.codigo_linea,
          nombre: linea.nombre_linea,
        }));

        const sublineasData = [];
        arbolInvestigacion.forEach((linea) => {
          if (Array.isArray(linea.sublineas)) {
            linea.sublineas.forEach((sublinea) => {
              sublineasData.push({
                codigo: sublinea.codigo_sublinea,
                nombre: sublinea.nombre_sublinea,
                codigoLinea: linea.codigo_linea,
              });
            });
          }
        });

        const areasData = [];
        arbolInvestigacion.forEach((linea) => {
          linea.sublineas?.forEach((sublinea) => {
            sublinea.areas_tematicas?.forEach((area) => {
              areasData.push({
                codigo: area.codigo_area,
                nombre: area.nombre_area,
                codigoSublinea: sublinea.codigo_sublinea,
              });
            });
          });
        });

        // 2️⃣ Docentes
        const docentesData = await RegisterProjectService.obtenerDocentes();

        // 2️⃣.5️⃣ Todos los grupos (para enriquecer asignaciones)
        let todosLosGruposData = [];
        try {
          const response = await fetch(`/api/v1/admin/grupos`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
          });
          if (response.ok) {
            const result = await response.json();
            todosLosGruposData = result.data || result || [];
          }
        } catch (err) {
          todosLosGruposData = [];
        }

        // 3️⃣ Clases disponibles (materias + grupos + docentes)
        // Usa el nuevo endpoint que devuelve todo combinado
        let materiasData = [];
        let clasesDisponibles = [];
        try {

          const response = await fetch(API_ENDPOINTS.ESTUDIANTE_MIS_CLASES, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
          });

          if (response.ok) {
            const result = await response.json();
            clasesDisponibles = result.data || result || [];

            // Procesar clases para obtener materias únicas
            const materiasUnicas = {};
            clasesDisponibles.forEach(clase => {
              const codigoMateria = clase.codigo_materia || clase.materia_codigo;
              if (codigoMateria && !materiasUnicas[codigoMateria]) {
                materiasUnicas[codigoMateria] = {
                  codigo: codigoMateria,
                  nombre: clase.nombre_materia || clase.materia_nombre || codigoMateria
                };
              }
            });

            materiasData = Object.values(materiasUnicas);
          } else {
            materiasData = [];
            clasesDisponibles = [];
          }
        } catch (err) {
          materiasData = [];
          clasesDisponibles = [];
        }

        // 4️⃣ Estudiante actual
        const estudianteActual = user
          ? {
              id: user.id_usuario || user.id_estudiante,
              nombreCompleto:
                user.nombre_completo ||
                `${user.p_nombre || user.primer_nombre || ""} ${user.p_apellido || user.primer_apellido || ""}`.trim(),
              correo: user.correo,
              codigoEstudiante: user.codigo_estudiante,
              programa: user.codigo_programa,
            }
          : null;

        // Agregar el estudiante actual como participante por defecto
        let listaEstudiantes = [];
        if (estudianteActual?.id) {
          listaEstudiantes = [estudianteActual];
        }

        // 5️⃣ Eventos con inscripciones abiertas
        const eventosData = await EventosService.obtenerEventos();
        const eventosInscritos = eventosData.filter(
          (e) =>
            typeof e.estado === "string" && e.estado.toLowerCase() === "inscripciones_abiertas"
        );

        setLineas(lineasData);
        setSublineas(sublineasData);
        setAreas(areasData);
        setDocentes(docentesData);
        setMaterias(materiasData);
        setEstudiantes(listaEstudiantes);
        setEventos(eventosInscritos);
        setTodosLosGrupos(todosLosGruposData);
        setClasesDisponibles(clasesDisponibles);

        // Auto-agregar usuario actual como participante
        const userId = user?.id_usuario || user?.id_estudiante || user?.id_egresado;
        if (userId) {
          setForm((prev) => ({ ...prev, id_estudiantes: [userId] }));
        }

      } catch (err) {
        setError(err.message || "Error al cargar los datos. Por favor, intenta de nuevo.");
      } finally {
        setLoadingData(false);
      }
    };

    cargarCatalogos();
  }, [user]);

  // Filtrar sublíneas cuando cambia la línea seleccionada
  useEffect(() => {
    if (form.codigo_linea) {
      setSublineasFiltradas(
        sublineas.filter((sub) => sub.codigoLinea === parseInt(form.codigo_linea))
      );
    } else {
      setSublineasFiltradas([]);
    }
  }, [form.codigo_linea, sublineas]);

  // Cargar grupos cuando cambia la materia seleccionada
  // Usa las clases disponibles cargadas en el endpoint /api/v1/estudiantes/mis_clases_disponibles
  useEffect(() => {
    if (form.codigo_materia && clasesDisponibles.length > 0) {

      // Filtrar clases disponibles por la materia seleccionada
      const clasesDeMateria = clasesDisponibles.filter(
        (clase) => clase.codigo_materia === form.codigo_materia
      );

      const gruposFormateados = clasesDeMateria.map((clase) => ({
        id: clase.id_docente_materia,
        nombre: `Grupo ${clase.nombre_grupo || ''}`,
        codigo_grupo: clase.nombre_grupo,
        idDocente: clase.id_docente,
        nombreDocente: clase.nombre_docente || 'Sin asignar',
        id_grupo: clase.id_grupo,
        id_docente_materia: clase.id_docente_materia
      }));

      setGrupos(gruposFormateados);
    } else {
      setGrupos([]);
      setForm((prev) => ({ ...prev, id_grupo: "", id_docente: "" }));
    }
  }, [form.codigo_materia, clasesDisponibles]);

  // Auto-asignar docente del grupo seleccionado
  useEffect(() => {
    if (form.id_grupo) {
      const grupoSeleccionado = grupos.find((g) => g.id === form.id_grupo);
      if (grupoSeleccionado?.idDocente) {
        const nuevoDocente = {
          id: grupoSeleccionado.idDocente,
          nombre: grupoSeleccionado.nombreDocente || "",
          correo: "",
        };
        setDocentes((prev) => {
          const existe = prev.find((d) => d.id === nuevoDocente.id);
          return existe ? prev : [...prev, nuevoDocente];
        });
        setForm((prev) => ({ ...prev, id_docente: grupoSeleccionado.idDocente }));
      }
    } else {
      setForm((prev) => ({ ...prev, id_docente: "" }));
    }
  }, [form.id_grupo, grupos]);

  // Derivados
  const areasFiltradas = form.codigo_sublinea
    ? areas.filter((a) => a.codigoSublinea === parseInt(form.codigo_sublinea))
    : [];

  const docenteDelGrupo = form.id_grupo ? grupos.find((g) => g.id === form.id_grupo) : null;

  // Búsqueda de estudiantes
  const buscarEstudiantes = async (termino) => {
    if (!termino || termino.length < 3) {
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/usuarios/buscar?q=${encodeURIComponent(termino)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        const usuarios = result.data || result || [];
        // Mapear respuesta del backend al formato esperado
        return usuarios.map(u => ({
          id: u.id || u.id_usuario || u.id_estudiante || u.id_egresado || u._id,
          nombreCompleto: u.nombre_completo || u.name || u.correo,
          correo: u.correo || u.email,
          rol: u.rol || u.role
        }));
      } else {
        return [];
      }
    } catch (err) {
      return [];
    }
  };

  // Participantes
  const addParticipant = (idEstudiante) => {
    if (!idEstudiante) return;
    setForm((s) => ({
      ...s,
      id_estudiantes: s.id_estudiantes.includes(idEstudiante)
        ? s.id_estudiantes
        : [...s.id_estudiantes, idEstudiante],
    }));
  };

  const removeParticipant = (idEstudiante) => {
    setForm((s) => ({
      ...s,
      id_estudiantes: s.id_estudiantes.filter((x) => x !== idEstudiante),
    }));
  };

  // Envío del formulario
  const submit = async (e, estudiantesAgregadosExtra = {}) => {
    e.preventDefault();

    if (!user?.id_usuario) {
      alert("Debe estar logueado para registrar un proyecto");
      return;
    }
    if (!form.titulo_proyecto.trim()) { alert("El título del proyecto es obligatorio"); return; }
    if (!form.tipo_actividad) { alert("Debe seleccionar un tipo de actividad"); return; }
    if (!form.id_docente) { alert("Debe seleccionar un grupo para asignar el docente"); return; }
    if (!form.codigo_linea) { alert("Debe seleccionar una línea de investigación"); return; }
    if (!form.codigo_sublinea) { alert("Debe seleccionar una sublínea de investigación"); return; }
    if (!form.codigo_area) { alert("Debe seleccionar un área temática"); return; }
    if (!form.id_evento) { alert("Debe seleccionar un evento"); return; }

    // Validar que el evento esté en estado de inscripciones abiertas
    const eventoSeleccionado = eventos.find((e) => (e.id_evento || e.id || e._id) === form.id_evento);
    if (!eventoSeleccionado) {
      alert("El evento seleccionado no existe");
      return;
    }
    if (eventoSeleccionado.estado?.toLowerCase() !== "inscripciones_abiertas") {
      alert("⚠️ Las inscripciones para este evento no están abiertas. Selecciona un evento con inscripciones disponibles.");
      return;
    }

    if (!form.archivoPDF) { alert("Debe adjuntar el artículo en PDF"); return; }

    if (form.archivoPDF.size > 10 * 1024 * 1024) {
      alert(
        `El archivo PDF es demasiado grande. Máximo: 10MB. Actual: ${(form.archivoPDF.size / 1024 / 1024).toFixed(2)}MB`
      );
      return;
    }

    const tipoSeleccionado = TIPOS_ACTIVIDAD.find((t) => t.id.toString() === form.tipo_actividad);
    if (tipoSeleccionado?.archivos.length > 1 && !form.archivoExtra) {
      alert(
        `Debe adjuntar ${
          tipoSeleccionado.archivos[1] === "poster_pdf" ? "el póster en PDF" : "la imagen (PNG/JPG)"
        }`
      );
      return;
    }

    setLoading(true);
    try {
      const participantes = [...form.id_estudiantes];
      const nombresParticipantes = [];

      form.id_estudiantes.forEach((idEst) => {
        // Buscar en estudiantesAgregadosExtra (estudiantes buscados) primero, luego en estudiantes
        const estudiante = estudiantesAgregadosExtra[idEst] || estudiantes.find((e) => e.id === idEst);
        if (estudiante) {
          nombresParticipantes.push(estudiante.nombreCompleto || estudiante.correo || "");
        } else {
          nombresParticipantes.push(""); // nombre vacío si no se encuentra
        }
      });

      // Asegurar que el usuario actual esté como id_usuario (no id_estudiante)
      const idUsuarioActual = user?.id_usuario;
      if (idUsuarioActual && !participantes.includes(idUsuarioActual)) {
        participantes.push(idUsuarioActual);
        nombresParticipantes.push(getFullName() || "Usuario actual");
      }

      const docenteSeleccionado = docentes.find((d) => d.id === form.id_docente);
      const nombreDocente = docenteSeleccionado?.nombre || docenteDelGrupo?.nombreDocente || "";

      const proyectoData = {
        id_docente: form.id_docente,
        nombre_docente: nombreDocente,
        id_estudiantes: participantes,
        nombres_estudiantes: nombresParticipantes,
        id_grupo: form.id_grupo,
        codigo_area: form.codigo_area,
        id_evento: form.id_evento,
        codigo_materia: form.codigo_materia,
        codigo_linea: form.codigo_linea,
        codigo_sublinea: form.codigo_sublinea,
        titulo_proyecto: form.titulo_proyecto,
        tipo_actividad: form.tipo_actividad,
      };

      // Limpiar participantes: eliminar duplicados e IDs inválidos
      const participantesUnicos = [...new Set(participantes)];
      const participantesValidos = participantesUnicos.filter(id => id && typeof id === 'string' && id.length > 0);

      // Actualizar datos del proyecto con participantes limpios
      proyectoData.id_estudiantes = participantesValidos;
      proyectoData.nombres_estudiantes = participantesValidos.map((id, i) =>
        nombresParticipantes[participantes.indexOf(id)] || ''
      );

      await RegisterProjectService.crearProyecto(proyectoData, form.archivoPDF, form.archivoExtra, idUsuarioActual);

      alert("¡Proyecto registrado exitosamente!");
      setOpen(false);
    } catch (err) {
      alert(err.message || "Error al registrar el proyecto. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estado del modal
    open,
    setOpen,
    // Formulario
    form,
    setForm,
    // Catálogos
    tiposActividad: TIPOS_ACTIVIDAD,
    estudiantes,
    docentes,
    materias,
    grupos,
    lineas,
    sublineasFiltradas,
    eventos,
    // Derivados
    areasFiltradas,
    docenteDelGrupo,
    // Estados de UI
    loading,
    loadingData,
    error,
    // Handlers
    addParticipant,
    removeParticipant,
    buscarEstudiantes,
    submit,
  };
}
