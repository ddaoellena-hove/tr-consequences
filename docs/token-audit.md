# Audit des tokens — 28 octobre 2026

## Périmètre et résultat

Le code applicatif `src/` n’a plus de prop JSX `style` ni d’écriture `element.style`. Les couleurs, polices, rayons et surfaces utilisent Cadence. Les références aux variables CSS sont contrôlées par `npm run check:tokens`.

Les espacements et dimensions de composition, absents des tokens Cadence fournis, sont centralisés dans `src/tokens.css` sous le préfixe **`--tr-*`**. Ce sont des extensions Traffic Report, pas des tokens officiels Cadence. Les espacements sont alignés sur une échelle 2/4/8/12/16/20/24/32. Les six couleurs métier existantes sont conservées dans des tokens sémantiques `--tr-severity-*`. Le texte du récapitulatif utilise les couleurs de texte sémantiques Cadence.

## Exceptions explicites

- Les coordonnées SVG, tailles de pictogrammes, épaisseurs de tracé et calculs de trajectoire sont des données géométriques, conservées dans le schéma ; elles ne sont pas intégralement tokenisées.
- Les transformations et durées calculées de l’animation sont appliquées avec Web Animations API, pas avec des styles JSX.
- Le breakpoint `760px` reste une constante CSS documentée : les propriétés personnalisées CSS ne fonctionnent pas dans les conditions `@media` natives.
- Les proportions (`100%`, `1fr`), zéros et mots-clés de mise en page restent du CSS standard.
- Le code importé `vendor/cadence-ui` reste identique au design system local. Cadence utilise lui-même des styles inline pour des valeurs calculées (progression, positionnement, espacement, graphiques) et des valeurs fixes internes. L’audit ne prétend donc pas que le DOM final est dépourvu de tout attribut style.

## Contrôle reproductible

`npm run check:tokens` contrôle les fichiers JSX et CSS applicatifs : styles inline, couleurs littérales hors fichier de tokens, références à des tokens inexistants et dimensions CSS hors tokens (exception du breakpoint ci-dessus). Ce contrôle statique ne remplace pas une vérification exhaustive du design system ou du rendu navigateur.
