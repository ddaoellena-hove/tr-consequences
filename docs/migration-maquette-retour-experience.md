# Migrer une maquette vers Hove Cadence : bilan et propositions de guidelines

**Projet de référence :** Traffic Report — déclaration de perturbation.  
**Période :** 28–29 octobre 2026.  
**Objectif :** restituer les changements réalisés depuis la capture initiale et en tirer une méthode réutilisable pour les futures migrations de maquettes.

Ce document prépare une mise à jour des guidelines. Il ne modifie pas le `GUIDELINES.md` du design system et ne transforme pas les décisions locales de Traffic Report en règles universelles.

## 1. Point de départ et résultat

La référence initiale était une capture d’un formulaire « Nouvelle perturbation prévue » : navigation latérale, informations générales repliées, sélection d’impact, étapes de saisie, sévérité, schéma de conséquences et actions de brouillon/validation.

La première version a reproduit cette structure avec des données fictives et des contrôles HTML/CSS/JavaScript. Elle est ensuite passée à React, puis à **React + Vite**, et a progressivement remplacé ses contrôles et compositions sur mesure par les composants Cadence.

Le résultat actuel comprend :

- un parcours en cinq étapes : périmètre, sévérité, période, message voyageurs, récapitulatif ;
- plusieurs impacts avec avancement distinct ;
- une section d’informations générales avec accordéon et indicateur de complétude ;
- six sévérités regroupées en catégories bloquantes et non bloquantes ;
- un schéma métier animé et des conséquences associées au choix de sévérité ;
- une sauvegarde/restauration locale du brouillon ;
- des erreurs de formulaire ciblées, un récapitulatif structuré et une liste de brouillons ;
- une navigation mobile, des étapes verticales sur petit écran et des champs empilables ;
- une barre d’actions fixe dans le cadre de l’application.

Le produit reste un prototype : aucune connexion métier à Traffic Report, aucune diffusion vers les voyageurs. La sauvegarde est propre au navigateur et à son origine.

## 2. Historique des changements

| Étape | Changement réalisé | Enseignement pour les guidelines |
|---|---|---|
| Base issue de la capture | Création du parcours, des impacts, du schéma et du brouillon local avec des styles provisoires | Une capture permet de reconstruire une intention ; elle ne fournit ni les API des composants ni toutes les règles métier |
| Import de Cadence local | Utilisation de `/Users/ddao-ellena/hove-cadence-ui`, bibliothèque React 1.0.0 ; import d’un sous-ensemble des sources et des polices | Rechercher la source du design system avant de réimplémenter ses contrôles |
| Première intégration React | PrimaryButton, GhostButton, Dropdown, TextInput, TextArea, Stepper, InlineAlert, Indicator, LineBadge, Icons | Migrer d’abord les contrôles élémentaires et leurs états |
| Passage à React + Vite | Entrée HTML racine, `src/main.jsx`, configuration Vite, serveur de développement et build de production | Vérifier explicitement la stack : une application React compilée avec esbuild seul n’est pas un projet Vite |
| Coque applicative | AppLayout, Sidebar, PageHeader, Breadcrumbs et badges de contexte | Commencer la composition par le squelette officiel, sans recalculer les décalages de sidebar |
| Six sévérités | Extension du modèle et adaptation des conséquences, du schéma et des options de rendu | Séparer modèle métier et présentation ; l’existence de couleurs dans une maquette ne certifie pas leur statut officiel |
| Audit et première migration globale | PageSection, Accordion, FormActions, ProgressBar, Modal, Toaster, DatePicker et composants de statut | Auditer aussi les assemblages et le feedback, pas uniquement les champs |
| Audit des styles | Suppression des styles JSX applicatifs ; couleurs et styles centralisés en tokens | Distinguer tokens officiels, extensions produit et géométrie calculée |
| Essai du pictogramme Bus | Remplacement sur une branche par `ModeIcon mode="bus"`, vérification puis retour au bus latéral à la demande de l’utilisateur | Un pictogramme officiel peut être inadapté à une illustration animée ; conserver l’essai et son annulation dans l’historique |
| Menu de sévérité coupé | Correction du débordement de la carte des impacts | Un `z-index` élevé ne permet pas de sortir d’un ancêtre qui coupe son contenu |
| Typographie du formulaire | Remplacement d’Uxum par Diatype pour les titres d’étape | Réserver Uxum aux rôles display ; les titres internes au formulaire restent en Diatype |
| Groupement des sévérités | Ajout d’un séparateur avant « Service modifié » via `DropdownOption.divider` | Utiliser l’API de groupement du composant plutôt qu’un séparateur dessiné à l’extérieur |
| Complétude générale | Indicator « Remplie » / « À compléter », calculé à partir de l’intitulé et de la cause | Un indicateur doit refléter une règle de validation et ne pas être une décoration permanente |
| Homogénéisation des sections | PageSection `surface="card"` pour les informations générales comme pour les impacts, avec Accordion interne « Intitulé et cause » | Dissocier enveloppe de section et comportement de disclosure |
| Alignement de l’accordéon | Padding 16/20 aligné sur l’en-tête et graisse 400 | Les ajustements de composition doivent être explicites, localisés et tokenisés |
| Second audit, puis application | ErrorSummary, DescriptionList, FieldRow, Toggle, EmptyState, SummaryList ; corrections de validation et de responsive | Une migration réussie couvre les erreurs, le focus, les contenus vides et la navigation entre objets |
| Menu Cause coupé | Correction du débordement du contenu de l’accordéon lorsqu’il est ouvert | Auditer tous les ancêtres ; la correction d’overflow sur la carte seule ne suffit pas |
| Barre d’actions persistante | Contenu défilant séparé du footer, sur le modèle d’un Drawer avec formulaire | Les actions restent hors de la zone qui défile ; aucun Drawer modal n’est nécessaire pour obtenir ce comportement |

