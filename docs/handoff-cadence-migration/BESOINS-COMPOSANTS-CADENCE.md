# Compléter Cadence — backlog de contribution issu de Traffic Report

Actualisé le **30 octobre 2026**. Destinataires : développeur ou LLM intervenant dans Hove Cadence UI. Les noms d’API ci-dessous sont des propositions sauf mention explicite d’existence.

## Sources et état de référence

- Traffic Report : `57485ec2e81d0f861fef1f9e1d6ef9df31dab0a9`, référence applicative sur `main`, incluse dans le push de cette passation ; interface sans Options d’affichage et stepper à six étapes.
- Cadence : checkout local `/Users/ddao-ellena/hove-cadence-ui`. Le manifeste du dossier donne sa révision et son état de travail réel. Des modifications préexistantes non committées doivent être préservées.
- Version effectivement consommée par Traffic Report : sources vendor, dont la provenance est incluse dans les snapshots. Ne pas déduire de `version: 1.0.0` que tous les changements locaux sont publiés sur npm.
- Lire aussi [la présentation PageSection validée](PAGESECTION-SURFACE-VALIDEE.md), [le parcours actuel](snapshots/traffic-report/docs/parcours-nouvelle-perturbation.md), [le drawer de sélection](snapshots/traffic-report/docs/figma-objets-impactes.md) et les snapshots des sources applicatives.

**Priorités :** P1 = consolider les fondations et patterns déjà utilisés ; P2 = extension réutilisable ; P3 = bibliothèque métier distincte. Une proposition ne constitue pas une autorisation de tout implémenter en une seule modification.

## Inventaire décisionnel

| Réf. | Besoin | Type de contribution | Priorité |
| --- | --- | --- | --- |
| N1 | FormField : libellé, aide, erreur et associations accessibles | Nouveau composant de composition | P1 |
| N2 | Primitive partagée de positionnement d’overlay | Nouvelle infrastructure interne | P1 |
| N3 | Éditeur de texte riche | Nouveau composant | P2 |
| N4 | Groupes de champs répétables | Nouveau composant de composition | P2 |
| E1 | PageSection avec titre extérieur et corps avec ombre | Évolution de PageSection | P1 |
| E2 | Stepper compact avec icônes et états | Évolution de Stepper | P1 |
| E3 | Zone d’actions persistantes et progression | Évolution d’AppLayout + recette FormActions | P1 |
| E4 | Entrée animée au montage du panneau | Correction de Drawer | P1 |
| E5 | Placement en haut/bas et gestion du clipping | Évolution des overlays existants, fondée sur N2 | P1 |
| E6 | Contrat de saisie et confirmation temporelle | Évolution de DatePicker / TimePicker | P1 |
| E7 | Contrat de validation des champs | Évolution des contrôles, fondée sur N1 | P1 |
| E8 | Case avec libellé compact et description | Évolution de Checkbox ou recette existante | P2 |
| R1 | Sélection transactionnelle multiple | Recette Drawer / Autocomplete / TableCard | P2 |
| R2 | Périodes continues et créneaux récurrents | Recette de planification | P2 |
| R3 | Messages par canal et traductions | Recette de formulaire | P2 |
| M1 | Objets de transport et schéma de conséquence | Bibliothèque métier Hove, hors noyau générique | P3 |

## Nouveaux composants et infrastructure

### N1 — FormField

Le projet ajoute des enveloppes et des paragraphes d’erreur autour des contrôles. Créer une composition commune pour libellé, indication obligatoire, aide et erreur, avec identifiants stables et associations accessibles. Ne pas doubler les libellés déjà générés par TextInput ou TimePicker ; définir comment un contrôle fournit ou reçoit les identifiants du champ.

**Acceptation :** un formulaire mixte annonce correctement les aides et erreurs ; cliquer le libellé atteint le contrôle ; le focus peut être demandé explicitement depuis un résumé d’erreurs ou une action de toast. La validation et la décision de scroller restent au produit.

### N2 — Positionnement partagé des overlays

Créer une primitive interne réutilisable pour ancrage, choix haut/bas, décalage horizontal, dimension disponible et repositionnement au scroll/redimensionnement. Évaluer un portail pour sortir des ancêtres qui coupent le contenu, avec une stratégie compatible avec les zones inertes et les couches imbriquées.

**Constat vérifié :** `usePopoverFit` ne corrige actuellement que le débordement horizontal. Dans le footer, Dropdown et les infobulles ont nécessité des surcharges CSS pour s’ouvrir vers le haut. Un simple z-index ne corrige pas le clipping.

