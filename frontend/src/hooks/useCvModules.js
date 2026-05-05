import { useState, useEffect, useCallback } from 'react';
import * as cvModulesApi from '../api/cvModules.js';
import { UnauthorizedError } from '../api/client.js';

// Centralise l'état des modules de CV + leurs variantes.
// `enabled` empêche tout fetch lorsqu'on est en session 'out' ou hors page.
// `onUnauthorized` est invoqué dès qu'une réponse 401 est observée.
export function useCvModules({ enabled, onUnauthorized, onAuthenticated }) {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await cvModulesApi.listCvModules();
      setModules(data ?? []);
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

  const createModule = ({ kind, name }) =>
    runMutation(
      () => cvModulesApi.createCvModule({ kind, name }),
      'Erreur lors de la création du module',
    );

  const renameModule = (id, name) =>
    runMutation(
      () => cvModulesApi.updateCvModule(id, { name }),
      'Erreur lors du renommage du module',
    );

  const deleteModule = (id) =>
    runMutation(
      () => cvModulesApi.deleteCvModule(id),
      'Erreur lors de la suppression du module',
    );

  const createVariant = (moduleId, { label, content }) =>
    runMutation(
      () => cvModulesApi.createCvModuleVariant(moduleId, { label, content }),
      'Erreur lors de la création de la variante',
    );

  const updateVariant = (variantId, patch) =>
    runMutation(
      () => cvModulesApi.updateCvModuleVariant(variantId, patch),
      'Erreur lors de la mise à jour de la variante',
    );

  const deleteVariant = (variantId) =>
    runMutation(
      () => cvModulesApi.deleteCvModuleVariant(variantId),
      'Erreur lors de la suppression de la variante',
    );

  const reset = useCallback(() => {
    setModules([]);
    setErrorMessage(null);
  }, []);

  return {
    modules,
    isLoading,
    errorMessage,
    refresh,
    createModule,
    renameModule,
    deleteModule,
    createVariant,
    updateVariant,
    deleteVariant,
    reset,
  };
}
