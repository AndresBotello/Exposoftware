import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import { AdminHeader, AdminPageHeader } from '../../components/Admin/AdminComponents';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { API_ENDPOINTS } from '../../utils/constants';
import * as AuthService from '../../Services/AuthService';
import EventosService from '../../Services/EventosService';
import { elegirEventoActual, ordenarEventos, etiquetaEstadoEvento } from '../../utils/eventoActual';

const MEDALLAS = ['🥇', '🥈', '🥉'];

export default function AdminRanking() {
  const navigate = useNavigate();
  const toast = useRef(null);
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();

  const [rankingConUmbral, setRankingConUmbral] = useState([]);
  const [rankingSinUmbral, setRankingSinUmbral] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [votosMinimos, setVotosMinimos] = useState(5);

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      const eventosData = await EventosService.obtenerEventosAdmin();
      const lista = Array.isArray(eventosData) ? eventosData : [];
      setEventos(ordenarEventos(lista));
      if (lista.length > 0) {
        // Antes se tomaba eventosData[0] (el primero del backend, normalmente el más antiguo)
        setEventoSeleccionado(elegirEventoActual(lista) || ordenarEventos(lista)[0]);
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los eventos',
        life: 5000
      });
    }
  };

  useEffect(() => {
    if (eventoSeleccionado) {
      cargarRanking(eventoSeleccionado.id_evento || eventoSeleccionado.id, votosMinimos);
    }
  }, [eventoSeleccionado, votosMinimos]);

  const solicitudRanking = useRef(0);

  const cargarRanking = async (idEvento, minVotos) => {
    const miSolicitud = ++solicitudRanking.current;
    setLoading(true);
    try {
      const headers = AuthService.getAuthHeaders();
      const url = new URL(`${API_ENDPOINTS.PUBLIC_RANKING_EVENTO(idEvento)}`, window.location.origin);
      url.searchParams.append('votos_minimos', minVotos);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error cargando ranking');
      }

      const data = await response.json();
      const rankingData = Array.isArray(data) ? data : (data.data || []);

      // Proyectos que cumplen umbral: ordenar por puntaje_premio de mayor a menor
      const conUmbral = rankingData
        .filter(p => p.cumple_umbral === true)
        .sort((a, b) => (b.puntaje_premio || 0) - (a.puntaje_premio || 0));

      // Proyectos sin umbral: también ordenar por votación total de mayor a menor
      const sinUmbral = rankingData
        .filter(p => p.cumple_umbral === false)
        .sort((a, b) => {
          const votosA = (a.votos_jurado_docente || 0) + (a.votos_publico_general || 0);
          const votosB = (b.votos_jurado_docente || 0) + (b.votos_publico_general || 0);
          return votosB - votosA;
        });

      // Si mientras tanto se pidió otro evento, esta respuesta ya no vale
      if (miSolicitud !== solicitudRanking.current) return;
      setRankingConUmbral(conUmbral);
      setRankingSinUmbral(sinUmbral);
    } catch (error) {
      if (miSolicitud !== solicitudRanking.current) return;
      console.error('Error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el ranking',
        life: 5000
      });
      setRankingConUmbral([]);
      setRankingSinUmbral([]);
    } finally {
      if (miSolicitud === solicitudRanking.current) setLoading(false);
    }
  };

  const COLORES_PODIO = [
    'from-amber-100 to-yellow-200 border-amber-400',
    'from-gray-100 to-slate-200 border-slate-400',
    'from-orange-100 to-amber-200 border-orange-400',
  ];

  const renderPodio = (proyecto, index) => {
    const votosTotales = (proyecto.votos_jurado_docente || 0) + (proyecto.votos_publico_general || 0);
    return (
      <div
        key={proyecto.id_proyecto || index}
        className={`rounded-xl border-2 bg-gradient-to-br ${COLORES_PODIO[index] || COLORES_PODIO[2]} p-5 text-center shadow-md`}
      >
        <div className="text-5xl">{MEDALLAS[index]}</div>
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-600">Puesto {index + 1}</p>
        <h3 className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-bold text-gray-900" title={proyecto.titulo_proyecto}>
          {proyecto.titulo_proyecto || 'Sin título'}
        </h3>
        <div className="mt-3 inline-block rounded-lg bg-white/80 px-4 py-1.5 text-xl font-extrabold text-amber-600 shadow-sm">
          {(Number(proyecto.puntaje_premio) || 0).toFixed(2)}
        </div>
        <p className="mt-2 text-xs text-gray-600">
          {proyecto.integrantes?.length || 0} integrante(s) • {votosTotales} votos
        </p>
      </div>
    );
  };

  const renderProyectoCard = (proyecto, index, conUmbral = true) => {
    const posicion = index + 1;
    const medalla = MEDALLAS[index] || null;
    const puntajePremio = Number(proyecto.puntaje_premio) || 0;
    const promJurado = Number(proyecto.promedio_jurado_docente) || 0;
    const promPublico = Number(proyecto.promedio_publico_general) || 0;
    const votosJurado = proyecto.votos_jurado_docente || 0;
    const votosPublico = proyecto.votos_publico_general || 0;
    const totalVotos = votosJurado + votosPublico;

    return (
      <div
        key={proyecto.id_proyecto || index}
        className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border-2 transition-all ${
          conUmbral
            ? posicion <= 3
              ? 'bg-white border-amber-300 shadow-md'
              : 'bg-white border-gray-200'
            : 'bg-gray-100 border-gray-300 opacity-75'
        }`}
      >
        {/* Medalla/Posición */}
        <div className="text-center min-w-16">
          {medalla ? (
            <>
              <span className="text-3xl">{medalla}</span>
              <p className="text-xs font-bold text-gray-600">#{posicion}</p>
            </>
          ) : (
            <p className="text-lg font-bold text-gray-500">#{posicion}</p>
          )}
        </div>

        {/* Info del Proyecto */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">
            {proyecto.titulo_proyecto || 'Sin título'}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {proyecto.integrantes?.length || 0} integrante(s) • {totalVotos} votos totales
          </p>
          <p className="text-xs text-gray-500 mt-2">
            <span className="font-semibold">Jurado docente:</span> {promJurado.toFixed(1)}/5.0 ({votosJurado} votos)
            <span className="mx-2">—</span>
            <span className="font-semibold">Público general:</span> {promPublico.toFixed(1)}/5.0 ({votosPublico} votos)
          </p>
        </div>

        {/* Puntaje Principal */}
        {conUmbral ? (
          <div className="text-center">
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-lg font-bold text-xl min-w-24 shadow-md">
              {puntajePremio.toFixed(2)}
            </div>
            <p className="text-xs text-gray-600 mt-1 font-semibold">PUNTAJE</p>
          </div>
        ) : (
          <div className="text-center">
            <Tag
              value="Sin umbral"
              severity="warning"
              className="text-xs"
            />
            <p className="text-xs text-gray-600 mt-1">Min. {votosMinimos} votos</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />

      <AdminHeader
        userName={getUserName()}
        userInitials={getUserInitials()}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar
            userName={getUserName()}
            userRole="Administrador"
          />

          <main className="lg:col-span-3 space-y-6">
            <AdminPageHeader
              icon="pi-star-fill"
              title="Ranking de Proyectos"
              subtitle="Ranking de los proyectos calificados, por evento"
            />

            {/* Controles */}
            <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    <i className="pi pi-calendar mr-2 text-amber-600"></i>
                    Evento
                  </label>
                  <Dropdown
                    value={eventoSeleccionado}
                    onChange={(e) => setEventoSeleccionado(e.value)}
                    options={eventos}
                    optionLabel={(option) =>
                      `${option?.nombre_evento || option?.nombre || 'Sin nombre'}${etiquetaEstadoEvento(option) ? ` · ${etiquetaEstadoEvento(option)}` : ''}`
                    }
                    placeholder="Selecciona un evento..."
                    filter
                    className="w-full"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    <i className="pi pi-check mr-2 text-amber-600"></i>
                    Votos mínimos para premio
                  </label>
                  <InputNumber
                    value={votosMinimos}
                    onValueChange={(e) => setVotosMinimos(e.value || 5)}
                    min={1}
                    max={30}
                    className="w-full"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    icon="pi pi-refresh"
                    label="Recargar"
                    onClick={() =>
                      eventoSeleccionado &&
                      cargarRanking(eventoSeleccionado.id_evento || eventoSeleccionado.id, votosMinimos)
                    }
                    loading={loading}
                    disabled={!eventoSeleccionado}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <i className="pi pi-info-circle mr-2"></i>
                <strong>Cálculo del puntaje:</strong> 60% del promedio de docentes + 40% del promedio del público general.
                Solo compiten proyectos con al menos {votosMinimos} votos totales.
              </div>
            </div>

            {/* Resumen (antes estaba al final de la página) */}
            {!loading && (rankingConUmbral.length > 0 || rankingSinUmbral.length > 0) && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: 'En competencia', valor: rankingConUmbral.length, icono: 'pi-trophy', caja: 'from-amber-50 to-amber-100 border-amber-200 text-amber-900', chip: 'from-amber-500 to-orange-500' },
                  { label: 'Sin suficientes votos', valor: rankingSinUmbral.length, icono: 'pi-info-circle', caja: 'from-gray-50 to-gray-100 border-gray-200 text-gray-800', chip: 'from-gray-400 to-gray-500' },
                  { label: 'Total de proyectos', valor: rankingConUmbral.length + rankingSinUmbral.length, icono: 'pi-briefcase', caja: 'from-teal-50 to-teal-100 border-teal-200 text-teal-900', chip: 'from-teal-500 to-cyan-600' },
                ].map((t) => (
                  <div key={t.label} className={`flex items-center justify-between rounded-xl border bg-gradient-to-br ${t.caja} p-4 shadow-sm`}>
                    <div>
                      <p className="text-xs font-medium opacity-80">{t.label}</p>
                      <p className="text-3xl font-bold">{t.valor}</p>
                    </div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${t.chip} shadow`}>
                      <i className={`pi ${t.icono} text-white`}></i>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Contenido principal */}
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg border border-gray-200 bg-white"></div>
                ))}
              </div>
            ) : rankingConUmbral.length === 0 && rankingSinUmbral.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <i className="pi pi-inbox mb-4 block text-6xl text-gray-300"></i>
                <p className="text-lg text-gray-600">No hay proyectos calificados en este evento</p>
                <p className="mt-1 text-sm text-gray-400">
                  Si el evento es nuevo, el ranking aparecerá cuando los proyectos reciban votos.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Podio: los tres primeros destacados */}
                {rankingConUmbral.length > 0 && (
                  <div>
                    <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                      <i className="pi pi-trophy text-2xl text-amber-500"></i>
                      Podio (califican para premio)
                    </h2>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                      {rankingConUmbral.slice(0, 3).map((proyecto, index) => renderPodio(proyecto, index))}
                    </div>

                    {rankingConUmbral.length > 3 && (
                      <div className="space-y-3">
                        {rankingConUmbral.slice(3).map((proyecto, index) =>
                          renderProyectoCard(proyecto, index + 3, true)
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Proyectos sin umbral */}
                {rankingSinUmbral.length > 0 && (
                  <div>
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-600">
                      <i className="pi pi-info-circle text-lg text-gray-500"></i>
                      Sin suficientes votos para premio (mínimo {votosMinimos})
                    </h2>
                    <div className="space-y-2">
                      {rankingSinUmbral.map((proyecto, index) =>
                        renderProyectoCard(proyecto, index, false)
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
