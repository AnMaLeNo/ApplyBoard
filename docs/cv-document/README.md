# Document CV — guide d'assemblage pour un agent IA

Ce document est destiné à un **agent IA (LLM)** qui doit produire un CV final à partir des données stockées dans la table `cv_documents`. Il décrit comment lire la structure et **quelles règles suivre pour piocher** les bons éléments en fonction d'une offre d'emploi cible.

La structure JSON elle-même est définie dans [`backend/src/schemas/cvDocumentSchema.js`](../../backend/src/schemas/cvDocumentSchema.js). Cette page se concentre sur **l'usage**, pas sur le format.

## Vue d'ensemble du JSON

Le document complet d'un utilisateur ressemble à ceci :

```json
{
  "cv": {
    "title":     { "variants": ["...", "...", "..."] },
    "summary":   { "variants": ["...", "...", "..."] },

    "projects":   { "entry-1": { "title": {...}, "description": {...} }, "entry-2": {...} },
    "education":  { "entry-1": { "title": {...}, "description": {...} } },
    "hackathons": { "entry-1": { "title": {...}, "description": {...} } },

    "skills":    { "items": ["...", "...", "..."] },
    "interests": { "items": ["...", "...", "..."] }
  }
}
```

Trois familles de sections, donc trois logiques d'assemblage différentes.

## Les trois règles d'assemblage

### Règle 1 — `title` et `summary` : **une seule variante**

Ces deux sections sont des **blocs de variantes plates** : un tableau de chaînes, chacune étant une formulation alternative du même contenu.

```json
"title": {
  "variants": [
    "Développeur Backend Senior",
    "Lead Engineer · Plateformes distribuées",
    "Ingénieur logiciel orienté infrastructure"
  ]
}
```

➡️ **L'IA pioche UNE seule variante** (celle qui colle le mieux à l'offre) et l'utilise telle quelle dans le CV final. Les autres sont ignorées.

Même règle pour `summary`.

### Règle 2 — `projects`, `education`, `hackathons` : **N entrées, puis 1+1 par entrée**

Ces trois sections sont des **maps d'entrées**. Chaque clé représente une entrée distincte (un projet, un diplôme, un hackathon), et chaque entrée contient **deux blocs de variantes indépendants** : un pour le titre, un pour la description.

```json
"projects": {
  "entry-1": {
    "title": {
      "variants": [
        "Refonte du moteur de paie",
        "Migration legacy → service modernisé"
      ]
    },
    "description": {
      "variants": [
        "Réécriture du moteur en Rust, gains de 40% sur la latence p99.",
        "Pilotage technique d'une équipe de 3 ingénieurs sur 6 mois.",
        "Refonte de la couche de persistance, migration sans downtime."
      ]
    }
  },
  "entry-2": { ... }
}
```

➡️ Pour ces sections, l'assemblage se fait en **deux temps** :

1. **Choix des entrées** : l'IA sélectionne quelles entrées inclure (par exemple 3 projets sur 5), en fonction de la pertinence pour l'offre. Toutes les entrées ne doivent pas forcément apparaître dans le CV final.

2. **Choix des variantes dans chaque entrée retenue** : pour **chaque** entrée gardée, l'IA pioche **exactement une variante de titre** et **exactement une variante de description**. Les autres variantes de la même entrée sont ignorées.

Les choix de titre et de description sont **indépendants** : pour la même entrée, on peut prendre la variante de titre n°1 et la variante de description n°3 sans souci.

Cette mécanique permet par exemple de présenter un même projet avec un angle technique pour une offre, et avec un angle leadership pour une autre, sans dupliquer l'entrée.

### Règle 3 — `skills` et `interests` : **piochage libre dans une liste**

Ces sections sont des **listes plates d'items** :

```json
"skills": {
  "items": ["PostgreSQL", "React", "Rust", "Docker", "Kubernetes", "Terraform"]
}
```

