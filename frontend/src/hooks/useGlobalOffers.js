import { useState, useEffect, useCallback } from 'react';
import * as offersApi from '../api/offers.js';
import { UnauthorizedError } from '../api/client.js';

export function useGlobalOffers({ enabled, onUnauthorized, onAuthenticated }) {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [limit, setLimit] = useState(50);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await offersApi.listGlobalOffers({ limit });
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
  }, [limit, onAuthenticated, onUnauthorized]);

  useEffect(() => {
    if (!enabled) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [enabled, refresh]);

  const reset = useCallback(() => {
    setOffers([]);
    setErrorMessage(null);
  }, []);

  return {
    offers,
    isLoading,
    errorMessage,
    limit,
    setLimit,
    refresh,
    reset,
  };
}
