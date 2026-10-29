import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3003";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setSessionUserId] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(Boolean(API));
  const authRevision = useRef(0);
  const authInFlight = useRef(false);
  const [authPending, setAuthPending] = useState(false);
  useEffect(() => {
    let active = true;
    const revision = authRevision.current;
    if (API) axios.get(`${API}/auth/session`).then(({ data }) => { if (active && revision === authRevision.current) setSessionUserId(data.userId ?? null); }).catch(() => {})
      .finally(() => { if (active && revision === authRevision.current) setSessionLoading(false); });
    return () => { active = false; };
  }, []);
  const setUserId = useCallback(value => {
    authRevision.current += 1;
    setSessionUserId(value);
    setSessionLoading(false);
  }, []);
  const changeAccount = useCallback(async (action, payload) => {
    if (authInFlight.current) throw new Error('An account request is already in progress.');
    authInFlight.current = true;
    setAuthPending(true);
    const revision = ++authRevision.current;
    setSessionLoading(false);
    try {
      const { data } = await axios.post(`${API}/auth/${action}`, payload);
      if (revision !== authRevision.current) return { applied: false };
      const nextUserId = action === 'logout' ? null : data.userId;
      setSessionUserId(nextUserId);
      return { applied: true, userId: nextUserId };
    } finally {
      authInFlight.current = false;
      setAuthPending(false);
    }
  }, []);
  const signIn = useCallback((username, password) => changeAccount('login', { username, password }), [changeAccount]);
  const register = useCallback((profile, password) => changeAccount('register', { ...profile, password }), [changeAccount]);
  const signOut = useCallback(() => changeAccount('logout'), [changeAccount]);
  return <AuthContext.Provider value={{ userId, setUserId, signIn, signOut, register, sessionLoading, authPending }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
