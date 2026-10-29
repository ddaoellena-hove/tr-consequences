# PageSection — titre extérieur et surface avec ombre

Statut : présentation validée par l’utilisateur dans Traffic Report le 29 octobre 2026. Cette fiche décrit l’intégration à réaliser dans Cadence ; elle ne prétend pas que cette API existe déjà dans le design system.

## Objectif et périmètre

Donner un repère stable aux sections principales d’une page de formulaire ou d’un tableau de bord : titre et actions hors de la boîte, contenu dans une surface blanche arrondie avec une ombre discrète. La séparation entre sections améliore la lecture des interfaces denses.

Références implémentées dans Traffic Report : Informations générales, Impacts de la perturbation et Perturbations du réseau. Le schéma de conséquence, désormais intégré dans Impacts, est une section nue pleine largeur. Les cartes d’objets imbriquées conservent leur présentation actuelle. Les sections sans surface restent inchangées.

## Anatomie validée

```text
Section nommée par son titre
  En-tête extérieur : titre + description éventuelle | actions / état
  Espace de 12 px
  Boîte : fond blanc, bordure, rayon, ombre
    Contenu fourni par le produit
```

Le titre, la description, les icônes éventuelles et les actions restent dans l’en-tête sémantique de la section, au-dessus de la surface. Aucun filet ne sépare cet en-tête extérieur du contenu. L’état « Remplie / À compléter » demeure associé au titre.

Le corps conserve les séparateurs internes utiles au formulaire : barre d’impact, navigation des étapes, filtres, etc. Un accordéon peut constituer son contenu ; retirer alors les bordures de début et de fin qui doubleraient la bordure de la surface. Ne pas masquer les contours de focus ni les menus débordants.

## Valeurs et tokens

| Propriété | Valeur validée | Token utilisé dans Traffic Report | Cible Cadence proposée |
| --- | --- | --- | --- |
| Ombre du corps | `0 0 2px 0 rgba(0, 0, 0, 0.10), 0 2px 10px 0 rgba(0, 0, 0, 0.05)` | `--cadence-shadow-section` | Token global créé dans Cadence |
| Rayon du corps | 12 px | `--cadence-radius-xl` | Réutiliser ce token existant |
| Fond du corps | Blanc | `--cadence-color-white` | Token existant |
| Bordure du corps | 1 px, couleur de bordure Cadence | `--tr-border-width` + `--cadence-color-border` | Réutiliser les fondations existantes si disponibles |
| Marge horizontale de la section | 8 px de chaque côté dans son parent | `--cadence-section-inset-inline` | Token global créé |
| Padding horizontal de l’en-tête | 8 px | `--cadence-section-padding-inline` | Token global créé |
| Espace entre en-tête et boîte | 12 px | `--cadence-section-heading-gap` | Token global créé |
| Padding horizontal du corps | 8 px ajoutés au contenu existant | `--cadence-section-padding-inline` | Token global créé |
| Espace entre sections principales | 32 px | `--cadence-section-gap` | Token global créé |

Le rayon est passé de 10 à 12 px lors de la validation. Utiliser directement `--cadence-radius-xl` ; ne pas modifier globalement `--cadence-radius-lg` et ne pas conserver un calcul « lg + 2 ».

L’ombre est différente des ombres Cadence existantes : utiliser le token global dédié sans changer `--cadence-shadow-sm` ou `--cadence-shadow-md`, utilisés par d’autres composants.

```css
/* Token global défini dans src/components/tokens.css de Cadence. */
--cadence-shadow-section: 0 0 2px 0 rgba(0, 0, 0, 0.10),
                          0 2px 10px 0 rgba(0, 0, 0, 0.05);
```

Les rôles de composition de page et de section disposent désormais des tokens globaux listés ci-dessous. Les `--tr-space-*` restent des extensions locales pour les autres espacements du prototype. Utiliser les tokens de rôle dans les composants concernés, sans multiplier des valeurs littérales.

## Distinguer padding du composant et padding du contenu

Les 8 px sur les côtés du corps s’ajoutent aux paddings déjà portés par ses enfants, sauf pour la section Impacts : son corps est bord à bord (`padding-inline: 0`) pour que la barre de progression et les séparateurs atteignent les bords de la surface. Ses enfants gardent leurs propres paddings. Dans l’implémentation validée, la barre d’impact garde 24 px de padding latéral, le formulaire 32 px sur desktop et 16 px sur mobile, le déclencheur d’accordéon 20 px. La marge de page reste gérée par le layout.

Ne pas recopier automatiquement ces paddings métier dans PageSection : une section de tableau et une section de formulaire n’ont pas la même composition. Documenter explicitement l’addition des espacements pour éviter un double padding involontaire.

Dans Traffic Report, l’espace de 32 px est porté par la marge basse d’Informations générales et la marge haute de chaque schéma. Les sections ne doivent pas cumuler deux marges de 32 px. Dans Cadence, privilégier un parent de composition avec un seul `gap`.

## Intégration recommandée dans Cadence