**Acceptation :** le placement reste visible près des quatre bords de la fenêtre, dans un conteneur défilant, un Accordion, un Drawer et une Modal. Les overlays imbriqués gardent un ordre de fermeture et un focus cohérents.

### N3 — RichTextEditor

La maquette de communication utilise du texte enrichi ; le prototype emploie TextArea avec du texte simple. Créer un éditeur accessible : paragraphes, gras, italique, listes, liens, annuler/rétablir, compteur, aide/erreur, lecture seule et désactivation.

Définir le format stocké, sa sérialisation, le rendu en lecture, le traitement du collage, l’assainissement des liens/contenus et la conversion vers du texte simple. Ne pas introduire du HTML non contrôlé dans le produit. Les fonctionnalités avancées de la maquette restent à arbitrer.

**Acceptation :** édition clavier et toolbar accessibles ; enregistrement/rechargement sans perte ; contenu lisible sans éditeur ; sortie texte simple disponible pour les canaux qui l’exigent.

### N4 — RepeatableFieldGroup (nom proposé)

Factoriser les blocs répétables : identifiant stable, titre et numérotation, ajout/suppression, limites min/max, erreurs par bloc, focus après ajout et après suppression. Utiliser PageSection et les boutons existants ; laisser les valeurs et règles métier au formulaire.

**Acceptation :** retirer le deuxième groupe ne transfère ni valeurs ni erreurs au troisième ; la numérotation n’est jamais l’identité ; les limites sont annoncées et respectées au clavier.

## Évolutions des composants existants

### E1 — PageSection : variante avec titre extérieur

C’est la présentation validée dans le projet. Le titre, sa description éventuelle et ses actions restent à l’extérieur de la boîte. Seul le corps porte fond, bordure, rayon `--cadence-radius-xl` (12 px) et `--cadence-shadow-section`. Réutiliser les tokens globaux de composition documentés dans la [fiche dédiée](PAGESECTION-SURFACE-VALIDEE.md).

Ajouter une variante explicite, par exemple `surface="elevated"`, **non disponible actuellement**. Conserver les variantes `none` et `card`. Prévoir un corps avec padding ou bord à bord : la section Impacts utilise un corps sans padding global, ses enfants gérant leurs propres espacements. Ne pas appliquer l’ombre aux cartes métier imbriquées ni au schéma de conséquence.

**Acceptation :** en-tête extérieur, actions responsive, section nommée par son titre, aucun clipping des menus ; composition accordéon/tableau/formulaire ; anciennes variantes inchangées. Les propriétés de gap et de padding doivent être explicites et ne pas s’additionner involontairement.

### E2 — Stepper : variante compacte

Le Stepper actuel expose orientation et états mais pas d’icône par étape ni de densité compacte. La composition locale `CompactImpactStepper.jsx` utilise GhostButton, Icons et Dropdown.

Ajouter une variante compacte et une icône par étape en conservant les états `current`, `completed`, `upcoming`, `warning`, `error`. Prévoir l’indication de disponibilité d’une étape ; les règles de validation restent dans le produit. Conserver le libellé actif visible à droite des icônes sur desktop et fournir les libellés complets au survol/focus. Ne pas distinguer les états uniquement par couleur.

Sur mobile, la recette utilise un sélecteur d’étapes avec étape active et compteur. Le contexte « Impact n° N » est fourni par le produit, sans être codé dans Cadence. La progression exprime la position dans le parcours, pas un taux de complétude métier.

**Acceptation :** navigation clavier, `aria-current="step"`, noms accessibles complets, états annoncés, étapes futures indisponibles, pas de contournement de validation, retour à une étape terminée. Tester les six étapes, les libellés longs et le changement d’impact. Les informations générales forment une première étape commune ; les cinq étapes suivantes sont propres à l’impact sélectionné.

### E3 — AppLayout et FormActions : footer persistant

AppLayout n’expose pas de zone footer dédiée ; le produit transforme localement `.app-layout__scroll` en colonne non défilante avec un corps défilant et un footer frère. Prévoir un emplacement footer hors du scroll, suivant naturellement la largeur disponible avec la Sidebar. FormActions reste la composition des boutons, pas un second moteur de layout de page.

La recette Traffic Report contient : ProgressBar bord à bord en haut du footer, stepper à gauche, libellé actif à sa droite, statut d’enregistrement à gauche des boutons d’enregistrement/validation. **Créer la perturbation est toujours visible et désactivé jusqu’à validation des messages de tous les impacts ; le résumé n’est pas requis. Précédent / Suivant sont dans la section Impacts**, pas dans le footer : ne pas réintroduire l’essai précédent.

