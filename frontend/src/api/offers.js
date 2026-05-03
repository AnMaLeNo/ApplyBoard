import { apiFetch } from './client.js';

export function listOffers({ apply, answer } = {}) {
  const params = {};
  if (apply && apply !== 'all') params.apply = apply;
  if (answer && answer !== 'all') params.answer = answer;
  return apiFetch('/offers', {
    params: Object.keys(params).length ? params : undefined,
  });
}

export const createOffer = (url) =>
  apiFetch('/offers', { method: 'POST', body: { url } });

export const updateOffer = (id, patch) =>
  apiFetch(`/offers/${id}`, { method: 'PATCH', body: patch });

export const deleteOffer = (id) =>
  apiFetch(`/offers/${id}`, { method: 'DELETE' });
