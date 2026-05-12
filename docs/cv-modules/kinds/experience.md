# `experience` — Expériences professionnelles

[← Retour à l'index](../README.md)

Le bloc **expériences professionnelles** décrit un poste occupé : rôle, entreprise, dates, réalisations clés.

## Mode d'édition

`fields` — formulaire à champs plats. **Une variante = une présentation d'un seul poste.**

Le module représente l'entité « poste » (ex. module nommé « Lead Backend @ Acme »). Chaque variante est une présentation différente du même poste : bullets axés sur le leadership pour un poste de lead, bullets axés sur la technique pour un poste d'IC, version courte vs version complète. Le générateur de CV **sélectionne quels postes inclure** et **quelle variante** de chacun afficher.

## Schéma du `content`

```json
{
  "role":     "string (requis) — intitulé du poste",
  "company":  "string (requis) — entreprise / employeur",
  "start":    "string (optionnel) — date de début (format libre)",
  "end":      "string (optionnel) — date de fin ou \"En cours\"",
  "location": "string (optionnel) — ville ou ville+pays, télétravail, ...",
  "bullets":  "string[] (optionnel) — réalisations / responsabilités clés"
}
```

### Exemple

```json
{
  "role": "Lead Backend Engineer",
  "company": "Acme Corp",
  "start": "Janvier 2022",
  "end": "En cours",
  "location": "Paris (hybride)",
  "bullets": [
    "Pilotage de la migration d'un monolithe Rails vers 12 microservices Node.js (downtime nul sur 18 mois).",
    "Encadrement technique d'une équipe de 5 développeurs : code review, mentorat, recrutement.",
    "Mise en place d'une plateforme d'observabilité (Prometheus + Grafana + Loki) couvrant 100% des services."
  ]
}
```

Exemple de deux variantes du même module pour deux cibles différentes :

```json
{
  "role": "Lead Backend Engineer", "company": "Acme Corp", "start": "Janvier 2022", "end": "En cours",
  "bullets": ["Management de 5 ingénieurs (recrutement, montée en compétences, OKR).", "Pilotage de la roadmap technique en lien avec le CPO."]
}

{
  "role": "Lead Backend Engineer", "company": "Acme Corp", "start": "Janvier 2022", "end": "En cours",
  "bullets": ["Migration monolithe → 12 microservices Node.js, downtime nul.", "Mise en place observabilité full-stack (Prometheus/Grafana/Loki)."]
}
```

### Règles de validation (côté API)

Validateur dans [`backend/src/routes/cvModules.js`](../../../backend/src/routes/cvModules.js) (`contentValidatorsByKind.experience`) :

- `content` doit être un objet (pas un tableau).
- `content.role` et `content.company` doivent être présents et de type `string`.
- `start`, `end`, `location`, s'ils sont présents, doivent être des `string`.
- `bullets`, s'il est présent, doit être un `string[]`.

## Justification architecturale

### Pourquoi une variante = un poste unique

C'est le kind pour lequel le gain est le plus évident. Un même poste de Lead Backend peut se présenter de façons radicalement différentes :

- Pour une **scale-up tech** : bullets axés sur la profondeur technique (archi, perf, infra).
- Pour un **grand compte** : bullets axés sur le leadership, la gestion de projet, la transversalité.
- Pour un **poste de management** : bullets sur les personnes encadrées, les processus mis en place.

Avec une variante par poste, le générateur choisit quelle facette montrer sans avoir à recomposer la section entière. Deux postes différents restent deux modules différents, et le générateur sélectionne combien et lesquels inclure.

### Pourquoi `bullets` est un `string[]` et non un champ texte multi-ligne

Les réalisations d'un poste sont par essence une liste à puces dans un CV. Un tableau permet :

- rendu canonique (le moteur choisit la puce et l'indentation),
- manipulation par item (réordonner, copier un bullet d'une variante à l'autre),
- validation future (longueur max par bullet, nombre max de bullets, etc.).

### Pourquoi `start`/`end` en `string` libre

Les formats sont trop variés : `Janvier 2022`, `Sept. 2019`, `En cours`, `Été 2020`. Forcer une `Date` ISO imposerait un date-picker là où l'utilisateur préfère taper.

### Pourquoi `role` et `company` requis

Un poste sans intitulé ni employeur n'a aucune valeur informative. `location` et les dates sont optionnels car certains profils les masquent volontairement.
