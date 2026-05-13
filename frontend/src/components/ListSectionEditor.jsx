import { useState } from 'react';
import { X } from 'lucide-react';

// Édite une section { items: string[] } : UI type chips avec input pour ajout.
export default function ListSectionEditor({
  section,
  onChange,
  placeholder = 'Ajouter et appuyer sur Entrée',
}) {
  const [draft, setDraft] = useState('');
  const items = section?.items ?? [];

  const addItem = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    onChange({ items: [...items, trimmed] });
    setDraft('');
  };

  const removeItem = (index) => {
    onChange({ items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border border-slate-300 rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded"
        >
          {item}
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="text-slate-400 hover:text-red-600"
            aria-label={`Supprimer ${item}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addItem(draft);
          } else if (event.key === 'Backspace' && draft === '' && items.length > 0) {
            removeItem(items.length - 1);
          }
        }}
        onBlur={() => addItem(draft)}
        className="flex-1 min-w-[160px] text-sm bg-transparent focus:outline-none"
      />
    </div>
  );
}
