class CacheService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Obtener valor del caché
   * @param {string} key - Clave del caché
   * @returns {any|null} Valor cached o null si expiró
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) return null;

    // Verificar si expiró
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Guardar valor en caché
   * @param {string} key - Clave del caché
   * @param {any} value - Valor a cachear
   * @param {number} ttl - Tiempo de vida en ms (opcional)
   */
  set(key, value, ttl = this.DEFAULT_TTL) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }

  /**
   * Ejecutar función con caché - si hay una petición pendiente, esperar
   * @param {string} key - Clave del caché
   * @param {Function} fn - Función que retorna Promise
   * @param {number} ttl - Tiempo de vida en ms (opcional)
   */
  async withCache(key, fn, ttl = this.DEFAULT_TTL) {
    // Si existe en caché, devolverlo
    const cached = this.get(key);
    if (cached) {
      console.log(`📦 Cache hit para: ${key}`);
      return cached;
    }

    // Si hay una petición pendiente, esperar por ella
    if (this.pendingRequests.has(key)) {
      console.log(`⏳ Esperando petición pendiente para: ${key}`);
      return this.pendingRequests.get(key);
    }

    // Crear nueva petición
    const promise = fn()
      .then((result) => {
        this.set(key, result, ttl);
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    // Guardar petición pendiente
    this.pendingRequests.set(key, promise);

    return promise;
  }

  /**
   * Limpiar un valor del caché
   */
  clear(key) {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  /**
   * Limpiar todo el caché
   */
  clearAll() {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

export default new CacheService();
