# `education` — Diplômes & formations

[← Retour à l'index](../README.md)

Le bloc **formations** regroupe le parcours académique : diplômes obtenus, écoles, années, optionnellement quelques précisions.

## Mode d'édition

`fields` — formulaire à champs plats. **Une variante = une présentation d'un seul diplôme.**

Le module représente l'entité « formation » (ex. module nommé « Master Informatique — Paris-Saclay »). Chaque variante est une présentation différente : mention du mémoire ou non, description longue ou courte, selon si la cible est une entreprise tech ou un cabinet RH. Le générateur de CV **sélectionne quelles formations inclure** et **quelle variante** de chacune afficher.

## Schéma du `content`

```json
{
  "degree":      "string (requis) — nom du diplôme",
  "school":      "string (requis) — établissement",
  "year":        "string (optionnel) — année ou plage (ex. \"2020-2023\")",
  "description": "string (optionnel) — spécialité, mention, mémoire, ..."
}
```

### Exemple

```json
{
  "degree": "Master en Informatique",
  "school": "Université Paris-Saclay",
  "year": "2021-2023",
  "description": "Spécialité systèmes distribués. Mémoire sur la cohérence éventuelle en bases NoSQL."
}
```

Exemple de deux variantes du même module (avec/sans détail) :

```json
{ "degree": "Master en Informatique", "school": "Université Paris-Saclay", "year": "2021-2023", "description": "Spécialité systèmes distribués. Mention Très Bien." }

{ "degree": "Master en Informatique", "school": "Université Paris-Saclay", "year": "2021-2023" }
```

### Règles de validation (côté API)

Validateur dans [`backend/src/routes/cvModules.js`](../../../backend/src/routes/cvModules.js) (`contentValidatorsByKind.education`) :

- `content` doit être un objet (pas un tableau).
- `content.degree` et `content.school` doivent être présents et de type `string`.
- `year` et `description`, s'ils sont présents, doivent être des `string`.

## Justification architecturale

### Pourquoi une variante = un diplôme unique

Même logique que pour `projects` : le générateur de CV choisit quelles formations inclure (sélection de modules) et comment les présenter (sélection de variante). Un module par diplôme permet de composer « la section formations version courte » (bac + master) vs « version complète » (bac + licence + master) sans dupliquer l'ensemble.

### Pourquoi `year` est une `string`

Une formation s'exprime rarement comme une date précise. Les formes courantes sont : `2021`, `2021-2023`, `Depuis 2024`, `En cours`. Forcer un type `Date` imposerait une normalisation que l'utilisateur ne souhaite pas.

### Pourquoi `degree` et `school` requis, le reste optionnel

Un item de formation sans diplôme ni école n'a pas d'information minimum lisible. À l'inverse, l'année peut être volontairement omise (lutte contre l'âgisme) et la description est cosmétique.