## 3. Correspondance maquette → composants

| Intention visible dans une maquette | Composition retenue | Règle de migration proposée |
|---|---|---|
| Coque et navigation | AppLayout + Sidebar | Réutiliser la coque et ses règles de largeur |
| Titre de page et contexte | PageHeader + Breadcrumbs + Badge/Indicator | Un h1 ; des actions et statuts dans les emplacements prévus |
| Bloc titré encadré | PageSection `surface="card"` | Choisir la section par sa fonction, plutôt que détourner une Card de KPI |
| Bloc repliable dans une section | Accordion dans PageSection | Conserver une hiérarchie de titres cohérente et tester les overlays internes |
| État « rempli » | Indicator | Calculer la complétude avec les mêmes règles que la validation |
| Sélection courte | Dropdown | Employer les options, icônes et séparateurs de son API |
| Deux champs courts liés | FieldRow | Larges parts égales et alignement ; adapter le repli responsive dans l’application |
| Champs de proportions différentes | Grille applicative | FieldRow n’impose pas un remplacement si le ratio 2:1 est intentionnel |
| Date et heure début/fin | Deux DatePicker `withTime`, variante champ | Ne pas employer DateRangePicker si la version disponible ne prend pas les heures en charge |
| Message long | TextArea | Label, état d’erreur et helperText du composant |
| Parcours à étapes | Stepper + ProgressBar | La validation et l’avancement sont calculés par l’application |
| Erreurs après tentative de validation | ErrorSummary + erreurs près des champs | Rendre la cible visible avant de la focaliser |
| Récapitulatif | DescriptionList, avec LineBadge et Indicator | Utiliser une structure de propriétés, pas des chaînes concaténées avec des retours à la ligne |
| Options à effet immédiat | Toggle | Distinguer l’activation immédiate d’un choix en attente de soumission |
| Vitesse exclusive | SegmentedControl | Conserver un groupe court ; le désactiver lorsque l’animation est coupée |
| Liste de déclarations | SummaryList | Réserver DataTable aux besoins réels de comparaison ou de manipulation tabulaire |
| Aucun brouillon | EmptyState `size="inline"` | Prévoir l’état vide dès la composition |
| Messages de résultat | toast + Toaster | Un seul point de montage du Toaster |
| Explication d’une conséquence | InlineAlert informatif + Indicator de gravité | La gravité de l’événement transport n’est pas une erreur de saisie |
| Actions de formulaire | FormActions + boutons Cadence | Respecter l’ordre des actions et le contexte de densité |
| Actions persistantes | Footer de page séparé du contenu défilant | Reprendre l’anatomie d’un Drawer formulaire sans changer le type de page |
| Schéma des ruptures et demi-tours | PageSection + SVG/animation métier | Préserver les informations que le composant standard ne sait pas représenter |

