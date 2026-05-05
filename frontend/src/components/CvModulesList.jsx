import { useState } from 'react';
import { Plus, RefreshCw, X, Layers } from 'lucide-react';
import { KIND_LABELS, KIND_ORDER } from '../utils/cvModuleKinds.js';

function CreateModuleForm({ onCreate, onCancel, busy }) {
  const [kind, setKind] = useState('headline');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    onCreate({ kind, name: trimmed });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-blue-200 rounded-lg p-4 bg-blue-50/30 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Nouveau module</span>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
          aria-label="Annuler"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Type
        </span>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="mt-1 w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {KIND_ORDER.map((k) => (
            <option key={k} value={k}>
              {KIND_LABELS[k]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Nom <span className="text-red-500">*</span>
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Accroche dev backend"
          autoFocus
          className="mt-1 w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </label>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!name.trim() || busy}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Créer
        </button>
      </div>
    </form>
  );
}

function groupByKind(modules) {
  const groups = new Map();
  for (const kind of KIND_ORDER) groups.set(kind, []);
  for (const m of modules) {
    if (!groups.has(m.kind)) groups.set(m.kind, []);
    groups.get(m.kind).push(m);
  }
  return [...groups.entries()].filter(([, list]) => list.length > 0);
}

export default function CvModulesList({
  modules,
  selectedModuleId,
  isLoading,
  onSelectModule,
  onCreateModule,
  onRefresh,
}) {
  const [creating, setCreating] = useState(false);
  const groups = groupByKind(modules);

  const handleCreate = async (payload) => {
    await onCreateModule(payload);
    setCreating(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100 shrink-0">
        <h2 className="text-lg font-semibold text-slate-800">
          Modules ({modules.length})
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-5">
        {creating && (
          <CreateModuleForm
            onCreate={handleCreate}
            onCancel={() => setCreating(false)}
            busy={isLoading}
          />
        )}

        {modules.length === 0 && !creating ? (
          <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
            <Layers className="w-8 h-8 mx-auto mb-3 text-slate-300" />
            Aucun module. Créez-en un pour commencer à composer votre CV.
          </div>
        ) : (
          groups.map(([kind, list]) => (
            <div key={kind}>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                {KIND_LABELS[kind] ?? kind}
              </div>
              <ul className="space-y-1.5">
                {list.map((module) => {
                  const variantsCount = module.variants?.length ?? 0;
                  const selected = module.id === selectedModuleId;
                  return (
                    <li key={module.id}>
                      <button
                        onClick={() => onSelectModule(module)}
                        className={`w-full text-left px-3 py-2.5 rounded-md transition-colors border ${
                          selected
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'border-transparent hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium truncate">{module.name}</span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                              selected
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {variantsCount} variante{variantsCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
