import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [warehouseId, setWarehouseId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setRole(null);
      setWarehouseId(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/profile');
      const data = res?.data ?? res;
      setUser(data);
      setRole(data?.role ?? null);
      setWarehouseId(data?.warehouse_id ?? null);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setRole(null);
      setWarehouseId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    if (userData) {
      setUser(userData);
      setRole(userData.role ?? null);
      setWarehouseId(userData.warehouse_id ?? null);
    } else {
      loadProfile();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setRole(null);
    setWarehouseId(null);
  };

  const isManager = role === 'manager' || role === 'admin';
  const isStaff = role === 'warehouse_staff' || role === 'staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        warehouseId,
        loading,
        loadProfile,
        login,
        logout,
        isManager,
        isStaff,
        isAuthenticated: !!localStorage.getItem('token'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
