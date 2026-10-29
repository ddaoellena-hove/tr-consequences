# Informations générales — extension du formulaire

La capture fournie complète le formulaire avec Nom (stocké dans `title`), Référence de la perturbation (`reference`), Cause (`cause`), Début de publication (`publicationStart`), Étiquettes (`labels`) et Propriétés (`properties`).

- Cadence : TextInput, Dropdown, DatePicker withTime, Checkbox, FieldRow, PageSection, PrimaryButton et GhostButton. La grille des quatre champs est égale sur deux colonnes et se replie sur écran étroit. Diatype est conservé.
- Référence générée une seule fois puis modifiable. Une copie du dashboard reçoit une nouvelle référence. Les références locales ne garantissent pas l’unicité dans un futur backend.
- La date de publication est distincte des périodes d’impact. Elle est enregistrée, mais ne programme aucune diffusion serveur et ne change pas la règle actuelle des statuts du dashboard. Le fuseau est celui du navigateur.
- Étiquettes de démonstration : Actualités, Travaux, Confidentiel, Équipements. Sélection multiple facultative via Checkbox, sans prop de sélection inventée sur Badge. « Confidentiel » est une métadonnée et ne met en place aucun contrôle d’accès.
- Propriétés : hypothèse de prototype, paires nom / valeur libres avec ajout et suppression. Aucune liste métier n’a été fournie. La validation exige des lignes complètes et des noms distincts ; une ligne vide peut être supprimée.
- Le badge de complétude utilise la validation générale et l’état de saisie de date. Le résumé d’erreurs pointe sur les nouveaux groupes de champs.
- `withGeneralInformation` initialise les métadonnées absentes des anciens dossiers/brouillons et conserve les valeurs existantes. Les champs sont persistés avec le brouillon et consultables dans le Drawer du dashboard.

Sources : `GeneralInformation.jsx`, `general-information.mjs`, `validation.mjs`, intégration dans `app.jsx` et `dashboard-data.mjs`. Les tests couvrent validation, compatibilité des données anciennes et persistance des métadonnées. 13 tests, contrôle des tokens et build validés ; vérification navigateur de la sélection d’étiquette, ajout/saisie de propriété, complétude et affichage bureau/étroit. Les contrôles visuels ne constituent pas une suite end-to-end automatisée.

Le titre de disclosure est désormais « Détails de la perturbation » : l’ancien « Intitulé et cause » ne décrit plus tout le contenu. Cette extension complète les décisions historiques, sans annuler les autres règles de typographie ou d’espacement.
