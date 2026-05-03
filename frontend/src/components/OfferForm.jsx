import { Plus } from 'lucide-react';

export default function OfferForm({ urlInput, setUrlInput, onSubmit, isLoading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">Ajouter une entité</h2>
      <form onSubmit={onSubmit} className="space-y-4">
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
  );
}
