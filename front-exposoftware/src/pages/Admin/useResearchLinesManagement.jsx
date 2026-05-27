import { useState, useEffect } from "react";
import {
  obtenerLineas,
  obtenerSublineas,
  obtenerAreas,
  obtenerTodasSublineas,
  obtenerTodasAreas,
  crearLinea,
  crearSublinea,
  crearArea,
  actualizarLinea,
  actualizarSublinea,
  actualizarArea,
  eliminarLinea,
  eliminarSublinea,
  eliminarArea,
  invalidarCache
} from "../../Services/ResearchLineService";

export function useResearchLinesManagement() {
  const [codigoLinea, setCodigoLinea] = useState("");
  const [nombreLinea, setNombreLinea] = useState("");
  const [lineas, setLineas] = useState([]);
  const [editingLineaCodigo, setEditingLineaCodigo] = useState(null);
  const [showEditLineaModal, setShowEditLineaModal] = useState(false);
  const [searchTermLinea, setSearchTermLinea] = useState("");

  const [codigoSublinea, setCodigoSublinea] = useState("");
  const [nombreSublinea, setNombreSublinea] = useState("");
  const [idLineaParaSublinea, setIdLineaParaSublinea] = useState("");
  const [sublineas, setSublineas] = useState([]);
  const [sublineasPorLinea, setSublineasPorLinea] = useState([]);
  const [editingSublineaCodigo, setEditingSublineaCodigo] = useState(null);
  const [editingSublineaLineaCodigo, setEditingSublineaLineaCodigo] = useState(null);
  const [showEditSublineaModal, setShowEditSublineaModal] = useState(false);
  const [searchTermSublinea, setSearchTermSublinea] = useState("");

  const [codigoArea, setCodigoArea] = useState("");
  const [nombreArea, setNombreArea] = useState("");
  const [idSublineaParaArea, setIdSublineaParaArea] = useState("");
  const [areas, setAreas] = useState([]);
  const [areasPorSublinea, setAreasPorSublinea] = useState([]);
  const [editingAreaCodigo, setEditingAreaCodigo] = useState(null);
  const [editingAreaSublineaCodigo, setEditingAreaSublineaCodigo] = useState(null);
  const [editingAreaLineaCodigo, setEditingAreaLineaCodigo] = useState(null);
  const [showEditAreaModal, setShowEditAreaModal] = useState(false);
  const [searchTermArea, setSearchTermArea] = useState("");

  useEffect(() => {
    cargarLineas();
  }, []);

  // Cargar sublíneas de una línea específica cuando se selecciona
  useEffect(() => {
    if (idLineaParaSublinea) {
      cargarSublineasPorLinea(parseInt(idLineaParaSublinea));
    } else {
      setSublineasPorLinea([]);
    }
  }, [idLineaParaSublinea]);

  // Cargar áreas de una sublínea específica cuando se selecciona
  useEffect(() => {
    if (idSublineaParaArea) {
      cargarAreasPorSublinea(parseInt(idSublineaParaArea));
    } else {
      setAreasPorSublinea([]);
    }
  }, [idSublineaParaArea]);

  const cargarSublineasPorLinea = async (codigoLinea) => {
    try {
      const data = await obtenerSublineas(codigoLinea);
      setSublineasPorLinea(data);
      
      // Si aún no hemos cargado TODAS las sublíneas, hacerlo solo una vez
      if (sublineas.length === 0) {
        console.log(`📥 Cargando TODAS las sublíneas (por primera vez)...`);
        const todasSublineas = await obtenerTodasSublineas();
        setSublineas(todasSublineas);
      }
    } catch (error) {
      setSublineasPorLinea([]);
    }
  };

  const cargarAreasPorSublinea = async (codigoSublinea) => {
    try {
      // Aquí necesitamos obtener las áreas de la sublínea correcta
      // Como no tenemos un endpoint específico, extraemos del árbol completo
      const todasAreas = await obtenerTodasAreas();
      const areasFiltradas = todasAreas.filter(a => a.codigo_sublinea === codigoSublinea);
      setAreasPorSublinea(areasFiltradas);
      
      // Si aún no hemos cargado TODAS las áreas, hacerlo solo una vez
      if (areas.length === 0) {
        console.log(`📥 Cargando TODAS las áreas (por primera vez)...`);
        setAreas(todasAreas);
      }
    } catch (error) {
      setAreasPorSublinea([]);
    }
  };

  const cargarLineas = async () => {
    try {
      const data = await obtenerLineas();
      setLineas(data);
      if (data.length === 0) {
      }
    } catch (error) {
      // No mostrar alerta, solo registrar el error
      setLineas([]);
    }
  };

  const cargarTodasSublineas = async () => {
    try {
      const data = await obtenerTodasSublineas();
      setSublineas(data);
    } catch (error) {
      alert("Error al cargar las sublíneas");
    }
  };

  const cargarTodasAreas = async () => {
    try {
      const data = await obtenerTodasAreas();
      setAreas(data);
    } catch (error) {
      alert("Error al cargar las áreas");
    }
  };

  const lineasFiltradas = lineas.filter((linea) =>
    linea.nombre_linea?.toLowerCase().includes(searchTermLinea.toLowerCase())
  );

  const sublineasFiltradas = sublineas.filter((sublinea) =>
    sublinea.nombre_sublinea?.toLowerCase().includes(searchTermSublinea.toLowerCase())
  );

  const areasFiltradas = areas.filter((area) =>
    area.nombre_area?.toLowerCase().includes(searchTermArea.toLowerCase())
  );

  const getLineaNombre = (codigoLinea) => {
    const linea = lineas.find((l) => l.codigo_linea === codigoLinea);
    return linea ? linea.nombre_linea : "Desconocida";
  };

  const getSublineaNombre = (codigoSublinea) => {
    const sublinea = sublineas.find((s) => s.codigo_sublinea === codigoSublinea);
    return sublinea ? sublinea.nombre_sublinea : "Desconocida";
  };

  const getSublineasPorLinea = (codigoLinea) => {
    return sublineas.filter((s) => s.codigo_linea === codigoLinea);
  };

  const handleSubmitLinea = async (e) => {
    e.preventDefault();
    if (!nombreLinea.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    if (!codigoLinea.trim()) {
      alert("El código de la línea es obligatorio");
      return;
    }
    try {
      await crearLinea({ 
        nombre_linea: nombreLinea,
        codigo_linea: parseInt(codigoLinea)
      });
      alert("Línea creada exitosamente");
      setNombreLinea("");
      setCodigoLinea("");
      // Invalidar caché y recargar
      invalidarCache();
      await cargarLineas();
      await cargarTodasSublineas();
      await cargarTodasAreas();
    } catch (error) {
      alert(error.message || "Error al crear");
    }
  };

  const handleEditLinea = (linea) => {
    setEditingLineaCodigo(linea.codigo_linea);
    setNombreLinea(linea.nombre_linea);
    setShowEditLineaModal(true);
  };

  const handleSaveEditLinea = async (e) => {
    e.preventDefault();
    if (!nombreLinea.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    try {
      await actualizarLinea(editingLineaCodigo, { nombre_linea: nombreLinea });
      alert("Línea actualizada");
      setShowEditLineaModal(false);
      setEditingLineaCodigo(null);
      setNombreLinea("");
      // Invalidar caché y recargar
      invalidarCache();
      await cargarLineas();
      await cargarTodasSublineas();
      await cargarTodasAreas();
    } catch (error) {
      alert(error.message || "Error al actualizar");
    }
  };

  const handleCancelEditLinea = () => {
    setShowEditLineaModal(false);
    setEditingLineaCodigo(null);
    setNombreLinea("");
  };

  const handleDeleteLinea = async (codigoLinea) => {
    if (!confirm("¿Eliminar línea?")) return;
    try {
      await eliminarLinea(codigoLinea);
      alert("Línea eliminada");
      // Invalidar caché y recargar
      invalidarCache();
      await cargarLineas();
      await cargarTodasSublineas();
      await cargarTodasAreas();
    } catch (error) {
      alert(error.message || "Error al eliminar");
    }
  };

  const handleSubmitSublinea = async (e) => {
    e.preventDefault();
    if (!nombreSublinea.trim() || !idLineaParaSublinea) {
      alert("Campos obligatorios");
      return;
    }
    try {
      // Convertir a número si es string
      const codigoLinea = typeof idLineaParaSublinea === 'string' ? parseInt(idLineaParaSublinea) : idLineaParaSublinea;
      await crearSublinea(codigoLinea, { nombre_sublinea: nombreSublinea });
      alert("Sublínea creada");
      setNombreSublinea("");
      setIdLineaParaSublinea("");
      // Invalidar caché y recargar
      invalidarCache();
      await cargarTodasSublineas();
      await cargarTodasAreas();
    } catch (error) {
      alert(error.message || "Error al crear");
    }
  };

  const handleEditSublinea = (sublinea) => {
    setEditingSublineaCodigo(sublinea.codigo_sublinea);
    setEditingSublineaLineaCodigo(sublinea.codigo_linea);
    setNombreSublinea(sublinea.nombre_sublinea);
    setIdLineaParaSublinea(sublinea.codigo_linea);
    setShowEditSublineaModal(true);
  };

  const handleSaveEditSublinea = async (e) => {
    e.preventDefault();
    if (!nombreSublinea.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    try {
      // Convertir a números si son strings
      const codigoLinea = typeof editingSublineaLineaCodigo === 'string' ? parseInt(editingSublineaLineaCodigo) : editingSublineaLineaCodigo;
      const codigoSublinea = typeof editingSublineaCodigo === 'string' ? parseInt(editingSublineaCodigo) : editingSublineaCodigo;
      await actualizarSublinea(codigoLinea, codigoSublinea, { nombre_sublinea: nombreSublinea });
      alert("Sublínea actualizada");
      setShowEditSublineaModal(false);
      setEditingSublineaCodigo(null);
      setEditingSublineaLineaCodigo(null);
      setNombreSublinea("");
      setIdLineaParaSublinea("");
      // Invalidar caché y recargar
      invalidarCache();
      await cargarTodasSublineas();
      await cargarTodasAreas();
    } catch (error) {
      alert(error.message || "Error al actualizar");
    }
  };

  const handleCancelEditSublinea = () => {
    setShowEditSublineaModal(false);
    setEditingSublineaCodigo(null);
    setEditingSublineaLineaCodigo(null);
    setNombreSublinea("");
    setIdLineaParaSublinea("");
  };

  const handleDeleteSublinea = async (codigoSublinea) => {
    if (!confirm("¿Eliminar sublínea?")) return;
    try {
      const sublinea = sublineas.find(s => s.codigo_sublinea === codigoSublinea);
      if (!sublinea) throw new Error("No encontrada");
      // Convertir a números si son strings
      const codigoLinea = typeof sublinea.codigo_linea === 'string' ? parseInt(sublinea.codigo_linea) : sublinea.codigo_linea;
      const codigoSub = typeof codigoSublinea === 'string' ? parseInt(codigoSublinea) : codigoSublinea;
      await eliminarSublinea(codigoLinea, codigoSub);
      alert("Sublínea eliminada");
      // Invalidar caché y recargar
      invalidarCache();
      await cargarTodasSublineas();
      await cargarTodasAreas();
    } catch (error) {
      alert(error.message || "Error al eliminar");
    }
  };

  const handleSubmitArea = async (e) => {
    e.preventDefault();
    if (!nombreArea.trim() || !idSublineaParaArea) {
      alert("Campos obligatorios");
      return;
    }
    try {
      const codigoSublinea = typeof idSublineaParaArea === 'string' ? parseInt(idSublineaParaArea) : idSublineaParaArea;
      
      // Buscar primero en sublineasPorLinea (que es lo que se mostró en el dropdown)
      let sublinea = sublineasPorLinea.find(s => s.codigo_sublinea === codigoSublinea);
      
      // Si no está en sublineasPorLinea, buscar en sublineas global
      if (!sublinea) {
        sublinea = sublineas.find(s => s.codigo_sublinea === codigoSublinea);
      }
      
      if (!sublinea) {
        console.error(`❌ Sublínea ${codigoSublinea} no encontrada en:`, {
          sublineasPorLinea: sublineasPorLinea.map(s => s.codigo_sublinea),
          sublineas: sublineas.map(s => s.codigo_sublinea)
        });
        throw new Error("Sublínea no encontrada");
      }
      
      // Convertir a números
      const codigoLinea = typeof sublinea.codigo_linea === 'string' ? parseInt(sublinea.codigo_linea) : sublinea.codigo_linea;
      await crearArea(codigoLinea, codigoSublinea, { nombre_area: nombreArea });
      alert("Área creada");
      setNombreArea("");
      setIdSublineaParaArea("");
      // Invalidar caché y recargar
      invalidarCache();
      await cargarTodasAreas();
    } catch (error) {
      alert(error.message || "Error al crear");
    }
  };

  const handleEditArea = (area) => {
    setEditingAreaCodigo(area.codigo_area);
    setEditingAreaSublineaCodigo(area.codigo_sublinea);
    setEditingAreaLineaCodigo(area.codigo_linea);
    setNombreArea(area.nombre_area);
    setIdSublineaParaArea(area.codigo_sublinea);
    setShowEditAreaModal(true);
  };

  const handleSaveEditArea = async (e) => {
    e.preventDefault();
    if (!nombreArea.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    try {
      // Convertir a números si son strings
      const codigoLinea = typeof editingAreaLineaCodigo === 'string' ? parseInt(editingAreaLineaCodigo) : editingAreaLineaCodigo;
      const codigoSublinea = typeof editingAreaSublineaCodigo === 'string' ? parseInt(editingAreaSublineaCodigo) : editingAreaSublineaCodigo;
      const codigoArea = typeof editingAreaCodigo === 'string' ? parseInt(editingAreaCodigo) : editingAreaCodigo;
      await actualizarArea(codigoLinea, codigoSublinea, codigoArea, { nombre_area: nombreArea });
      alert("Área actualizada");
      setShowEditAreaModal(false);
      setEditingAreaCodigo(null);
      setEditingAreaSublineaCodigo(null);
      setEditingAreaLineaCodigo(null);
      setNombreArea("");
      setIdSublineaParaArea("");
      // Invalidar caché y recargar
      invalidarCache();
      await cargarTodasAreas();
    } catch (error) {
      alert(error.message || "Error al actualizar");
    }
  };

  const handleCancelEditArea = () => {
    setShowEditAreaModal(false);
    setEditingAreaCodigo(null);
    setEditingAreaSublineaCodigo(null);
    setEditingAreaLineaCodigo(null);
    setNombreArea("");
    setIdSublineaParaArea("");
  };

  const handleDeleteArea = async (codigoArea) => {
    if (!confirm("¿Eliminar área?")) return;
    try {
      const area = areas.find(a => a.codigo_area === codigoArea);
      if (!area) throw new Error("No encontrada");
      // Convertir a números si son strings
      const codigoLinea = typeof area.codigo_linea === 'string' ? parseInt(area.codigo_linea) : area.codigo_linea;
      const codigoSublinea = typeof area.codigo_sublinea === 'string' ? parseInt(area.codigo_sublinea) : area.codigo_sublinea;
      const codigoAreaDelete = typeof codigoArea === 'string' ? parseInt(codigoArea) : codigoArea;
      await eliminarArea(codigoLinea, codigoSublinea, codigoAreaDelete);
      alert("Área eliminada");
      // Invalidar caché y recargar
      invalidarCache();
      await cargarTodasAreas();
    } catch (error) {
      alert(error.message || "Error al eliminar");
    }
  };

  return {
    codigoLinea, setCodigoLinea, nombreLinea, setNombreLinea, lineas, lineasFiltradas, searchTermLinea, setSearchTermLinea, showEditLineaModal,
    codigoSublinea, setCodigoSublinea, nombreSublinea, setNombreSublinea, idLineaParaSublinea, setIdLineaParaSublinea, sublineas, sublineasFiltradas, sublineasPorLinea, searchTermSublinea, setSearchTermSublinea, showEditSublineaModal,
    codigoArea, setCodigoArea, nombreArea, setNombreArea, idSublineaParaArea, setIdSublineaParaArea, areas, areasFiltradas, areasPorSublinea, searchTermArea, setSearchTermArea, showEditAreaModal,
    getLineaNombre, getSublineaNombre, getSublineasPorLinea,
    handleSubmitLinea, handleEditLinea, handleSaveEditLinea, handleCancelEditLinea, handleDeleteLinea,
    handleSubmitSublinea, handleEditSublinea, handleSaveEditSublinea, handleCancelEditSublinea, handleDeleteSublinea,
    handleSubmitArea, handleEditArea, handleSaveEditArea, handleCancelEditArea, handleDeleteArea,
  };
}