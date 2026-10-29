# Brief de contribution — compléter Hove Cadence UI

Ce brief est destiné à un développeur ou un LLM chargé de compléter Cadence à partir des besoins observés pendant le développement de Traffic Report. Il décrit des propositions à concevoir, pas des composants ou des API déjà disponibles.

## Contexte et références

- Dépôt cible : `/Users/ddao-ellena/hove-cadence-ui`.
- Projet de référence : `/Users/ddao-ellena/tr-consequences /traffic-report` — attention à l’espace finale dans `tr-consequences `.
- Passation : `docs/handoff-cadence-migration/` dans Traffic Report.
- Référence applicative : commit `e91b7166dd9a7eda0df67f3927e54a84e1abd806`, poussé sur `main`.
- Documentation du parcours : [Parcours complet](snapshots/traffic-report/docs/parcours-nouvelle-perturbation.md) et [Adaptation du parcours Figma](snapshots/traffic-report/docs/figma-objets-impactes.md).

Avant toute modification, lire les instructions du dépôt cible, ses guidelines, les composants existants et ce dossier. Inspecter l’état Git et préserver tous les travaux préexistants. Vérifier les API dans la version courante : les constats portent sur la version utilisée par Traffic Report.

La base existante a permis de composer le parcours avec Drawer, Autocomplete, ModeFilter, PageSection et TableCard. Les besoins portent surtout sur les formulaires complexes et les patterns réutilisables. Réutiliser ces briques avant de créer de nouveaux composants.

## 1. Validation homogène des champs — P1

### Problème observé

TextInput, Dropdown, Autocomplete et DatePicker n’exposent pas tous le même contrat de validation. Traffic Report ajoute des enveloppes, des messages et des associations accessibles dans l’application.

### Besoin

Définir un contrat cohérent pour :

- Libellé, aide et caractère obligatoire.
- Erreur provenant du formulaire ou du serveur.
- États désactivé et lecture seule, selon le contrôle.
- Associations `aria-describedby`, `aria-invalid` et identifiants stables.
- Accès au contrôle par une ref pour le focus depuis ErrorSummary.

Évaluer un composant **FormField** commun, sans doubler les libellés déjà rendus par les contrôles. Les noms de props doivent être conçus en tenant compte des API existantes.

### Acceptation

Les champs d’un formulaire mixte affichent et annoncent les erreurs de manière cohérente. ErrorSummary peut déplacer le focus vers chaque contrôle.

## 2. Contrat de saisie et de confirmation des dates — P1

### Problème observé

DatePicker transmet principalement une valeur confirmée. L’application doit aussi savoir si l’utilisateur est en train de saisir une date invalide ou non confirmée.

### Besoin

Distinguer explicitement :

- Valeur confirmée.
- Saisie en cours.
- Saisie invalide.
- Confirmation, annulation et effacement.

Concevoir les événements nécessaires sans imposer leurs noms avant étude de l’API actuelle.

### Cas indispensables

- Une saisie invalide ne permet pas de valider silencieusement l’ancienne valeur.
- Corriger une date pour revenir à sa valeur initiale ne laisse pas le formulaire bloqué.
- Un rendu du parent ne réinitialise pas la saisie.
- Effacer une valeur facultative est possible.
- DatePicker et TimePicker suivent des conventions compatibles.

### Acceptation

Aucune inspection du DOM ni capture d’événements autour du composant n’est nécessaire pour connaître son état de saisie.

## 3. Positionnement partagé des overlays — P1

### Problème observé

Des menus ont été coupés par les cartes, accordéons et zones défilantes. Augmenter le `z-index` ne résout pas le clipping d’un ancêtre.

### Besoin

Étudier une infrastructure commune pour Dropdown, Autocomplete et les sélecteurs temporels :

- Portail lorsque nécessaire.
- Positionnement selon l’espace disponible.
- Repositionnement pendant le scroll et le redimensionnement.
- Largeur du menu cohérente avec le déclencheur.
- Gestion des overlays imbriqués dans Drawer et Modal.
- Ordre de fermeture avec Échap.
- Maintien du focus et compatibilité avec les zones inertes.

### Acceptation

Les menus restent utilisables dans une carte, un Accordion ouvert, un Drawer et une Modal, sans correctif global d’`overflow` dans l’application.

## 4. Éditeur de texte riche — P1

### Problème observé

La maquette de communication prévoit du texte enrichi. La version intégrée de Cadence ne fournit pas cet éditeur ; Traffic Report utilise TextArea.

### Besoin

Concevoir un éditeur accessible comprenant au minimum :

- Paragraphes et retours à la ligne.
- Gras, italique et listes.
- Liens.
- Annuler/rétablir.
- Compteur et limites de contenu.
- Aide, erreurs, lecture seule et désactivation.
- Navigation clavier de la barre d’outils.

Définir un format de contenu stable, sa sérialisation, le rendu en lecture et la gestion du contenu collé. Prévoir une conversion en texte simple pour les canaux qui l’exigent.

### Acceptation

