import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../utils/constants';

// Cada cuántos ms se vuelven a pedir los tableros mientras la página está abierta.
export const INTERVALO_TABLEROS_MS = 10000;

const TABLEROS_VACIOS = { solo_jurado: [], jurado_y_publico: [] };

/**
 * Tableros del evento (top 5 por cada tablero), actualizados cada
 * INTERVALO_TABLEROS_MS. Si la petición falla, se conserva el último resultado.
 */
export function useTablerosEvento(idEvento) {
  const [tableros, setTableros] = useState(TABLEROS_VACIOS);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!idEvento) return undefined;

    let cancelado = false;
    let temporizador = null;

    const cargar = async () => {
      setCargando(true);
      try {
        const response = await fetch(API_ENDPOINTS.PUBLIC_TABLEROS_EVENTO(idEvento), {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body = await response.json();
        if (!cancelado) {
          setTableros(body.data || TABLEROS_VACIOS);
          setError(false);
        }
      } catch (err) {
        console.error('Error cargando tableros:', err);
        if (!cancelado) setError(true);
      } finally {
        if (!cancelado) {
          setCargando(false);
          temporizador = setTimeout(cargar, INTERVALO_TABLEROS_MS);
        }
      }
    };

    cargar();
    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [idEvento]);

  return { tableros, cargando, error };
}
