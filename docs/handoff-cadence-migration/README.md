# Passation — guidelines Cadence et guide de migration

Préparée le **29 octobre 2026** à partir du projet Traffic Report. Ce dossier est destiné à un autre LLM ou à un développeur chargé de :

1. mettre à jour les guidelines de Hove Cadence à partir des enseignements vérifiés du projet ;
2. créer un guide réutilisable pour migrer une maquette, une capture ou un prototype HTML vers Cadence.

## Démarrer

Copier le contenu de [PROMPT.md](PROMPT.md) dans une nouvelle conversation ouverte sur le dépôt Cadence. Joindre ce dossier ou son archive si les deux dépôts locaux ne sont pas accessibles.

Ordre de lecture :

1. [Mission et consignes](PROMPT.md).
2. [Contexte, état des dépôts et limites](CONTEXTE.md).
3. [Matrice des changements à intégrer](MISE-A-JOUR-GUIDELINES.md).
4. [Base du guide de migration](GUIDE-MIGRATION-BASE.md).
5. [Modèles et critères de livraison](MODELES-ET-ACCEPTATION.md).
6. [Évolutions du tableau de bord et des cartes](EVOLUTIONS-TABLEAU-DE-BORD.md).
7. [Étude de cas complète Traffic Report](snapshots/traffic-report/docs/migration-maquette-retour-experience.md).

Les fichiers dans `snapshots/` sont des **références figées**, pas une autorisation de modifier les composants. Ils n’incluent ni identifiants, ni fichiers d’environnement, ni polices commerciales. Le manifeste [manifest.json](manifest.json) en donne les empreintes et les révisions source.

## Livrables attendus dans Cadence

- `GUIDELINES.md` : précisions ciblées et liens vers le guide, sans dupliquer les fiches API.
- `docs/MIGRATION-TO-CADENCE.md` : procédure autonome pour les projets suivants.
- `docs/case-studies/traffic-report-migration.md` : décisions locales, essais abandonnés et exemples.
- `docs/templates/migration-audit.md` : grille réutilisable avant/après migration.
- `README.md` : lien d’entrée vers le guide.
- Mise à jour ciblée du changelog ou du handoff si les conventions du dépôt le demandent.

Aucune évolution d’API n’est nécessaire pour livrer cette documentation. Les lacunes de composants doivent devenir des propositions séparées et explicitement marquées comme non réalisées.

## Mise à jour du 29 octobre 2026

Le dossier couvre désormais le dashboard et le formulaire. Les copies source Traffic Report ont été actualisées ; des copies des composants Cadence effectivement embarqués complètent les références du checkout DS. Les archives et empreintes ont été régénérées. La passation ne signifie pas que les guidelines du design system ont déjà été modifiées.

Dernier complément : [Champs des informations générales](INFORMATIONS-GENERALES.md).

Dernière extension : [Parcours complet en cinq étapes](snapshots/traffic-report/docs/parcours-nouvelle-perturbation.md). Cette référence complète les états historiques précédents.

Complément Figma : [Drawer d’ajout d’objets et parcours par type](snapshots/traffic-report/docs/figma-objets-impactes.md). Il remplace la modale de choix de type décrite dans les premiers états du prototype.

Contributions à Cadence : [Brief des besoins en composants et patterns pour un autre LLM](BESOINS-COMPOSANTS-CADENCE.md).

### Schémas multiples et ouverture du panneau

Un aperçu par ligne et par tronçon remplace la limitation au premier tronçon. Voir `src/consequence-diagrams.mjs` et ses tests dans les snapshots. Le bouton annonce la sélection multiple ; l’aide évite le jargon. Le panneau est monté fermé pour conserver l’animation d’entrée Cadence lors du chargement différé. Détails et limite de géométrie : `docs/figma-objets-impactes.md` du projet.

## PageSection : présentation validée

Voir [PageSection — surface validée](PAGESECTION-SURFACE-VALIDEE.md) pour l’anatomie, les tokens, les espacements et la proposition d’intégration dans Cadence. Cette fiche décrit une évolution de composant à réaliser dans une mission distincte de la mise à jour documentaire.

## Navigation du formulaire

La navigation est désormais regroupée dans le footer fixe : stepper compact, contexte de l’impact à sa droite, progression en haut et actions d’enregistrement à droite, précédées de leur statut. Précédent / Suivant restent dans la section Impacts. Sur mobile, liste des étapes dans un Dropdown ouvrant vers le haut. Voir le snapshot de `docs/parcours-nouvelle-perturbation.md` et `src/CompactImpactStepper.jsx`. Cette composition locale reste à formaliser comme variante Cadence si elle est retenue.
