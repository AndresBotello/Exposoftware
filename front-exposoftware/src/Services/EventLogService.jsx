/**
 * Servicio para gestión de registros de eventos por año
 * Almacena los registros y PDFs en localStorage
 */

const STORAGE_KEY = 'event_logs';

class EventLogService {

  /**
   * Obtener todos los registros de eventos
   */
  static getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error al obtener registros:', error);
      return [];
    }
  }

  /**
   * Obtener registros filtrados por año
   */
  static getByYear(year) {
    const all = this.getAll();
    return all.filter(item => item.year === parseInt(year));
  }

  /**
   * Obtener lista de años disponibles
   */
  static getAvailableYears() {
    const all = this.getAll();
    const years = [...new Set(all.map(item => item.year))];
    return years.sort((a, b) => b - a);
  }

  /**
   * Crear un nuevo registro de evento
   * @param {Object} registro - Datos del registro
   * @param {number} registro.year - Año del evento
   * @param {string} registro.title - Título del evento
   * @param {string} registro.description - Descripción del evento
   * @param {string} registro.pdfBase64 - PDF en formato base64
   * @param {string} registro.pdfName - Nombre del archivo PDF
   */
  static create(registro) {
    try {
      const all = this.getAll();
      const newRecord = {
        id: Date.now().toString(),
        year: parseInt(registro.year),
        title: registro.title,
        description: registro.description,
        pdfBase64: registro.pdfBase64,
        pdfName: registro.pdfName,
        createdAt: new Date().toISOString(),
      };
      all.push(newRecord);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      console.log('✅ Registro creado:', newRecord.id);
      return newRecord;
    } catch (error) {
      console.error('❌ Error al crear registro:', error);
      throw error;
    }
  }

  /**
   * Eliminar un registro por ID
   */
  static delete(id) {
    try {
      const all = this.getAll();
      const filtered = all.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      console.log('🗑️ Registro eliminado:', id);
      return true;
    } catch (error) {
      console.error('❌ Error al eliminar registro:', error);
      throw error;
    }
  }

  /**
   * Convertir archivo a base64
   * @param {File} file - Archivo PDF
   * @returns {Promise<string>} base64 string
   */
  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
}

export default EventLogService;