➡️ L'IA **pioche autant d'items qu'elle veut** (zéro, un, plusieurs, tous) en fonction de la pertinence pour l'offre. Il n'y a pas de notion de variante ici — chaque item est lui-même la valeur finale.

L'ordre dans le CV final est libre.

## Récapitulatif

| Section            | Type de structure      | Combien d'éléments l'IA pioche ?                                  |
| ------------------ | ---------------------- | ----------------------------------------------------------------- |
| `title`            | bloc de variantes      | **1** variante                                                    |
| `summary`          | bloc de variantes      | **1** variante                                                    |
| `projects`         | map d'entrées          | **N** entrées, puis **1 titre + 1 description** par entrée gardée |
| `education`        | map d'entrées          | **N** entrées, puis **1 titre + 1 description** par entrée gardée |
| `hackathons`       | map d'entrées          | **N** entrées, puis **1 titre + 1 description** par entrée gardée |
| `skills`           | liste d'items          | **N** items                                                       |
| `interests`        | liste d'items          | **N** items                                                       |

## Exemple complet d'assemblage

**Source** (ce que l'IA lit) :

```json
{
  "cv": {
    "title": {
      "variants": ["Dev Backend Senior", "Lead Plateformes"]
    },
    "summary": {
      "variants": [
        "10 ans d'expérience backend, focus performance et fiabilité.",
        "Lead technique habitué aux migrations critiques."
      ]
    },
    "projects": {
      "p1": {
        "title": { "variants": ["Refonte paie", "Modernisation legacy"] },
        "description": {
          "variants": [
            "Réécriture en Rust, -40% latence.",
            "Pilotage de 3 ingés sur 6 mois."
          ]
        }
      },
      "p2": {
        "title": { "variants": ["Plateforme événementielle"] },
        "description": {
          "variants": ["Kafka + microservices, 1M evt/s."]
        }
      }
    },
    "education": { },
    "hackathons": { },
    "skills":    { "items": ["Rust", "PostgreSQL", "Kafka", "Docker", "React"] },
    "interests": { "items": ["Photographie", "Échecs", "Course à pied"] }
  }
}
```

**Cible** : une offre « Senior Backend Engineer · Distributed systems ».

**Décisions de l'IA** :

- `title` → 1 variante : **« Lead Plateformes »** (plus proche du sujet "distributed systems")
- `summary` → 1 variante : **« 10 ans d'expérience backend, focus performance et fiabilité. »**
- `projects` → garde **p1** et **p2** (les deux sont pertinents) :
  - p1 : titre **« Refonte paie »** + description **« Réécriture en Rust, -40% latence. »**
  - p2 : titre **« Plateforme événementielle »** + description **« Kafka + microservices, 1M evt/s. »**
- `skills` → pioche **Rust, PostgreSQL, Kafka, Docker** (ignore React, peu pertinent)
- `interests` → pioche **Échecs** (signale rigueur analytique) et ignore le reste

**CV final assemblé** (rendu libre, hors scope de cette doc) :

```
Lead Plateformes

10 ans d'expérience backend, focus performance et fiabilité.

Projets
  • Refonte paie — Réécriture en Rust, -40% latence.
  • Plateforme événementielle — Kafka + microservices, 1M evt/s.

Compétences : Rust · PostgreSQL · Kafka · Docker
Centres d'intérêt : Échecs
```

## Points d'attention

- **Une variante = un bloc atomique.** L'IA ne doit pas mélanger des morceaux de variantes différentes (pas de "fusion créative" entre deux titres). Si aucune variante ne convient, mieux vaut omettre la section que d'en fabriquer une.
- **Les clés des entrées (`p1`, `entry-1`, ...) sont opaques.** Elles ne doivent pas apparaître dans le CV final.
- **Une section peut être vide** (`{ "variants": [] }`, `{}`, `{ "items": [] }`) — dans ce cas l'IA n'inclut simplement rien pour cette section.
- **Aucun ordre n'est garanti.** Ni dans les variantes, ni dans les items, ni dans les entrées. L'IA choisit l'ordre du rendu final.
