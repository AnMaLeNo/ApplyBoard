# `custom` — Module personnalisé

[← Retour à l'index](../README.md)

Le kind **`custom`** est l'échappatoire générique pour tout bloc qui n'entre dans aucun des 8 autres kinds. Exemples : « Langues », « Certifications », « Publications », « Conférences données », « Distinctions », « Voyages ». Plutôt que d'enfler le catalogue avec un kind par cas particulier, on offre une option de **texte libre** qui couvre tout ce qui reste.

## Mode d'édition

`text` — un champ texte multi-lignes (`<textarea>`).

## Schéma du `content`

```json
{
  "text": "string (requis)"
}
```

### Exemples

Langues :

```json
{
  "text": "Français : natif\nAnglais : courant (TOEIC 945)\nEspagnol : intermédiaire (B1)\nAllemand : notions"
}
```

Certifications :

```json
{
  "text": "AWS Certified Solutions Architect Associate (2024)\nCertified Kubernetes Administrator (2023)\nProfessional Scrum Master I (2022)"
}
```

Conférences données :

```json
{
  "text": "« Migration progressive d'un monolithe Rails », DevoxxFR 2024\n« Observabilité bottom-up », Paris.JS 2023"
}
```

### Règles de validation (côté API)

Validateur dans [`backend/src/routes/cvModules.js`](../../../backend/src/routes/cvModules.js) (`contentValidatorsByKind.custom`) :

- `content` doit être un objet.
- `content.text` doit être présent et de type `string`.

C'est strictement le même contrat que [`title`](title.md) et [`headline`](headline.md). La distinction se fait au niveau du `kind` du module, pas du schéma.

## Justification architecturale

### Pourquoi avoir un `custom` plutôt qu'enrichir la liste de kinds (`languages`, `certifications`, ...)

Chaque kind ajouté au catalogue impose :

- une entrée dans l'enum `CHECK` du `cv_modules.kind`,
- un validateur dédié dans `contentValidatorsByKind`,
- un éditeur dédié dans [`KIND_EDITORS`](../../../frontend/src/utils/cvModuleKinds.js),
- une page de documentation,
- un template de rendu, le jour où on génère un CV.

C'est rentable pour les blocs structurés (`education`, `experience`, ...) où la structure apporte de la valeur. Ça l'est moins pour des blocs qui sont déjà fondamentalement du texte (langues, certifications, publications), où la diversité des cas légitimes empêche d'imposer une structure unique :

- les langues peuvent se rendre comme barres, étoiles, niveaux, ou texte libre,
- les certifications peuvent inclure ou non la date, l'organisme, le score,
- les publications suivent des conventions disciplinaires (APA, IEEE, Chicago, ...) qu'on ne va pas réimplémenter.

`custom` offre donc une **soupape** : si un utilisateur veut un bloc inhabituel, il peut le créer sans attendre une mise à jour du produit.

### Pourquoi le même schéma que `title`/`headline` et non un schéma plus permissif

Tentation : autoriser n'importe quel JSON dans `custom.content`. Refusé parce que :

- Un consommateur (l'UI, plus tard le moteur de rendu) doit pouvoir lire `content.text` sans avoir à faire de cas particulier par utilisateur.
- Si on autorise « n'importe quoi », l'utilisateur va peut-être essayer de glisser un sous-objet structuré (`{ items: [...] }`) — qu'aucun template ne saura rendre, faute de schéma documenté.

Le contrat reste simple : **un module `custom` est un bloc textuel libre**. L'utilisateur peut bien sûr utiliser le markdown ou structurer son texte avec des sauts de ligne — c'est lui qui contrôle le rendu via le texte qu'il saisit.

### Pourquoi ne pas exposer un constructeur de schéma utilisateur

Une voie alternative aurait été : « `custom` permet à l'utilisateur de définir ses propres champs structurés ». C'est tentant — on aurait pu modéliser une section `Langues` avec `{ items: [{ name, level }] }`. Refusé parce que :

- Bâtir une UI de constructeur de schéma est un produit en soi (champ-glissé-déposé, validation, prévisualisation, ...).
- L'utilisateur n'attend pas un éditeur de schéma ; il attend un **endroit pour mettre du texte qui ne rentre nulle part ailleurs**. La simplicité bat l'expressivité ici.
- Si plus tard un kind structuré devient demandé (« Langues »), on l'ajoute au catalogue plutôt qu'on le délègue à l'utilisateur.

### Quand promouvoir un `custom` vers un kind dédié

Heuristique pour les itérations futures : si on observe que **plus de 30% des utilisateurs créent au moins un module `custom` nommé `Langues`** (ou un synonyme), c'est le signal qu'il faut un kind `languages` propre, avec sa structure et son template. On migrera alors les contenus existants par script — la conservation du `text` brut permet de toujours retomber sur ses pieds.
