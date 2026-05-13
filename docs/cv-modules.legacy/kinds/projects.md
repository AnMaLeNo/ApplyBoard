# `projects` — Projets & réalisations

[← Retour à l'index](../README.md)

Le bloc **projets** regroupe les réalisations personnelles, side-projects, contributions open source ou projets d'études marquants.

## Mode d'édition

`fields` — formulaire à champs plats. **Une variante = une présentation d'un seul projet.**

Le module représente l'entité « projet » (ex. module nommé « ft_transcendence »). Chaque variante en est une présentation différente selon le ciblage (description technique, description courte, mise en avant d'une techno particulière...). Le générateur de CV **sélectionne quels modules inclure** et **quelle variante** de chacun afficher.

## Schéma du `content`

```json
{
  "name":        "string (requis) — nom du projet",
  "description": "string (optionnel) — résumé en 1 à 3 phrases",
  "link":        "string (optionnel) — URL (repo, démo, article, ...)",
  "tech":        "string[] (optionnel) — stack technique utilisée"
}
```

### Exemple

```json
{
  "name": "ft_transcendence",
  "description": "Application web temps réel de jeu Pong multijoueur avec chat, tournois et auth OAuth42. Projet final du cursus 42.",
  "link": "https://github.com/exemple/ft_transcendence",
  "tech": ["NestJS", "React", "PostgreSQL", "Socket.IO", "Docker"]
}
```

Exemple de deux variantes du même module :

```json
{ "name": "ft_transcendence", "description": "Projet full-stack React/NestJS — architecture microservices, auth OAuth, WebSocket temps réel.", "tech": ["NestJS", "React", "PostgreSQL"] }

{ "name": "ft_transcendence", "description": "Projet de fin de cursus 42 : Pong multijoueur, chat intégré, gestion de tournois.", "tech": ["NestJS", "React"] }
```

### Règles de validation (côté API)

Validateur dans [`backend/src/routes/cvModules.js`](../../../backend/src/routes/cvModules.js) (`contentValidatorsByKind.projects`) :

- `content` doit être un objet (pas un tableau).
- `content.name` doit être présent et de type `string`.
- `description` et `link`, s'ils sont présents, doivent être des `string`.
- `tech`, s'il est présent, doit être un `string[]`.

## Justification architecturale

### Pourquoi une variante = un projet unique (et non une liste)

Le changement clé par rapport à la V1 initiale (`{ items: [...] }`) : un module `projects` représente **un projet spécifique**, pas « la section projets » entière. Cela permet au générateur de CV de :

- choisir **quels projets inclure** (sélection de modules),
- choisir **comment présenter chaque projet** selon le poste visé (sélection de variante).

Avec l'ancienne approche, le générateur devait choisir entre des blocs entiers pré-composés. Avec cette approche, il compose la section lui-même à partir de briques atomiques.

### Pourquoi `tech` en tableau

Voir la version précédente du document. Résumé : rendu canonique (chips, badges, liste), indexation GIN possible, cohérence avec `bullets` dans `experience`.

### Pourquoi un seul `link`

Un lien suffit pour la plupart des projets (le repo contient la démo et la doc). Les cas multi-liens sont rares et peuvent être mentionnés dans `description`.

### Pourquoi `description` libre

L'accroche d'un projet s'adapte au contexte. Pas de structure imposée (STAR, PAR, etc.) — l'utilisateur formule dans le ton qui lui convient, et c'est précisément ce que les variantes permettent de faire varier.
