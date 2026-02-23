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
          token: response.data.token,
          providerId: response.data.providerId // Store providerId
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
        address: userData.address || ''
      };

      const response = await api.post('/auth/register', registerData);

      if (response.data.success) {
        const newUser = {
          ...response.data.user,
          token: response.data.token,
          providerId: response.data.providerId // Store providerId
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

  const googleLogin = async (token, userId, role) => {
    try {
      // Fetch user details with the token
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();

      if (data.success) {
        const userData = {
          ...data.data,
          id: userId,
          role: role,
          token: token
        };
        localStorage.setItem('washx_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
      } else {
        throw new Error('Failed to authenticate with Google');
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
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
    googleLogin,
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