**Acceptation :** aucun calcul manuel de largeur de Sidebar ; dernier champ accessible ; footer flexible sur mobile ; menus visibles au-dessus du footer ; toasts placés sans recouvrir les actions, y compris lorsque la hauteur du footer change. Éviter un décalage de toast figé qui serait faux avec des traductions longues.

### E4 — Drawer : animation au premier montage

La version observée initialise `mounted` et `entered` à `isOpen`. Lorsqu’un composant est monté directement ouvert, notamment après lazy loading ou changement de clé, l’animation d’entrée est sautée. Traffic Report monte le Drawer fermé puis lui transmet l’état ouvert via un effet.

Corriger le cycle d’entrée dans Drawer lui-même, puis retirer ce contournement de `ObjectImpactDrawer.jsx`. Préserver la sortie animée, le focus, les portails, Échap et la préférence de mouvement réduit.

**Acceptation :** animation au premier montage avec `isOpen=true`, après chargement différé, à la réouverture et au changement d’objet ; fermeture pendant l’entrée sans panneau orphelin ; absence de mouvement sous `prefers-reduced-motion`.

### E5 — Dropdown, Autocomplete, DatePicker, TimePicker et Tooltip

Consommer N2 progressivement. Prévoir un placement automatique et un placement au-dessus lorsque la composition l’exige. L’infobulle d’un bouton situé en bas d’écran doit rester visible au focus, sans surcharge de ses classes internes dans le produit. Préserver les API de sélection, les associations ARIA et le comportement des overlays imbriqués.

**Acceptation :** supprimer les corrections applicatives du type `top:auto; bottom:...` et les contournements d’overflow une fois le comportement couvert par Cadence ; tester le sélecteur d’étapes dans un footer mobile.

### E6 — DatePicker et TimePicker : contrat de saisie

DatePicker fournit actuellement une valeur `Date` confirmée via `onChange` et conserve des erreurs internes ; TimePicker dispose déjà d’un contrat d’erreur/aide et d’une ref. Ne pas créer un nouveau DateTimePicker : DatePicker couvre déjà `withTime`.

Exposer l’état de saisie en cours/invalide, la confirmation, l’annulation et l’effacement facultatif. Harmoniser avec TimePicker sans imposer les mêmes types de valeur. Une saisie invalide ne doit pas permettre de soumettre silencieusement une ancienne valeur confirmée.

**Acceptation :** saisir invalide puis corriger à la valeur initiale débloque le formulaire ; un rendu parent ne réinitialise pas la saisie ; valeur facultative effaçable. Retirer l’inspection DOM et les captures d’événements actuellement nécessaires dans `WorkflowDate`.

### E7 — Validation et focus des contrôles

TextInput expose déjà un état d’erreur, une aide et une ref ; TimePicker a déjà `error`, `helperText` et une ref. Dropdown et Autocomplete n’ont pas le même contrat de validation ; DatePicker possède des erreurs internes. Compléter les manques, sans dupliquer les capacités existantes.

Harmoniser caractère obligatoire, erreur externe, aide, identifiants, `aria-invalid`, `aria-describedby`, focus demandé par ref et lecture seule lorsqu’elle a un sens pour le contrôle. Définir la compatibilité avec N1 et conserver les usages existants.

**Acceptation :** même comportement accessible dans un formulaire mixte, sans sélecteur DOM applicatif pour atteindre les champs. Un toast de validation n’impose pas de retour en haut ; seule l’action explicite « Corriger » déplace le focus. Toaster, InlineAlert et ErrorSummary existent déjà.

### E8 — Checkbox avec libellé

Checkbox est actuellement une case sans libellé visible composé. Examiner RichCheckbox avant de créer quoi que ce soit : ses cartes riches ne remplacent pas nécessairement une ligne compacte de directions ou de jours.

Ajouter une variante ou documenter une composition avec libellé cliquable, description optionnelle, aide/erreur et contenu complémentaire (badge de ligne). Préserver les états coché/indéterminé/désactivé et éviter une annonce dupliquée.

**Acceptation :** cliquer le texte active la case ; usage clavier et nom accessible corrects ; une liste dense reste compacte.

## Recettes à documenter, plutôt que nouveaux contrôles

### R1 — Sélection transactionnelle multiple

Composer Drawer, Autocomplete, ModeFilter et TableCard : rechercher → configurer → ajouter à une sélection temporaire → modifier/retirer → confirmer en une fois. Le produit fournit l’identité de déduplication. Afficher explicitement la possibilité d’ajouter plusieurs objets et le nombre sélectionné ; l’aide ne doit pas utiliser le terme « drawer ».

