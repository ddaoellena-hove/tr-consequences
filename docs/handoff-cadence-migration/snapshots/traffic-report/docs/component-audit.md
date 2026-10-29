# Audit des composants — 28 octobre 2026

Référence : sources locales de Hove Cadence UI 1.0.0, importées sans modification. Les empreintes des fichiers et le commit source sont enregistrés dans `vendor/cadence-ui/provenance.json`.

| Zone | Constat avant migration | Résultat |
|---|---|---|
| Structure et navigation | AppLayout, Sidebar, PageHeader, Breadcrumbs déjà intégrés | Conservés |
| Sévérité | Menu maison, gestion partielle du clavier et label non associé | Dropdown, options avec pastilles et libellés passant/non passant ; six sévérités conservées |
| Informations générales | details/summary stylés et coche de validation inconditionnelle | Accordion ; ouverture forcée en cas d’intitulé vide, sans prétendre que les données sont validées |
| Panneau des impacts | Conteneur maison | PageSection avec surface card |
| Progression | Deux div visuelles sans sémantique | ProgressBar avec nom accessible et valeur |
| Actions | CSS applicatif redéfinissant la classe Cadence form-actions | FormActions, styles applicatifs limités à des classes propres |
| Dates et heures | TextInput datetime-local | DatePicker withTime ; confirmation explicite dans le calendrier, sérialisation locale sans conversion UTC |
| Options d’affichage | Cases et select natifs stylés | Checkbox et SegmentedControl, vitesse désactivée quand l’animation est coupée |
| Conséquences | Carte et pastille dessinées à la main | InlineAlert et Indicator ; textes métier et options conservés |
| Badges d’en-tête | Deux spans stylés | Badge |
| Notifications | Toast maison et minuteur applicatif | Toaster et API toast Cadence |
| Historique | Dialog natif habillé et fermeture spécifique | Modal Cadence, fermeture Échap, gestion du focus et retour à la navigation |
| Texte, boutons, étapes | TextInput, TextArea, PrimaryButton, GhostButton, Stepper | Conservés |
| Schéma de conséquences | SVG animé avec ruptures et demi-tours | Géométrie métier conservée ; badge migré vers Indicator, LineBadge déjà présent |

## Exception motivée : schéma métier

Le LineDiagram du design system représente les positions et retards des véhicules sur une ligne. Son API expose les arrêts, les véhicules et leurs directions, mais pas les segments non passants, la déviation ni les demi-tours du prototype. Le substituer supprimerait des informations métier. Le SVG et son animation restent donc spécifiques ; ils ne constituent pas une copie du composant Cadence.

## Styles et règles métier

Suppression des styles des anciens menus, badges, modale, toast, actions et accordéon. Suppression des règles globales sur les titres et les focus qui écrasaient le design system. Correction des références à des tokens absents (font-size-xsmall, border-subtle). Les couleurs des six sévérités restent les données métier préexistantes, sans modification de leur sens. Leur statut « officiel » n’est pas certifié par cet audit.

## Vérifications

Compilation de production Vite ; contrôle des imports et de l’identité des sources Cadence ; vérification navigateur du menu, du parcours, de la modale, des options et du calendrier. Le projet reste un prototype avec sauvegarde locale, sans publication voyageurs.
