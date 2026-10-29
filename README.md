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


## Migration de l’audit du 29 octobre

`npm test` vérifie les règles de validation. La saisie utilise maintenant ErrorSummary, DescriptionList, FieldRow, Toggle, EmptyState et SummaryList, en complément des composants déjà intégrés. Les dates avec heures utilisent DatePicker en variante champ. L’avancement est indépendant pour chaque impact ; les champs invalides sont accessibles depuis le résumé.

Sur petit écran, la navigation passe par une modale Cadence et le Stepper devient vertical. Le schéma de conséquences conserve son bus et sa géométrie métier, dans une PageSection avec défilement horizontal identifié.

## Tableau de bord

Le tableau de bord est l’entrée par défaut. Il reprend la maquette sous forme de TableCard Cadence : statuts En cours / À venir / Passées / Brouillons, vues par perturbation ou par impact, recherche, filtres, tri, sélection et pagination. Un Drawer permet de consulter le détail. Duplication et suppression confirmée agissent sur les données de démonstration enregistrées localement. La création et la modification ouvrent le formulaire existant.

Les données du tableau sont conservées sous `traffic-report-records-v1` ; l’ancien brouillon reste accessible via `traffic-report-draft`. Les dates d’initialisation sont relatives au jour de création du jeu de démonstration pour peupler les quatre statuts. Aucune connexion backend ni diffusion voyageurs. Le formulaire et le schéma conservent une limite de six arrêts de démonstration, même si la ligne et les libellés peuvent varier par déclaration.

Sources : `src/Dashboard.jsx`, `src/dashboard-data.mjs`, `src/traffic-model.mjs`. Tests de données et de persistance dans `tests/dashboard.test.mjs`. Les couleurs des badges de ligne sont des données GTFS de démonstration, conformément à l’exception LineBadge.
