import { Loader2 } from 'lucide-react';
import VariantListEditor from './VariantListEditor.jsx';
import EntryMapEditor from './EntryMapEditor.jsx';
import ListSectionEditor from './ListSectionEditor.jsx';

function Section({ title, hint, children }) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
      <header>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
      </header>
      {children}
    </section>
  );
}

export default function CvDocumentPage({ cvDocumentState }) {
  const { document, isLoading, errorMessage, mutate } = cvDocumentState;

  // Helpers immuables pour patcher des branches précises de l'arbre.
  const updateField = (field, nextValue) =>
    mutate((prev) => ({ ...prev, cv: { ...prev.cv, [field]: nextValue } }));

  if (!document) {
    return (
      <div className="max-w-3xl mx-auto py-12 flex items-center justify-center text-slate-500">
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : errorMessage ? (
          <span className="text-sm text-red-600">{errorMessage}</span>
        ) : (
          <span className="text-sm">Chargement du document...</span>
        )}
      </div>
    );
  }

  const cv = document.cv;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modules de CV</h1>
          <p className="text-sm text-slate-500 mt-1">
            Stockez vos ingrédients granulaires : pour chaque champ, plusieurs variantes que l'IA pourra recomposer selon l'offre visée.
          </p>
        </div>
        {isLoading && (
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin mt-1" />
        )}
      </header>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          {errorMessage}
        </div>
      )}

      <Section
        title="Titre"
        hint="Étiquette courte positionnant le candidat (ex. « Développeur Backend Senior »)."
      >
        <VariantListEditor
          block={cv.title}
          onChange={(next) => updateField('title', next)}
          placeholder="Une formulation de titre..."
          rows={1}
        />
      </Section>

      <Section
        title="Résumé"
        hint="Paragraphe d'introduction. Plusieurs angles possibles (axe technique, axe leadership, etc.)."
      >
        <VariantListEditor
          block={cv.summary}
          onChange={(next) => updateField('summary', next)}
          placeholder="Une formulation de résumé..."
          rows={4}
        />
      </Section>

      <Section
        title="Projets"
        hint="Une entrée par projet. Pour chaque projet, plusieurs titres et descriptions possibles."
      >
        <EntryMapEditor
          map={cv.projects}
          onChange={(next) => updateField('projects', next)}
          entryNoun="projet"
        />
      </Section>

      <Section
        title="Formations"
        hint="Une entrée par diplôme/formation."
      >
        <EntryMapEditor
          map={cv.education}
          onChange={(next) => updateField('education', next)}
          entryNoun="formation"
        />
      </Section>

      <Section
        title="Hackathons"
        hint="Une entrée par hackathon."
      >
        <EntryMapEditor
          map={cv.hackathons}
          onChange={(next) => updateField('hackathons', next)}
          entryNoun="hackathon"
        />
      </Section>

      <Section title="Compétences" hint="Liste à plat de compétences techniques.">
        <ListSectionEditor
          section={cv.skills}
          onChange={(next) => updateField('skills', next)}
          placeholder="Ex. PostgreSQL, React, Rust..."
        />
      </Section>

      <Section title="Centres d'intérêt" hint="Liste à plat de loisirs et passions.">
        <ListSectionEditor
          section={cv.interests}
          onChange={(next) => updateField('interests', next)}
          placeholder="Ex. Photographie, échecs..."
        />
      </Section>
    </div>
  );
}
