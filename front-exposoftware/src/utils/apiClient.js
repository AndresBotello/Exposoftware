import { API_BASE_URL } from './constants';
import { safeRemoveItem } from './safeStorage';

let isRefreshing = false;
let queue = [];

/**
 * Wrapper de fetch que maneja automáticamente refresh de token en caso de 401
 * Úsalo en lugar de fetch() directo para todas las llamadas a la API
 */
export const fetchApi = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const makeRequest = async () => {
    return fetch(fullUrl, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
      }
    });
  };

  let response = await makeRequest();

  // Si recibimos 401 y no es login/refresh, intentar refrescar
  if (
    response.status === 401 &&
    !url.includes('/auth/refresh') &&
    !url.includes('/auth/login')
  ) {
    if (isRefreshing) {
      // Si ya se está refrescando, esperar en cola
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then(() => makeRequest());
    }

    isRefreshing = true;
    try {
      // Intentar refrescar token
      const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (refreshResponse.ok) {
        // Refresh exitoso, reintentar request original
        queue.forEach((p) => p.resolve());
        queue = [];
        response = await makeRequest();
      } else {
        // Refresh falló, redirigir a login
        queue.forEach((p) => p.reject(new Error('Session expired')));
        queue = [];
        safeRemoveItem('auth_token');
        safeRemoveItem('user_data');
        safeRemoveItem('user_role');
        window.location.href = '/login';
      }
    } catch (error) {
      queue.forEach((p) => p.reject(error));
      queue = [];
      safeRemoveItem('auth_token');
      safeRemoveItem('user_data');
      safeRemoveItem('user_role');
      window.location.href = '/login';
    } finally {
      isRefreshing = false;
    }
  }

  // Retornar el response completo (no parsear JSON automáticamente)
  return response;
};

// Alias para compatibilidad
export const api = {
  fetch: fetchApi
};
