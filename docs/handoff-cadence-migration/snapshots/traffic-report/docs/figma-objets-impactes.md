# Objets impactés — parcours Figma adapté à Cadence

## Référence consultée

[Figma : Nouvelle perturbation — Types d’objets d’impact](https://www.figma.com/design/T7ETD7UaaWUHsvaedeXSVk/New-Traffic-Report?node-id=1962-5294). Page lue via l’intégration Figma ; les écrans de détail ont été inspectés par contexte de conception et captures, pas seulement via les captures anciennes du chat.

| Parcours | Frame du drawer consultée |
|---|---|
| Choix initial | 7994:52318 |
| Réseau, vide | 1973:1824 |
| Ligne / directions | 3666:13999 |
| Tronçon / directions et lignes | 3429:12362 |
| Arrêt précis | 3455:23467 |
| Zone d’arrêt | 3430:14927 |
| Déviation | 3370:10980 |
| Entrées/sorties et plan | 5810:19205 |
| Point d’intérêt | 3463:26831 |
| Tronçon train / Transilien | 8033:18581 |
| Course | 3273:4788 |
| Choix des horaires | 3269:3412 |

## Comportements conservés

- L’ajout ouvre un **Drawer formulaire Cadence de largeur lg**, avec en-tête et pied fixes, corps défilant, fermeture et restauration du focus gérées par les primitives Cadence.
- Choix du type, filtres multi-mode (ModeFilter), recherche (Autocomplete), champs et configuration dépendent du type. Une sélection vide de modes signifie « aucun filtre ».
- Pour une ligne : choix des directions. Pour un tronçon : deux arrêts distincts, lignes communes et directions. Le tronçon ferroviaire permet de consulter les gares intermédiaires dans Accordion.
- Arrêt, zone d’arrêt, réseau et POI : recherche et ajout dans la sélection temporaire. Arrêt précis et zone sont distincts ; le scope historique `stop` reste associé à la déviation pour ne pas transformer les dossiers existants.
- Déviation : arrêt, lignes et directions. Entrée/sortie : arrêt, ligne/direction et sélection d’accès, avec plan optionnel. Course : ligne, direction, jour de circulation, choix d’une course et aperçu des horaires aux arrêts.
- Un bouton de configuration ajoute l’objet au panier du drawer ; l’action du pied confirme les objets dans l’impact. Les deux opérations sont distinctes.
- Annuler, fermer ou Échap ne modifient pas l’impact. Les sélections temporaires sont réinitialisées à la réouverture. Les doublons identiques sont filtrés ; une modification remplace l’objet existant par son identité.
- La page montre des cartes récapitulatives TableCard, avec actions Modifier / Supprimer. Modifier ouvre le même drawer. Les champs ne restent plus éditables directement dans la liste principale.

## Adaptations Cadence et limites explicites

Les contrôles et surfaces utilisent les composants du paquet embarqué : Drawer, Autocomplete, ModeFilter / ModeIcon, Dropdown, PageSection, TableCard, Checkbox, Toggle, Accordion, Modal, DatePicker et DescriptionList. Polices, boutons et tokens actuels remplacent l’habillage pré-Cadence. Les dix pictogrammes métier fournis précédemment restent utilisés ; aucun nouveau contrôle visuel n’a été reconstruit depuis le code Figma.

Le sélecteur de courses utilise des cartes de courses avec heures de départ/arrivée et un détail des arrêts, plutôt que le tableau à colonnes de la maquette ancienne. Cela conserve le choix exclusif et l’aperçu des horaires avec les composants déjà disponibles et une présentation mobile lisible.

Le catalogue, les identifiants, les dessertes et horaires sont **des données de démonstration**. Les courses ne sont pas issues d’un service réel. Le plan de Saint-Lazare provient de la maquette ; les repères numérotés sont indicatifs et ne constituent pas une géolocalisation validée. Les accès d’autres arrêts ne sont pas inventés. Les favoris de recherche de la maquette ne sont pas implémentés. Brancher un référentiel transport et une cartographie métier reste distinct de cette adaptation du parcours.

Les objets conservent désormais leurs lignes, directions, bornes nommées, accès et course structurés. Le dashboard et le résumé lisent ces données. Le schéma animé utilise le référentiel du tronçon choisi lorsqu’il est compatible avec sa géométrie ; un aperçu textuel est utilisé sinon.

## Assets importés

- `public/figma/object-empty.svg` : illustration de l’état vide, dimensions naturelles 212 × 122 ; utilisée dans le slot illustration d’EmptyState, sans modification de géométrie.
- `public/figma/access-basemap.png` : fond de plan du drawer d’accès ; utilisé dans une figure avec légende explicite.

Les URL temporaires Figma ne sont pas utilisées à l’exécution. Les boutons, badges de lignes et modes viennent du design system ; les couleurs d’identité des lignes sont des données métier du catalogue, pas une nouvelle palette Cadence.

## Sources et contrôles

`ImpactObjects.jsx` gère ouverture/modification/confirmation ; `ObjectImpactDrawer.jsx` compose le formulaire ; `ObjectSelectionCard.jsx` affiche les résumés ; `object-catalogue.mjs` contient le catalogue et les fonctions de sélection/déduplication ; `object-drawer.css` contient la composition tokenisée.

28 tests passent, dont catalogue/modes, sélection temporaire, déduplication, remplacement d’un objet, tronçon en sens inverse, accès et horaires de course. Contrôles navigateur : recherche et directions d’une ligne, annulation sans mutation, confirmation d’accès 1/4, plan, choix de course en Modal puis retour au Drawer. Desktop à 1440 px et mobile à 390 px ; largeur mesurée du drawer 390 px, scrollWidth 390 px. Illustration SVG chargée à 212 × 122 et plan PNG chargé. Le contrôle des tokens et le build passent. Vite signale un bundle principal dépassant 500 ko minifié ; le drawer est chargé à la demande, mais le découpage global des composants Cadence reste à optimiser si nécessaire.

## Indication de la sélection multiple

Le titre d’ajout est « Ajouter des objets impactés ». Son aide précise qu’il est possible d’ajouter plusieurs objets de types différents, puis de les ajouter ensemble à l’impact. Le bouton de configuration porte « Ajouter à la sélection » ; le pied porte « Ajouter à l’impact (N) ». Le panier « Votre sélection (N objets) » et le message après ajout invitent à poursuivre la recherche. Le mode modification conserve un texte adapté à la modification d’un objet. Vérification navigateur : deux réseaux préparés sans fermeture du drawer, compteur et bouton final à 2, puis annulation sans mutation de l’impact.

## Ajustements du 29 octobre 2026

- Action : « Ajouter un ou plusieurs objets impactés ». L’aide parle de sélection d’objets du réseau, sans utiliser le terme technique « drawer ».
- Le panneau est monté fermé avant de recevoir l’état ouvert, même après chargement différé ou changement de clé. Cela conserve la transition d’entrée native Cadence et sa préférence de mouvement réduit. Contournement applicatif de l’initialisation `entered = isOpen` du Drawer.
- Un tronçon commun à plusieurs lignes affiche un schéma de conséquence pour chacune des lignes sélectionnées à l’étape Sévérité. Chaque ligne conserve son ordre d’arrêts et ses indices ; exemple de démonstration : Gare de Lyon — Châtelet, Métro 1 et RER A. Tous les tronçons sont représentés.
- Le composant actuel accepte six arrêts ; les référentiels incompatibles sont explicitement signalés. Il faudra un tracé de longueur variable pour un référentiel de production.
