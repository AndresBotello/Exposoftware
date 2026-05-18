import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo-unicesar.png';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import * as AuthService from '../../Services/AuthService';
import * as FacultadService from '../../Services/CreateFaculty';
import * as ProgramasService from '../../Services/CreateProgram';
import ProgramsListSection from './ProgramsListSection';

function CreatePrograms() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [facultadSeleccionada, setFacultadSeleccionada] = useState('');
  const [codigoPrograma, setCodigoPrograma] = useState('');
  const [nombrePrograma, setNombrePrograma] = useState('');
  const [facultades, setFacultades] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loadingFacultades, setLoadingFacultades] = useState(false);
  const [loadingProgramas, setLoadingProgramas] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [programaEditandoId, setProgramaEditandoId] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) setUserData(user);
  }, []);

  useEffect(() => { cargarFacultades(); }, []);

  useEffect(() => {
    if (facultadSeleccionada) { cargarProgramas(facultadSeleccionada); }
    else { setProgramas([]); setSearchTerm(''); }
  }, [facultadSeleccionada]);

  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };
  const getUserInitials = () => getUserName().charAt(0).toUpperCase();

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      try { await AuthService.logout(); navigate('/login'); } catch (error) { console.error('❌ Error al cerrar sesión:', error); }
    }
  };

  const cargarFacultades = async () => {
    setLoadingFacultades(true);
    setError('');
    try {
      const datos = await FacultadService.obtenerFacultades();
      setFacultades(datos);
    } catch (err) {
      setError('Error al cargar facultades: ' + err.message);
    } finally {
      setLoadingFacultades(false);
    }
  };

  const cargarProgramas = async (facultadId) => {
    setLoadingProgramas(true);
    setError('');
    try {
      const datos = await ProgramasService.obtenerProgramasPorFacultad(facultadId);
      setProgramas(datos);
    } catch (err) {
      setError('Error al cargar programas: ' + err.message);
    } finally {
      setLoadingProgramas(false);
    }
  };

  const handleCrearPrograma = async (e) => {
    e.preventDefault();
    if (!facultadSeleccionada) { setError('Por favor selecciona una facultad'); return; }
    if (!codigoPrograma.trim()) { setError('El código del programa es requerido'); return; }
    if (!nombrePrograma.trim()) { setError('El nombre del programa es requerido'); return; }
    if (!/^[A-Z0-9_]{3,15}$/.test(codigoPrograma.toUpperCase())) {
      setError('Código Programa: debe tener 3-15 caracteres y solo contener A-Z, 0-9, _');
      return;
    }
    if (nombrePrograma.length > 40) { setError('Nombre Programa: debe tener máximo 40 caracteres'); return; }

    setCargando(true);
    setError('');
    setSuccess('');
    try {
      await ProgramasService.crearPrograma({
        codigo_programa: codigoPrograma.toUpperCase().trim(),
        id_facultad: facultadSeleccionada,
        nombre_programa: nombrePrograma.trim()
      });
      setSuccess('✅ Programa creado exitosamente');
      setCodigoPrograma('');
      setNombrePrograma('');
      await cargarProgramas(facultadSeleccionada);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al crear programa: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEditarPrograma = (programa) => {
    setProgramaEditandoId(programa.codigo_programa);
    setNombreEditado(programa.nombre_programa);
    setShowEditModal(true);
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!nombreEditado.trim()) { setError('El nombre del programa no puede estar vacío'); return; }
    if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]{1,40}$/.test(nombreEditado)) {
      setError('Nombre Programa: debe tener máximo 40 caracteres y solo contener letras y espacios');
      return;
    }
    setCargando(true);
    setError('');
    try {
      await ProgramasService.actualizarPrograma(facultadSeleccionada, programaEditandoId, { nombre_programa: nombreEditado.trim() });
      setSuccess('✅ Programa actualizado exitosamente');
      setShowEditModal(false);
      setProgramaEditandoId(null);
      setNombreEditado('');
      await cargarProgramas(facultadSeleccionada);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al actualizar programa: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleCancelarEdicion = () => {
    setShowEditModal(false);
    setProgramaEditandoId(null);
    setNombreEditado('');
    setError('');
  };

  const handleEliminarPrograma = async (programa) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar el programa "${programa.nombre_programa}"?`)) return;
    setCargando(true);
    setError('');
    try {
      await ProgramasService.eliminarPrograma(facultadSeleccionada, programa.codigo_programa);
      setSuccess('✅ Programa eliminado exitosamente');
      await cargarProgramas(facultadSeleccionada);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar programa: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  const programasFiltrados = programas.filter(programa =>
    programa.nombre_programa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    programa.codigo_programa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Nuevo Programa</h2>
                <p className="text-sm text-gray-600">Agrega nuevos programas académicos a las facultades.</p>
              </div>

              {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}

              <form onSubmit={handleCrearPrograma} className="space-y-6 max-w-2xl">
                <div>
                  <label htmlFor="facultad" className="block text-sm font-medium text-gray-700 mb-2">
                    Facultad <span className="text-red-500">*</span>
                  </label>
                  <select id="facultad" value={facultadSeleccionada} onChange={(e) => setFacultadSeleccionada(e.target.value)}
                    disabled={loadingFacultades || cargando}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-100"
                  >
                    <option value="">{loadingFacultades ? 'Cargando facultades...' : 'Selecciona una facultad'}</option>
                    {facultades.map((facultad) => (
                      <option key={facultad.id_facultad} value={facultad.id_facultad}>
                        {facultad.nombre_facultad} ({facultad.id_facultad})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">
                      Código del Programa <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="codigo" value={codigoPrograma}
                      onChange={(e) => setCodigoPrograma(e.target.value.toUpperCase())}
                      placeholder="Ej: ING_SIS" maxLength="10"
                      disabled={!facultadSeleccionada || cargando}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all uppercase disabled:bg-gray-100"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">3-15 caracteres: A-Z, 0-9, _</p>
                  </div>
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Programa <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="nombre" value={nombrePrograma}
                      onChange={(e) => setNombrePrograma(e.target.value)}
                      placeholder="Ej: Ingeniería de Sistemas" maxLength="40"
                      disabled={!facultadSeleccionada || cargando}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-100"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Máximo 40 caracteres: letras y espacios</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={!facultadSeleccionada || cargando}
                    className={`w-full px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-md ${cargando || !facultadSeleccionada ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'}`}
                  >
                    {cargando ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Creando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <i className="pi pi-plus"></i>Crear Programa
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <ProgramsListSection
              facultadSeleccionada={facultadSeleccionada}
              loadingProgramas={loadingProgramas}
              programasFiltrados={programasFiltrados}
              programas={programas}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              cargando={cargando}
              handleEditarPrograma={handleEditarPrograma}
              handleEliminarPrograma={handleEliminarPrograma}
              showEditModal={showEditModal}
              nombreEditado={nombreEditado}
              setNombreEditado={setNombreEditado}
              error={error}
              handleGuardarEdicion={handleGuardarEdicion}
              handleCancelarEdicion={handleCancelarEdicion}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default CreatePrograms;
