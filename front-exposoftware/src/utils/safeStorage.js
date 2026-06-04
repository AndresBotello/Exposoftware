/**
 * Wrapper seguro para localStorage/sessionStorage
 * Maneja excepciones en iPhones en modo privado y otros navegadores restringidos
 */

// Fallback en memoria para cuando localStorage no está disponible
const memoryStore = {};

/**
 * Obtener el tipo de almacenamiento disponible
 */
const getAvailableStorage = () => {
  try {
    const test = '__test_key__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return localStorage;
  } catch (e) {
    try {
      const test = '__test_key__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return sessionStorage;
    } catch (e) {
      return null;
    }
  }
};

let storage = getAvailableStorage();

/**
 * Obtener un valor del almacenamiento seguro
 */
export const safeGetItem = (key) => {
  try {
    if (storage) {
      return storage.getItem(key);
    }
  } catch (e) {
    // Silenciosamente ignorar errores
  }
  return memoryStore[key] || null;
};

/**
 * Guardar un valor en el almacenamiento seguro
 */
export const safeSetItem = (key, value) => {
  try {
    if (storage) {
      storage.setItem(key, value);
      return;
    }
  } catch (e) {
    // Silenciosamente ignorar errores si localStorage falla
  }
  memoryStore[key] = value;
};

/**
 * Remover un valor del almacenamiento seguro
 */
export const safeRemoveItem = (key) => {
  try {
    if (storage) {
      storage.removeItem(key);
    }
  } catch (e) {
    // Silenciosamente ignorar errores
  }
  delete memoryStore[key];
};

/**
 * Limpiar todo el almacenamiento
 */
export const safeClear = () => {
  try {
    if (storage) {
      storage.clear();
    }
  } catch (e) {
    // Silenciosamente ignorar errores
  }
  Object.keys(memoryStore).forEach(key => delete memoryStore[key]);
};

/**
 * Verificar si el almacenamiento está disponible
 */
export const isStorageAvailable = () => {
  return storage !== null;
};

/**
 * Obtener todas las claves
 */
export const safeKeys = () => {
  try {
    if (storage) {
      return Object.keys(storage);
    }
  } catch (e) {
    // Silenciosamente ignorar errores
  }
  return Object.keys(memoryStore);
};
