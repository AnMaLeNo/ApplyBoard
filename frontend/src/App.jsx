import React, { useState, useEffect } from 'react';
import { ExternalLink, Plus, CheckCircle2, Circle, AlertCircle, RefreshCw } from 'lucide-react';

// Configuration de l'endpoint cible. 
// À modifier selon l'exposition des ports du conteneur Docker hébergeant l'API.
const API_BASE_URL = '/api';

export default function App() {
  const [offers, setOffers] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [filterApply, setFilterApply] = useState('all');
  const [filterAnswer, setFilterAnswer] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  // Exécution de la requête HTTP GET avec sérialisation des paramètres d'URL
  const fetchOffers = async () => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const params = new URLSearchParams();
      if (filterApply !== 'all') params.append('apply', filterApply);
      if (filterAnswer !== 'all') params.append('answer', filterAnswer);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${API_BASE_URL}/offers${queryString}`);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setOffers(data);
    } catch (error) {
      setErrorStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Déclenchement du fetch lors de l'initialisation et de la mutation des filtres
  useEffect(() => {
    fetchOffers();
  }, [filterApply, filterAnswer]);

  // Exécution de la requête HTTP POST avec payload JSON
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setErrorStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      // Réinitialisation du champ d'entrée et rechargement de la collection de données
      setUrlInput('');
      await fetchOffers();
    } catch (error) {
      setErrorStatus(`Échec de l'insertion : ${error.message}`);
      setIsLoading(false);
    }
  };

  // Composant auxiliaire pour le rendu conditionnel des booléens
  const StatusBadge = ({ status, label }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-slate-100 text-slate-600 border-slate-200'
      }`}>
      {status ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
      {label}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Suivi des Candidatures
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Interface d'interaction avec le service d'agrégation d'offres 42.
          </p>
        </header>

        {errorStatus && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-sm font-medium">
              Erreur d'exécution de la requête : {errorStatus}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Formulaire d'insertion (POST) */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">Ajouter une entité</h2>
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">
                    URI de l'offre
                  </label>
                  <input
                    type="url"
                    id="url"
                    required
                    pattern="https://companies\.intra\.42\.fr/en/offers/[0-9]+"
                    title="Doit correspondre au format: https://companies.intra.42.fr/en/offers/[ID]"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://companies.intra.42.fr/en/offers/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    L'ID numérique sera extrait par le processeur backend.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !urlInput}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Soumettre la requête
                </button>
              </form>
            </div>
          </div>

          {/* Table d'affichage et filtres (GET) */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Registre des entités ({offers.length})</h2>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label htmlFor="filter-apply" className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Apply
                    </label>
                    <select
                      id="filter-apply"
                      value={filterApply}
                      onChange={(e) => setFilterApply(e.target.value)}
                      className="text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-8"
                    >
                      <option value="all">Indifférent</option>
                      <option value="true">True (1)</option>
                      <option value="false">False (0)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="filter-answer" className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Answer
                    </label>
                    <select
                      id="filter-answer"
                      value={filterAnswer}
                      onChange={(e) => setFilterAnswer(e.target.value)}
                      className="text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-8"
                    >
                      <option value="all">Indifférent</option>
                      <option value="true">True (1)</option>
                      <option value="false">False (0)</option>
                    </select>
                  </div>

                  <button
                    onClick={fetchOffers}
                    disabled={isLoading}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                    title="Forcer la réactualisation"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">ID</th>
                      <th scope="col" className="px-4 py-3 font-semibold">URI d'accès</th>
                      <th scope="col" className="px-4 py-3 font-semibold">État 'Apply'</th>
                      <th scope="col" className="px-4 py-3 font-semibold">État 'Answer'</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                          Aucun enregistrement ne correspond aux critères actuels.
                        </td>
                      </tr>
                    ) : (
                      offers.map((offer) => (
                        <tr key={offer.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium text-slate-900">
                            {offer.id}
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={offer.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline max-w-[200px] sm:max-w-xs truncate"
                            >
                              <span className="truncate">{offer.url}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={offer.apply} label={offer.apply ? 'Postulé' : 'En attente'} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={offer.answer} label={offer.answer ? 'Reçu' : 'Sans réponse'} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}