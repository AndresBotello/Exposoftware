import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../utils/constants';

const SIN_TABLEROS = { solo_jurado: [], jurado_y_publico: [] };

/**
 * Ranking de varios eventos: tableros (top 5) y puntaje de cada proyecto.
 *
 * No hay temporizador: se pide al montar y cada vez que `version` cambia. La
 * versión la informa el servidor (/publicos/estado) y solo cambia con un voto
 * nuevo o una reasignación de jurado.
 *
 * Devuelve `datos` como { [id_evento]: { tableros, proyectos } }, con `proyectos`
 * indexado por id_proyecto.
 */
export function useRankingEventos(idsEventos, version) {
  const clave = idsEventos.join(',');
  const [datos, setDatos] = useState({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const ids = clave ? clave.split(',') : [];
    if (ids.length === 0) return undefined;

    let cancelado = false;

    const pedirJson = async (url) => {
      const response = await fetch(url, { method: 'GET', credentials: 'include' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    };

    setCargando(true);
    Promise.all(ids.map(async (id) => {
      const [podios, ranking] = await Promise.all([
        pedirJson(API_ENDPOINTS.PUBLIC_TABLEROS_EVENTO(id)),
        pedirJson(`${API_ENDPOINTS.PUBLIC_RANKING_EVENTO(id)}?limit=500`),
      ]);
      const proyectos = {};
      (ranking.data || []).forEach((p) => { proyectos[p.id_proyecto] = p; });
      return [id, { tableros: podios.data || SIN_TABLEROS, proyectos }];
    }))
      .then((resultados) => {
        if (cancelado) return;
        setDatos(Object.fromEntries(resultados));
        setError(false);
      })
      .catch((err) => {
        console.error('Error cargando el ranking:', err);
        if (!cancelado) setError(true);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [clave, version]);

  return { datos, cargando, error };
}
