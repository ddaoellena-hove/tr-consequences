# Traffic Report — Déclaration de perturbation

Prototype React basé sur la capture fournie, intégré au Hove Cadence Design System local 1.0.0.

## Installation et compilation

`npm ci` puis `npm run build`. Servir `dist/` avec un serveur HTTP statique.

Le paquet `@ddaoellena/cadence-ui` est une dépendance locale versionnée dans `vendor/cadence-ui`. Les sources des composants utilisés et leurs dépendances locales y sont copiées sans modification, avec leur empreinte SHA-256 et le commit source dans `provenance.json`. Le prototype ne dépend pas d’un chemin absolu pour compiler.

Pour synchroniser une nouvelle version locale : `python3 scripts/import-cadence.py /Users/ddao-ellena/hove-cadence-ui`, puis `npm install` et `npm run build`. Le script ne lit ni les fichiers d’environnement, ni les configurations privées, ni les identifiants du projet source.

## Composants Cadence intégrés

PrimaryButton, GhostButton, Dropdown, TextInput, TextArea, Stepper, InlineAlert, Indicator, LineBadge et Icons. Tokens officiels, ABC Diatype et Uxum Grotesque servis localement. La composition de la page et le schéma métier restent spécifiques au prototype ; le logo texte reste provisoire.

## Périmètre

Parcours en cinq étapes, plusieurs impacts indépendants, sévérité et périmètre reliés au schéma, validation des tronçons/périodes/messages, sauvegarde et restauration du brouillon dans le navigateur. La validation finale vérifie tous les impacts, sans diffusion métier.

Les données, les sévérités supplémentaires et leurs conséquences sont illustratives et restent à confirmer. Aucun raccordement au produit Traffic Report. Les dates s’interprètent dans le fuseau local du navigateur.
