import { createContext, useState, useContext, useEffect } from 'react';

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
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // TODO: Replace with actual API call
    try {
      // Simulated API call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          // Mock user data
          const mockUser = {
            id: '1',
            email: email,
            name: 'John Doe',
            role: email.includes('admin') ? 'admin' : email.includes('provider') ? 'provider' : 'customer',
            phone: '+1234567890',
            avatar: null
          };
          resolve(mockUser);
        }, 1000);
      });

      localStorage.setItem('washx_user', JSON.stringify(response));
      setUser(response);
      return response;
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (userData) => {
    // TODO: Replace with actual API call
    try {
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          const newUser = {
            id: Date.now().toString(),
            ...userData,
            role: userData.role || 'customer'
          };
          resolve(newUser);
        }, 1000);
      });

      localStorage.setItem('washx_user', JSON.stringify(response));
      setUser(response);
      return response;
    } catch (error) {
      throw new Error('Registration failed');
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
