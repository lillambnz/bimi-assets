import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

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

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const role = localStorage.getItem('userRole');
      let endpoint = '';

      if (role === 'patient') {
        endpoint = '/api/patients/me';
      } else if (role === 'doctor') {
        endpoint = '/api/doctors/me';
      }

      if (endpoint) {
        const res = await api.get(endpoint);
        setUser({ ...res.data.data, role });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      const endpoint = role === 'patient' ? '/api/patients/login' : '/api/doctors/login';
      const res = await api.post(endpoint, { email, password });

      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);

      setToken(token);
      setUser({ ...user, role });

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Login failed. Please try again.'
      };
    }
  };

  const register = async (formData, role) => {
    try {
      const endpoint = role === 'patient' ? '/api/patients/register' : '/api/doctors/register';
      const res = await api.post(endpoint, formData);

      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);

      setToken(token);
      setUser({ ...user, role });

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedData }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