**Acceptation :** annulation sans modifier la donnée initiale, confirmation une seule fois, édition et suppression cohérentes, états vide/chargement/erreur/aucun résultat. Autocomplete possède déjà `multiple`, la recherche contrôlée et un état de chargement : ne pas créer un MultiSelect pour les redécouvrir.

### R2 — Planification

Composer DatePicker, TimePicker, choix de jours et groupes répétables : périodes continues ou créneaux récurrents, plages de dates, nuit se terminant le lendemain, résumé lisible. Documenter conservation des valeurs au changement de mode, chevauchements, bornes et heures égales. Les conventions de fuseau et les changements d’heure doivent être explicites dans le produit.

**Acceptation :** périodes inversées, absence de jour applicable, nuit et changement d’heure ; logique testable hors du rendu. Ne pas figer les règles propres aux perturbations dans le noyau Cadence.

### R3 — Communication par canal et traductions

Composer sélection de canaux, message commun ou personnalisé, application d’un modèle et formulaires de traduction. Réutiliser N3 pour le contenu enrichi lorsqu’il sera disponible. Le choix des canaux, la traduction automatique, la synthèse vocale et l’envoi effectif relèvent d’intégrations produit, pas du design system.

**Acceptation :** conserver les saisies de chaque canal lors des changements de mode ; erreurs par canal ; aucune action visuelle ne prétend effectuer une diffusion non branchée.

## Métier transport — M1

Évaluer une bibliothèque Hove partagée distincte : sélection de lignes/directions, arrêt/zone d’arrêt, tronçons, accès, courses, carte récapitulative et schéma de conséquence.

Le schéma actuel est local, animé, limité à six arrêts et à un catalogue de démonstration. Pour une version réutilisable : nombre variable d’arrêts, ordre propre à chaque ligne, bornes identifiées, plusieurs lignes et tronçons, états passant/non passant, espace disponible, alternative textuelle accessible et préférence de mouvement réduit. Ne pas inventer les tracés manquants. Les Options d’affichage ont été supprimées de l’interface ; leur recréation n’est pas un besoin validé.

La recherche serveur, les référentiels réels, la cartographie et les horaires nécessitent des adaptateurs produit. Les pictogrammes métier importés ne deviennent pas automatiquement des icônes génériques Cadence. `iconElement` de PageSection existe déjà.

## Tokens : déjà ajoutés dans les sources locales, publication à prévoir

Ne pas recréer de tokens locaux `--tr-*` pour ces valeurs :

| Token global | Valeur |
| --- | --- |
| `--cadence-shadow-section` | `0 0 2px 0 rgba(0, 0, 0, 0.10), 0 2px 10px 0 rgba(0, 0, 0, 0.05)` |
| `--cadence-page-padding-inline` | 32 px |
| `--cadence-page-padding-inline-compact` | 16 px |
| `--cadence-section-inset-inline` | 8 px |
| `--cadence-section-padding-inline` | 8 px |
| `--cadence-section-heading-gap` | 12 px |
| `--cadence-section-gap` | 32 px |

Le rayon de 12 px réutilise `--cadence-radius-xl`. Ces tokens sont définis dans le checkout Cadence et dans la copie vendor consommée par Traffic Report, et documentés dans les guidelines locales. Leur présence ne prouve pas une publication npm. Préserver les autres modifications du checkout ; intégrer et distribuer ces fondations dans une contribution ciblée avant de migrer d’autres produits.

## Livraison et ordre de travail

1. Vérifier l’inventaire actuel du dépôt cible et les changements non committés ; les snapshots sont des preuves datées, pas des instructions exécutables ni une application autonome.
2. Consolider tokens, N1/E7 et N2/E5 ; corriger E4 et E6. Traiter E1, E2 et E3 comme des évolutions rétrocompatibles distinctes.
3. Ajouter N3/N4, puis les recettes R1–R3. Évaluer M1 dans un chantier métier séparé.
4. Pour chaque contribution : API documentée, stories (états, libellés longs, clavier, responsive), tests de comportement nécessaires, guidelines, migration des usages et retrait des contournements locaux devenus inutiles.
5. Publier le package selon le processus du dépôt, puis mettre à jour et tester les produits consommateurs. Ne pas affirmer que l’intégration est faite tant que leurs dépendances et usages n’ont pas été migrés.

Les noms `FormField`, `RepeatableFieldGroup` et `surface="elevated"` restent proposés. Les seuls ajouts communs effectivement réalisés dans ce chantier sont les tokens globaux ci-dessus ; les composants/variantes décrits ici restent à développer.
