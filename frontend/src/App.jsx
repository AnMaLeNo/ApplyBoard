import React, { useState, useEffect } from 'react';
import { ExternalLink, Plus, CheckCircle2, Circle, AlertCircle, RefreshCw, Loader2, Trash2, LayoutDashboard, Database, LogOut } from 'lucide-react';

// Configuration de l'endpoint cible. 
// À modifier selon l'exposition des ports du conteneur Docker hébergeant l'API.
const API_BASE_URL = '/api';

export default function App() {
  // États de la session d'authentification
  const [authState, setAuthState] = useState(null); // null = phase de vérification, 'in' = authentifié, 'out' = non authentifié
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);

  // États de l'interface de navigation et des données
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [offers, setOffers] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [filterApply, setFilterApply] = useState('all');
  const [filterAnswer, setFilterAnswer] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  // Procédure de révocation d'accès locale
  const handleUnauthorized = () => setAuthState('out');

  // Exécution de la requête HTTP GET avec sérialisation des paramètres d'URL et inclusion des credentials
  const fetchOffers = async () => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const params = new URLSearchParams();
      if (filterApply !== 'all') params.append('apply', filterApply);
      if (filterAnswer !== 'all') params.append('answer', filterAnswer);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${API_BASE_URL}/offers${queryString}`, {
        credentials: 'include'
      });
      
      if (response.status === 401) { 
        handleUnauthorized(); 
        return; 
      }
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setAuthState('in');
      setOffers(data);
    } catch (error) {
      setErrorStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Implémentation de la mutation partielle via la méthode HTTP PATCH
  const handleToggleStatus = async (id, field, currentValue) => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const response = await fetch(`${API_BASE_URL}/offers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ [field]: !currentValue }),
      });

      if (response.status === 401) { 
        handleUnauthorized(); 
        return; 
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      // Re-synchronisation de l'état local après succès de la transaction SQL
      await fetchOffers();
    } catch (error) {
      setErrorStatus(`Erreur de mise à jour : ${error.message}`);
      setIsLoading(false);
    }
  };

  // Exécution de la requête HTTP DELETE pour la suppression d'une ressource
  const handleDeleteOffer = async (id) => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const response = await fetch(`${API_BASE_URL}/offers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.status === 401) { 
        handleUnauthorized(); 
        return; 
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }

      // Réconciliation de l'arbre d'état local via une requête GET subséquente
      await fetchOffers();
    } catch (error) {
      setErrorStatus(`Échec de l'opération de suppression : ${error.message}`);
      setIsLoading(false);
    }
  };

  // Déclenchement du fetch lors de l'initialisation et de la mutation des filtres
  useEffect(() => {
    fetchOffers();
  }, [filterApply, filterAnswer]);

  // Exécution de la requête HTTP POST avec payload JSON pour l'insertion
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
        credentials: 'include',
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (response.status === 401) { 
        handleUnauthorized(); 
        return; 
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      setUrlInput('');
      await fetchOffers();
    } catch (error) {
      setErrorStatus(`Échec de l'insertion : ${error.message}`);
      setIsLoading(false);
    }
  };

  // Traitement du flux d'authentification (Connexion / Inscription)
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setAuthError(data.error || `Erreur ${response.status}`);
        return;
      }

      setEmail('');
      setPassword('');
      setAuthState('in');
      fetchOffers();
    } catch (error) {
      setAuthError(error.message);
    }
  };

  // Traitement de l'opération de déconnexion
  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setAuthState('out');
    setOffers([]);
  };

  // Composant auxiliaire interactif pour la mutation de statut
  const StatusToggle = ({ status, label, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
        status 
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
      } disabled:opacity-50 disabled:cursor-wait`}
    >
      {status ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
      {label}
    </button>
  );

  // Évaluation conditionnelle - Phase de résolution asynchrone
  if (authState === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Évaluation conditionnelle - Mode non authentifié (Interface de connexion)
  if (authState === 'out') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 w-full max-w-sm space-y-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-center">
            {authMode === 'login' ? 'Authentification' : 'Création de compte'}
          </h1>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Identifiant (Email)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Clé d'accès (Mot de passe)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              {authMode === 'login' ? 'Ouvrir la session' : "S'inscrire"}
            </button>
          </form>

          <button
            onClick={() => { setAuthMode(m => m === 'login' ? 'register' : 'login'); setAuthError(null); }}
            className="w-full text-sm text-slate-500 hover:text-slate-700 text-center transition-colors"
          >
            {authMode === 'login' ? "Créer une nouvelle entité utilisateur" : 'S\'authentifier avec un compte existant'}
          </button>
        </div>
      </div>
    );
  }

  // Évaluation conditionnelle - Mode authentifié (Arbre DOM principal)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-lg font-bold text-slate-800 tracking-tight">Système de Gestion</div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentRoute('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentRoute === 'dashboard' ? 'bg-slate-100 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Suivi d'Entités
              </button>
              <button
                onClick={() => setCurrentRoute('all_offers')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentRoute === 'all_offers' ? 'bg-slate-100 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Database className="w-4 h-4" />
                Registre Global
              </button>
            </div>
            
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="px-8 pb-8">
        {currentRoute === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Suivi des Candidatures
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Interface d'interaction avec le service d'agrégation d'offres 42.
                </p>
              </div>
              {isLoading && <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
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
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://companies.intra.42.fr/en/offers/..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !urlInput}
                      className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Soumettre la requête
                    </button>
                  </form>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">Registre des entités ({offers.length})</h2>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={filterApply}
                        onChange={(e) => setFilterApply(e.target.value)}
                        className="text-sm border-slate-300 rounded-md focus:ring-blue-500 py-1.5"
                      >
                        <option value="all">Apply: All</option>
                        <option value="true">True (1)</option>
                        <option value="false">False (0)</option>
                      </select>

                      <select
                        value={filterAnswer}
                        onChange={(e) => setFilterAnswer(e.target.value)}
                        className="text-sm border-slate-300 rounded-md focus:ring-blue-500 py-1.5"
                      >
                        <option value="all">Answer: All</option>
                        <option value="true">True (1)</option>
                        <option value="false">False (0)</option>
                      </select>
                      
                      <button 
                        onClick={fetchOffers}
                        disabled={isLoading}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold">ID</th>
                          <th className="px-4 py-3 font-semibold">URI d'accès</th>
                          <th className="px-4 py-3 font-semibold">État 'Apply'</th>
                          <th className="px-4 py-3 font-semibold">État 'Answer'</th>
                          <th className="px-4 py-3 font-semibold text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {offers.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                              Aucun enregistrement ne correspond aux critères.
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
                                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 max-w-[150px] truncate"
                                >
                                  <span className="truncate">{offer.url}</span>
                                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                </a>
                              </td>
                              <td className="px-4 py-3">
                                <StatusToggle 
                                  status={offer.apply} 
                                  label={offer.apply ? 'Postulé' : 'En attente'} 
                                  onClick={() => handleToggleStatus(offer.id, 'apply', offer.apply)}
                                  disabled={isLoading}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <StatusToggle 
                                  status={offer.answer} 
                                  label={offer.answer ? 'Reçu' : 'Sans réponse'} 
                                  onClick={() => handleToggleStatus(offer.id, 'answer', offer.answer)}
                                  disabled={isLoading}
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => handleDeleteOffer(offer.id)}
                                  disabled={isLoading}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Exécuter la suppression (DELETE)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
        )}

        {currentRoute === 'all_offers' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <header>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Registre Global des Offres
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Interface de consultation séquentielle de la base de données distante.
              </p>
            </header>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center flex flex-col items-center">
              <Database className="w-12 h-12 text-slate-300 mb-4" />
              <h2 className="text-lg font-medium text-slate-700">Composant de substitution (Stub)</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-md">
                Cette ressource de présentation est actuellement non implémentée. La future logique de récupération asynchrone des données (Data Fetching) sera injectée dans ce nœud du DOM.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}