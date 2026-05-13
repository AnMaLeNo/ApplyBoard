# `title` — Titre

[← Retour à l'index](../README.md)

Le **titre** d'un CV est typiquement la ligne qui suit immédiatement le nom : `Développeur Backend Senior`, `Étudiant en informatique`, `Lead Tech / Architecte`. C'est une **étiquette courte** qui positionne le candidat en quelques mots.

## Mode d'édition

`text` — un champ de saisie unique.

## Schéma du `content`

```json
{
  "text": "string (requis)"
}
```

### Exemple

```json
{
  "text": "Développeur Backend Node.js — 5 ans d'expérience"
}
```

### Règles de validation (côté API)

Validateur dans [`backend/src/routes/cvModules.js`](../../../backend/src/routes/cvModules.js) (`contentValidatorsByKind.title`) :

- `content` doit être un objet.
- `content.text` doit être présent et de type `string`.

Pas de longueur maximale imposée par la validation — la `VARCHAR(255)` du `label` borne la taille du libellé de variante, mais le `text` lui-même est libre puisque stocké en `JSONB`. Si on souhaite plus tard imposer une longueur (par ex. 120 caractères pour rester lisible sur une seule ligne), c'est à ajouter ici, pas en base.

## Justification architecturale

### Pourquoi `{ text: string }` et non juste une `string`

PostgreSQL `JSONB` accepterait `"Développeur Backend"` (chaîne nue) comme contenu valide. On a quand même choisi un objet `{ text: ... }` pour deux raisons :

- **Homogénéité de la forme `content`** : tous les kinds renvoient un objet (`{ text }` pour les `text`, `{ items }` pour les `tags` et `list`). Le code de rendu peut faire un seul `switch` sur `kind` sans avoir à gérer le cas particulier « ce kind a un contenu scalaire ».
- **Évolutivité non destructive** : si demain on veut ajouter `{ text, subtitle, color }`, on enrichit l'objet sans casser les variantes existantes. Avec une chaîne nue, on aurait dû migrer toute la colonne.

### Pourquoi plusieurs variantes ont du sens

À première vue, un CV n'a qu'un seul titre. Mais l'utilisateur prépare des CV pour des contextes variés :

- candidature spontanée vs réponse à une offre,
- alternance vs stage vs CDI,
- mise en avant du métier (`Développeur Backend`) ou du niveau (`Senior Engineer`).

Chaque ciblage justifie une variante distincte stockée à plat sous le même module « Titre ». L'utilisateur choisira la bonne au moment de monter un CV.

### Pourquoi pas de validation de longueur

Imposer une longueur maximale en V1 reviendrait à deviner les contraintes typographiques du futur moteur de rendu (taille de police, largeur de page, multi-ligne autorisé ou pas). Ces décisions appartiennent au système de rendu, pas au catalogue. Le catalogue reste « bête » et stocke ce que l'utilisateur saisit.
