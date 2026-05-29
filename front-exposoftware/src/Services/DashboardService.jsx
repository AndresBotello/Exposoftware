import axios from 'axios';
import * as AuthService from './AuthService';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Servicio para obtener estadísticas del dashboard
 */
class DashboardService {
  /**
   * Obtiene el token de autenticación desde localStorage usando AuthService
   */
  static getAuthToken() {
    return AuthService.getToken();
  }

  /**
   * Configuración de headers con autenticación usando el método de AuthService
   */
  static getAuthConfig() {
    const headers = AuthService.getAuthHeaders();
    return {
      headers: headers,
      withCredentials: true // Enviar cookies para mantener sesión
    };
  }

  /**
   * Obtener total de proyectos registrados
   * GET /api/v1/proyectos
   * @returns {Promise<number>} - Total de proyectos
   */
  static async getTotalProyectos() {
    try {
      const response = await axios.get(
        API_ENDPOINTS.PROYECTOS,
        this.getAuthConfig()
      );
      
      
      // La respuesta puede ser un array directo o un objeto con data
      const proyectos = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || response.data?.proyectos || [];
      
      return proyectos.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtener total de estudiantes inscritos
   * GET /api/v1/admin/estudiantes
   * @returns {Promise<number>} - Total de estudiantes
   */
  static async getTotalEstudiantes() {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.ADMIN_ESTUDIANTES}?limit=100`,
        this.getAuthConfig()
      );

      // Si viene con paginación, usar total_items
      if (response.data?.pagination?.total_items) {
        return response.data.pagination.total_items;
      }

      // La API devuelve un array directamente
      if (Array.isArray(response.data)) {
        return response.data.length;
      }

      // Si viene en un objeto con propiedad data
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data.length;
      }

      // Si viene con propiedad estudiantes
      if (response.data?.estudiantes && Array.isArray(response.data.estudiantes)) {
        return response.data.estudiantes.length;
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtener total de docentes/profesores inscritos
   * GET /api/v1/admin/profesores
   * @returns {Promise<number>} - Total de profesores
   */
  static async getTotalProfesores() {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.ADMIN_DOCENTES}?limit=100`,
        this.getAuthConfig()
      );

      // Si viene con paginación, usar total_items
      if (response.data?.pagination?.total_items) {
        return response.data.pagination.total_items;
      }

      // La API devuelve un array directamente
      if (Array.isArray(response.data)) {
        return response.data.length;
      }

      // Si viene en un objeto con propiedad data
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data.length;
      }

      // Si viene con propiedad profesores
      if (response.data?.profesores && Array.isArray(response.data.profesores)) {
        return response.data.profesores.length;
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtener proyectos agrupados por tipo de actividad
   * @returns {Promise<Object>} - Proyectos agrupados por tipo
   */
  static async getProyectosPorTipo() {
    try {
      const response = await axios.get(
        API_ENDPOINTS.PROYECTOS,
        this.getAuthConfig()
      );

      const proyectos = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.proyectos || [];


      // Mapeo de tipo_actividad a nombres descriptivos
      const tiposActividad = {
        1: 'Exposoftware',
        2: 'Ponencia',
        3: 'Taller',
        4: 'Conferencia'
      };

      // Contar proyectos por tipo
      const conteo = proyectos.reduce((acc, proyecto) => {
        const tipo = proyecto.tipo_actividad || 1;
        const nombreTipo = tiposActividad[tipo] || `Tipo ${tipo}`;
        acc[nombreTipo] = (acc[nombreTipo] || 0) + 1;
        return acc;
      }, {});

      // Convertir a formato para la gráfica
      const labels = Object.keys(conteo);
      const valores = Object.values(conteo);


      return {
        labels,
        valores,
        total: proyectos.length,
        proyectos: proyectos.slice(0, 5) // Los 5 más recientes para mostrar en lista
      };
    } catch (error) {
      return {
        labels: [],
        valores: [],
        total: 0,
        proyectos: []
      };
    }
  }

  /**
   * Obtener proyectos agrupados por línea de investigación
   * @returns {Promise<Object>} - Proyectos agrupados por línea
   */
  static async getProyectosPorLineaInvestigacion() {
    try {
      const response = await axios.get(
        API_ENDPOINTS.PROYECTOS,
        this.getAuthConfig()
      );

      const proyectos = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.proyectos || [];

      // Contar proyectos por línea de investigación
      const conteo = proyectos.reduce((acc, proyecto) => {
        const linea = proyecto.id_linea_investigacion?.nombre ||
                     proyecto.linea_investigacion?.nombre ||
                     proyecto.nombre_linea ||
                     'Sin línea definida';
        acc[linea] = (acc[linea] || 0) + 1;
        return acc;
      }, {});

      // Convertir a formato para la gráfica
      const labels = Object.keys(conteo);
      const valores = Object.values(conteo);

      return {
        labels,
        valores,
        total: proyectos.length,
        proyectos: proyectos.slice(0, 5) // Los 5 más recientes para mostrar en lista
      };
    } catch (error) {
      return {
        labels: [],
        valores: [],
        total: 0,
        proyectos: []
      };
    }
  }

  /**
   * Obtener todas las estadísticas del dashboard en una sola llamada
   * @returns {Promise<Object>} - Objeto con todas las estadísticas
   */
  static async getEstadisticasCompletas() {
    try {
      const [totalProyectos, totalEstudiantes, totalProfesores, proyectosPorLinea] = await Promise.all([
        this.getTotalProyectos(),
        this.getTotalEstudiantes(),
        this.getTotalProfesores(),
        this.getProyectosPorLineaInvestigacion()
      ]);

      return {
        totalProyectos,
        totalEstudiantes,
        totalProfesores,
        proyectosPorLinea
      };
    } catch (error) {
      return {
        totalProyectos: 0,
        totalEstudiantes: 0,
        totalProfesores: 0,
        proyectosPorLinea: {
          labels: [],
          valores: [],
          total: 0,
          proyectos: []
        }
      };
    }
  }
}

export default DashboardService;
