import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import { AdminHeader, AdminPageHeader } from '../../components/Admin/AdminComponents';
import TableroTop5 from '../../components/Ranking/TableroTop5';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useTablerosEvento } from '../../hooks/useTablerosEvento';
import EventosService from '../../Services/EventosService';
import { elegirEventoActual, ordenarEventos, etiquetaEstadoEvento } from '../../utils/eventoActual';

export default function AdminRanking() {
  const navigate = useNavigate();
  const toast = useRef(null);
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();

  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  const idEvento = eventoSeleccionado?.id_evento || eventoSeleccionado?.id;
  const { tableros, cargando, error } = useTablerosEvento(idEvento);

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    if (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron actualizar los tableros',
        life: 4000,
      });
    }
  }, [error]);

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
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los eventos',
        life: 5000,
      });
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
              icon="pi-star-fill"
              title="Tableros del evento"
              subtitle="Top 5 de cada tablero. Se actualiza al registrarse una calificación"
            />

            {/* Controles */}
            <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <div className="flex items-end">
                  <Button
                    label="Asignar jurado y voto popular"
                    icon="pi pi-users"
                    className="w-full"
                    onClick={() => navigate('/admin/votacion-grupos')}
                  />
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                <i className="pi pi-info-circle mr-2"></i>
                <strong>Tableros:</strong> <em>Solo jurado</em> usa únicamente los votos de los docentes jurado (mínimo 2 votos por proyecto).
                <em> Jurado + voto popular</em> pondera 80 % jurado y 20 % voto popular. En ese tablero solo entran
                proyectos con al menos 6 calificaciones.
              </div>
            </div>

            {/* Tableros */}
            {(

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <TableroTop5
                  titulo="Solo jurado"
                  descripcion="Promedio únicamente de los docentes jurado. Mínimo 2 votos de jurado."
                  items={tableros.solo_jurado}
                  campoPuntaje="puntaje_solo_jurado"
                  campoVotos="votos_jurado_docente"
                  etiquetaVotos="votos de jurado"
                  cargando={cargando}
                />
                <TableroTop5
                  titulo="Jurado + voto popular"
                  descripcion="80 % jurado y 20 % voto popular. Mínimo 6 calificaciones."
                  items={tableros.jurado_y_publico}
                  campoPuntaje="puntaje_jurado_publico"
                  campoVotos="total_calificaciones"
                  etiquetaVotos="calificaciones"
                  cargando={cargando}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
