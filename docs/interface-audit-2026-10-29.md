# Audit global de l’interface — 29 octobre 2026

## Périmètre et conclusion

Audit de `src/app.jsx`, `src/LineDiagram.jsx`, des styles et tokens, du catalogue local Hove Cadence UI 1.0.0 et de ses guidelines. Parcours observé dans le navigateur local : informations générales, sévérité, période, message et récapitulatif. La modale et ses états vide/rempli ont été examinés dans le code ; le responsive a été examiné dans les règles CSS, sans campagne multi-écrans. Ce rapport décrit le code local, pas une garantie de synchronisation du site publié.

L’interface utilise déjà Cadence pour la majorité de ses contrôles. La prochaine migration devrait viser la composition et la validation du formulaire, plutôt qu’un remplacement général des composants.

Aucun composant ni comportement de l’application n’a été modifié pendant cet audit.

## Priorités proposées

| Priorité | Zone et référence applicative | Constat | Migration ou adaptation proposée | Effort |
|---|---|---|---|---|
| P1 | Informations générales — `app.jsx:321`, `accordion.css:72` | Le menu **Cause est visuellement coupé** : reproduit dans l’accordéon ouvert. L’override d’overflow sur PageSection ne suffit pas, car Accordion conserve `overflow:hidden` sur son contenu. | Corriger la composition des overlays. À court terme, autoriser le débordement du contenu uniquement lorsque cet accordéon est ouvert, vérifier l’animation de fermeture. À terme, rendre les menus Dropdown en portail via les primitives d’overlay de Cadence. Augmenter le z-index seul ne résout pas le clipping. | Faible pour le correctif local ; moyen pour une correction du design system |
| P1 | Validation — `app.jsx:208`, `app.jsx:231`, `app.jsx:455` | Un seul texte d’erreur est affiché dans InlineAlert, sans cible de champ ni état d’erreur local. Une erreur sur l’intitulé ouvre l’accordéon mais reste affichée dans le panneau des impacts. | **ErrorSummary** après validation, avec accès aux champs et focus ; **TextInput/TextArea `state="error"` + `helperText`**. Conserver InlineAlert pour les erreurs de stockage ou générales. L’app doit ouvrir le bon impact, la bonne étape et l’accordéon avant de focaliser les cibles. | Moyen |
| P2 | Récapitulatif — `app.jsx:443` | Texte concaténé avec strong, br et paragraphes ; pas de structure label/valeur. | **DescriptionList** : ligne, tronçon, sévérité (Indicator), début, fin et message. Une liste par impact pour une synthèse globale. | Faible |
| P2 | Rangées de champs — `app.jsx:326`, `app.jsx:401`, `styles.css:7` | Grilles manuelles, gap 20 et largeurs spécifiques 620/850 px. | **FieldRow** pour début/fin de tronçon et début/fin de période ; gap 12 et repli responsive fourni par Cadence. Les informations générales sont volontairement en ratio 2:1 : FieldRow impose des largeurs égales, donc conserver cette grille ou valider le changement de ratio. | Faible à moyen |
| P2 | Période — `app.jsx:426` | DatePicker est déjà intégré, mais en `variant="button"` compact dans un formulaire. | Utiliser **DatePicker `withTime`, variante champ**. Garder deux sélecteurs : DateRangePicker v1 ne prend pas les heures en charge. Vérifier validation, focus et menu en bord de viewport. | Faible |
| P2 | Options d’affichage — `app.jsx:485` | Checkbox + span séparés pour des effets immédiats ; seul le carré est cliquable. | **Toggle** pour les bascules immédiates (couleur, tag, animation, arrêts), avec nom accessible. Segment de vitesse déjà correctement traité par SegmentedControl. Prévoir une composition libellé/contrôle et une vérification clavier. | Faible |
| P2 | Historique — `app.jsx:517` | Modal Cadence déjà présent ; contenu du brouillon et état vide faits à la main. | **EmptyState `size="inline"`** quand aucun brouillon ; **SummaryList** pour la liste des déclarations, ou DescriptionList pour le détail d’un seul brouillon. Aucune nécessité de DataTable pour un seul élément. | Faible |
| P2 | Titres d’étape — `app.jsx:390` | h2 + aide recréés dans le panneau ; même niveau h2 que la section parent. | **PageSection nue, `headingLevel={3}`**, titre et description ; préserver Diatype. Le composant fournit le repère nommé et la hiérarchie. | Faible |
| P2 | Schéma — `LineDiagram.jsx:186` | Enveloppe de carte, en-tête et légende spécifiques ; largeur SVG fixe 1136 px. | **PageSection `surface="card"`** pour l’enveloppe et ses actions, garder le canevas métier dans le corps. Donner un titre h2, ajouter `cadence-scrollbar` aux zones qui défilent. La géométrie responsive nécessite un travail distinct ; changer de carte ne rend pas le SVG responsive. | Moyen |
| P3 | Cause — `app.jsx:333` | Trois choix fixes dans Dropdown. | **SegmentedControl** est recommandé par les guidelines pour 2–4 choix de formulaire. Option à arbitrer avec l’espace disponible et les libellés ; Dropdown reste un contrôle Cadence valide. | Faible, optionnel |
| P3 | Nombre d’impacts — `app.jsx:356` | Compteur texte personnalisé. | **Badge** si l’intention est une étiquette de quantité ; le texte simple reste acceptable et plus discret. Ne pas utiliser Indicator pour une quantité. | Très faible, optionnel |

