import { ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import StatusToggle from './StatusToggle.jsx';
import { fallback } from '../utils/format.js';

const FILTER_OPTIONS = [
  { value: 'all', labelPrefix: 'All' },
  { value: 'true', labelPrefix: 'True (1)' },
  { value: 'false', labelPrefix: 'False (0)' },
];

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

export default function OffersTable({
  offers,
  isLoading,
  filterApply,
  filterAnswer,
  onChangeApplyFilter,
  onChangeAnswerFilter,
  onRefresh,
  onToggleStatus,
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
              <th className="px-4 py-3 font-semibold">État 'Apply'</th>
              <th className="px-4 py-3 font-semibold">État 'Answer'</th>
              <th className="px-4 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                  Aucun enregistrement ne correspond aux critères.
                </td>
              </tr>
            ) : (
              offers.map((offer) => (
                <tr
                  key={offer.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors align-top"
                >
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">{offer.id}</td>
                  <td className="px-4 py-3 max-w-[280px]">
                    <a
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
                      title={offer.title || offer.url}
                    >
                      <span className="line-clamp-2">{fallback(offer.title) === '—' ? offer.url : offer.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    </a>
                    <div className="text-xs text-slate-500 mt-1">{fallback(offer.company)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-700">{fallback(offer.contract_type)}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {fallback(offer.campus)}
                      {offer.salary ? ` · ${offer.salary}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusToggle
                      status={offer.apply}
                      label={offer.apply ? 'Postulé' : 'En attente'}
                      onClick={() => onToggleStatus(offer.id, 'apply', offer.apply)}
                      disabled={isLoading}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusToggle
                      status={offer.answer}
                      label={offer.answer ? 'Reçu' : 'Sans réponse'}
                      onClick={() => onToggleStatus(offer.id, 'answer', offer.answer)}
                      disabled={isLoading}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onDelete(offer.id)}
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
