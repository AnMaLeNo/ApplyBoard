# `headline` — Accroche

[← Retour à l'index](../README.md)

L'**accroche** est le paragraphe d'introduction du CV : 2 à 4 phrases qui positionnent le candidat, mettent en avant son expérience clé et précisent ce qu'il cherche. C'est le bloc le plus retouché entre deux candidatures, et celui pour lequel le besoin de variantes est le plus évident.

## Mode d'édition

`text` — un champ texte multi-lignes (`<textarea>` 6 lignes par défaut côté UI).

## Schéma du `content`

```json
{
  "text": "string (requis)"
}
```

### Exemple

```json
{
  "text": "Développeur backend avec 5 ans d'expérience sur des architectures Node.js distribuées. J'ai notamment mené la migration d'un monolithe vers une douzaine de microservices chez Acme, en gardant un downtime nul. Je cherche aujourd'hui un poste de lead technique dans une scale-up à fort enjeu produit."
}
```

### Règles de validation (côté API)

Validateur dans [`backend/src/routes/cvModules.js`](../../../backend/src/routes/cvModules.js) (`contentValidatorsByKind.headline`) :

- `content` doit être un objet.
- `content.text` doit être présent et de type `string`.

Aucune contrainte sur le contenu de la chaîne (longueur, formatage). Les retours à la ligne (`\n`) sont conservés et rendus par le frontend via `whitespace-pre-line`.

## Justification architecturale

### Pourquoi un seul champ `text` et non plusieurs champs (`role`, `years`, `goal`...)

On aurait pu structurer l'accroche en composants atomiques : `{ role, experienceYears, targetPosition, valueProposition }`. Cette voie a été écartée parce que :

- Une accroche est un **texte de présentation** dont la valeur réside dans la formulation. Imposer une structure aurait obligé l'utilisateur à entrer des morceaux qu'un futur moteur de rendu aurait recollés — perte de naturel garantie.
- Les utilisateurs construisent leur accroche dans leur tête (ou la copient-collent d'un brouillon Word). Une saisie en champ unique colle à leur workflow réel.
- Si une UI plus avancée doit assister la rédaction plus tard (suggestions, comptage de caractères, etc.), elle peut le faire sans changer le schéma — elle remplit le `text` final.

### Pourquoi plusieurs variantes sont essentielles ici

C'est **le** kind pour lequel le besoin de variantes a été identifié dès la conception :

- Pour un poste de **lead tech**, l'accroche met en avant les responsabilités d'encadrement.
- Pour un poste de **dev senior individuel contributeur**, elle met en avant l'expertise technique.
- Pour une **candidature spontanée**, le ton est plus large que pour une réponse à une offre précise.

Un même profil produit facilement 3 à 6 variantes d'accroche dans sa carrière. Le `label` (« Pour startups », « Pour ESN », « Pour scale-up B2B », ...) est crucial pour s'y retrouver.

### Pourquoi pas de markdown ou de rich-text

Le `content` est du texte brut. Pas de balises, pas de markdown, pas de mise en gras. Raisons :

- Le rendu final dépendra du **template du CV**. Imposer du markdown dans le catalogue forcerait le moteur de rendu à le parser, alors que la sémantique reste « un paragraphe d'intro » — pas de structure interne à exploiter.
- Si demain on veut autoriser un peu de mise en forme (gras sur le rôle visé, par exemple), on ajoutera un champ `format: "plain" | "markdown"` à l'objet sans casser les variantes existantes.
