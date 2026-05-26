import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import logo from '../../assets/Logo-unicesar.png';
import * as AuthService from '../../Services/AuthService';
import EventosService from '../../Services/EventosService';
import { API_ENDPOINTS } from '../../utils/constants';
import axios from 'axios';
import ProyectosTable from './ProyectosTable';
import ProyectoDetalleDialog from './ProyectoDetalleDialog';

export default function GestionProyectos() {
  const navigate = useNavigate();
  const toast = useRef(null);
  const [userData, setUserData] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [showDetalleDialog, setShowDetalleDialog] = useState(false);
  const [nombreEvento, setNombreEvento] = useState('');
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) { setUserData(user); } else { navigate('/login'); }
  }, [navigate]);

  useEffect(() => {
    cargarProyectos();
    cargarEventos();
  }, []);

  const cargarProyectos = async () => {
    try {
      setLoading(true);
      const headers = AuthService.getAuthHeaders();
      const response = await axios.get(API_ENDPOINTS.PROYECTOS, {
        headers,
        withCredentials: true
      });
      const proyectosData = Array.isArray(response.data) ? response.data : response.data?.data || response.data?.proyectos || [];
      setProyectos(proyectosData);
      toast.current?.show({ severity: 'success', summary: 'Proyectos Cargados', detail: `${proyectosData.length} proyecto(s) encontrado(s)`, life: 3000 });
      await cargarEventos();
    } catch (error) {
      console.error('❌ Error al cargar proyectos:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos', life: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const cargarEventos = async () => {
    try {
      const eventosData = await EventosService.obtenerEventosAdmin();
      setEventos(eventosData);
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      try { await AuthService.logout(); navigate('/login'); } catch (error) { console.error('❌ Error:', error); }
    }
  };

  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };

  const getUserInitials = () => getUserName().charAt(0).toUpperCase();

  const getNombreEvento = (idEvento) => {
    if (!idEvento) return 'Sin evento asignado';
    const evento = eventos.find(e => e.id_evento === idEvento || e.id === idEvento);
    return evento ? (evento.nombre_evento || 'Evento desconocido') : `Evento no encontrado (ID: ${idEvento})`;
  };

  const verDetalles = (proyecto) => {
    setSelectedProyecto(proyecto);
    setNombreEvento(getNombreEvento(proyecto.id_evento));
    setShowDetalleDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo Unicesar" className="w-10 h-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Expo-software</h1>
                <p className="text-xs text-gray-500">Universidad Popular del Cesar</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:block">{getUserName()}</span>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">{getUserInitials()}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2">
                <i className="pi pi-sign-out"></i>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />
          <main className="lg:col-span-3">
            <ProyectosTable
              proyectos={proyectos}
              loading={loading}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              cargarProyectos={cargarProyectos}
              onVerDetalles={verDetalles}
            />
          </main>
        </div>
      </div>

      <ProyectoDetalleDialog
        showDetalleDialog={showDetalleDialog}
        setShowDetalleDialog={setShowDetalleDialog}
        selectedProyecto={selectedProyecto}
        nombreEvento={nombreEvento}
      />
    </div>
  );
}
