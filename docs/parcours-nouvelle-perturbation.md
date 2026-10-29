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

## Navigation fixe compacte — 29 octobre 2026

Le stepper et la progression sont déplacés de la carte Impacts vers le footer fixe. Sur desktop : cinq icônes Cadence et pastilles d’état, infobulles au survol / focus, avec le contexte « Impact n° N · étape/5 · libellé actif » à droite des icônes. Les étapes terminées restent accessibles ; les étapes futures restent indisponibles. La progression indique la position dans le parcours de l’impact courant, pas la complétude globale de la déclaration.

Sur mobile : un Dropdown Cadence expose l’étape active et la liste des étapes, avec les mêmes restrictions. Ce menu s’ouvre au-dessus de la barre pour rester visible. Les actions Brouillon et Valider (à la dernière étape) restent dans la barre fixe ; le statut du brouillon apparaît à leur gauche. Précédent / Suivant restent en bas de la section Impacts de la perturbation. La progression est bord à bord en haut du footer, sans arrondi. Les notifications sont positionnées au-dessus de la barre sur petit écran.

La composition locale `CompactImpactStepper` utilise les boutons, icônes et Dropdown de Cadence ; elle ne modifie pas l’API Stepper de la bibliothèque. Le contrôle `go` et les validations existantes sont conservés. Ajouter cette variante compacte au design system reste une évolution distincte.

Le schéma de conséquence, ses options d’affichage et son InlineAlert sont regroupés dans le corps de la section Impacts, après la sélection de sévérité et avant Précédent / Suivant. Cette composition comprend aussi les aperçus par ligne et les messages de remplacement ; elle reste limitée à l’étape Sévérité. Les titres des schémas sont de niveau 3, sous le titre de section de niveau 2.

Le schéma ne possède plus de carte imbriquée : sa section nue occupe toute la largeur intérieure d’Impacts, après un séparateur gris sous le champ Sévérité. Les options et l’alerte conservent leur padding latéral. Le badge passant / bloquant est retiré de l’InlineAlert bleu ; il reste dans l’en-tête du schéma et sa légende.

## Simplification du 30 octobre 2026

La partie Options d’affichage est supprimée. Le schéma utilise une configuration fixe : couleurs et labels visibles, badge dans son en-tête, animation active à vitesse normale. L’alerte de conséquence reste sans badge. Les mentions antérieures des contrôles d’affichage décrivent l’historique du prototype.

## Création disponible après les messages — 30 octobre 2026

Le bouton « Créer la perturbation » est toujours présent dans le footer. Il reste désactivé tant que les informations générales sont incomplètes, qu’une date est en cours de saisie ou qu’un impact n’a pas ses étapes 0 à 3 valides et validées. « Vérifier les messages » valide la quatrième étape et permet la création depuis Messages ; « Suivant » effectue également les contrôles avant le résumé. Le résumé n’est pas un prérequis de création.

Modifier un impact invalide la validation de l’étape concernée et des étapes suivantes. Commencer à modifier une date invalide également la validation temporelle ou celle des messages, pour éviter qu’un changement d’impact contourne une saisie non confirmée. Le bouton se désactive après création et se réévalue lors des modifications. Les données et validations de tous les impacts sont contrôlées, pas uniquement celles de l’impact courant.

## Informations générales dans le stepper — 30 octobre 2026

Le stepper de déclaration compte six étapes : Informations générales, Objets impactés, Sévérité, Périodes / créneaux, Messages, Résumé. La première est commune à tous les impacts ; les cinq suivantes suivent l’impact sélectionné. Le clic sur la première étape ouvre l’accordéon et rend le formulaire accessible ; La section Informations générales ne contient plus de bouton Suivant ; le stepper permet de rejoindre les objets impactés. Précédent depuis Objets revient aux informations générales. Le focus dans une section actualise le contexte actif du stepper.

La première pastille reflète les champs obligatoires et la saisie de publication en cours. La progression et les compteurs affichés sont sur six étapes ; les indices internes des cinq étapes d’impact et des validations restent inchangés. La création peut toujours être activée après validation des messages (cinquième étape globale), sans visite obligatoire du résumé. Les données des informations générales ne sont pas dupliquées par impact.

L’essai d’agrandissement des pastilles est annulé : pastille de 12 px, coche de 8 px et hauteur du footer antérieure rétablies.