## 4. Règles proposées pour les guidelines

### 4.1 Décomposer par intention avant d’écrire du code

Pour chaque zone de la maquette, identifier :

1. sa fonction : navigation, saisie, synthèse, statut, feedback, illustration ;
2. ses états : fermé/ouvert, vide/rempli, valide/invalide, actif/désactivé ;
3. ses dépendances : données métier, validation, contexte réseau, étapes précédentes ;
4. le composant existant et son API réelle ;
5. les écarts nécessitant une composition ou une extension.

Créer une table de correspondance avec trois décisions : **réutiliser**, **composer**, **conserver en spécifique**. Ne pas conclure à une équivalence sur la seule ressemblance d’une capture.

### 4.2 Appliquer la bonne typographie

- **ABC Diatype**, via `--cadence-font-sans` : labels, valeurs, boutons, descriptions, titres internes aux formulaires et libellés textuels du schéma.
- **Uxum Grotesque**, via `--cadence-font-display` : titre de page et rôles display prévus par le design system.
- **Spline Sans Mono** : uniquement pour les données appropriées et lorsque la police est effectivement chargée.
- La hiérarchie sémantique ne décide pas seule de la police : un h2/h3 de formulaire n’implique pas Uxum.

Le titre de page reste en h1 ; les grandes sections en h2 ; les étapes et disclosures internes utilisent le niveau approprié. Dans ce projet, le titre d’étape est une PageSection nue de niveau 3.

### 4.3 Utiliser les tokens sans masquer leur provenance

Le projet ne comporte plus de styles JSX applicatifs ni de couleurs brutes hors de son fichier de tokens. Il distingue :

- `--cadence-*` : tokens officiels de couleurs, surfaces, polices, rayons, ombres et statuts ;
- `--tr-*` : extensions locales de Traffic Report, centralisées dans `src/tokens.css` ;
- coordonnées SVG, trajectoires et durées calculées : données géométriques/de mouvement ;
- breakpoints CSS documentés : 760 et 1024 px ;
- proportions, zéros et mots-clés CSS : primitives de mise en page.

Les couleurs des six sévérités restent des tokens métier locaux. Elles ne deviennent pas des tokens officiels parce qu’elles ont été déplacées dans un fichier CSS.

**À ne pas généraliser :** Cadence autorise le layout inline et produit lui-même des styles calculés. La contrainte « aucun style JSX applicatif » est une convention de ce projet, pas une preuve que le DOM final sera dépourvu d’attributs style. Le contrôle automatisé ne vérifie ni tous les contrastes ni la pertinence sémantique de chaque token.

### 4.4 Concevoir les overlays avec leurs conteneurs

Deux défauts distincts ont été rencontrés :

1. PageSection en carte coupait le Dropdown de sévérité ;
2. Accordion coupait le Dropdown Cause malgré la correction de PageSection.

Pour chaque menu/calendrier/popover : vérifier le cadre, le corps défilant, les ancêtres à `overflow:hidden/auto`, l’arrondi, la couche et les panneaux inertes.

Correctifs locaux actuels : débordement visible sur les cartes concernées ; débordement visible sur le contenu de l’accordéon **uniquement lorsqu’il est ouvert**. La fermeture conserve ainsi sa logique de masquage.

**Évolution possible du design system, non réalisée ici :** proposer une gestion en portail pour les overlays qui doivent échapper aux conteneurs. Ne pas modifier silencieusement les sources vendored ; faire évoluer la source du composant, ses tests puis l’import.

