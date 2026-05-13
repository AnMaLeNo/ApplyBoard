import { Plus, Trash2 } from 'lucide-react';

// Édite un bloc { variants: string[] }. Chaque variante est une chaîne libre éditée via textarea.
// `onChange` reçoit le bloc complet remplacé (immutable).
export default function VariantListEditor({
  block,
  onChange,
  label,
  placeholder = 'Saisissez une variante...',
  rows = 2,
}) {
  const variants = block?.variants ?? [];

  const updateVariant = (index, value) => {
    const next = variants.slice();
    next[index] = value;
    onChange({ variants: next });
  };

  const removeVariant = (index) => {
    onChange({ variants: variants.filter((_, i) => i !== index) });
  };

  const addVariant = () => {
    onChange({ variants: [...variants, ''] });
  };

  return (
    <div className="space-y-2">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
      )}

      {variants.length === 0 && (
        <p className="text-xs text-slate-400 italic">Aucune variante.</p>
      )}

      <ul className="space-y-2">
        {variants.map((variant, index) => (
          <li key={index} className="flex gap-2 items-start">
            <textarea
              value={variant}
              onChange={(event) => updateVariant(index, event.target.value)}
              rows={rows}
              placeholder={placeholder}
              className="flex-1 text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
            />
            <button
              type="button"
              onClick={() => removeVariant(index)}
              aria-label="Supprimer la variante"
              className="mt-1 inline-flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={addVariant}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Ajouter une variante
      </button>
    </div>
  );
}
