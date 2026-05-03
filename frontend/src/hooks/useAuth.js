import { useState, useCallback } from 'react';
import * as authApi from '../api/auth.js';

// Encapsule l'état de session : phase de résolution, formulaire et transitions in/out.
export function useAuth() {
  const [authState, setAuthState] = useState(null); // null = vérification, 'in' | 'out'
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);

  const markAuthenticated = useCallback(() => setAuthState('in'), []);
  const markUnauthenticated = useCallback(() => setAuthState('out'), []);

  const submitAuth = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const fn = authMode === 'login' ? authApi.login : authApi.register;
      await fn({ email, password });
      setEmail('');
      setPassword('');
      markAuthenticated();
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // En cas d'échec réseau, on bascule quand même côté client
    }
    markUnauthenticated();
  };

  const toggleAuthMode = () => {
    setAuthMode((m) => (m === 'login' ? 'register' : 'login'));
    setAuthError(null);
  };

  return {
    authState,
    authMode,
    email,
    password,
    authError,
    setEmail,
    setPassword,
    toggleAuthMode,
    submitAuth,
    logout,
    markAuthenticated,
    markUnauthenticated,
  };
}
