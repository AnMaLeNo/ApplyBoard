import { useState, useEffect, useCallback } from 'react';
import * as offersApi from '../api/offers.js';
import { UnauthorizedError } from '../api/client.js';

// Centralise l'état du registre des offres + les opérations CRUD.
// `enabled` empêche tout fetch lorsqu'on est en session 'out'.
// `onUnauthorized` est invoqué dès qu'une réponse 401 est observée.
export function useOffers({ enabled, onUnauthorized, onAuthenticated }) {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const [filterApply, setFilterApply] = useState('all');
  const [filterAnswer, setFilterAnswer] = useState('all');
  const [urlInput, setUrlInput] = useState('');

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const data = await offersApi.listOffers({
        apply: filterApply,
        answer: filterAnswer,
      });
      setOffers(data ?? []);
      onAuthenticated?.();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        onUnauthorized?.();
        return;
      }
      setErrorStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [filterApply, filterAnswer, onAuthenticated, onUnauthorized]);

  useEffect(() => {
    if (!enabled) return;
    // Pattern de data-fetching standard : la cascade de setState provoquée par refresh()
    // est attendue (loading -> data). React Query / SWR seraient préférables à terme.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [enabled, refresh]);

  // Pattern commun aux mutations : exécution -> rafraîchissement -> gestion d'erreur unifiée.
  const runMutation = async (operation, errorPrefix) => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      await operation();
      await refresh();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        onUnauthorized?.();
        return;
      }
      setErrorStatus(`${errorPrefix} : ${error.message}`);
      setIsLoading(false);
    }
  };

  const submitOffer = async (e) => {
    e.preventDefault();
    const url = urlInput.trim();
    if (!url) return;
    await runMutation(async () => {
      await offersApi.createOffer(url);
      setUrlInput('');
    }, "Échec de l'insertion");
  };

  const toggleStatus = (id, field, currentValue) =>
    runMutation(
      () => offersApi.updateOffer(id, { [field]: !currentValue }),
      'Erreur de mise à jour',
    );

  const deleteOffer = (id) =>
    runMutation(
      () => offersApi.deleteOffer(id),
      "Échec de l'opération de suppression",
    );

  const reset = useCallback(() => {
    setOffers([]);
    setErrorStatus(null);
    setUrlInput('');
  }, []);

  return {
    offers,
    isLoading,
    errorStatus,
    filterApply,
    filterAnswer,
    urlInput,
    setFilterApply,
    setFilterAnswer,
    setUrlInput,
    refresh,
    submitOffer,
    toggleStatus,
    deleteOffer,
    reset,
  };
}
