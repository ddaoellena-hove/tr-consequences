# Contexte vérifié

## Révisions et états au 29 octobre 2026

### Traffic Report

- Dépôt : `/Users/ddao-ellena/tr-consequences /traffic-report`.
- Branche : `main`.
- Commit applicatif de référence : `bb0fa13df904d5f3fb3a77771b2d7aa9b867682e` (dernier correctif de carte). Consulter le manifeste pour la révision et l’état Git au moment de cette mise à jour.
- Répertoire propre avant cette mise à jour documentaire ; les changements de passation sont distincts du commit applicatif.
- Stack : React 19.2.6, Vite 8.x, dépendance locale Cadence 1.0.0, sources sélectionnées dans `vendor/cadence-ui`.
- Validation : 11 tests unitaires lors de la livraison du dashboard ; contrôle statique des tokens et build Vite repassés après le dernier correctif CSS. Voir le complément dashboard pour les mesures navigateur.
- Contrôles navigateur effectués : débordement Cause, dates inversées et correction via résumé d’erreurs, récapitulatif, avancement par impact, navigation/historique à 390 px, rendu de bureau à 1280 px, footer avant/après défilement. Cela n’est pas une certification de tous les scénarios ou breakpoints.

### Cadence

- Dépôt : `/Users/ddao-ellena/hove-cadence-ui`.
- HEAD inspecté : `6314a549bfea418d939a8d8daa746605299eb087`.
- Version du manifeste : `1.0.0`. Ne pas déduire la version publiée sur npm de ce manifeste.
- Répertoire **non propre** : des changements préexistants touchent CHANGELOG.md, GUIDELINES.md, docs/HANDOFF.md, Drawer, PageHero et leurs stories/styles ; d’autres fichiers sont non suivis.
- Les snapshots incluent l’état lu du répertoire de travail, donc pas nécessairement le contenu exact du commit HEAD. Le manifeste identifie les copies par hash.
- Ne pas annuler, committer globalement ou réécrire les travaux préexistants.

## Ce qui a été construit

Un tableau de bord et un formulaire de déclaration de perturbation à partir de captures, adaptés à Cadence : navigation, informations générales, cinq étapes par impact, six sévérités, périodes avec heures, message voyageurs, récapitulatif, schéma animé, options d’affichage, brouillon local, historique, erreurs ciblées et footer fixe.

La migration a été progressive : prototype HTML/JS, React compilé avec esbuild, puis React + Vite ; composants élémentaires, coque, compositions, validation et responsive. L’exemple ne constitue pas une intégration backend : les données sont fictives et la validation finale n’effectue aucune diffusion voyageurs.

## Décisions de l’utilisateur à préserver

- Diatype pour les titres et textes de formulaire ; Uxum pour les rôles display prévus.
- Séparateur avant « Service modifié » dans le menu de sévérité.
- Bus latéral animé conservé après essai du pictogramme frontal ModeIcon Bus sur une branche, puis revert.
- PageSection en carte pour les informations générales et les impacts ; Accordion interne « Intitulé et cause ».
- Indicateur « Remplie » / « À compléter » lié aux mêmes règles que la validation générale.
- Padding de disclosure aligné sur le titre, 16/20, et graisse 400.
- Boutons compacts sm conservés ; ceci ne remplace pas automatiquement la règle générale md des formulaires.
- Actions de brouillon/validation visibles dans un footer non défilant, inspiré du Drawer formulaire.

## État actuel à distinguer des documents historiques

L’étude de cas complète a été rédigée avant le commit `b8c4e9c`. Sa rubrique sur les changements non committés décrit cet instant historique. Les migrations et le footer ont depuis été inclus dans ce commit et poussés.

Les anciens audits conservent des constats avant correction. Utiliser leur section de suivi et le code pour savoir si un défaut existe encore. Ne pas reproduire les anciens problèmes comme l’état actuel.

Le Site privé, GitHub et localhost sont des destinations distinctes. La publication privée du dernier correctif applicatif a réussi le 29 octobre 2026. Au point de référence applicatif ci-dessus, les dernières adaptations n’avaient pas encore été poussées sur GitHub. La présente livraison regroupe leur push avec la mise à jour de passation. La référence de cette passation est le code et les empreintes du manifeste.

## Limites fonctionnelles et techniques

- Le schéma et la validation sont encore adaptés à six arrêts fictifs et à une ligne de démonstration.
- Le dashboard et ses impacts ont des identifiants locaux stables. La géométrie des arrêts reste indexée ; aucune identité issue d’un référentiel transport ni couche API n’a été introduite.
- Le brouillon utilise localStorage ; aucune gestion de concurrence serveur, droits ou persistance multi-utilisateur.
- Les heures sont locales au navigateur ; la politique de fuseau d’un réseau réel n’est pas définie.
- Le bilan contient des propositions d’évolution de composants ; elles ne sont pas des fonctionnalités existantes.
- React + Vite est une base frontend viable. Cela ne prouve pas que le prototype est prêt pour une exploitation à fort volume. Ce sujet est distinct de la migration visuelle et ne justifie pas une réécriture de stack dans cette mission.

## Complément récent

Lire [Évolutions du tableau de bord](EVOLUTIONS-TABLEAU-DE-BORD.md) : composition TableCard, pictogrammes d’objet fournis, headers 44 px / icônes 24 px, fonds et arrondis, pastilles de sévérité et progression sans arrondi.
