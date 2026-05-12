# `hackathons` — Hackathons

[← Retour à l'index](../README.md)

Le bloc **hackathons** liste les événements compétitifs auxquels le candidat a participé.

## Mode d'édition

`fields` — formulaire à champs plats. **Une variante = une présentation d'un seul hackathon.**

Le module représente l'entité « hackathon » (ex. module nommé « Hackathon BNP 2024 »). Chaque variante est une présentation différente : mise en avant du classement, du projet réalisé, de l'équipe, selon la cible. Le générateur de CV **sélectionne quels hackathons inclure** et **quelle variante** de chacun afficher.

## Schéma du `content`

```json
{
  "name":        "string (requis) — nom du hackathon",
  "year":        "string (optionnel) — année ou date courte",
  "description": "string (optionnel) — projet réalisé, contexte, équipe",
  "prize":       "string (optionnel) — classement ou prix obtenu"
}
```

### Exemple

```json
{
  "name": "Hackathon BNP Paribas",
  "year": "2024",
  "description": "48h pour développer un assistant IA d'aide à la déclaration d'impôts. Équipe de 4 (2 devs, 1 designer, 1 product).",
  "prize": "2e prix — Catégorie meilleure UX"
}
```

Exemple de deux variantes du même module :

```json
{ "name": "Hackathon BNP Paribas", "year": "2024", "description": "Assistant IA fiscal en 48h — 2e prix UX.", "prize": "2e prix" }

{ "name": "Hackathon BNP Paribas", "year": "2024", "description": "48h pour concevoir et livrer un assistant IA d'aide à la déclaration d'impôts. Rôle : lead backend (API Python/FastAPI, intégration LLM). Équipe pluridisciplinaire de 4 personnes.", "prize": "2e prix — Catégorie meilleure UX" }
```

### Règles de validation (côté API)

Validateur dans [`backend/src/routes/cvModules.js`](../../../backend/src/routes/cvModules.js) (`contentValidatorsByKind.hackathons`) :

- `content` doit être un objet (pas un tableau).
- `content.name` doit être présent et de type `string`.
- `year`, `description`, `prize`, s'ils sont présents, doivent être des `string`.

## Justification architecturale

### Pourquoi une variante = un hackathon unique

Même logique que pour `projects` et `education`. Le générateur choisit quels hackathons montrer et dans quelle version selon le poste visé.

### Pourquoi `prize` est une `string` libre

Les hackathons ne suivent pas une nomenclature standardisée (1er prix, 2e prix, coup de cœur, finaliste sur 200 équipes...). Une chaîne libre préserve la formulation exacte du jury.

### Pourquoi pas de champ `link`

Les hackathons s'incarnent rarement par un lien public. Si le projet a survécu en open source, l'utilisateur peut le créer aussi comme module `projects`.
