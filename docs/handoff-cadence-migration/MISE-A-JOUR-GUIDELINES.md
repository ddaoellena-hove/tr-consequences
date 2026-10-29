# Matrice de mise à jour des guidelines

Vérifier les intitulés de rubriques dans le dépôt courant. Les références ci-dessous ciblent les rubriques, pas des numéros de ligne qui vieillissent rapidement.

| Rubrique existante | Ajout ou clarification à réaliser | Preuve / limite |
|---|---|---|
| Instructions pour agents IA | Introduire le workflow de migration : analyser les intentions/états, choisir un pattern, mapper, vérifier les API, composer, tester. Lier le guide | Les premières versions ont recréé des composants avant d’avoir la source Cadence |
| Installation & setup | Distinguer package publié, checkout local et snapshot vendored ; styles/polices nécessaires et provenance | Le prototype utilise un import sélectif reproductible, ce n’est pas une obligation universelle |
| Typographie | Diatype pour les titres internes aux formulaires, même en h2/h3 ; Uxum pour h1/rôles display ; charger les polices employées | Correction explicite d’un titre de sévérité en Uxum ; suppression de Mono non chargé dans les libellés du schéma |
| Intention → composant | Documenter réutilisation/composition/spécifique ; la ressemblance n’assure pas l’équivalence fonctionnelle | ModeIcon Bus rejeté ; LineDiagram de supervision insuffisant pour les ruptures et demi-tours |
| Layout & spacing | Clarifier largeur pleine de la page vs largeur de lecture des champs, grilles égales vs ratio intentionnel | FieldRow utilisé pour bornes et dates ; grille 2:1 conservée pour intitulé/cause |
| Layout & spacing | Ne pas attribuer le repli responsive à FieldRow sans vérifier son CSS ; définir qui le fournit | La version inspectée n’a aucun @media dans field-row.css ; l’application ajoute le repli à 1024 px |
| Formulaires | Décrire PageSection card + Accordion interne, hiérarchie h1/h2/h3 et indicateur de complétude calculé | Le statut doit réutiliser les règles de validation générale |
| Boutons | Expliquer les décisions de densité et l’enregistrement des exceptions projet | sm retenu sur Traffic Report ; ne pas remplacer globalement md |
| Formulaires / Feedback | ErrorSummary + erreurs locales, activation du bon impact/étape/panneau et focus sur un contrôle utilisable | Les cibles peuvent être des conteneurs stables ; pas de props d’erreur inventées sur Dropdown/DatePicker |
| Feedback / Dates | Distinguer valeur confirmée et édition locale ; éviter de réinitialiser l’édition par des objets Date recréés ; normaliser les données restaurées | datePending et useMemo sont des adaptations applicatives actuelles, pas une nouvelle API Cadence |
| Dates | Expliquer l’exception « deux DatePicker avec heures » face à DateRangePicker jours entiers | Vérifier cette limite dans l’API actuelle avant de la conserver |
| Navigation / Stepper | Avancement par objet répété, invalidation des étapes dépendantes et restauration à la sélection | La bibliothèque dessine les états ; le modèle métier les calcule |
| Statuts / Feedback | Une perturbation transport grave n’est pas nécessairement une erreur de formulaire | InlineAlert informatif pour l’explication, Indicator pour la gravité |
| Listes / Synthèses | DescriptionList pour les récapitulatifs, SummaryList pour une liste courte, EmptyState pour l’absence de données | Ne pas forcer DataTable pour un seul brouillon |
| Formulaires / Options | Toggle pour effet immédiat, Checkbox pour sélection/confirmation ; SegmentedControl pour choix exclusif court | Le code distingue désormais options de rendu et données à enregistrer |
| Overlays / Popover | Ajouter une section sur la chaîne des ancêtres, overflow, arrondis, zones inertes et scroll ; z-index ne résout pas le clipping | Deux bugs distincts : carte des impacts, puis contenu d’Accordion |
| AppLayout / FormActions | Documenter le footer persistant inspiré du Drawer : corps scrollable + actions hors scroll, pas de position liée à la largeur Sidebar | AppLayout actuel n’expose pas de prop footer ; l’adaptation applicative est identifiée comme telle |
| Responsive | Donner une checklist de test avec navigation latérale, champs, étapes, overlays et footer | À 390 px, la Sidebar ouverte rendait le formulaire inutilisable ; navigation mobile en Modal |
| Tokens | Distinguer tokens DS, extensions produit, géométrie et constantes ; le contrôle statique n’est pas une preuve d’accessibilité | --tr-* locaux ; géométrie SVG et breakpoints documentés ; layout inline autorisé par Cadence |
| Data visualisation / Métier transport | Documenter les cas où conserver un schéma spécifique et les conditions d’extension du DS | Ne pas recommander StopLabel HTML comme substitut direct à du texte SVG |
| Page patterns | Relier guide et patterns Formulaire/Assistant ; prévenir que les exemples doivent être comparés aux composants réels | Le parcours combine des patterns et nécessite des états applicatifs |

