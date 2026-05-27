import { API_ENDPOINTS } from "../utils/constants";

class InvestigacionService {
  constructor() {
    this.arbolCache = null;
  }

  async obtenerArbolCompleto() {
    // Usar caché si ya fue obtenido
    if (this.arbolCache) {
      return this.arbolCache;
    }

    try {
      const response = await fetch(API_ENDPOINTS.PUBLIC_ARBOL_COMPLETO_INVESTIGACION, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      this.arbolCache = result.data || [];
      return this.arbolCache;
    } catch (error) {
      throw error;
    }
  }

  async obtenerNombresInvestigacion(codigoLinea, codigoSublinea = null, codigoArea = null) {
    try {
      const arbol = await this.obtenerArbolCompleto();
      const result = {
        linea: null,
        sublinea: null,
        area: null
      };

      // Buscar la línea
      const lineaEncontrada = arbol.find(l => l.codigo_linea === codigoLinea);
      if (!lineaEncontrada) {
        return result;
      }

      result.linea = lineaEncontrada.nombre_linea;

      // Buscar la sublínea si se proporciona código
      if (codigoSublinea && lineaEncontrada.sublineas) {
        const sublineaEncontrada = lineaEncontrada.sublineas.find(
          s => s.codigo_sublinea === codigoSublinea
        );

        if (sublineaEncontrada) {
          result.sublinea = sublineaEncontrada.nombre_sublinea;

          // Buscar el área si se proporciona código
          if (codigoArea && sublineaEncontrada.areas_tematicas) {
            const areaEncontrada = sublineaEncontrada.areas_tematicas.find(
              a => a.codigo_area === codigoArea
            );

            if (areaEncontrada) {
              result.area = areaEncontrada.nombre_area;
            }
          }
        }
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  limpiarCache() {
    this.arbolCache = null;
  }
}

export default new InvestigacionService();
