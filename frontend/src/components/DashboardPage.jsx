import { AlertCircle, Loader2 } from 'lucide-react';
import OfferForm from './OfferForm.jsx';
import OffersTable from './OffersTable.jsx';

export default function DashboardPage({ offersState }) {
  const {
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
  } = offersState;

  return (
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
          <OfferForm
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            onSubmit={submitOffer}
            isLoading={isLoading}
          />
        </div>

        <div className="md:col-span-2 space-y-4">
          <OffersTable
            offers={offers}
            isLoading={isLoading}
            filterApply={filterApply}
            filterAnswer={filterAnswer}
            setFilterApply={setFilterApply}
            setFilterAnswer={setFilterAnswer}
            onRefresh={refresh}
            onToggleStatus={toggleStatus}
            onDelete={deleteOffer}
          />
        </div>
      </div>
    </div>
  );
}
