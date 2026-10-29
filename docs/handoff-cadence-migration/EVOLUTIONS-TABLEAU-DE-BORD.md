# Complément de passation — tableau de bord et objets impactés

Mis à jour le 29 octobre 2026. État applicatif de référence : `bb0fa13df904d5f3fb3a77771b2d7aa9b867682e`. Ce complément décrit des réalisations ; les recommandations destinées à Cadence restent à intégrer dans son dépôt.

## Tableau de bord livré

Le projet comporte deux écrans reliés par `#dashboard` et `#declaration`. Le tableau de bord est l’entrée par défaut. Il propose quatre statuts (en cours, à venir, passées, brouillons), une vue par perturbation ou par impact, recherche, filtres combinés, tri, pagination et sélection multiple. Les filtres de ligne, sévérité et objet correspondent au même impact. Recherche, filtres et tri précèdent la pagination.

La liste utilise **TableCard + TableHeader**, et non un composant nommé DataCard : « DataCard » désigne ici la référence visuelle fournie par l’utilisateur. Les colonnes de dates et de sévérité partagent les mêmes largeurs entre en-tête et cartes ; la colonne des impacts prend le reste. Les cartes se réorganisent sous 1024 px et la navigation sous 760 px.

Les actions permettent consultation en Drawer, modification dans le formulaire, duplication en brouillon et suppression confirmée en Modal. BulkActionBar porte les actions de sélection ; Pagination règle la taille de page. EmptyState traite l’absence de résultats. La création/modification conserve l’identité locale du dossier. Les données restent fictives, enregistrées dans `traffic-report-records-v1` ; la validation ne diffuse rien aux voyageurs.

## Présentation des objets impactés

Chaque objet est une composition **PageSection surface="card"**, avec titre de niveau 4, pictogramme dans `iconElement`, détails et LineBadge éventuels. Le wrapper TableCard conserve ses actions de header ; aucune action de sauvegarde n’a été ajoutée à partir de la seule icône présente sur la capture.

Les types sont associés aux pictogrammes fournis dans `Disruptions-icons.zip` :

| Scope actuel | Libellé | Fichier fourni |
|---|---|---|
| line | Ligne | Type=Line.svg |
| stop | Arrêt / déviation | Type=Deviation.svg |
| section | Tronçon | Type=Line Section.svg |
| access | Entrée / sortie | Type=Entrance exit.svg |
| poi | Point d’intérêt | Type=POI.svg |

Le scope `stop` représente actuellement une déviation. Ne pas en déduire que tout arrêt réel est une déviation : séparer les catégories si le modèle métier évolue. Les géométries des dix icônes du ZIP sont conservées dans `disruption-icon-paths.mjs` ; le composant `DisruptionObjectIcon.jsx` choisit l’icône, avec repli sur tronçon. Elles sont des assets métier du produit, pas des exports officiels de Cadence.

Les couleurs originales du ZIP sont remplacées par les tokens `--cadence-color-label` et `--cadence-color-icon-muted`. Les SVG sont décoratifs (`aria-hidden`, non focalisables), car le libellé adjacent transmet le sens. Aucune injection de SVG brut à l’exécution.

## Correctifs visuels vérifiés

- Header des objets : **44 px** dans le rendu mesuré, obtenu avec icône **24 px** et padding vertical de 10 px calculé à partir des extensions de spacing existantes. Padding horizontal 12 px. Pas de hauteur fixe qui tronque un libellé long.
- Fond du wrapper identique à celui du header : supprime les morceaux blancs visibles derrière les coins supérieurs arrondis du contenu. Aucun espace vertical entre header et corps ; bordure de séparation portée par le corps.
- Corps au fond `surface-subtle`, titre d’objet en capitales ; dates hiérarchisées en date / heure atténuée.
- Sévérité des lignes : **Indicator appearance="dot" + libellé visible**, au lieu d’un badge rempli. La pastille est masquée aux technologies d’assistance dans cette composition pour ne pas doubler le texte.
- Barre de progression du formulaire : angles droits via une classe locale `declaration-progress`, sans changement global de ProgressBar.

Ces adaptations sont limitées aux classes du produit dans `dashboard.css` et `styles.css`. Elles ne définissent aucune nouvelle variante officielle de PageSection ou ProgressBar. Les sélecteurs ciblant les classes internes doivent être revérifiés à chaque synchronisation de Cadence.

## Enseignements pour les guidelines et le guide

1. Choisir TableCard pour les éléments riches peu nombreux ; évaluer DataTable et la pagination serveur pour un volume important. La pagination locale ne résout pas le chargement de gros jeux de données.
2. Distinguer l’icône d’action UI, le pictogramme de mode de transport, le pictogramme d’objet métier et l’illustration animée. Ils ne sont pas interchangeables.
3. Pour un asset fourni, inventorier les variantes, expliciter le mapping métier et le fallback, conserver la géométrie et appliquer les tokens aux couleurs pertinentes.
4. Pour les cartes imbriquées, vérifier la jonction à zoom normal : fond du parent, rayon du corps, bordure et gap. Un fond blanc derrière un rayon produit un défaut même si le gap mesuré est nul.
5. Documenter séparément la hauteur d’icône, le padding et la hauteur résultante du header. Tester les titres longs avant de figer une hauteur.
6. Une pastille de statut exige un libellé lisible ; la couleur seule n’est pas suffisante. Préserver le composant Indicator et son API dot.
7. Une capture ne définit pas les comportements : documenter tri, filtres par impact, sélection, suppression et liens vers le formulaire, sans inventer un backend.

## Sources et vérifications

Consulter les snapshots de `Dashboard.jsx`, `dashboard.css`, `dashboard-data.mjs`, `traffic-model.mjs`, `DisruptionObjectIcon.jsx`, `disruption-icon-paths.mjs`, `tests/dashboard.test.mjs` et `docs/dashboard-cadence.md`.

Les snapshots `vendor/cadence-ui/src/` prouvent les API effectivement embarquées. Les snapshots `cadence/` décrivent le checkout du design system ; ces deux origines ne doivent pas être confondues.

La livraison du dashboard a passé 11 tests unitaires, le contrôle statique des tokens et le build Vite. Le dernier correctif CSS a repassé tokens et build, puis une vérification navigateur : cinq headers à 44 px, cinq icônes à 24 px et gap nul. Contrôles visuels effectués en disposition bureau et étroite ; ce ne sont pas des tests end-to-end automatisés.

Le dernier code a été publié sur le Site privé avec succès. Au point de référence ci-dessus, les deux dernières adaptations n’avaient pas été poussées sur GitHub. La présente livraison prévoit leur push avec les infobulles et la passation ; vérifier le résultat Git avant d’annoncer la synchronisation.

## Dernier ajustement — infobulles d’action

Les boutons icône de chaque TableCard affichent uniquement le verbe : **Dupliquer**, **Modifier**, **Consulter**, **Supprimer**. Le titre de la perturbation n’est plus répété dans l’infobulle. Dans l’API Cadence embarquée, BaseButton génère cette infobulle à partir du nom accessible `aria-label` ; les quatre noms portent donc ces seuls verbes. La case de sélection conserve son libellé contextualisé. Aucun comportement d’action ni composant du design system n’a été changé.

Cette densité de libellé est une décision Traffic Report. Ne pas inventer une prop tooltip distincte absente de cette version du composant.
