import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Verificar token al cargar la aplicación
  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.validateToken();
      if (response.success) {
        setUser(response.data.user);
        setToken(savedToken);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error validating token:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, remember = false) => {
    try {
      const response = await authAPI.login(username, password);
      
      if (response.success) {
        const { token: newToken, user: userData } = response.data;
        
        // Guardar token
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        
        // Manejar "recordar usuario"
        if (remember) {
          localStorage.setItem('rememberedUser', username);
        } else {
          localStorage.removeItem('rememberedUser');
        }
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return user !== null && token !== null;
  };

  const isAdmin = () => {
    return user && user.es_admin === true;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    validateToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};