Le contenu peut être enregistré, rechargé et affiché sans perte. Les commandes ne dépendent pas uniquement de la souris. Les fonctionnalités avancées de la maquette doivent être arbitrées séparément.

## 5. Pattern de sélection transactionnelle dans un Drawer — P2

### Problème observé

Le composant Drawer existe. La logique recherche → configuration → sélection temporaire → confirmation a été assemblée dans Traffic Report.

### Besoin

Créer une recette ou un pattern réutilisable couvrant :

- Recherche et filtres.
- Configuration d’un résultat.
- Ajout à une sélection temporaire.
- Consultation, modification et retrait des éléments préparés.
- Déduplication selon une identité fournie par le produit.
- Confirmation globale.
- Annulation sans modification des données initiales.
- États vide, chargement, erreur et aucun résultat.

### Acceptation

Fermer ou annuler laisse les données initiales intactes. Confirmer applique la sélection une seule fois. La logique fonctionne avec des objets génériques, sans dépendance au transport.

## 6. Groupes de champs répétables — P2

### Problème observé

Les périodes, propriétés et blocs de communication répètent la même structure d’ajout et de suppression.

### Besoin

Évaluer une composition réutilisable avec :

- Identifiants stables.
- Titre et numérotation d’affichage.
- Actions Ajouter et Supprimer.
- Nombre minimal ou maximal configurable.
- Erreurs par groupe.
- Focus sur le nouveau groupe après ajout.
- Focus pertinent après suppression.

### Acceptation

Supprimer un groupe ne transfère pas ses valeurs, erreurs ou états aux autres. La numérotation ne sert pas d’identité métier. La validation métier reste dans l’application.

## 7. Pattern de planification — P2

### Besoin

Composer les contrôles temporels existants pour gérer :

- Une ou plusieurs périodes continues.
- Des créneaux récurrents sur une plage de dates.
- Les jours de semaine.
- Les heures de début et de fin.
- Les créneaux se terminant le lendemain.
- L’ajout et la suppression des règles.
- Un résumé lisible de la planification.

Définir explicitement les conventions : bornes inclusives/exclusives, heures égales, chevauchements et conservation des saisies lors d’un changement de mode.

Documenter la responsabilité du produit pour les fuseaux et changements d’heure.

### Acceptation

Les exemples couvrent périodes inversées, absence de jour applicable, créneau de nuit et changement d’heure. La logique temporelle est testable indépendamment du rendu.

## 8. Layout de formulaire avec actions persistantes — P2

### Problème observé

FormActions existe, mais le footer persistant du formulaire nécessite une composition locale autour d’AppLayout.

### Besoin

Étudier un emplacement dédié ou un pattern officiel comprenant :

- Corps défilant.
- Actions hors du scroll.
- Largeur suivant le contenu lorsque la Sidebar change.
- Retour à la ligne sur mobile.
- Accès au dernier champ sans recouvrement.
- Coexistence avec les menus et calendriers ouverts.

### Acceptation

Aucun calcul applicatif de position fondé sur la largeur de la Sidebar n’est nécessaire.

## 9. Checkbox avec libellé et description — P2

### Problème observé

Les listes de directions, jours et accès nécessitent des assemblages Checkbox + texte.

### Besoin

Compléter l’API existante ou proposer une composition officielle avec :

- Libellé associé.
- Description facultative.
- Zone de libellé cliquable.
- États coché, indéterminé et désactivé.
- Erreur et aide accessibles.
- Contenu complémentaire, par exemple un badge de ligne.

Examiner Checkbox et RichCheckbox avant de créer une nouvelle variante.

### Acceptation

Cliquer le texte active la case, le clavier fonctionne et le nom accessible n’est pas annoncé deux fois.

## 10. Patterns métier transport — bibliothèque Hove partagée

Ces besoins doivent être évalués séparément des composants génériques de Cadence :

- Sélection de lignes et directions.
- Distinction arrêt précis / zone d’arrêt.
- Sélection de tronçons et consultation des arrêts intermédiaires.
- Sélection d’entrées/sorties.
- Choix de courses et consultation des horaires.
- Carte récapitulative d’un objet impacté.
- Convention d’utilisation des pictogrammes d’objet, des modes et des badges de ligne.

Prévoir des adaptateurs de données et des identifiants stables. Ne pas intégrer les données de démonstration de Traffic Report comme référentiel officiel.

La cartographie, les horaires réels, la recherche serveur et l’envoi des messages restent des intégrations produit.

## Contraintes et livrables

- Distinguer **composant**, **évolution d’API**, **pattern documenté** et **intégration métier**.
- Préserver les usages existants ; documenter toute rupture.
- Utiliser les tokens et conventions typographiques Cadence.
- Ajouter des stories couvrant les états, le clavier et le responsive.
- Ajouter des tests de comportement pertinents.
- Mettre à jour les guidelines et la documentation d’API.
- Fournir les exemples de migration depuis les adaptations locales de Traffic Report.
- Ne pas présenter ces propositions comme déjà réalisées.

**Ordre recommandé :** validation des champs → contrat des dates → overlays → éditeur riche → patterns de composition.
