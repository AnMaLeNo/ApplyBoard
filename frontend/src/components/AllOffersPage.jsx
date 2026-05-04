import { AlertCircle, ExternalLink, Loader2, RefreshCw, Database } from 'lucide-react';

const LIMIT_OPTIONS = [25, 50, 100, 250, 500];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function AllOffersPage({ globalOffersState }) {
  const {
    offers,
    isLoading,
    errorStatus,
    limit,
    setLimit,
    refresh,
  } = globalOffersState;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Registre Global des Offres
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Catalogue public des offres connues de la plateforme, triées par date d'ajout.
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Catalogue ({offers.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="text-sm border-slate-300 rounded-md focus:ring-blue-500 py-1.5"
            >
              {LIMIT_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  Limite : {value}
                </option>
              ))}
            </select>

            <button
              onClick={refresh}
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
                <th className="px-4 py-3 font-semibold">Date d'ajout</th>
              </tr>
            </thead>
            <tbody>
              {offers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-12 text-center text-slate-400">
                    <Database className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                    Aucune offre référencée dans le catalogue.
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">
                      {offer.id}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={offer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 max-w-[280px]"
                      >
                        <span className="truncate">{offer.url}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {formatDate(offer.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
