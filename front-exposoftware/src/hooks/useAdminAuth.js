import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as AuthService from "../Services/AuthService";
import { confirmarCierreSesion } from "../utils/confirmDialog.jsx";

export function useAdminAuth() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) {
      setUserData(user);
    }
  }, []);

  const getUserName = () => {
    if (!userData) return 'Administrador';
    return userData.nombre || userData.nombres || userData.correo?.split('@')[0] || 'Administrador';
  };

  const getUserInitials = () => getUserName().charAt(0).toUpperCase();

  const handleLogout = async () => {
    if (await confirmarCierreSesion()) {
      try {
        await AuthService.logout();
        navigate('/login');
      } catch (error) {
        navigate('/login');
      }
    }
  };

  return { userData, getUserName, getUserInitials, handleLogout };
}
