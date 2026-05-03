import { apiFetch } from './client.js';

export const login = (credentials) =>
  apiFetch('/login', { method: 'POST', body: credentials });

export const register = (credentials) =>
  apiFetch('/register', { method: 'POST', body: credentials });

export const logout = () =>
  apiFetch('/logout', { method: 'POST' });
