import { apiFetch } from './client.js';

export const listCvModules = () => apiFetch('/cv-modules');

export const getCvModule = (id) => apiFetch(`/cv-modules/${id}`);

export const createCvModule = ({ kind, name }) =>
  apiFetch('/cv-modules', { method: 'POST', body: { kind, name } });

export const updateCvModule = (id, patch) =>
  apiFetch(`/cv-modules/${id}`, { method: 'PATCH', body: patch });

export const deleteCvModule = (id) =>
  apiFetch(`/cv-modules/${id}`, { method: 'DELETE' });

export const createCvModuleVariant = (moduleId, { label, content }) =>
  apiFetch(`/cv-modules/${moduleId}/variants`, {
    method: 'POST',
    body: { label, content },
  });

export const updateCvModuleVariant = (variantId, patch) =>
  apiFetch(`/cv-module-variants/${variantId}`, { method: 'PATCH', body: patch });

export const deleteCvModuleVariant = (variantId) =>
  apiFetch(`/cv-module-variants/${variantId}`, { method: 'DELETE' });