### 4.5 Traiter la validation comme un parcours

- Centraliser les règles de complétude générale et de validation finale.
- Afficher les erreurs à proximité des champs ; utiliser l’API `state`/`helperText` lorsqu’elle existe.
- Quand l’API ne fournit pas d’état d’erreur externe, associer un message au groupe et au résumé, sans inventer de prop non supportée.
- Utiliser ErrorSummary après une tentative de progression/validation ; son lien doit conduire à un contrôle utilisable.
- Ouvrir l’accordéon et sélectionner le bon impact/la bonne étape avant de focaliser une cible cachée.
- Réserver InlineAlert aux erreurs générales et au feedback contextualisé.
- Dans la réalisation actuelle, la validation finale présente le premier groupe invalide rencontré ; elle n’expose pas une liste exhaustive de toutes les erreurs de toutes les étapes simultanément.

Les cibles du résumé sont des conteneurs stables `field-*`, à l’intérieur desquels Cadence cherche le premier contrôle visible et actif. Cette approche évite de dépendre des identifiants générés par les composants.

### 4.6 Sécuriser les champs de date contrôlés

La migration vers DatePicker en variante champ a révélé un point sensible : une édition locale n’est pas nécessairement une nouvelle valeur confirmée du composant.

- Normaliser les données restaurées avant de les passer aux contrôles ; une date invalide devient un champ à renseigner.
- Préserver les heures locales lors de la sérialisation ; ne pas introduire une conversion UTC involontaire.
- Distinguer valeur confirmée et édition en attente : ne pas valider l’étape avec l’ancienne date pendant qu’une saisie non confirmée est affichée.
- Stabiliser les objets Date passés au composant, ici avec `useMemo`. Recréer un objet Date à chaque rendu peut réinitialiser une saisie interne lors d’un changement d’état du parent.
- Tester une fin antérieure au début, une valeur vide/invalide, une correction, la confirmation au clavier et le retour depuis le résumé d’erreurs.

L’état d’édition et la confirmation gagneraient à être exposés par une API officielle du composant si ce besoin se répète ; le suivi `datePending` actuel est une adaptation applicative.

### 4.7 Isoler l’avancement de chaque objet

Un Stepper ne doit pas déclarer les étapes terminées uniquement parce que leur index précède l’étape affichée.

Dans le projet :

- chaque impact possède son étape courante et ses étapes complétées ;
- changer d’impact restaure son propre avancement ;
- un nouvel impact démarre au périmètre ;
- modifier une étape invalide ses états de complétion et ceux des étapes suivantes ;
- les règles de validation contrôlent les passages et la validation finale.

Le design system fournit l’affichage ; il ne déduit pas ces règles métier. L’avancement de session n’est pas pour autant un historique persistant : le brouillon sauvegarde les données, pas l’intégralité de l’état de navigation.

### 4.8 Prévoir le responsive dès le mapping

- La page utilise la largeur disponible ; les champs de lecture restent contenus à environ 720 px.
- Les rangées FieldRow se replient à 1024 px dans le CSS applicatif. **La version importée de FieldRow ne fournit pas elle-même ce breakpoint.**
- À 760 px et moins : navigation accessible via une Modal et bouton Menu ; Stepper vertical ; informations générales et actions empilables.
- Le schéma métier conserve une largeur géométrique et défile dans une zone identifiée avec `cadence-scrollbar`.
- Tester la place réellement disponible avec Sidebar ouverte et repliée, pas uniquement la largeur de la fenêtre.

Vérifications visuelles effectuées notamment à 390 et 1280 px. Une campagne exhaustive sur tous les écrans et tous les états reste distincte de ces contrôles.

### 4.9 Reprendre l’anatomie d’un Drawer pour les actions persistantes

Le pied fixe demandé à la fin de la conversation suit cette structure :

```text
AppLayout
└── cadre de contenu
    ├── contenu défilant
    │   ├── en-tête de page
    │   ├── sections de saisie
    │   ├── schéma et conséquences
    │   └── note de démonstration
    └── footer non défilant
        └── FormActions
            ├── état du brouillon
            └── enregistrer / valider
```

