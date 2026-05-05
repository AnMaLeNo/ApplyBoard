import { useState, useCallback } from 'react';
import * as authApi from '../api/auth.js';

// Encapsule l'état de session : phase de résolution + mode + erreur.
// Les credentials (email/password) sont laissés à la couche UI (AuthScreen).
export function useAuth() {
  const [authState, setAuthState] = useState(null); // null = vérification, 'in' | 'out'
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState(null);

  const markAuthenticated = useCallback(() => setAuthState('in'), []);
  const markUnauthenticated = useCallback(() => setAuthState('out'), []);

  const signIn = async (credentials) => {
    setAuthError(null);
    try {
      await authApi.login(credentials);
      setAuthState('in');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const signUp = async (credentials) => {
    setAuthError(null);
    try {
      await authApi.register(credentials);
      setAuthState('in');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // En cas d'échec réseau, on bascule quand même côté client.
    }
    setAuthState('out');
  };

  return {
    authState,
    authMode,
    authError,
    setAuthMode,
    setAuthError,
    signIn,
    signUp,
    logout,
    markAuthenticated,
    markUnauthenticated,
  };
}
