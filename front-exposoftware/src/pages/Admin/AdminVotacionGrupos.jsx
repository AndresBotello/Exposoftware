import { useState, useEffect, useRef, useMemo } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import { AdminHeader, AdminPageHeader } from '../../components/Admin/AdminComponents';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { API_ENDPOINTS } from '../../utils/constants';
import * as AuthService from '../../Services/AuthService';
import EventosService from '../../Services/EventosService';
import { elegirEventoActual, ordenarEventos, etiquetaEstadoEvento } from '../../utils/eventoActual';

const GRUPO_JURADO = 'jurado';

export default function AdminVotacionGrupos() {
  const toast = useRef(null);
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();

  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [docentes, setDocentes] = useState([]);
  // Cada docente queda en un solo grupo: jurado o voto popular.
  const [jurado, setJurado] = useState([]);
  const [votoPopular, setVotoPopular] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [original, setOriginal] = useState({ jurado: [], votoPopular: [] });

  const idEvento = eventoSeleccionado?.id_evento || eventoSeleccionado?.id;

  const opciones = useMemo(
    () => docentes.map((d) => ({ label: `${d.nombre} (${d.correo})`, value: d.id_usuario })),
    [docentes]
  );
  const todosIds = useMemo(() => docentes.map((d) => d.id_usuario), [docentes]);
  const hayCambios =
    JSON.stringify([...jurado].sort()) !== JSON.stringify([...original.jurado].sort()) ||
    JSON.stringify([...votoPopular].sort()) !== JSON.stringify([...original.votoPopular].sort());

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    if (idEvento) cargarGrupos(idEvento);
  }, [idEvento]);

  const mostrarError = (detail) =>
    toast.current?.show({ severity: 'error', summary: 'Error', detail, life: 5000 });

  const cargarEventos = async () => {
    try {
      const eventosData = await EventosService.obtenerEventosAdmin();
      const lista = Array.isArray(eventosData) ? eventosData : [];
      setEventos(ordenarEventos(lista));
      if (lista.length > 0) {
        setEventoSeleccionado(elegirEventoActual(lista) || ordenarEventos(lista)[0]);
      }
    } catch (err) {
      console.error('Error cargando eventos:', err);
      mostrarError('No se pudieron cargar los eventos');
    }
  };

  const aplicarGrupos = (listaDocentes) => {
    const ids = listaDocentes.map((d) => d.id_usuario);
    const jur = listaDocentes.filter((d) => d.grupo === GRUPO_JURADO).map((d) => d.id_usuario);
    const pop = ids.filter((id) => !jur.includes(id));
    setDocentes(listaDocentes);
    setJurado(jur);
    setVotoPopular(pop);
    setOriginal({ jurado: jur, votoPopular: pop });
  };

  const cargarGrupos = async (id) => {
    setCargando(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTO_VOTACION_GRUPOS(id), {
        method: 'GET',
        headers: AuthService.getAuthHeaders(),
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      aplicarGrupos(body.data?.docentes || []);
    } catch (err) {
      console.error('Error cargando grupos de votación:', err);
      mostrarError('No se pudieron cargar los docentes del evento');
    } finally {
      setCargando(false);
    }
  };

  // Mantener la partición: lo que sale de un grupo entra al otro.
  const cambiarJurado = (valores) => {
    setJurado(valores);
    setVotoPopular(todosIds.filter((id) => !valores.includes(id)));
  };

  const cambiarVotoPopular = (valores) => {
    setVotoPopular(valores);
    setJurado(todosIds.filter((id) => !valores.includes(id)));
  };

  const guardar = async () => {
    if (!idEvento) return;
    setGuardando(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_EVENTO_VOTACION_GRUPOS(idEvento), {
        method: 'PUT',
        headers: { ...AuthService.getAuthHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ jurado, voto_popular: votoPopular }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.message || body.detail || `HTTP ${response.status}`);
      }
      aplicarGrupos(body.data?.docentes || []);
      toast.current?.show({
        severity: 'success',
        summary: 'Guardado',
        detail: 'Los grupos de votación quedaron actualizados. Los tableros se actualizan en vivo.',
        life: 4000,
      });
    } catch (err) {
      console.error('Error guardando grupos de votación:', err);
      mostrarError(err.message || 'No se pudieron guardar los grupos');
    } finally {
      setGuardando(false);
    }
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
              icon="pi-users"
              title="Jurado y voto popular"
              subtitle="Elige qué docentes califican como jurado y cuáles como voto popular"
            />

            <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm space-y-5">
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

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <i className="pi pi-info-circle mr-2"></i>
                Cada docente queda en un solo grupo. Estudiantes, egresados e invitados siempre
                votan como voto popular, así que no aparecen aquí.
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    <i className="pi pi-star-fill mr-2 text-amber-600"></i>
                    Jurado ({jurado.length})
                  </label>
                  <MultiSelect
                    value={jurado}
                    options={opciones}
                    onChange={(e) => cambiarJurado(e.value)}
                    optionValue="value"
                    placeholder="Selecciona los docentes jurado"
                    filter
                    className="w-full"
                    disabled={!idEvento || cargando}
                    emptyFilterMessage="Sin resultados"
                    emptyMessage="No hay docentes activos"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    <i className="pi pi-users mr-2 text-amber-600"></i>
                    Voto popular ({votoPopular.length})
                  </label>
                  <MultiSelect
                    value={votoPopular}
                    options={opciones}
                    onChange={(e) => cambiarVotoPopular(e.value)}
                    optionValue="value"
                    placeholder="Selecciona los docentes de voto popular"
                    filter
                    className="w-full"
                    disabled={!idEvento || cargando}
                    emptyFilterMessage="Sin resultados"
                    emptyMessage="No hay docentes activos"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <span className="mr-auto text-sm text-gray-500">
                  {hayCambios ? 'Hay cambios sin guardar' : 'Sin cambios pendientes'}
                </span>
                <Button
                  label="Descartar"
                  icon="pi pi-undo"
                  severity="secondary"
                  outlined
                  disabled={!hayCambios || guardando}
                  onClick={() => {
                    setJurado(original.jurado);
                    setVotoPopular(original.votoPopular);
                  }}
                />
                <Button
                  label="Guardar"
                  icon="pi pi-save"
                  loading={guardando}
                  disabled={!hayCambios || !idEvento}
                  onClick={guardar}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
