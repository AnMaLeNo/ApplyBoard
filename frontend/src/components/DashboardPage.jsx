import { AlertCircle, Loader2 } from 'lucide-react';
import OffersTable from './OffersTable.jsx';

export default function DashboardPage({ offersState }) {
  const {
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
  } = offersState;

  const handleToggleStatus = (id, field, current) =>
    updateOffer(id, { [field]: !current });

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

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="text-sm font-medium">
            Erreur d'exécution de la requête : {errorMessage}
          </div>
        </div>
      )}

      <OffersTable
        offers={offers}
        isLoading={isLoading}
        filterApply={filterApply}
        filterAnswer={filterAnswer}
        limit={limit}
        onChangeApplyFilter={setFilterApply}
        onChangeAnswerFilter={setFilterAnswer}
        onChangeLimit={setLimit}
        onRefresh={refresh}
        onToggleStatus={handleToggleStatus}
        onDelete={deleteOffer}
      />
    </div>
  );
}
