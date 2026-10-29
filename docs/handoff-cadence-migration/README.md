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
