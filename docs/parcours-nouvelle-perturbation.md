# Parcours de nouvelle perturbation — Cadence

Le parcours utilise les **cinq étapes nommées par l’utilisateur**, malgré la mention initiale de quatre étapes : Objets impactés, Sévérité de l’impact, Période(s) ou créneau(x) d’impact, Messages & canaux de communication, Résumé de la perturbation.

## Fonctions livrées

- Objets multiples par impact : ligne, tronçon, arrêt / déviation, entrée / sortie, point d’intérêt, réseau, course. Modal de choix, pictogrammes fournis, champs adaptés, suppression. Les lignes et arrêts proposés sont ceux du contexte de démonstration chargé ; lieu et référence de course sont saisis librement tant qu’aucun référentiel réel n’est connecté.
- Sévérité commune aux objets d’un impact. Le schéma animé reste limité à cette étape ; il présente un schéma par ligne et par tronçon sélectionné, avec les arrêts et les bornes propres à chaque ligne. Les géométries incompatibles sont signalées sans inventer de tracé. Un autre type d’objet reçoit une explication textuelle.
- Plusieurs périodes continues avec heures ; ou plusieurs créneaux récurrents avec bornes de dates inclusives, jours de semaine et heures. Une fin plus petite que le début signifie le lendemain ; les heures égales sont refusées. Les deux modes conservent leur saisie, seul le mode actif est appliqué. Les heures restent locales au navigateur.
- Messages : titre obligatoire (160 caractères maximum), masques locaux de démonstration, choix E-mail / Moteur de recherche / Facebook / Twitter-X, message unique ou champs personnalisés pour chaque canal. Application explicite du générique aux canaux. Traductions manuelles anglais/espagnol du générique et des messages personnalisés par canal, notification facultative enregistrée, vérification locale des messages.
- Résumé global : informations générales et tous les impacts avec objets, sévérités, périodes/créneaux, canaux, textes et traductions ; liens de retour vers chaque étape de chaque impact.
- Validation de toutes les étapes avant validation finale, résumé d’erreurs et blocage des saisies de date/heure non confirmées. Les modifications invalident l’avancement dépendant de l’impact, et la suppression réindexe les impacts sans leur transférer la progression d’un autre.
- Brouillons incomplets sauvegardables, migration des anciennes données vers le nouveau modèle et compatibilité du dashboard. Le dashboard affiche plusieurs objets, recherche dans leurs titres et calcule le statut avec les périodes actives ; les intervalles sans service entre périodes ne sont pas classés « en cours ».

## Cadence et exceptions

PageSection, Stepper, ProgressBar, Dropdown, DatePicker, **TimePicker**, TextInput, TextArea, Checkbox, SegmentedControl, Modal, DescriptionList, Indicator, InlineAlert et boutons officiels. TimePicker a été ajouté à l’import sélectif et à la provenance ; aucun composant source du dépôt Cadence n’a été modifié.

La version intégrée ne propose pas d’éditeur de texte riche : les messages utilisent TextArea en texte simple. Les anciennes barres d’outils HTML, icônes d’export et lecture audio de la maquette ne sont pas simulées. Les masques ne sont pas un catalogue produit validé. Les canaux sont des métadonnées et aucun message ou notification n’est envoyé. Les traductions ne sont pas générées automatiquement.

Le choix de propriétés prédéfinies pour les informations générales reste en attente du catalogue fourni par l’utilisateur ; le formulaire précédent conserve temporairement les paires nom/valeur libres. Ce point n’a pas été résolu par l’invention de propriétés.

## Sources et validation

- `disruption-workflow.mjs` : objets, canaux, normalisation, projection de compatibilité, validation, récurrences et intervalles.
- `ImpactObjects.jsx`, `ImpactSchedule.jsx`, `ImpactMessages.jsx`, `DisruptionSummary.jsx` : écrans composés.
- `app.jsx` : navigation, progression, actions persistantes et sauvegarde.
- `dashboard-data.mjs` et `Dashboard.jsx` : affichage, périodes, filtres, statuts et compatibilité des brouillons.
- `workflow.css` : composition et responsive, avec tokens Cadence / extensions Traffic Report.

23 tests unitaires passent, ainsi que le contrôle des tokens et le build Vite. Les cas ajoutés portent sur objets multiples, brouillons vides, périodes disjointes, créneaux récurrents de nuit, messages personnalisés et persistance des nouvelles structures. Contrôle navigateur : ajout de ligne à un tronçon, navigation jusqu’au résumé, blocage de créneau incomplet, retour aux périodes sans perte, application du générique et vérification des canaux, rendu bureau et étroit. La validation finale n’a pas été exercée sur les données personnelles du navigateur ; sa validation et sa persistance sont couvertes séparément par les tests de règles et de sauvegarde.
