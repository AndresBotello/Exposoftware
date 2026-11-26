import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../utils/constants';

// Cada cuánto se consulta la versión del ranking (consulta liviana, solo con la
// pestaña visible). Los tableros completos solo se piden cuando la versión cambia.
export const INTERVALO_VERSION_MS = 15000;

const TABLEROS_VACIOS = { solo_jurado: [], jurado_y_publico: [] };

/**
 * Tableros del evento (top 5 por cada tablero).
 *
 * Se piden al montar y cada vez que cambia la versión del ranking, que el
 * servidor informa en /ranking/evento/{id}/version. Así no se vuelve a pedir
 * nada mientras no haya una calificación nueva o un cambio de jurado.
 */
export function useTablerosEvento(idEvento) {
  const [tableros, setTableros] = useState(TABLEROS_VACIOS);
  const [version, setVersion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  // Consulta de versión, con temporizador que solo corre con la pestaña visible.
  useEffect(() => {
    if (!idEvento) return undefined;

    let activo = true;
    let temporizador = null;

    const programar = (ms) => {
      clearTimeout(temporizador);
      temporizador = setTimeout(revisar, ms);
    };

    const revisar = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const response = await fetch(API_ENDPOINTS.PUBLIC_VERSION_RANKING_EVENTO(idEvento), {
            method: 'GET',
            credentials: 'include',
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const body = await response.json();
          if (activo) {
            setVersion((previa) => (previa === body.data?.ranking ? previa : body.data?.ranking));
          }
        } catch (err) {
          console.error('No se pudo consultar la versión del ranking:', err);
        }
      }
      if (activo) programar(INTERVALO_VERSION_MS);
    };

    const alVolverAVisible = () => {
      if (document.visibilityState === 'visible') programar(0);
    };

    programar(0);
    document.addEventListener('visibilitychange', alVolverAVisible);
    return () => {
      activo = false;
      clearTimeout(temporizador);
      document.removeEventListener('visibilitychange', alVolverAVisible);
    };
  }, [idEvento]);

  // Tableros: se piden al cambiar la versión (o al cambiar de evento).
  useEffect(() => {
    if (!idEvento || version === null) return undefined;

    let cancelado = false;
    setCargando(true);
    fetch(API_ENDPOINTS.PUBLIC_TABLEROS_EVENTO(idEvento), { method: 'GET', credentials: 'include' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((body) => {
        if (cancelado) return;
        setTableros(body.data || TABLEROS_VACIOS);
        setError(false);
      })
      .catch((err) => {
        console.error('Error cargando tableros:', err);
        if (!cancelado) setError(true);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idEvento, version]);

  return { tableros, cargando, error };
}
