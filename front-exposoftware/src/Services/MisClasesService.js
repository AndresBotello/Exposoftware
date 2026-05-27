import { API_ENDPOINTS } from "../utils/constants";

class MisClasesService {
  constructor() {
    this.clasesCache = null;
  }

  async obtenerMisClases() {
    // Usar caché si ya fue obtenido
    if (this.clasesCache) {
      return this.clasesCache;
    }

    try {
      const response = await fetch(API_ENDPOINTS.ESTUDIANTE_MIS_CLASES, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      this.clasesCache = result.data || [];
      return this.clasesCache;
    } catch (error) {
      throw error;
    }
  }

  async obtenerDetallesDocente(idDocenteMateria) {
    try {
      const clases = await this.obtenerMisClases();

      const clase = clases.find(c => c.id_docente_materia === idDocenteMateria);

      if (!clase) {
        return null;
      }

      return {
        nombre_materia: clase.nombre_materia,
        nombre_docente: clase.nombre_docente,
        nombre_grupo: clase.nombre_grupo,
        id_docente: clase.id_docente,
        id_grupo: clase.id_grupo,
        codigo_materia: clase.codigo_materia
      };
    } catch (error) {
      throw error;
    }
  }

  limpiarCache() {
    this.clasesCache = null;
  }
}

export default new MisClasesService();
