import { apiFetch } from './client.js';

export const getCvDocument = () => apiFetch('/cv-document');

export const updateCvDocument = (data) =>
  apiFetch('/cv-document', { method: 'PUT', body: { data } });
