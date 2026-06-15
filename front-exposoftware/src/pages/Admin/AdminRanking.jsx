import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import { AdminHeader } from '../../components/Admin/AdminComponents';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { API_ENDPOINTS } from '../../utils/constants';
import * as AuthService from '../../Services/AuthService';
import EventosService from '../../Services/EventosService';

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
      setEventos(eventosData);
      if (eventosData.length > 0) {
        setEventoSeleccionado(eventosData[0]);
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

  const cargarRanking = async (idEvento, minVotos) => {
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

      setRankingConUmbral(conUmbral);
      setRankingSinUmbral(sinUmbral);
    } catch (error) {
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
      setLoading(false);
    }
  };

  const renderProyectoCard = (proyecto, index, conUmbral = true) => {
    const posicion = index + 1;
    const medalla = MEDALLAS[index] || null;
    const puntajePremio = proyecto.puntaje_premio || 0;
    const promJurado = proyecto.promedio_jurado_docente || 0;
    const promPublico = proyecto.promedio_publico_general || 0;
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

          <main className="lg:col-span-3">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <i className="pi pi-star-fill text-amber-500 text-4xl"></i>
                    Ranking de Proyectos
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Visualiza el ranking completo de TODOS los proyectos calificados por evento
                  </p>
                </div>
                <div className="text-6xl text-amber-100 hidden sm:block">
                  <i className="pi pi-crown"></i>
                </div>
              </div>

              {/* Controles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    <i className="pi pi-calendar text-amber-600 mr-2"></i>
                    Evento
                  </label>
                  <Dropdown
                    value={eventoSeleccionado}
                    onChange={(e) => setEventoSeleccionado(e.value)}
                    options={eventos}
                    optionLabel={(option) => option?.nombre_evento || option?.nombre || 'Sin nombre'}
                    placeholder="Selecciona un evento..."
                    filter
                    className="w-full"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    <i className="pi pi-check text-amber-600 mr-2"></i>
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
                    onClick={() => cargarRanking(eventoSeleccionado.id_evento || eventoSeleccionado.id, votosMinimos)}
                    loading={loading}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Información */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <i className="pi pi-info-circle mr-2"></i>
                <strong>Cálculo del puntaje:</strong> 60% del promedio de docentes + 40% del promedio del público general.
                Solo compiten proyectos con al menos {votosMinimos} votos totales.
              </div>
            </div>

            {/* Contenido Principal */}
            {loading ? (
              <div className="flex justify-center py-20">
                <ProgressSpinner style={{ width: '60px', height: '60px' }} strokeWidth="4" />
              </div>
            ) : rankingConUmbral.length === 0 && rankingSinUmbral.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200 shadow-md">
                <i className="pi pi-inbox text-gray-300 text-6xl block mb-4"></i>
                <p className="text-gray-600 text-lg">No hay proyectos calificados en este evento</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Proyectos con Umbral (PODIO) */}
                {rankingConUmbral.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="pi pi-trophy text-amber-500 text-2xl"></i>
                      Podio (Califican para Premio)
                    </h2>
                    <div className="space-y-3">
                      {rankingConUmbral.map((proyecto, index) =>
                        renderProyectoCard(proyecto, index, true)
                      )}
                    </div>
                  </div>
                )}

                {/* Proyectos sin Umbral */}
                {rankingSinUmbral.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-600 mb-4 flex items-center gap-2">
                      <i className="pi pi-info-circle text-gray-500 text-lg"></i>
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

            {/* Resumen */}
            {(rankingConUmbral.length > 0 || rankingSinUmbral.length > 0) && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-md">
                  <p className="text-sm text-gray-600">En competencia</p>
                  <p className="text-3xl font-bold text-amber-600">{rankingConUmbral.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-md">
                  <p className="text-sm text-gray-600">Sin suficientes votos</p>
                  <p className="text-3xl font-bold text-gray-600">{rankingSinUmbral.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 text-center shadow-md">
                  <p className="text-sm text-gray-600">Total de proyectos</p>
                  <p className="text-3xl font-bold text-teal-600">
                    {rankingConUmbral.length + rankingSinUmbral.length}
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
