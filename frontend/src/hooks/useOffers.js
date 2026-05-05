import { useState, useEffect, useCallback } from 'react';
import * as offersApi from '../api/offers.js';
import { UnauthorizedError } from '../api/client.js';

// Centralise l'état du registre des offres + les opérations CRUD.
// `enabled` empêche tout fetch lorsqu'on est en session 'out'.
// `onUnauthorized` est invoqué dès qu'une réponse 401 est observée.
export function useOffers({ enabled, onUnauthorized, onAuthenticated }) {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [filterApply, setFilterApply] = useState('all');
  const [filterAnswer, setFilterAnswer] = useState('all');
  const [limit, setLimit] = useState(500);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await offersApi.listOffers({
        apply: filterApply,
        answer: filterAnswer,
        limit,
      });
      setOffers(data ?? []);
      onAuthenticated?.();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        onUnauthorized?.();
        return;
      }
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [filterApply, filterAnswer, limit, onAuthenticated, onUnauthorized]);

  useEffect(() => {
    if (!enabled) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [enabled, refresh]);

  const runMutation = async (operation, errorPrefix) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await operation();
      await refresh();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        onUnauthorized?.();
        return;
      }
      setErrorMessage(`${errorPrefix} : ${error.message}`);
      setIsLoading(false);
    }
  };

  const updateOffer = (id, patch) =>
    runMutation(
      () => offersApi.updateOffer(id, patch),
      'Erreur de mise à jour',
    );

  const deleteOffer = (id) =>
    runMutation(
      () => offersApi.deleteOffer(id),
      "Échec de l'opération de suppression",
    );

  const reset = useCallback(() => {
    setOffers([]);
    setErrorMessage(null);
  }, []);

  return {
    offers,
    isLoading,
    errorMessage,
    filterApply,
    filterAnswer,
    limit,
    setFilterApply,
    setFilterAnswer,
    setLimit,
    refresh,
    updateOffer,
    deleteOffer,
    reset,
  };
}
