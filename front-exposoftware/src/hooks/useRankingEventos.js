import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../utils/constants';
import { INTERVALO_TABLEROS_MS } from './useTablerosEvento';

const SIN_TABLEROS = { solo_jurado: [], jurado_y_publico: [] };

/**
 * Ranking en vivo de varios eventos a la vez.
 *
 * Para cada evento pide los dos tableros (top 5) y el ranking completo, que
 * trae el puntaje de cada proyecto. Se actualiza cada INTERVALO_TABLEROS_MS.
 * Devuelve `datos` como { [id_evento]: { tableros, proyectos } }, donde
 * `proyectos` está indexado por id_proyecto.
 */
export function useRankingEventos(idsEventos) {
  const clave = idsEventos.join(',');
  const [datos, setDatos] = useState({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const ids = clave ? clave.split(',') : [];
    if (ids.length === 0) return undefined;

    let cancelado = false;
    let temporizador = null;

    const pedirJson = async (url) => {
      const response = await fetch(url, { method: 'GET', credentials: 'include' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    };

    const cargar = async () => {
      setCargando(true);
      try {
        const resultados = await Promise.all(ids.map(async (id) => {
          const [podios, ranking] = await Promise.all([
            pedirJson(API_ENDPOINTS.PUBLIC_TABLEROS_EVENTO(id)),
            pedirJson(`${API_ENDPOINTS.PUBLIC_RANKING_EVENTO(id)}?limit=500`),
          ]);
          const proyectos = {};
          (ranking.data || []).forEach((p) => { proyectos[p.id_proyecto] = p; });
          return [id, { tableros: podios.data || SIN_TABLEROS, proyectos }];
        }));
        if (!cancelado) {
          setDatos(Object.fromEntries(resultados));
          setError(false);
        }
      } catch (err) {
        console.error('Error cargando el ranking en vivo:', err);
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
  }, [clave]);

  return { datos, cargando, error };
}