## Déjà migré et à conserver

- **Structure** : AppLayout, Sidebar, PageHeader, Breadcrumbs ; badges de contexte Cadence.
- **Informations générales** : PageSection en carte, Accordion, TextInput, Dropdown, Indicator de complétude.
- **Impacts** : PageSection en carte, Dropdown de sélection et bouton Ajouter un impact.
- **Sévérité** : Dropdown officiel, pastilles de couleur et séparateur avant Service modifié. Les six valeurs et la séparation bloquant/non bloquant sont des règles produit.
- **Étapes et progression** : Stepper et ProgressBar. Le calcul de la complétude reste à la charge de l’application.
- **Message** : TextArea. Ajouter un état d’erreur est une meilleure utilisation du composant, pas un changement de contrôle.
- **Conséquences** : InlineAlert et Indicator déjà intégrés. Le wrapper ConsequenceCard compose ces composants ; ce n’est pas une copie de carte.
- **Actions, modale, feedback** : PrimaryButton, GhostButton, FormActions, Modal, Toaster et API toast.
- **Identité transport** : LineBadge et Icons.

## Éléments qui doivent rester métier ou nécessitent une évolution produit

### Schéma de conséquences et bus

Le **LineDiagram de Cadence est un composant de supervision** : arrêts, positions de véhicules, sens et retards. Son API actuelle ne représente pas les tronçons non passants avec interruption, panneaux de sens interdit et demi-tours du prototype. Il n’est pas un remplacement direct.

Le bus latéral animé a été rétabli à la demande de l’utilisateur après essai de ModeIcon Bus. **Ne pas relancer cette migration.** Conserver dessin et animation, avec couleurs/tokens centralisés. StopLabel est un composant HTML pour listes et options ; il ne remplace pas directement les text SVG des arrêts.

### Périmètre réseau

**DisruptionScopePicker** devient pertinent pour sélectionner réseaux/lignes/parcours dans une arborescence réelle. Il ne remplace pas les bornes début/fin d’un tronçon. Avec les six arrêts fictifs actuels, Dropdown reste suffisant ; sur un réseau réel et une longue liste, envisager **Autocomplete**, éventuellement enrichi par StopLabel.

### Calendar et tableaux

ServiceCalendar ne se justifie que si l’on ajoute une récurrence, des jours de semaine et des exceptions. DateRangePicker ne remplace pas les dates avec heures actuelles. DataTable, Card KPI et PageHero n’améliorent pas le parcours de déclaration actuel.

## Ajustements transversaux