Le conteneur parent est en colonne ; le contenu prend l’espace disponible avec `flex:1` et `min-height:0` ; le footer ne rétrécit pas. La barre reste dans le cadre de l’application et suit sa largeur, sans coordonnées fixes dépendant de la Sidebar.

Ajouter un séparateur et une surface de footer issus des tokens. Prévoir le retour à la ligne des actions sur mobile et vérifier que le dernier contenu demeure accessible. La validation finale reste affichée à l’étape de récapitulatif, comme dans le parcours existant.

## 5. Décisions spécifiques à Traffic Report

Ces choix ont été validés pendant la conversation et doivent rester des exceptions ou des décisions produit documentées :

| Décision | Portée |
|---|---|
| Boutons de formulaire en `size="sm"` | Conserver sur ce projet ; ne pas remplacer la recommandation générale `md` sans arbitrage |
| « Intitulé et cause » en graisse 400, padding 16/20 | Ajustement local aligné avec l’en-tête de PageSection |
| Deux groupes de sévérités, séparés avant Service modifié | Règle métier, implémentée par l’API Dropdown |
| Six couleurs de sévérité | Extensions produit ; leur officialisation et leur contraste nécessitent une décision distincte |
| Ratio 2:1 pour intitulé/cause | Grille locale conservée ; FieldRow aurait changé cette proportion |
| Cause reste un Dropdown | La migration optionnelle vers SegmentedControl n’a pas été retenue |
| Nombre d’impacts reste un texte | Un Badge ne corrigeait pas un problème fonctionnel |
| Bus latéral animé spécifique | Essai de ModeIcon Bus abandonné après retour utilisateur ; ne pas le réintroduire automatiquement |
| SVG de conséquences spécifique | Le LineDiagram Cadence est destiné à la supervision des véhicules et ne couvre pas les ruptures/demi-tours du prototype |

DisruptionScopePicker, ServiceCalendar, Autocomplete, DataTable ou PageHero restent à envisager selon l’évolution du besoin ; leur simple présence au catalogue n’est pas une raison de les intégrer.

## 6. Import et traçabilité du design system

L’intégration utilise un paquet local versionné dans `vendor/cadence-ui`, avec :

- un script qui suit les dépendances locales des composants sélectionnés ;
- les polices ABC Diatype et Uxum servies depuis `/fonts` ;
- un manifeste de provenance : version, commit source et empreintes des fichiers ;
- des sources importées sans modification depuis le dossier Cadence ;
- un build qui fonctionne à partir de la copie du dépôt, sans dépendance au chemin absolu source.

Le script exclut les fichiers d’environnement et les identifiants du projet source. Les nouveaux composants ont été ajoutés au sous-ensemble importé, plutôt que recopiés sous des noms applicatifs.

Une composition qui utilise plusieurs composants Cadence, comme ConsequenceCard, peut rester applicative. Elle n’est pas un nouveau composant du design system tant que son usage reste spécifique au produit.

## 7. Processus de migration recommandé

1. **Lire la référence et la source du design system.** Relever les contenus, les interactions attendues et les règles encore inconnues.
2. **Inventorier les zones et états.** Produire le mapping composant/composition/spécifique avant la mise en œuvre.
3. **Installer la coque et les fondations.** Stack, polices, tokens, navigation, en-tête et sections.
4. **Migrer les contrôles par fonction.** Vérifier props, variantes, gabarits, labels et possibilités de groupement.
5. **Brancher les règles métier.** Complétude, états par objet, brouillons, validation, dates et conséquences.
6. **Composer les états non nominaux.** ErrorSummary, erreurs locales, EmptyState, listes et notifications.
7. **Vérifier les conteneurs.** Menus ouverts, calendriers, accordéons, zones qui défilent et pied d’actions.
8. **Tester le responsive.** Champs, navigation, étapes, synthèse et actions ; distinguer défilement métier et débordement accidentel.
9. **Documenter les écarts.** Justification, portée, propriétaire et conditions de réexamen ; conserver les décisions utilisateur.
10. **Livrer un état vérifiable.** Contrôles exécutés, limites, branche/commit et destination de publication explicites.

