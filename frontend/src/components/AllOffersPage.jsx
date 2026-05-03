import { Database } from 'lucide-react';

export default function AllOffersPage() {
  return (
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
          Cette ressource de présentation est actuellement non implémentée. La future logique de
          récupération asynchrone des données (Data Fetching) sera injectée dans ce nœud du DOM.
        </p>
      </div>
    </div>
  );
}