1. **Largeurs** : les guidelines demandent une zone de page pleine largeur et une largeur de lecture de formulaire d’environ 720 px. Actuellement page limitée à 1400, champs à 620/850. Harmoniser la largeur des champs dans les panneaux tout en laissant le schéma disposer de sa place ; conserver l’empilement vertical.
2. **Responsive** : les grilles ne se replient qu’à 760 px ; FieldRow se replie plus tôt. Stepper force 660 px et le canevas reste à 1136 px. Tester à 1280, 1024 et 390 px, Sidebar ouverte et repliée. Défilement horizontal acceptable pour le schéma s’il est identifié, pas souhaitable pour les champs.
3. **Barres de défilement** : `steps-container` et `diagram-scroll` n’ont pas la classe Cadence `cadence-scrollbar`, contrairement aux guidelines.
4. **Sémantique d’alerte** : une interruption sélectionnée rend InlineAlert `type="error"`, donc `role="alert"`, pour une conséquence attendue. Envisager une présentation informative et garder la gravité dans Indicator, afin de distinguer explication et erreur de saisie.
5. **Étapes par impact** : l’état Stepper est dérivé de l’index courant, pas d’une validation réelle par impact. Changer d’impact peut laisser apparaître des étapes terminées pour un nouvel impact. Cadence ne corrige pas cette logique ; stocker avancement/validité par impact avant de développer la synthèse globale.
6. **Données restaurées** : loadDraft accepte les dates si ce sont des chaînes, sans vérifier leur validité avant `new Date(...)`. Ajouter une normalisation avant d’alimenter DatePicker. La validation finale ne vérifie pas la cause de la même manière que l’indicateur général. Unifier les règles.
7. **Navigation** : le fil d’Ariane « Perturbations » n’a pas d’action fournie ; prévoir sa destination lorsque la liste des déclarations sera une vue réelle.
8. **Actions et densité** : les guidelines recommandent `md` pour les actions de formulaire, mais la taille `sm` a été demandée précédemment sur ce projet. La conserver comme décision produit ; aucune migration automatique. Conserver également Diatype dans les formulaires, la graisse 400 de l’accordéon et le séparateur du menu de sévérité.
9. **Tokens** : le contrôle statique passe, mais il ne certifie ni le contraste des six couleurs métier, ni l’usage sémantique des variables, ni le responsive. `--tr-border-width` utilisé pour letter-spacing mélange deux intentions ; un token de tracking ou la suppression de cet effet serait plus clair. Les tokens de couleurs métier restent des extensions locales, pas des tokens Cadence officiels.
10. **Polices** : les WOFF2 Diatype et Uxum sont présents ; Spline Sans Mono est référencée dans le SVG mais n’est pas chargée par `index.html`/`main.jsx`. Soit charger la police approuvée, soit utiliser Diatype pour ces libellés textuels (la règle Cadence réserve Mono aux données chiffrées).

## Intégrité de Cadence et limites

Le manifeste de provenance référence Cadence 1.0.0 au commit `6314a549bfea418d939a8d8daa746605299eb087`. Les empreintes sont conformes et les sources déjà importées ne diffèrent pas du dossier local actuel. Les composants proposés plus haut existent dans les exports de la bibliothèque source, mais certains doivent être ajoutés au sous-ensemble vendored par le script d’import avant utilisation.

Il n’est pas nécessaire de mettre à jour ou réécrire la bibliothèque pour commencer. Le correctif de menu en portail, s’il est retenu, serait en revanche une évolution explicite du design system, à répercuter dans sa source et sa provenance.

## Lots recommandés

1. **Fiabilité** : clipping Cause, ErrorSummary et erreurs de champs, validité/avancement par impact.
2. **Composition** : DescriptionList, FieldRow, titres PageSection, DatePicker en variante champ ; tests responsive.
3. **Finitions** : Toggle, EmptyState/SummaryList, enveloppe du schéma, scrollbar et polices.

Les variantes imposées par les décisions précédentes de l’utilisateur sont conservées. La migration du lot 1 apporte le plus de valeur ; elle traite des problèmes d’usage observés plutôt qu’un simple alignement visuel.


## Application après validation de l’utilisateur

Les recommandations applicables au parcours actuel ont été implémentées : correctif du débordement Cause, ErrorSummary et messages locaux, validation générale partagée, dates restaurées normalisées et DatePicker en variante champ, avancement par impact, DescriptionList, FieldRow (sauf grille générale 2:1 conservée), PageSection pour les titres et le schéma, Toggle, SummaryList/EmptyState, scrollbars et Diatype dans le schéma.

La page prend la largeur disponible et les champs restent limités à 720 px. Les rangées se replient à 1024 px. À 760 px et moins, une navigation en Modal remplace la sidebar et le Stepper s’empile. Le schéma SVG continue de défiler horizontalement : sa géométrie métier n’a pas été réécrite.

Les propositions optionnelles de remplacer Cause par SegmentedControl et le compteur d’impacts par Badge ne sont pas retenues : elles n’apportent pas de correction fonctionnelle ici. Le bus, les boutons compacts et les choix typographiques demandés précédemment sont conservés.

Vérifications : tests unitaires des règles, contrôle de tokens et build Vite ; navigateur pour Cause, dates inversées et correction via ErrorSummary, récapitulatif, ajout/changement d’impact, navigation et historique à 390 px. Aucun brouillon de test n’a été enregistré. Le fichier d’audit décrit plus haut l’état avant migration.
