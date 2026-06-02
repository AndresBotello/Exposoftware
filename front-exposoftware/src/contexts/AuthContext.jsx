import React, { createContext, useContext, useState, useEffect } from 'react';
import * as AuthService from '../Services/AuthService';
import * as StudentProfileService from '../Services/StudentProfileService';

// Crear el contexto de autenticación
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshIntervalRef = React.useRef(null);

  // Función para iniciar el timer de refresh automático
  const startAutoRefresh = () => {
    // Limpiar timer anterior si existe
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Refrescar token cada 20 minutos (1200 segundos)
    refreshIntervalRef.current = setInterval(async () => {
      try {
        await AuthService.refreshToken();
      } catch (error) {
        // Si refresh falla, el usuario será redirigido a login por el AuthService
      }
    }, 20 * 60 * 1000);
  };

  // Función para detener el timer
  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  // Simular carga de datos del usuario desde localStorage o API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Verificar si hay sesión activa usando AuthService
        if (AuthService.isAuthenticated()) {
          const userData = AuthService.getUserData();
          const userRole = AuthService.getUserRole();


          if (userData) {
            // 🚀 CARGAR DATOS INMEDIATAMENTE desde localStorage
            setUser(userData);
            setLoading(false); // ← Liberar el loading INMEDIATAMENTE

            // ✅ INICIAR REFRESH AUTOMÁTICO AL RECARGAR LA PÁGINA
            startAutoRefresh();

            // Si es estudiante, cargar perfil completo desde el backend en SEGUNDO PLANO
            if (userRole === 'estudiante') {

              // Esta llamada NO bloquea la UI
              StudentProfileService.obtenerMiPerfil()
                .then(resultado => {
                  if (resultado.success && resultado.data) {
                    const perfilProcesado = StudentProfileService.procesarDatosPerfil(resultado.data);
                    setUser(perfilProcesado);
                  } else {
                  }
                })
                .catch(error => {
                  console.log('✅ Manteniendo datos de localStorage (ya mostrados)');
                });
            }
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Cleanup: detener timer al desmontar
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, []);

  // Función para hacer login
  const login = async (credentials) => {
    try {
      setLoading(true);


      // Usar AuthService para hacer login
      const resultado = await AuthService.login(credentials);

      if (resultado.success && resultado.data) {
        const userRole = AuthService.getUserRole();


        // 🚀 ACTUALIZAR EL ESTADO INMEDIATAMENTE
        setUser(resultado.data);
        setLoading(false);

        // ✅ INICIAR REFRESH AUTOMÁTICO CADA 20 MINUTOS
        startAutoRefresh();

        // Si es estudiante, cargar perfil completo en SEGUNDO PLANO
        if (userRole === 'estudiante') {

          // Esta llamada NO bloquea la UI
          StudentProfileService.obtenerMiPerfil()
            .then(perfilResultado => {
              if (perfilResultado.success && perfilResultado.data) {
                const perfilProcesado = StudentProfileService.procesarDatosPerfil(perfilResultado.data);
                setUser(perfilProcesado);
                // Guardar en localStorage para próximas cargas
                localStorage.setItem('user_data', JSON.stringify(perfilProcesado));
              }
            })
            .catch(error => {
            });
        }

        return { success: true, user: resultado.data };
      }

      setLoading(false);
      return { success: false, error: 'Error en el login' };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Función para hacer login como invitado
  const loginAsGuest = async () => {
    try {
      setLoading(true);


      // Usar AuthService para hacer login como invitado
      const resultado = await AuthService.loginAsGuest();

      if (resultado.success && resultado.data) {

        // 🚀 ACTUALIZAR EL ESTADO INMEDIATAMENTE
        setUser(resultado.data);
        setLoading(false);


        return { success: true, user: resultado.data };
      }

      setLoading(false);
      return { success: false, error: 'Error en login de invitado' };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Función para hacer logout
  const logout = async () => {
    try {
      // ✅ DETENER REFRESH AUTOMÁTICO
      stopAutoRefresh();

      // Llamar al servicio de logout que cierra sesión en el backend
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      // ✅ DETENER REFRESH AUTOMÁTICO AUNQUE FALLE
      stopAutoRefresh();

      // Limpiar de todas formas aunque falle el backend
      setUser(null);
      localStorage.clear();
    }
  };

  // Función para actualizar datos del usuario
  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    // Actualizar también en localStorage usando las claves correctas del AuthService
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
  };

  // Función para recargar el perfil del usuario (útil después de actualizar datos)
  const reloadUserProfile = async () => {
    try {
      setLoading(true);
      
      const userRole = AuthService.getUserRole();
      
      if (userRole === 'estudiante') {
        const resultado = await StudentProfileService.obtenerMiPerfil();
        if (resultado.success && resultado.data) {
          const perfilProcesado = StudentProfileService.procesarDatosPerfil(resultado.data);
          setUser(perfilProcesado);
          return { success: true, data: perfilProcesado };
        }
      }
      
      return { success: false, error: 'No se pudo recargar el perfil' };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    return AuthService.getToken();
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    const userRole = AuthService.getUserRole();
    return userRole === role;
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return AuthService.isAuthenticated();
  };

  // Obtener nombre completo del usuario
  const getFullName = () => {
    if (!user) return '';
    
    // Si tiene nombre_completo del backend procesado, usarlo
    if (user.nombre_completo) {
      return user.nombre_completo;
    }
    
    // Si tiene campos separados, construir nombre completo
    if (user.primer_nombre || user.primer_apellido) {
      return `${user.primer_nombre || ''} ${user.segundo_nombre || ''} ${user.primer_apellido || ''} ${user.segundo_apellido || ''}`.trim().replace(/\s+/g, ' ');
    }
    
    // Fallback: buscar en el token de Firebase (podría tener displayName)
    const storedUser = AuthService.getUserData();
    if (storedUser?.name) {
      return storedUser.name;
    }
    
    // Último recurso: usar el correo
    return user.correo || '';
  };

  // Guardar perfil completo del invitado (para acceso desde otras páginas)
  const setGuestProfile = (perfilData) => {
    if (perfilData) {
      // Guardar en localStorage para persistencia
      localStorage.setItem('guest_profile', JSON.stringify(perfilData));
      // Actualizar el estado del usuario con los datos completos del perfil
      setUser(prev => ({ ...prev, ...perfilData }));
    }
  };

  // Obtener perfil del invitado desde localStorage
  const getGuestProfile = () => {
    const stored = localStorage.getItem('guest_profile');
    return stored ? JSON.parse(stored) : null;
  };

  // Guardar perfil completo del egresado (para acceso desde otras páginas)
  const setGraduateProfile = (perfilData) => {
    if (perfilData) {
      // Guardar en localStorage para persistencia
      localStorage.setItem('graduate_profile', JSON.stringify(perfilData));
      // Actualizar el estado del usuario con los datos completos del perfil
      setUser(prev => ({ ...prev, ...perfilData }));
    }
  };

  // Obtener perfil del egresado desde localStorage
  const getGraduateProfile = () => {
    const stored = localStorage.getItem('graduate_profile');
    return stored ? JSON.parse(stored) : null;
  };

  // Obtener iniciales del usuario
  const getInitials = () => {
    if (user?.iniciales) return user.iniciales;
    if (!user) return '';
    
    // Si tiene campos separados del backend (primer_nombre, primer_apellido)
    if (user.primer_nombre || user.primer_apellido) {
      const nombre = (user.primer_nombre || '').trim();
      const apellido = (user.primer_apellido || '').trim();
      return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    }
    
    // Si tiene nombre_completo, extraer iniciales
    if (user.nombre_completo) {
      const partes = user.nombre_completo.split(' ').filter(p => p.length > 0);
      if (partes.length >= 2) {
        return `${partes[0].charAt(0)}${partes[partes.length - 1].charAt(0)}`.toUpperCase();
      }
      if (partes.length === 1) {
        return partes[0].substring(0, 2).toUpperCase();
      }
    }
    
    // Fallback: buscar en el token de Firebase
    const storedUser = AuthService.getUserData();
    if (storedUser?.name) {
      const partes = storedUser.name.split(' ').filter(p => p.length > 0);
      if (partes.length >= 2) {
        return `${partes[0].charAt(0)}${partes[partes.length - 1].charAt(0)}`.toUpperCase();
      }
      if (partes.length === 1) {
        return partes[0].substring(0, 2).toUpperCase();
      }
    }
    
    // Último recurso: usar las primeras 2 letras del correo
    if (user.correo) {
      return user.correo.substring(0, 2).toUpperCase();
    }
    
    return '';
  };

  const value = {
    user,
    loading,
    login,
    loginAsGuest,
    logout,
    updateUser,
    reloadUserProfile,
    getAuthToken,
    hasRole,
    isAuthenticated,
    getFullName,
    getInitials,
    setGuestProfile,
    getGuestProfile,
    setGraduateProfile,
    getGraduateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
