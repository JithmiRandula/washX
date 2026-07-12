import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { loginUser, registerUser } from '../api/authApi';

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

  const normalizeRole = (value) => {
    if (value === undefined || value === null) return undefined;
    const str = String(value).trim();
    if (!str) return undefined;
    return str.toLowerCase();
  };

  const normalizeId = (value) => {
    if (value === undefined || value === null) return undefined;
    const str = String(value);
    return str.length > 0 ? str : undefined;
  };

  const resolveProviderId = (baseUser, data, payload) => {
    return normalizeId(
      data?.providerId ??
        data?.ProviderId ??
        payload?.providerId ??
        payload?.ProviderId ??
        baseUser?.providerId ??
        baseUser?.providerID ??
        baseUser?.ProviderId ??
        baseUser?.providerProfileId ??
        baseUser?.ProviderProfileId ??
        baseUser?.provider?._id ??
        baseUser?.provider?.id ??
        baseUser?.provider?.Id ??
        baseUser?.Provider?._id ??
        baseUser?.Provider?.id ??
        baseUser?.Provider?.Id ??
        data?.provider?._id ??
        data?.provider?.id ??
        data?.provider?.Id ??
        data?.Provider?._id ??
        data?.Provider?.id ??
        data?.Provider?.Id
    );
  };

  const resolveCustomerId = (baseUser, data, payload) => {
    return normalizeId(
      data?.customerId ??
        data?.CustomerId ??
        payload?.customerId ??
        payload?.CustomerId ??
        baseUser?.customerId ??
        baseUser?.customerID ??
        baseUser?.CustomerId ??
        baseUser?.customerProfileId ??
        baseUser?.CustomerProfileId ??
        baseUser?.customer?._id ??
        baseUser?.customer?.id ??
        baseUser?.customer?.Id ??
        baseUser?.Customer?._id ??
        baseUser?.Customer?.id ??
        baseUser?.Customer?.Id ??
        data?.customer?._id ??
        data?.customer?.id ??
        data?.customer?.Id ??
        data?.Customer?._id ??
        data?.Customer?.id ??
        data?.Customer?.Id
    );
  };

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
      // If token is invalid, this will throw and trigger logout.
      // If valid, also try to enrich user with missing profile ids.
      await api.get('/auth/me');

      const stored = localStorage.getItem('washx_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if ((parsed?.role === 'customer' && !parsed?.customerId) || (parsed?.role === 'provider' && !parsed?.providerId)) {
          await enrichUserFromMe(parsed);
        }
      }
    } catch (error) {
      // Token is invalid, logout
      logout();
    }
  };

  const unwrapPayload = (payload) => {
    if (!payload) return undefined;
    if (payload.data && typeof payload.data === 'object') return payload.data;
    return payload;
  };

  const extractMeUser = (payload) => {
    const data = unwrapPayload(payload);
    return data?.user || data?.data || data;
  };

  const enrichUserFromMe = async (currentUser) => {
    try {
      const response = await api.get('/auth/me');
      const payload = response?.data;
      const data = unwrapPayload(payload);
      const meUser = extractMeUser(payload) || {};

      const resolvedProviderId = resolveProviderId(meUser, data, payload);
      const resolvedCustomerId = resolveCustomerId(meUser, data, payload);

      const enriched = {
        ...currentUser,
        ...meUser,
        role: normalizeRole(meUser?.role ?? meUser?.Role ?? currentUser?.role),
        providerId: resolvedProviderId || currentUser?.providerId,
        customerId: resolvedCustomerId || currentUser?.customerId
      };

      localStorage.setItem('washx_user', JSON.stringify(enriched));
      setUser(enriched);
      return enriched;
    } catch {
      return currentUser;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginUser({ email, password });
      const payload = response?.data;

      // Support common backend shapes:
      // 1) { success: true, user, token, providerId, customerId }
      // 2) { user, token, providerId, customerId }
      // 3) { success: true, data: { user, token, providerId, customerId } }
      const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload;
      const success = payload?.success ?? true;

      if (!success) {
        throw new Error(payload?.message || 'Login failed');
      }

      const token = data?.token || payload?.token || data?.Token || payload?.Token;
      const baseUser = data?.user || payload?.user || data || {};

      const role = normalizeRole(baseUser?.role || baseUser?.Role || data?.role || data?.Role || payload?.role || payload?.Role);
      const userIdFallback = normalizeId(
        baseUser?.id ??
          baseUser?._id ??
          baseUser?.Id ??
          baseUser?.userId ??
          baseUser?.UserId ??
          baseUser?.userID ??
          baseUser?.UserID ??
          data?.id ??
          data?._id ??
          data?.Id ??
          data?.userId ??
          data?.UserId ??
          data?.userID ??
          data?.UserID
      );
      const providerId = resolveProviderId(baseUser, data, payload);
      const customerId = resolveCustomerId(baseUser, data, payload);

      const userData = {
        ...baseUser,
        token,
        role,
        providerId: providerId || (role === 'provider' ? userIdFallback : undefined),
        customerId: customerId || (role === 'customer' ? userIdFallback : undefined)
      };
      localStorage.setItem('washx_user', JSON.stringify(userData));
      setUser(userData);

      if ((role === 'customer' && !userData.customerId) || (role === 'provider' && !userData.providerId)) {
        return await enrichUserFromMe(userData);
      }

      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
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
        address: userData.address || '',
        latitude: userData.latitude ?? null,
        longitude: userData.longitude ?? null,
      };

      const response = await registerUser(registerData);
      const payload = response?.data;

      // Support a couple of common backend shapes:
      // 1) { success: true, user, token, providerId, customerId }
      // 2) { user, token, providerId, customerId }
      // 3) { success: true, data: { user, token, providerId, customerId } }
      const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload;
      const success = payload?.success ?? true;

      if (!success) {
        throw new Error(payload?.message || 'Registration failed');
      }

      const newUser = {
        ...(data?.user || data || {}),
        token: data?.token || payload?.token || data?.Token || payload?.Token
      };

      const role = normalizeRole(
        newUser?.role || newUser?.Role || data?.role || data?.Role || payload?.role || payload?.Role || registerData.role
      );
      const userIdFallback = normalizeId(
        newUser?.id ??
          newUser?._id ??
          newUser?.Id ??
          newUser?.userId ??
          newUser?.UserId ??
          newUser?.userID ??
          newUser?.UserID ??
          data?.id ??
          data?._id ??
          data?.Id ??
          data?.userId ??
          data?.UserId ??
          data?.userID ??
          data?.UserID
      );
      const providerId = resolveProviderId(newUser, data, payload);
      const customerId = resolveCustomerId(newUser, data, payload);

      newUser.role = role;
      newUser.providerId = providerId || (role === 'provider' ? userIdFallback : undefined);
      newUser.customerId = customerId || (role === 'customer' ? userIdFallback : undefined);

      localStorage.setItem('washx_user', JSON.stringify(newUser));
      setUser(newUser);

      if ((role === 'customer' && !newUser.customerId) || (role === 'provider' && !newUser.providerId)) {
        return await enrichUserFromMe(newUser);
      }

      return newUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const googleLogin = async (token, userId, role) => {
    try {
      // Fetch user details with the token
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5218'}/api/auth/me`, {
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
