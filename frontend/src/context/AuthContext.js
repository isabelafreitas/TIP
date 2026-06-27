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
          setUser(res.data);
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
    const { token: t, user: u } = res.data;
    await AsyncStorage.setItem('token', t);
    setToken(t);
    setUser(u);
    return u;
  }

  async function register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: t, user: u } = res.data;
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
    setUser(res.data);
    return res.data;
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
