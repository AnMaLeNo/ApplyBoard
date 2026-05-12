import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { KIND_EDITORS, emptyContentForKind } from '../utils/cvModuleKinds.js';

function TextField({ field, value, onChange }) {
  const Tag = field.multiline ? 'textarea' : 'input';
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <Tag
        type={field.multiline ? undefined : 'text'}
        value={value ?? ''}
        rows={field.multiline ? 3 : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </label>
  );
}

function TagField({ label, value, onChange }) {
  const [draft, setDraft] = useState('');
  const items = Array.isArray(value) ? value : [];

  const addTag = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft('');
  };

  const removeTag = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="mt-1 flex flex-wrap gap-2 p-2 border border-slate-300 rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded"
          >
            {item}
            <button
              type="button"
              onClick={() => removeTag(index)}
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
          placeholder="Ajouter et appuyer sur Entrée"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag(draft);
            } else if (e.key === 'Backspace' && draft === '' && items.length > 0) {
              removeTag(items.length - 1);
            }
          }}
          onBlur={() => addTag(draft)}
          className="flex-1 min-w-[120px] text-sm bg-transparent focus:outline-none"
        />
      </div>
    </div>
  );
}

function ListItemFields({ kind, item, onChange }) {
  const editor = KIND_EDITORS[kind];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {editor.fields.map((field) =>
        field.tags ? (
          <div key={field.key} className="sm:col-span-2">
            <TagField
              label={field.label}
              value={item[field.key]}
              onChange={(next) => onChange({ ...item, [field.key]: next })}
            />
          </div>
        ) : (
          <div key={field.key} className={field.multiline ? 'sm:col-span-2' : ''}>
            <TextField
              field={field}
              value={item[field.key]}
              onChange={(next) => onChange({ ...item, [field.key]: next })}
            />
          </div>
        ),
      )}
    </div>
  );
}

export default function CvVariantEditor({
  kind,
  initialLabel = '',
  initialContent,
  submitLabel = 'Enregistrer',
  onSubmit,
  onCancel,
  busy,
}) {
  const editor = KIND_EDITORS[kind];
  const [label, setLabel] = useState(initialLabel);
  const [content, setContent] = useState(
    initialContent ?? emptyContentForKind(kind),
  );

  useEffect(() => {
    setLabel(initialLabel);
    setContent(initialContent ?? emptyContentForKind(kind));
  }, [initialLabel, initialContent, kind]);

  if (!editor) {
    return <div className="text-sm text-red-600">Type de module inconnu : {kind}</div>;
  }

  const updateText = (text) => setContent({ text });

  const updateItems = (items) => setContent({ items });

  const canSubmit = label.trim().length > 0 && !busy;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ label: label.trim(), content });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Libellé de la variante <span className="text-red-500">*</span>
        </span>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex. Pour postes backend"
          className="mt-1 w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </label>

      {editor.mode === 'text' && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Contenu
          </span>
          <textarea
            value={content.text ?? ''}
            onChange={(e) => updateText(e.target.value)}
            rows={6}
            className="mt-1 w-full text-sm border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </label>
      )}

      {editor.mode === 'tags' && (
        <TagField
          label="Éléments"
          value={content.items ?? []}
          onChange={updateItems}
        />
      )}

      {editor.mode === 'fields' && (
        <ListItemFields
          kind={kind}
          item={content}
          onChange={(next) => setContent(next)}
        />
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
