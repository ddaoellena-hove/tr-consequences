# Traffic Report — Déclaration de perturbation

Prototype React + Vite basé sur la capture fournie, intégré au Hove Cadence Design System local 1.0.0.

## Installation et compilation

Prérequis : Node.js 22.12 ou supérieur.

- `npm ci` : installer les dépendances.
- `npm run dev` : démarrer Vite sur http://localhost:4173 avec React Fast Refresh.
- `npm run build` : générer la version de production dans `dist/`.
- `npm run preview` : contrôler le build de production sur http://localhost:4174.

`index.html` est le point d’entrée Vite, `src/main.jsx` initialise React et `src/app.jsx` contient le parcours. Les polices Cadence sont copiées automatiquement dans `public/fonts/` avant le développement et la compilation. Les fichiers générés dans `dist/` sont conservés pour le déploiement Sites.

Le paquet `@ddaoellena/cadence-ui` est une dépendance locale versionnée dans `vendor/cadence-ui`. Les sources des composants utilisés et leurs dépendances locales y sont copiées sans modification, avec leur empreinte SHA-256 et le commit source dans `provenance.json`. Le prototype ne dépend pas d’un chemin absolu pour compiler.

Pour synchroniser une nouvelle version locale : `python3 scripts/import-cadence.py /Users/ddao-ellena/hove-cadence-ui`, puis `npm install` et `npm run build`. Le script ne lit ni les fichiers d’environnement, ni les configurations privées, ni les identifiants du projet source.

## Composants Cadence intégrés

PrimaryButton, GhostButton, Dropdown, TextInput, TextArea, Stepper, InlineAlert, Indicator, LineBadge, Icons, Sidebar, AppLayout, Avatar, PageHeader, Breadcrumbs, Accordion, PageSection, FormActions, ProgressBar, Modal, Toaster, DatePicker, Checkbox, SegmentedControl, Badge. Tokens officiels, ABC Diatype et Uxum Grotesque servis localement.

Voir [l’audit et les choix de migration](docs/component-audit.md). Le schéma animé reste spécifique au métier (ruptures et demi-tours non couverts par le LineDiagram de supervision Cadence).

## Périmètre

Parcours en cinq étapes, plusieurs impacts indépendants, sévérité et périmètre reliés au schéma, validation des tronçons/périodes/messages, sauvegarde et restauration du brouillon dans le navigateur. La validation finale vérifie tous les impacts, sans diffusion métier.

Les données, les sévérités supplémentaires et leurs conséquences sont illustratives et restent à confirmer. Aucun raccordement au produit Traffic Report. Les dates s’interprètent dans le fuseau local du navigateur.

## Vérification des tokens

`npm run check:tokens` contrôle les styles applicatifs. Les extensions Traffic Report sont centralisées dans `src/tokens.css`. Voir [l’audit des tokens et ses exceptions](docs/token-audit.md) pour distinguer tokens Cadence, tokens produit, géométrie SVG et styles calculés internes à la bibliothèque.
