# Tableau de bord — adaptation de la maquette à Cadence

## Mapping

- Coque, navigation et titre : AppLayout, Sidebar, PageHeader.
- Liste principale : PageSection surface card, TabList/Tab pour les statuts, SegmentedControl pour le regroupement.
- Recherche/filtres : FilterBar, Dropdown, Accordion pour les filtres avancés ; badges actifs retirables.
- Lignes riches : TableHeader et TableCard. Les mêmes largeurs sont utilisées pour les dates et la sévérité. L’information/les impacts prennent l’espace restant. Ce choix vise quelques dizaines de cartes paginées, pas des milliers d’éléments montés.
- Détails des objets impactés : PageSection, LineBadge ; statuts via Indicator.
- Consultation : Drawer avec corps défilant et pied d’actions.
- Actions : GhostButton icône seule, confirmation Modal pour la suppression, BulkActionBar après la liste, Pagination.
- Absence de résultat : EmptyState, avec remise à zéro des filtres.

## Comportements

Le statut est calculé à partir des périodes, sauf le brouillon qui reste explicite. Les filtres de ligne/sévérité/objet doivent correspondre au même impact ; la vue perturbation garde l’ensemble des impacts de la déclaration correspondante. La vue impact affiche une ligne par impact. Recherche et tri portent sur tous les résultats avant pagination. Les sélections sont annulées lorsque les filtres, le statut ou la vue changent.

Une duplication crée un brouillon ; la suppression exige une confirmation. En vue impact, supprimer le dernier impact retire aussi sa perturbation, comme indiqué dans la confirmation. Les données locales de démonstration ont des identifiants stables.

La création/modification ouvre le formulaire. Enregistrer crée/met à jour un brouillon local ; valider crée/met à jour une déclaration dans le jeu local, sans diffusion métier. Le schéma utilise la ligne et les noms d’arrêts de la déclaration, mais sa géométrie reste limitée à six arrêts.

## Adaptations responsive

À 1024 px et moins, les informations des cartes s’empilent et les métadonnées affichent leurs labels ; les en-têtes de colonnes sont masqués. À 760 px et moins, la Sidebar est remplacée par un menu et les actions se replient. Les contrôles et surfaces restent Cadence, avec des styles applicatifs de composition.

## Vérifications

Tests des statuts, périodes, filtres combinés, vues, tri, suppression et persistance ; contrôle des tokens et build Vite. Vérification navigateur de la recherche sans résultat, du Drawer, du lien d’édition, de la duplication et de la suppression d’une copie de test. Contrôles visuels à 1440 et 390 px.

## Limites

Données fictives et stockage navigateur. Pas de gestion multi-utilisateur, d’authentification métier, de concurrence serveur ni d’API. Les dates utilisent le fuseau local ; elles ne constituent pas encore un contrat de fuseau réseau. La suppression locale ne dispose pas d’un mécanisme de restauration. Le choix de TableCard devra être réévalué pour une liste réelle volumineuse, avec DataTable et pagination serveur si le besoin le justifie.
