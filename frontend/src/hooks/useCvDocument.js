import { useState, useEffect, useCallback, useRef } from 'react';
import * as cvDocumentApi from '../api/cvDocument.js';
import { UnauthorizedError } from '../api/client.js';

// Centralise l'état du document CV unique (un par utilisateur).
// `enabled` empêche tout fetch en session 'out' ou hors page.
// `mutate(updater)` met à jour le state localement (optimiste) puis persiste le doc complet.
export function useCvDocument({ enabled, onUnauthorized, onAuthenticated }) {
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  // Ref pour lire la valeur courante depuis un updater sans recréer mutate à chaque rendu.
  const documentRef = useRef(null);
  documentRef.current = document;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const row = await cvDocumentApi.getCvDocument();
      setDocument(row?.data ?? null);
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
  }, [onAuthenticated, onUnauthorized]);

  useEffect(() => {
    if (!enabled) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [enabled, refresh]);

  const mutate = useCallback(
    async (updater) => {
      const previous = documentRef.current;
      if (previous == null) return;
      const next = updater(previous);
      setDocument(next);
      setErrorMessage(null);
      try {
        const row = await cvDocumentApi.updateCvDocument(next);
        setDocument(row?.data ?? next);
      } catch (error) {
        setDocument(previous);
        if (error instanceof UnauthorizedError) {
          onUnauthorized?.();
          return;
        }
        setErrorMessage(`Erreur lors de la sauvegarde du CV : ${error.message}`);
      }
    },
    [onUnauthorized],
  );

  const reset = useCallback(() => {
    setDocument(null);
    setErrorMessage(null);
  }, []);

  return {
    document,
    isLoading,
    errorMessage,
    refresh,
    mutate,
    reset,
  };
}