Les essais de pictogrammes ou de compositions à valider visuellement peuvent être isolés dans une branche. Un retour arrière explicite conserve la traçabilité ; il évite de présenter un essai rejeté comme une recommandation future.

## 8. Critères d’acceptation à intégrer aux guidelines

- [ ] Chaque zone de la maquette possède une décision de mapping justifiée.
- [ ] Les composants standard sont importés, avec leurs variantes réelles, plutôt qu’imités.
- [ ] Les polices chargées correspondent aux rôles utilisés ; Diatype dans les formulaires.
- [ ] Les titres, sections et disclosures ont une hiérarchie accessible.
- [ ] Les erreurs conduisent à des champs visibles, actifs et correctement nommés.
- [ ] Aucun menu ouvert n’est coupé par une carte ou un accordéon ; augmenter le z-index n’est pas le seul contrôle effectué.
- [ ] Les dates éditées ne sont pas confondues avec les anciennes valeurs confirmées.
- [ ] L’avancement est indépendant pour chaque objet répété.
- [ ] Les champs et les actions restent utilisables sur petit écran.
- [ ] La barre persistante ne masque pas le contenu ni les cibles d’erreur.
- [ ] Les états vide, erreur, désactivé et rempli sont pris en compte.
- [ ] Les tokens locaux ne sont pas présentés comme officiels ; les exceptions géométriques sont explicites.
- [ ] Les choix refusés par l’utilisateur ne sont pas proposés à nouveau par une migration automatique.
- [ ] Les règles métier importantes ont des tests pertinents et le build réussit.
- [ ] La vérification navigateur couvre les overlays, la correction d’erreur et au moins un format mobile et un format bureau.

Commandes disponibles dans le projet :

```bash
npm test
npm run check:tokens
npm run build
```

Les quatre tests actuels couvrent les champs généraux, le tronçon, la période et le message. Le contrôle de tokens est statique et ciblé sur `src/`. Les vérifications navigateur réalisées sont manuelles via l’outil d’automatisation ; elles ne constituent pas une suite de tests end-to-end enregistrée dans le dépôt.

## 9. État de livraison et points à distinguer

Les changements ont été mis à disposition dans l’aperçu local. Plusieurs versions antérieures ont également été publiées sur un Site privé. Les demandes de commit/push ont été exécutées aux étapes correspondantes ; le dernier commit poussé identifié avant l’audit du 29 octobre est `f880d6c`.

Au moment de rédaction, l’application de l’audit du 29 octobre et la barre d’actions fixe sont présentes dans le répertoire de travail, avec des changements non committés. Le site privé publié, `main` sur GitHub et l’aperçu local ne doivent donc pas être supposés identiques.

L’ajout de ce fichier ne vaut ni commit, ni push, ni nouvelle publication. L’état des sources reste la référence pour distinguer ce qui est appliqué localement et ce qui est livré à distance.

## 10. Références pour mettre à jour les guidelines

- [Audit de la première migration](component-audit.md).
- [Audit des tokens et exceptions](token-audit.md).
- [Audit global du 29 octobre, avec état avant/après migration](interface-audit-2026-10-29.md).
- [Composition actuelle du parcours](../src/app.jsx).
- [Schéma métier et animation](../src/LineDiagram.jsx).
- [Tokens produit](../src/tokens.css) et [styles de composition](../src/styles.css).
- [Règles de validation](../src/validation.mjs) et [tests](../tests/validation.test.mjs).
- [Script d’import de Cadence](../scripts/import-cadence.py) et [provenance](../vendor/cadence-ui/provenance.json).

Pour la mise à jour du design system, intégrer d’abord les enseignements dans les rubriques **migration depuis une maquette**, **typographie**, **composition de formulaire**, **overlays et overflow**, **validation/dates**, **responsive** et **actions persistantes**. Conserver les exceptions Traffic Report dans une fiche projet et soumettre séparément les évolutions d’API des composants.