## Formulations directement réutilisables

### Départ d’une migration

> Avant de coder depuis une maquette, inventorier ses zones et états. Pour chaque zone, décider si elle réutilise un composant, compose plusieurs composants ou nécessite un rendu métier spécifique. Vérifier les API et variantes disponibles. Toute exception doit porter une justification et une portée projet.

### Menus et conteneurs

> Tester les menus et calendriers ouverts dans leur contexte réel : carte, accordéon, zone défilante et surcouche. Un z-index élevé n’annule pas l’overflow d’un ancêtre. Préserver le masquage des panneaux fermés et ne pas supprimer globalement les règles nécessaires à leurs transitions.

### Validation

> Une erreur doit pouvoir conduire à son champ. L’application sélectionne d’abord le bon objet et la bonne étape, ouvre le panneau nécessaire, puis rend la cible disponible au focus. Le résumé d’erreurs complète les messages de champ ; il ne remplace ni la validation métier ni la gestion des erreurs serveur.

### Footer persistant

> Pour un formulaire long, séparer le corps défilant des actions persistantes dans un conteneur en colonne. Le corps prend l’espace restant avec min-height:0 ; le footer reste dans le cadre et suit sa largeur. Prévoir retour à la ligne mobile, accès au dernier champ et absence de recouvrement du contenu.

## Contradictions à traiter explicitement

1. **Source de vérité unique vs guide séparé** : les guidelines possèdent les règles et API ; le guide possède la procédure. La même règle ne doit pas être dupliquée dans deux versions concurrentes.
2. **CSS limité au layout vs corrections de composant** : les overrides actuels résolvent des problèmes réels mais doivent être décrits comme des adaptations temporaires, pas comme l’autorisation générale d’habiller les composants.
3. **Tokens uniquement vs couleurs métier** : ne pas entériner les six couleurs locales comme palette officielle. Définir une procédure d’exception ou de contribution.
4. **Pas de styles inline vs code Cadence** : l’interdiction locale ne doit pas devenir une règle contradictoire avec FieldRow, FormActions ou les overlays internes.
5. **Avancement validé vs pré-remplissage** : les données de démonstration sont pré-remplies ; un nouveau formulaire réel doit définir son état initial et ses contrôles, sans copier aveuglément l’étape de départ.
6. **API manquante** : ne pas inventer AppLayout.footer, Sidebar.collapsed, Dropdown.error ou une notification d’édition DatePicker. Vérifier la version et consigner les besoins séparément.

## Propositions d’évolution à isoler de la mission documentaire

- Overlay Dropdown en portail pour les conteneurs qui coupent le contenu.
- Signal explicite d’édition/validité/confirmation dans DatePicker si ce besoin est partagé.
- Emplacement footer persistant dans AppLayout, pour éviter l’adaptation locale de son conteneur scrollable.
- Composition responsive commune pour la navigation mobile.
- Contrat de responsive de FieldRow, aujourd’hui à la charge de l’application inspectée.

Ces points nécessitent une conception, des tests et une validation distincts. Le guide doit rester exact même si aucune de ces évolutions n’est implémentée.

## Complément : dashboard et cartes riches

| Rubrique | Clarification à intégrer | Preuve / portée |
|---|---|---|
| Listes | TableCard + TableHeader pour cartes riches ; DataTable selon volume et besoin | Le terme DataCard de la maquette ne correspond pas à une API utilisée |
| Icônes métier | Séparer objets de perturbation, modes de transport et icônes UI ; définir mapping, fallback et accessibilité | DisruptionObjectIcon, géométrie fournie par le produit ; pas un nouveau composant Cadence |
| Surfaces imbriquées | Contrôler fond du wrapper derrière les rayons, bordure et absence de gap | Correctif local dashboard-impact ; pas une règle globale sur toutes les PageSection |
| Densité | Mesurer hauteur résultante : icône 24 + padding vertical 10 × 2 = header 44 | Décision Traffic Report ; conserver la possibilité de wrap |
| Statuts | Indicator dot avec libellé visible et annonce unique | Couleur seule insuffisante |
| Progression | Documenter une adaptation d’arrondi locale lorsqu’elle est demandée | declaration-progress ; pas de variante inventée |
| Tests / données | Filtrer et trier avant pagination ; combinaison des filtres sur le même impact | Règle métier applicative, ni garantie de TableCard ni aptitude au gros volume |

Les exemples et mesures sont détaillés dans [le complément dashboard](EVOLUTIONS-TABLEAU-DE-BORD.md).

### Infobulles des actions de ligne

Sur Traffic Report, utiliser le seul verbe pour les boutons icône : Dupliquer, Modifier, Consulter, Supprimer. Vérifier la source du texte : le BaseButton embarqué reprend aria-label pour son infobulle. Cette décision produit ne constitue pas une nouvelle prop ni une règle universelle pour tous les noms accessibles.
