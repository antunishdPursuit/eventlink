import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3003";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    if (API) axios.get(`${API}/auth/session`).then(({ data }) => setUserId(data.userId)).catch(() => {});
  }, []);
  const signIn = useCallback(async (username, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { username, password });
    setUserId(data.userId);
  }, []);
  const signOut = useCallback(async () => {
    await axios.post(`${API}/auth/logout`);
    setUserId(null);
  }, []);
  return <AuthContext.Provider value={{ userId, setUserId, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
