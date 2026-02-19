import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

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

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('washx_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      // Verify token is still valid
      verifyToken(userData.token);
    }
    setLoading(false);
  }, []);

  const verifyToken = async (token) => {
    try {
      await api.get('/auth/me');
    } catch (error) {
      // Token is invalid, logout
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const userData = {
          ...response.data.user,
          token: response.data.token
        };
        localStorage.setItem('washx_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      // Prepare registration data
      const registerData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: userData.role || 'customer',
        address: {
          street: userData.address || '',
          city: '',
          state: '',
          zipCode: '',
          coordinates: {
            lat: userData.latitude || 0,
            lng: userData.longitude || 0
          }
        }
      };

      const response = await api.post('/auth/register', registerData);

      if (response.data.success) {
        const newUser = {
          ...response.data.user,
          token: response.data.token
        };
        localStorage.setItem('washx_user', JSON.stringify(newUser));
        setUser(newUser);
        return newUser;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('washx_user');
    setUser(null);
  };

  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    localStorage.setItem('washx_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isProvider: user?.role === 'provider',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
