export const KIND_ORDER = [
  'title',
  'headline',
  'education',
  'projects',
  'hackathons',
  'interests',
  'skills',
  'experience',
  'custom',
];

export const KIND_LABELS = {
  title: 'Titre',
  headline: 'Accroche',
  education: 'Diplômes & formations',
  projects: 'Projets & réalisations',
  hackathons: 'Hackathons',
  interests: "Centres d'intérêt",
  skills: 'Compétences',
  experience: 'Expériences professionnelles',
  custom: 'Module personnalisé',
};

// Modes d'édition de la variante.
//   text     → un champ texte unique stocké sous { text }
//   tags     → liste de tags stockée sous { items: string[] }
//   list     → liste éditable d'items stockée sous { items: [...] }
export const KIND_EDITORS = {
  title: { mode: 'text' },
  headline: { mode: 'text' },
  custom: { mode: 'text' },
  interests: { mode: 'tags' },
  skills: { mode: 'tags' },
  education: {
    mode: 'list',
    fields: [
      { key: 'degree', label: 'Diplôme', required: true },
      { key: 'school', label: 'Établissement', required: true },
      { key: 'year', label: 'Année' },
      { key: 'description', label: 'Description', multiline: true },
    ],
  },
  projects: {
    mode: 'list',
    fields: [
      { key: 'name', label: 'Nom', required: true },
      { key: 'description', label: 'Description', multiline: true },
      { key: 'link', label: 'Lien' },
      { key: 'tech', label: 'Technologies', tags: true },
    ],
  },
  hackathons: {
    mode: 'list',
    fields: [
      { key: 'name', label: 'Nom', required: true },
      { key: 'year', label: 'Année' },
      { key: 'description', label: 'Description', multiline: true },
      { key: 'prize', label: 'Prix / classement' },
    ],
  },
  experience: {
    mode: 'list',
    fields: [
      { key: 'role', label: 'Poste', required: true },
      { key: 'company', label: 'Entreprise', required: true },
      { key: 'start', label: 'Début' },
      { key: 'end', label: 'Fin' },
      { key: 'location', label: 'Lieu' },
      { key: 'bullets', label: 'Réalisations', tags: true },
    ],
  },
};

export function emptyContentForKind(kind) {
  const editor = KIND_EDITORS[kind];
  if (!editor) return {};
  if (editor.mode === 'text') return { text: '' };
  return { items: [] };
}

export function emptyItemForKind(kind) {
  const editor = KIND_EDITORS[kind];
  if (!editor || editor.mode !== 'list') return null;
  return editor.fields.reduce((acc, field) => {
    acc[field.key] = field.tags ? [] : '';
    return acc;
  }, {});
}
