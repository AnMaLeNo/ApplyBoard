import { Plus, Trash2 } from 'lucide-react';
import VariantListEditor from './VariantListEditor.jsx';

const emptyEntry = () => ({
  title: { variants: [] },
  description: { variants: [] },
});

// `crypto.randomUUID` n'est pas exposé hors contexte sécurisé (HTTP non-localhost),
// d'où ce générateur autonome basé sur timestamp + aléa Math.random.
const generateEntryKey = () =>
  `entry-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// Édite une map d'entrées : { [key]: { title: variantBlock, description: variantBlock } }.
// La clé de chaque entrée est un UUID opaque ; l'utilisateur identifie l'entrée par sa première variante de titre.
export default function EntryMapEditor({ map, onChange, entryNoun = 'entrée' }) {
  const entries = Object.entries(map ?? {});

  const updateEntry = (key, nextEntry) => {
    onChange({ ...map, [key]: nextEntry });
  };

  const removeEntry = (key) => {
    const next = { ...map };
    delete next[key];
    onChange(next);
  };

  const addEntry = () => {
    const key = generateEntryKey();
    onChange({ ...(map ?? {}), [key]: emptyEntry() });
  };

  return (
    <div className="space-y-4">
      {entries.length === 0 && (
        <p className="text-sm text-slate-400 italic">Aucune {entryNoun} pour l'instant.</p>
      )}

      <ul className="space-y-4">
        {entries.map(([key, entry]) => {
          const displayName = entry?.title?.variants?.[0]?.trim() || `Sans titre`;
          return (
            <li
              key={key}
              className="border border-slate-200 rounded-lg p-4 bg-white space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-800 truncate">
                  {displayName}
                </h4>
                <button
                  type="button"
                  onClick={() => removeEntry(key)}
                  aria-label={`Supprimer cette ${entryNoun}`}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              </div>

              <VariantListEditor
                label="Titres"
                block={entry?.title ?? { variants: [] }}
                onChange={(nextTitle) => updateEntry(key, { ...entry, title: nextTitle })}
                placeholder="Variante de titre..."
                rows={1}
              />

              <VariantListEditor
                label="Descriptions"
                block={entry?.description ?? { variants: [] }}
                onChange={(nextDesc) =>
                  updateEntry(key, { ...entry, description: nextDesc })
                }
                placeholder="Variante de description..."
                rows={3}
              />
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={addEntry}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Ajouter une {entryNoun}
      </button>
    </div>
  );
}
