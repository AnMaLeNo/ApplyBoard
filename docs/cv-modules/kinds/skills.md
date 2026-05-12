# `skills` — Compétences

[← Retour à l'index](../README.md)

Le bloc **compétences** liste les technologies, langages, outils et méthodologies maîtrisés. C'est l'un des blocs les plus scrutés par les ATS (Applicant Tracking Systems) et donc l'un de ceux pour lesquels avoir plusieurs variantes ciblées par offre est le plus payant.

## Mode d'édition

`tags` — liste de chaînes courtes, saisies comme des chips.

## Schéma du `content`

```json
{
  "items": ["string", "string", "..."]
}
```

Chaque entrée est typiquement le nom d'une compétence (`React`, `Python`, `Docker`, `Méthodes Agile`...).

### Exemple

```json
{
  "items": [
    "Node.js", "TypeScript", "Fastify", "Express",
    "React", "Tailwind CSS",
    "PostgreSQL", "Redis", "MongoDB",
    "Docker", "Docker Compose", "GitHub Actions",
    "Méthodes Agile", "Revue de code"
  ]
}
```

### Règles de validation (côté API)

Validateur dans [`backend/src/routes/cvModules.js`](../../../backend/src/routes/cvModules.js) (`contentValidatorsByKind.skills`) :

- `content` doit être un objet.
- `content.items` doit être un `string[]`.

Aucun contrôle sur le contenu individuel : on ne maintient pas de référentiel fermé de compétences.

## Justification architecturale

### Pourquoi `string[]` et non `{ name, level }[]`

Les niveaux d'expertise (`débutant`, `intermédiaire`, `confirmé`, `expert` — ou pire, `***** sur 5`) sont **mal aimés** des recruteurs comme des candidats :

- Aucune définition partagée entre individus (mon « confirmé » = ton « débutant »).
- Source d'auto-évaluation biaisée (effet Dunning-Kruger).
- Bruit visuel sur le CV.

La pratique moderne consiste à **ne pas afficher de niveau** et à laisser le contexte (expériences, projets) prouver la maîtrise. On colle à cette pratique. Si un utilisateur tient absolument à indiquer un niveau, il peut écrire `"React (expert)"` — c'est sa responsabilité, pas une structure imposée par le schéma.

### Pourquoi pas de catégories (`{ frontend: [...], backend: [...] }`) en V1

Beaucoup de CV regroupent les compétences par famille : `Backend : Node, Python, Go` / `Frontend : React, Vue` / `Outils : Docker, K8s`. La V1 ne fait pas ça pour deux raisons :

- **Simplicité de saisie** : entrer 30 tags d'un coup est plus rapide que les répartir dans 4 catégories.
- **Réversibilité** : ajouter un regroupement plus tard est trivial — on passe du schéma `{ items: string[] }` à `{ groups: [{ category, items }] }` ou à un schéma hybride. L'inverse (retirer une structure imposée) est plus coûteux.

Si l'usage montre que les utilisateurs créent **plusieurs modules `skills`** (un par catégorie) pour contourner l'absence de regroupement, on saura que c'est le moment de le formaliser.

### Pourquoi distinguer `skills` de `interests` (même schéma technique)

Voir la même section dans [`interests.md`](interests.md). Résumé : sémantique différente, template de rendu différent, et évolution probable du schéma `skills` (catégorisation) qui ne concernera pas `interests`.

### Pourquoi pas de validation sur la nature d'un « skill »

On ne vérifie pas que les chaînes correspondent à des technos connues (pas de référentiel `["React", "Vue", "Angular", ...]`). Maintenir un tel référentiel à jour est un projet en soi (le marché évolue chaque mois) et le bénéfice est faible : un faux positif sur une compétence atypique (`Pandoc`, `Tree-sitter`) n'apporte rien et frustre l'utilisateur. La validation reste cantonnée à la **forme** (`string[]`).
