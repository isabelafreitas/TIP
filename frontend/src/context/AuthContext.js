import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('token');
        if (stored) {
          setToken(stored);
          const res = await api.get('/users/me');
          setUser(res.data.data || res.data);
        }
      } catch {
        await AsyncStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    const d = res.data.data || res.data;
    const t = d.token || res.data.token;
    const u = d.user || d;
    await AsyncStorage.setItem('token', t);
    setToken(t);
    setUser(u);
    return u;
  }

  async function register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password });
    const d = res.data.data || res.data;
    const t = d.token || res.data.token;
    const u = d.user || d;
    await AsyncStorage.setItem('token', t);
    setToken(t);
    setUser(u);
    return u;
  }

  async function logout() {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  async function updateUser(data) {
    const res = await api.patch('/users/me', data);
    const u = res.data.data || res.data;
    setUser(u);
    return u;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
