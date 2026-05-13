# Système des Modules de CV

> **Documentation obsolète.** Ce dossier décrit l'ancien système basé sur les tables `cv_modules` et `cv_module_variants`. Depuis le pivot vers la table unique `cv_documents` (un JSONB par utilisateur, variantes au niveau du champ), cette documentation n'est plus d'actualité et n'est pas maintenue. Conservée à titre historique.

---

Documentation technique du système permettant à un utilisateur de stocker, organiser et faire évoluer les **briques réutilisables de son CV** : titre, accroche, formations, projets, hackathons, centres d'intérêt, compétences, expériences professionnelles, modules personnalisés.

À ce stade, la fonctionnalité ne génère pas un CV complet ; elle constitue le **catalogue de briques** sur lequel la génération s'appuiera dans une itération future.

## Sommaire

- [Concept général](#concept-général)
- [Modèle de données](#modèle-de-données)
- [Cycle de vie d'une variante](#cycle-de-vie-dune-variante)
- [Surface API](#surface-api)
- [Validation du `content`](#validation-du-content)
- [Liste des types de modules (`kind`)](#liste-des-types-de-modules-kind)
- [Décisions architecturales](#décisions-architecturales)

## Concept général

Un CV est composé de **sections** (« titre », « accroche », « expériences », ...). Pour chaque section, un utilisateur peut vouloir préparer **plusieurs formulations** selon la cible visée (startup vs grand compte, poste backend vs lead tech, candidature spontanée vs réponse à une offre, etc.).

Le domaine modélise cette idée en deux concepts :

- **Module** : une brique nommée, typée par un `kind`. Pour les kinds `text`/`tags`, le module est une section (`kind=headline`, nommé « Accroche dev backend »). Pour les kinds `fields`, le module est une entité individuelle (`kind=experience`, nommé « Lead Backend @ Acme »). Le module appartient à un `user_id` et son `kind` est fixe après création.
- **Variante** : une instance concrète prête à insérer dans un CV. Chaque variante est rattachée à un module et porte un `label` (qui sert à choisir la bonne variante au moment de monter un CV) et un `content` JSON dont la structure dépend du `kind` du module parent.

Pour les kinds **`text`** et **`tags`** (`title`, `headline`, `custom`, `skills`, `interests`), une variante représente un **bloc complet** — le générateur choisit quelle variante utiliser. Pour les kinds **`fields`** (`education`, `projects`, `hackathons`, `experience`), une variante représente **une présentation d'une entité unique** — le générateur choisit quels modules inclure et quelle variante de chacun afficher.

```
User
 ├── CV Module (kind = headline, name = "Accroche dev backend")   ← bloc complet
 │     ├── Variant (label = "Pour startups",       content = { text: "..." })
 │     └── Variant (label = "Pour grands comptes", content = { text: "..." })
 │
 ├── CV Module (kind = experience, name = "Lead Backend @ Acme")  ← entité unique
 │     ├── Variant (label = "Axe technique",    content = { role, company, bullets: [...] })
 │     └── Variant (label = "Axe leadership",   content = { role, company, bullets: [...] })
 │
 └── CV Module (kind = experience, name = "Dev @ Beta")           ← entité unique
       └── Variant (label = "Standard", content = { role, company, bullets: [...] })
```

## Modèle de données

Le schéma est défini dans [`backend/src/db/init.js`](../../backend/src/db/init.js) (deux `CREATE TABLE IF NOT EXISTS` ajoutés à `initDB()`).

### Table `cv_modules`

| Colonne      | Type                         | Notes                                                                                        |
| ------------ | ---------------------------- | -------------------------------------------------------------------------------------------- |
| `id`         | `SERIAL PRIMARY KEY`         |                                                                                              |
| `user_id`    | `INTEGER NOT NULL`           | `REFERENCES users(id) ON DELETE CASCADE` — la suppression d'un user purge ses modules        |
| `kind`       | `VARCHAR(32) NOT NULL`       | `CHECK` enum : `title`, `headline`, `education`, `projects`, `hackathons`, `interests`, `skills`, `experience`, `custom` |
| `name`       | `VARCHAR(255) NOT NULL`      | Libellé libre choisi par l'utilisateur                                                       |
| `created_at` | `TIMESTAMP WITH TIME ZONE`   | Défaut `CURRENT_TIMESTAMP`                                                                   |
| `updated_at` | `TIMESTAMP WITH TIME ZONE`   | Mise à jour explicite sur PATCH                                                              |

Index : `idx_cv_modules_user_created (user_id, created_at DESC)` pour le listing par utilisateur.

### Table `cv_module_variants`

| Colonne      | Type                         | Notes                                                                                        |
| ------------ | ---------------------------- | -------------------------------------------------------------------------------------------- |
| `id`         | `SERIAL PRIMARY KEY`         |                                                                                              |
| `module_id`  | `INTEGER NOT NULL`           | `REFERENCES cv_modules(id) ON DELETE CASCADE` — suppression du module ⇒ purge des variantes  |
| `label`      | `VARCHAR(255) NOT NULL`      | Libellé court pour identifier la variante (« Pour startups », « Version courte », ...)       |
| `content`    | `JSONB NOT NULL`             | Bloc structuré, schéma défini par le `kind` du module parent (voir pages dédiées)            |
| `created_at` | `TIMESTAMP WITH TIME ZONE`   |                                                                                              |
| `updated_at` | `TIMESTAMP WITH TIME ZONE`   |                                                                                              |

Index : `idx_cv_module_variants_module (module_id, created_at DESC)`.

Le choix `JSONB` (et non plusieurs colonnes typées) est volontaire : la **forme du contenu dépend du `kind`** du module parent. Avoir des colonnes spécifiques par type (`degree`, `role`, `company`, ...) imposerait soit une explosion de colonnes nullables, soit une table par kind. Le `JSONB` permet une seule colonne, indexable au besoin, et la validation se fait à l'API.

## Cycle de vie d'une variante

1. **Création du module** : `POST /api/cv-modules` avec `{ kind, name }`. Le `kind` est figé pour la vie du module.
2. **Création d'une variante** : `POST /api/cv-modules/:id/variants` avec `{ label, content }`. L'API lit le `kind` du module parent, valide le `content` contre le schéma de ce `kind`, puis insère.
3. **Mise à jour d'une variante** : `PATCH /api/cv-module-variants/:id`. Le `label` et/ou le `content` peuvent évoluer. Le `kind` du parent est relu pour revalider `content`.
4. **Suppression** : `DELETE /api/cv-module-variants/:id` (variante) ou `DELETE /api/cv-modules/:id` (module — cascade automatique sur les variantes via la FK).

Le `kind` d'un module n'est **pas modifiable** par l'API : changer le kind invaliderait toutes les variantes existantes (leur `content` ne respecterait plus le bon schéma). Si l'utilisateur veut « changer » un module de kind, il supprime puis recrée — explicite, sans risque silencieux.

## Surface API

Les routes sont définies dans [`backend/src/routes/cvModules.js`](../../backend/src/routes/cvModules.js). Toutes nécessitent l'authentification (cookie `authToken`) et vérifient l'appartenance via `user_id`.

| Méthode | Chemin                                  | Description                                            |
| ------- | --------------------------------------- | ------------------------------------------------------ |
| `POST`  | `/api/cv-modules`                       | Crée un module (`kind`, `name`)                        |
| `GET`   | `/api/cv-modules`                       | Liste les modules de l'utilisateur + variantes embarquées (via `json_agg`) |
| `GET`   | `/api/cv-modules/:id`                   | Détail d'un module + ses variantes                     |
| `PATCH` | `/api/cv-modules/:id`                   | Renomme un module (`name` uniquement)                  |
| `DELETE`| `/api/cv-modules/:id`                   | Supprime un module et ses variantes (cascade)          |
| `POST`  | `/api/cv-modules/:id/variants`          | Crée une variante (`label`, `content`)                 |
| `PATCH` | `/api/cv-module-variants/:id`           | Met à jour une variante (`label` et/ou `content`)      |
| `DELETE`| `/api/cv-module-variants/:id`           | Supprime une variante                                  |

Codes :
- `401` si non authentifié
- `404` si la ressource n'existe pas **ou** appartient à un autre utilisateur (on n'expose pas la distinction)
- `400` si la structure du `content` ne respecte pas le schéma du `kind` parent
- `200` / `201` sinon

## Validation du `content`

La validation est implémentée dans [`backend/src/routes/cvModules.js`](../../backend/src/routes/cvModules.js) sous forme d'un mapping `contentValidatorsByKind` : à chaque `kind` correspond une fonction qui prend un `content` et renvoie soit `null` (valide), soit un message d'erreur. Cette validation est appelée :

- à la création de variante (`POST .../variants`) après avoir lu le `kind` du parent ;
- à la mise à jour (`PATCH .../cv-module-variants/:id`) si un nouveau `content` est fourni.

Côté frontend, la forme du JSON est pilotée par le mode d'édition (`text`, `tags`, `list`) déclaré dans [`frontend/src/utils/cvModuleKinds.js`](../../frontend/src/utils/cvModuleKinds.js). Les schémas attendus sont documentés en détail dans les pages dédiées ci-dessous.

## Liste des types de modules (`kind`)

| Kind         | Mode d'édition | Page                                          |
| ------------ | -------------- | --------------------------------------------- |
| `title`      | `text`         | [Titre](kinds/title.md)                       |
| `headline`   | `text`         | [Accroche](kinds/headline.md)                 |
| `education`  | `list`         | [Diplômes & formations](kinds/education.md)   |
| `projects`   | `list`         | [Projets & réalisations](kinds/projects.md)   |
| `hackathons` | `list`         | [Hackathons](kinds/hackathons.md)             |
| `interests`  | `tags`         | [Centres d'intérêt](kinds/interests.md)       |
| `skills`     | `tags`         | [Compétences](kinds/skills.md)                |
| `experience` | `list`         | [Expériences professionnelles](kinds/experience.md) |
| `custom`     | `text`         | [Module personnalisé](kinds/custom.md)        |

Les **trois modes d'édition** (`text`, `tags`, `fields`) sont une convention frontend qui dicte l'UI et la forme générale du `content` :

- **`text`** → `{ text: string }`. Une seule zone de texte. Le générateur choisit **1 variante**.
- **`tags`** → `{ items: string[] }`. Liste de chaînes (chips dans l'UI). Le générateur choisit **1 variante** (ou N modules thématiques).
- **`fields`** → objet structuré dont les clés dépendent du `kind`. Une variante = une entité unique (un projet, un poste, un diplôme, un hackathon). Le générateur **sélectionne N modules** de ce type et **1 variante par module**.

Cette distinction est fondamentale pour la future génération automatique de CV :

| Kind          | Mode     | Le générateur…                                                    |
| ------------- | -------- | ----------------------------------------------------------------- |
| `title`       | `text`   | choisit 1 variante parmi les variantes du module                  |
| `headline`    | `text`   | choisit 1 variante parmi les variantes du module                  |
| `custom`      | `text`   | choisit 1 variante parmi les variantes du module                  |
| `skills`      | `tags`   | choisit N modules thématiques, 1 variante par module              |
| `interests`   | `tags`   | choisit 1 variante du module (ou l'ignore)                        |
| `education`   | `fields` | choisit quels modules inclure + 1 variante par module             |
| `projects`    | `fields` | choisit quels modules inclure + 1 variante par module             |
| `hackathons`  | `fields` | choisit quels modules inclure + 1 variante par module             |
| `experience`  | `fields` | choisit quels modules inclure + 1 variante par module             |

## Décisions architecturales

### Pourquoi deux tables et pas une seule

Une table à plat (`cv_blocks`) avec une colonne `group_name` aurait permis de stocker variantes et regroupement dans un seul endroit. On a choisi deux tables (`cv_modules` + `cv_module_variants`) car :

- Le **renommage du regroupement** (le `name` du module) est une opération courante qu'on veut atomique — une seule ligne à mettre à jour, et non N variantes.
- L'intégrité référentielle (cascade à la suppression) est explicite via la FK `module_id`, plutôt qu'implicite via une chaîne dupliquée.
- L'**API liste** peut renvoyer `modules[].variants[]` en une requête (`json_agg`) sans dédoublonner le module côté client.

### Pourquoi un enum figé pour `kind`

Un type ENUM PostgreSQL ou un `CHECK` figé peut sembler restrictif comparé à un texte libre. On a choisi un `CHECK` parce que :

- Le **rendu d'un CV** s'appuiera sur le `kind` pour décider quel template visuel appliquer (un bloc « expérience » ne se rend pas comme un bloc « accroche »). Un kind non typé sémantiquement ferait reposer toute l'intelligence sur le frontend, qui n'a pas de moyen de deviner.
- La **validation du `content`** dépend du `kind`. Sans liste fermée, on devrait soit accepter n'importe quel JSON, soit demander à l'utilisateur de définir son propre schéma — un constructeur de schéma est hors scope V1.
- Le `kind` `custom` est **l'échappatoire** pour les besoins atypiques : texte libre, sans contrainte de structure.

### Pourquoi `content` en `JSONB` et non en colonnes typées

- Le contenu d'une variante est **fortement hétérogène** entre kinds (un `experience` n'a rien en commun avec un `headline`). Une table par kind serait correct mais multiplierait les routes et la complexité.
- `JSONB` permet d'indexer si besoin (`->`, `@>`, GIN index) sans casser la souplesse.
- La validation au boundary API garantit que le JSON respecte la forme attendue. Les invariants restent forts là où ça compte.

### Pourquoi les kinds `fields` utilisent « module = entité » et non « module = section »

Pour `education`, `projects`, `hackathons`, `experience`, le module représente **une entité unique** (un poste, un projet, un diplôme), et non la section entière. Cette décision permet au générateur de CV de :

- **sélectionner les entités pertinentes** pour le poste visé (ex. inclure 3 postes sur 5, ceux liés au domaine cible),
- **choisir indépendamment la présentation** de chaque entité (ex. bullets axés leadership pour un poste, bullets axés technique pour un autre).

L'alternative — « module = section, variante = toute la liste » — obligerait à dupliquer des blocs entiers pour changer un seul détail, et priverait le générateur de toute granularité de sélection. La contrepartie est que la section finale du CV est **composée** par le générateur à partir de plusieurs modules, plutôt que directement stockée comme un bloc.

### Pourquoi pas de champ `position` en V1

L'ordre des modules ou des items à l'intérieur d'une variante n'a pas d'intérêt tant qu'on ne génère pas le CV. Lorsque la génération arrivera, on ajoutera soit :

- un champ `position INT` (réordonnancement explicite côté UI),
- ou un champ d'ordonnancement au niveau du « projet CV » (le document final référence les variantes dans l'ordre souhaité, ce qui découple ordre et catalogue).

Le second choix paraît plus propre — une même variante pourrait apparaître à des positions différentes dans deux CV — mais la décision est repoussée à l'itération qui en a besoin.
