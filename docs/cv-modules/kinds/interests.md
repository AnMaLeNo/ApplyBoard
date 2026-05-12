# `interests` — Centres d'intérêt

[← Retour à l'index](../README.md)

Le bloc **centres d'intérêt** liste les passions, loisirs, engagements associatifs ou activités extra-professionnelles. Bloc traditionnellement bref, qui sert moins à informer qu'à donner un point d'accroche en entretien (« je vois que vous faites de l'escalade, j'en fais aussi »).

## Mode d'édition

`tags` — liste de chaînes courtes, saisies comme des chips (Entrée ou virgule pour ajouter).

## Schéma du `content`

```json
{
  "items": ["string", "string", "..."]
}
```

Chaque entrée est une chaîne courte, lisible telle quelle.

### Exemple

```json
{
  "items": ["Escalade en salle", "Photographie argentique", "Lecture de SF", "Bénévolat aux Restos du Cœur"]
}
```

### Règles de validation (côté API)

Validateur dans [`backend/src/routes/cvModules.js`](../../../backend/src/routes/cvModules.js) (`contentValidatorsByKind.interests`) :

- `content` doit être un objet.
- `content.items` doit être un `string[]` (tableau dont chaque élément est une `string`).

Aucune contrainte sur le contenu individuel des chaînes.

## Justification architecturale

### Pourquoi `string[]` et pas `Item[]` avec sous-champs

On aurait pu structurer chaque intérêt en `{ name, level, since, frequency }`. Refusé parce que :

- Un centre d'intérêt **se résume en quelques mots** dans 99% des cas. Un objet structuré aurait été disproportionné.
- L'utilisateur préfère taper « Escalade en salle » que remplir 4 champs.
- Si un intérêt mérite plus de contexte (« Marathon : 3 finishs en 3h30 »), l'utilisateur le met dans la même chaîne. Pas besoin de schéma.

### Pourquoi `{ items: [...] }` et non directement un tableau `[]`

Cohérence avec les autres kinds. Le `content` racine est toujours un objet, ce qui :

- évite d'avoir un cas particulier dans le code de rendu (`if (Array.isArray(content)) ... else ...`),
- laisse une porte ouverte pour ajouter une métadonnée plus tard (`{ items, sortBy }` par exemple) sans casser le schéma.

### Pourquoi un kind distinct de `skills` alors que la structure est identique

Sur le plan technique, `interests` et `skills` ont le même schéma `{ items: string[] }`. Pourtant ce sont deux kinds différents parce que :

- La **sémantique** diffère totalement. Les compétences sont des outils maîtrisés (recherchables, valorisables) ; les centres d'intérêt sont du contexte humain.
- Le **template de rendu** est différent. Les compétences apparaissent souvent en haut/en colonne ; les centres d'intérêt en bas, parfois en une ligne.
- Le **classement par catégories** pourrait diverger à terme. Si demain on enrichit `skills` avec des regroupements (`{ items: [{ category, skills }] }`), on n'a pas envie de l'imposer aux centres d'intérêt.

Garder les deux séparés laisse l'évolution indépendante.

### Pourquoi rien empêche un intérêt « long » comme `"Bénévolat associatif (3 ans dans une association d'aide aux devoirs)"`

L'absence de longueur maximale est volontaire. Si l'utilisateur veut détailler, il peut. La cohérence visuelle (tags courts) est encouragée par l'UI (chips compacts) mais pas imposée par le schéma. Si une donnée trop longue casse le rendu d'un futur template, la responsabilité revient au template (tronquer, wrap, ...) et non au catalogue.