1. Vérifier le composant PageSection et ses usages actuels avant modification.
2. Le token global `--cadence-shadow-section` est désormais défini dans `src/components/tokens.css` et documenté dans `GUIDELINES.md` du dépôt Cadence. Il est consommé directement par Traffic Report via sa copie vendor. Inclure ce changement dans la prochaine publication du package pour le distribuer aux autres produits.
3. Ajouter une variante explicite, par exemple `surface="elevated"`, pour cette anatomie. **Cette valeur est une proposition et n’existe pas dans la version consommée par Traffic Report.** Conserver `surface="card"` et `surface="none"` pour éviter une modification silencieuse des cartes imbriquées existantes.
4. Appliquer fond, bordure, rayon et ombre au corps uniquement ; laisser la racine transparente et l’en-tête extérieur sans bordure. Préserver l’association `aria-labelledby` entre la section et son titre.
5. Prévoir la composition avec les actions d’en-tête, une description, un accordéon, des tableaux et des contrôles à menus. Les actions peuvent revenir à la ligne sur petit écran.
6. Ajouter les exemples et critères ci-dessous à Storybook et aux guidelines. Le nom définitif de la variante doit suivre les conventions du dépôt.
7. Migrer les trois usages principaux Traffic Report vers cette variante, puis supprimer les surcharges applicatives. Le token global d’ombre est déjà consommé directement.

Ne pas déplacer le contenu dans un nouveau repère `section` sans titre : la section nommée doit continuer à englober en-tête et corps. Les titres de formulaire restent en Diatype et conservent leur hiérarchie ; le changement de surface ne doit pas introduire Uxum.

## État du code Traffic Report

- Cadence `src/components/tokens.css` : nouveau token global `--cadence-shadow-section`, disponible pour tous les produits.
- Traffic Report `src/styles.css` : consommation directe du token global ; aucune définition ni alias d’ombre `--tr-*`. Le rayon Cadence existant est réutilisé directement.
- `src/styles.css` : sélecteurs `.section-preview.page-section--card` et enfants directs `.page-section__head` / `.page-section__body`.
- `src/app.jsx` : opt-in des sections Informations générales et Impacts de la perturbation.
- `src/LineDiagram.jsx` : section nue intégrée dans Impacts, sans opt-in de surface avec ombre.
- `src/Dashboard.jsx` : opt-in de la section Perturbations du réseau.

Le nom technique `section-preview` est conservé jusqu’à la migration vers une véritable variante de la bibliothèque. Il ne représente pas une API publique de Cadence. Le token global a été ajouté au dépôt source Cadence et à la copie vendor ciblée. La variante de PageSection elle-même reste à intégrer dans la bibliothèque. Les autres changements déjà présents dans Cadence sont préservés.

## Critères d’acceptation

- Titre et actions visibles au-dessus de la boîte ; aucune ombre ou bordure autour de l’en-tête.
- Corps avec l’ombre exacte ci-dessus et un rayon calculé de 12 px.
- Espace en-tête / corps de 12 px et séparation de 32 px entre sections principales, sans cumul.
- Accordéon ouvert et fermé : aucune bordure doublée ni coupure de contenu.
- Dropdown de sévérité, sélecteurs de date et menus : aucune coupure par un `overflow: hidden` de la section.
- Focus visible, hiérarchie de titres et nom accessible de la section préservés.
- Actions et titres longs lisibles à 390 px et sur desktop ; pas de débordement horizontal de page.
- Plusieurs schémas de conséquence affichables successivement avec la même présentation.
- Cartes d’objets imbriquées et anciennes variantes inchangées.
- Aucune valeur inline ajoutée aux usages ; contrôle des tokens et build passent.

Vérifications réalisées dans Traffic Report : rendu desktop et mobile de la première version, puis styles calculés de la version finale (rayon 12 px et ombre exacte), contrôle des tokens et build. Les tests de non-régression de Cadence restent à réaliser lors de l’intégration de la variante.

## Tokens globaux de composition ajoutés

Ces tokens sont définis dans les fondations Cadence, documentés dans ses guidelines et consommés directement par Traffic Report (déclaration et tableau de bord).

- `--cadence-page-padding-inline` : 32px — Padding latéral du contenu de page sur grand écran.
- `--cadence-page-padding-inline-compact` : 16px — Padding latéral du contenu de page sur petit écran.
- `--cadence-section-inset-inline` : 8px — Retrait latéral supplémentaire des sections dans le contenu de page.
- `--cadence-section-padding-inline` : 8px — Padding latéral de l’en-tête extérieur et du corps de section.
- `--cadence-section-heading-gap` : 12px — Espace entre l’en-tête extérieur et la surface de section.
- `--cadence-section-gap` : 32px — Espace entre deux sections principales ; appliquer une seule fois.

Les paddings de page et le retrait de section s’additionnent : bord de page → bord de boîte = 40 px sur desktop (32 + 8), 24 px sur mobile (16 + 8). Le padding interne du corps est distinct. Les tokens de page `compact` sont choisis par la composition responsive du produit (760 px dans Traffic Report), pas par une media query embarquée dans le token.

Utiliser `--cadence-section-gap` une seule fois entre deux sections, via un `gap` du parent ou une marge sur un seul voisin. Ces tokens expriment un rôle ; ils ne remplacent pas tous les espacements métier de même valeur numérique. Les anciens `--tr-space-*` restent des extensions locales pour les autres usages.

Pour la future variante Cadence, prévoir un corps sans padding en option pour les progressions, tableaux et séparateurs bord à bord. Ne pas compenser avec des marges négatives ni masquer les débordements des dropdowns.
