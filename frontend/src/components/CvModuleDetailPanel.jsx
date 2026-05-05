import { useState } from 'react';
import { ArrowLeft, Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import CvVariantEditor from './CvVariantEditor.jsx';
import { KIND_LABELS, KIND_EDITORS } from '../utils/cvModuleKinds.js';
import { formatDate } from '../utils/format.js';

function VariantPreview({ kind, content }) {
  if (!content) return <span className="text-slate-400 italic">Vide</span>;

  const editor = KIND_EDITORS[kind];
  if (!editor) return null;

  if (editor.mode === 'text') {
    if (!content.text) return <span className="text-slate-400 italic">Vide</span>;
    return (
      <p className="text-sm text-slate-700 whitespace-pre-line break-words">
        {content.text}
      </p>
    );
  }

  if (editor.mode === 'tags') {
    const items = content.items ?? [];
    if (items.length === 0) return <span className="text-slate-400 italic">Aucun élément</span>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded">
            {item}
          </span>
        ))}
      </div>
    );
  }

  // mode list
  const items = content.items ?? [];
  if (items.length === 0) return <span className="text-slate-400 italic">Aucun élément</span>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => {
        const primaryField = editor.fields[0];
        const secondaryField = editor.fields[1];
        return (
          <li key={i} className="text-sm">
            <span className="font-medium text-slate-800">
              {item[primaryField.key] || '(sans titre)'}
            </span>
            {secondaryField && item[secondaryField.key] && (
              <span className="text-slate-500"> · {item[secondaryField.key]}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function VariantCard({ variant, kind, onUpdate, onDelete, busy }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
        <CvVariantEditor
          kind={kind}
          initialLabel={variant.label}
          initialContent={variant.content}
          submitLabel="Mettre à jour"
          busy={busy}
          onCancel={() => setEditing(false)}
          onSubmit={async ({ label, content }) => {
            await onUpdate(variant.id, { label, content });
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 break-words">{variant.label}</div>
          <div className="text-xs text-slate-400 mt-0.5">
            Modifiée le {formatDate(variant.updated_at)}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setEditing(true)}
            disabled={busy}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
            title="Modifier la variante"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(variant.id)}
            disabled={busy}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            title="Supprimer la variante"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <VariantPreview kind={kind} content={variant.content} />
    </div>
  );
}

export default function CvModuleDetailPanel({
  module,
  busy,
  onBack,
  onRename,
  onDelete,
  onCreateVariant,
  onUpdateVariant,
  onDeleteVariant,
}) {
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [creatingVariant, setCreatingVariant] = useState(false);

  if (!module) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
        Aucun module sélectionné.
      </div>
    );
  }

  const variants = module.variants ?? [];

  const startRename = () => {
    setNameDraft(module.name);
    setRenaming(true);
  };

  const submitRename = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === module.name) {
      setRenaming(false);
      return;
    }
    await onRename(module.id, trimmed);
    setRenaming(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
      <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
        <button
          onClick={onBack}
          aria-label="Retour à la liste"
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            {KIND_LABELS[module.kind] ?? module.kind}
          </div>
          {renaming ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitRename();
                  else if (e.key === 'Escape') setRenaming(false);
                }}
                className="text-xl font-semibold text-slate-900 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-0"
              />
              <button
                onClick={submitRename}
                disabled={busy}
                className="p-2 text-green-600 hover:bg-green-50 rounded-md disabled:opacity-50"
                aria-label="Valider"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRenaming(false)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
                aria-label="Annuler"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-xl font-semibold text-slate-900 break-words">
                {module.name}
              </h2>
              <button
                onClick={startRename}
                disabled={busy}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                title="Renommer le module"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(module.id)}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors shrink-0 disabled:opacity-50"
          title="Supprimer le module et toutes ses variantes"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Variantes ({variants.length})
        </h3>
        {!creatingVariant && (
          <button
            onClick={() => setCreatingVariant(true)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Nouvelle variante
          </button>
        )}
      </div>

      {creatingVariant && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
          <CvVariantEditor
            kind={module.kind}
            submitLabel="Créer la variante"
            busy={busy}
            onCancel={() => setCreatingVariant(false)}
            onSubmit={async ({ label, content }) => {
              await onCreateVariant(module.id, { label, content });
              setCreatingVariant(false);
            }}
          />
        </div>
      )}

      {variants.length === 0 && !creatingVariant ? (
        <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
          Aucune variante pour ce module. Créez-en une pour commencer.
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant) => (
            <VariantCard
              key={variant.id}
              variant={variant}
              kind={module.kind}
              onUpdate={onUpdateVariant}
              onDelete={onDeleteVariant}
              busy={busy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
