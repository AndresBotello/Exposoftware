import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as AuthService from '../../Services/AuthService';
import AdminSidebar from '../../components/Layout/AdminSidebar';
import EventReportPanel from '../../components/Admin/EventReportPanel';
import logo from '../../assets/Logo-unicesar.png';

export default function EventReports() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) {
      setUserData(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      try {
        await AuthService.logout();
        navigate('/login');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
  };

  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };

  const getUserInitials = () => getUserName().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
              >
                <i className="pi pi-sign-out"></i>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          {/* Contenido Principal */}
          <main className="lg:col-span-3">
            {/* Encabezado de página */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="pi pi-file-pdf text-green-600 text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Reportes de Eventos</h1>
                  <p className="text-gray-500 mt-1">
                    Genera reportes completos con estadísticas de asistencia, proyectos y análisis de eventos
                  </p>
                </div>
              </div>
            </div>

            {/* Panel de Generador de Reportes */}
            <EventReportPanel />

            {/* Información adicional */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Qué incluye */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="pi pi-check-circle text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Contenido del Reporte</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <i className="pi pi-check text-green-600 flex-shrink-0 mt-1"></i>
                    <span>Resumen de asistencias por rol</span>
                  </li>
                  <li className="flex gap-2">
                    <i className="pi pi-check text-green-600 flex-shrink-0 mt-1"></i>
                    <span>Total de proyectos registrados</span>
                  </li>
                  <li className="flex gap-2">
                    <i className="pi pi-check text-green-600 flex-shrink-0 mt-1"></i>
                    <span>Proyectos aprobados y calificados</span>
                  </li>
                  <li className="flex gap-2">
                    <i className="pi pi-check text-green-600 flex-shrink-0 mt-1"></i>
                    <span>Materias asociadas al evento</span>
                  </li>
                  <li className="flex gap-2">
                    <i className="pi pi-check text-green-600 flex-shrink-0 mt-1"></i>
                    <span>Estadísticas y porcentajes</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Cómo usarlo */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="pi pi-book text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Cómo Usar</h3>
                </div>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="font-semibold text-gray-900 flex-shrink-0">1.</span>
                    <span>Selecciona un evento del dropdown</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-gray-900 flex-shrink-0">2.</span>
                    <span>Carga la vista previa para ver estadísticas</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-gray-900 flex-shrink-0">3.</span>
                    <span>Haz clic en "Generar Reporte PDF"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-gray-900 flex-shrink-0">4.</span>
                    <span>El PDF se descargará automáticamente</span>
                  </li>
                </ol>
              </div>

              {/* Card 3: Características */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <i className="pi pi-palette text-amber-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Características</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <i className="pi pi-star-fill text-amber-600 flex-shrink-0 mt-1"></i>
                    <span>Diseño profesional y moderno</span>
                  </li>
                  <li className="flex gap-2">
                    <i className="pi pi-star-fill text-amber-600 flex-shrink-0 mt-1"></i>
                    <span>Tablas de datos detalladas</span>
                  </li>
                  <li className="flex gap-2">
                    <i className="pi pi-star-fill text-amber-600 flex-shrink-0 mt-1"></i>
                    <span>Paginación automática</span>
                  </li>
                  <li className="flex gap-2">
                    <i className="pi pi-star-fill text-amber-600 flex-shrink-0 mt-1"></i>
                    <span>Encabezados y pies personalizados</span>
                  </li>
                  <li className="flex gap-2">
                    <i className="pi pi-star-fill text-amber-600 flex-shrink-0 mt-1"></i>
                    <span>Descarga inmediata en PDF</span>
                  </li>
                </ul>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
