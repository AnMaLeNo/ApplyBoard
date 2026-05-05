import { CheckCircle2, Circle, RefreshCw, Trash2 } from 'lucide-react';
import OfferTitleCell from './OfferTitleCell.jsx';
import { fallback, formatDate } from '../utils/format.js';

const FILTER_OPTIONS = [
  { value: 'all', labelPrefix: 'All' },
  { value: 'true', labelPrefix: 'True (1)' },
  { value: 'false', labelPrefix: 'False (0)' },
];

const LIMIT_OPTIONS = [50, 100, 250, 500];

function FilterSelect({ value, onChangeValue, label }) {
  return (
    <select
      value={value}
      onChange={(e) => onChangeValue(e.target.value)}
      className="text-sm border-slate-300 rounded-md focus:ring-blue-500 py-1.5"
    >
      {FILTER_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.value === 'all' ? `${label}: All` : opt.labelPrefix}
        </option>
      ))}
    </select>
  );
}

function StatusIcon({ active, label }) {
  const Icon = active ? CheckCircle2 : Circle;
  const color = active ? 'text-green-600' : 'text-slate-300';
  return <Icon className={`w-5 h-5 ${color}`} aria-label={label} />;
}

export default function OffersTable({
  offers,
  isLoading,
  filterApply,
  filterAnswer,
  limit,
  onChangeApplyFilter,
  onChangeAnswerFilter,
  onChangeLimit,
  onRefresh,
  onSelectOffer,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">
          Registre des entités ({offers.length})
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect value={filterApply} onChangeValue={onChangeApplyFilter} label="Apply" />
          <FilterSelect value={filterAnswer} onChangeValue={onChangeAnswerFilter} label="Answer" />

          <select
            value={limit}
            onChange={(e) => onChangeLimit(Number(e.target.value))}
            className="text-sm border-slate-300 rounded-md focus:ring-blue-500 py-1.5"
          >
            {LIMIT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                Limite : {value}
              </option>
            ))}
          </select>

          <button
            onClick={onRefresh}
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
              <th className="px-4 py-3 font-semibold">Offre</th>
              <th className="px-4 py-3 font-semibold">Contrat / Campus</th>
              <th className="px-4 py-3 font-semibold text-center">Apply</th>
              <th className="px-4 py-3 font-semibold text-center">Answer</th>
              <th className="px-4 py-3 font-semibold">Date d'ajout</th>
              <th className="px-4 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                  Aucun enregistrement ne correspond aux critères.
                </td>
              </tr>
            ) : (
              offers.map((offer) => (
                <tr
                  key={offer.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectOffer(offer)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectOffer(offer);
                    }
                  }}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors align-top cursor-pointer focus:outline-none focus:bg-slate-50"
                >
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">{offer.id}</td>
                  <OfferTitleCell offer={offer} maxWidthClass="max-w-[280px]" />
                  <td className="px-4 py-3">
                    <div className="text-slate-700">{fallback(offer.contract_type)}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {fallback(offer.campus)}
                      {offer.salary ? ` · ${offer.salary}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex justify-center">
                      <StatusIcon active={offer.apply} label={offer.apply ? 'Postulé' : 'En attente'} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex justify-center">
                      <StatusIcon active={offer.answer} label={offer.answer ? 'Reçu' : 'Sans réponse'} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {formatDate(offer.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(offer.id);
                      }}
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
  );
}
