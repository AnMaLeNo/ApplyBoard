import { apiFetch } from './client.js';

export function listOffers({ apply, answer, limit } = {}) {
  const params = {};
  if (apply && apply !== 'all') params.apply = apply;
  if (answer && answer !== 'all') params.answer = answer;
  if (limit) params.limit = limit;
  return apiFetch('/offers', {
    params: Object.keys(params).length ? params : undefined,
  });
}

export const listGlobalOffers = ({ limit } = {}) =>
  apiFetch('/global-offers', {
    params: limit ? { limit } : undefined,
  });

export const updateOffer = (id, patch) =>
  apiFetch(`/offers/${id}`, { method: 'PATCH', body: patch });

export const deleteOffer = (id) =>
  apiFetch(`/offers/${id}`, { method: 'DELETE' });
