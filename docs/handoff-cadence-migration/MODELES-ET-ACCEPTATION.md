# Modèles réutilisables et critères de livraison

## Modèle : audit de migration

```markdown
# Audit de migration — [projet] — [date]

## Références
- Référence visuelle / prototype :
- Dépôt cible et état Git :
- Version Cadence / révision / modifications locales :
- Parcours observés et états non fournis :

## Mapping
| Zone | Intention et états | Composant/API vérifiés | Décision | Écart | Priorité |
|---|---|---|---|---|---|

## Règles métier et hypothèses
- Données réelles / fictives :
- Validation et complétude :
- Dates et fuseau :
- Objets répétés et identifiants :
- Chargement, erreurs et persistance :

## Exceptions
| Écart | Justification | Portée | Validation utilisateur | Condition de réexamen |
|---|---|---|---|---|

## Risques de composition
- Ancêtres à overflow et overlays :
- Hiérarchie des titres, labels et focus :
- Responsive et défilement :
- Footer et accès au dernier contenu :

## Vérifications
| Contrôle | Scénario | Résultat observé | Preuve ou limite |
|---|---|---|---|

## Livraison
- Fichiers modifiés :
- Révision et branche :
- Commit / push effectués ou non :
- Aperçu / déploiement et état vérifié :
- Actions restantes :
```

## Modèle : fiche d’exception

```markdown
### [Nom de l’exception]
- Besoin :
- Composant standard évalué :
- Information ou comportement perdu si substitution :
- Décision et personne/échange de validation :
- Implémentation locale :
- Tokens / accessibilité / responsive :
- Limite et condition de réexamen :
```

## Contrat d’acceptation de la mission documentaire

- [ ] Le guide se comprend sans la conversation Traffic Report.
- [ ] README et GUIDELINES donnent accès au guide par des liens relatifs valides.
- [ ] Les règles officielles restent dans les guidelines ; les fiches API ne sont pas recopiées inutilement.
- [ ] Les exemples suivent les types et variantes réellement exportés.
- [ ] Le guide traite maquettes, captures et prototypes HTML, y compris leurs états implicites.
- [ ] Une méthode explicite distingue réutilisation, composition et spécifique métier.
- [ ] Typographie, tokens et responsive sont distingués du niveau sémantique des titres.
- [ ] Le clipping d’overlay est expliqué avec sa chaîne d’ancêtres, sans solution magique par z-index.
- [ ] Validation, focus, dates en cours d’édition et avancement par objet sont couverts.
- [ ] Le footer persistant est décrit sans inventer AppLayout.footer.
- [ ] Les exceptions Traffic Report restent dans l’étude de cas.
- [ ] FieldRow n’est pas crédité d’un responsive absent de la version inspectée.
- [ ] Le guide ne promet ni zéro inline DOM, ni contraste certifié, ni robustesse backend/fort volume par la seule migration Cadence.
- [ ] Les lacunes de composants et contradictions sont listées séparément des règles applicables.
- [ ] Les changements préexistants du dépôt cible ont été préservés.
- [ ] Le rapport distingue contrôles exécutés et contrôles recommandés.
- [ ] Aucun push, déploiement ou publication de package n’est présenté comme réalisé sans preuve.

## Scénarios de référence à citer dans le guide

| Famille | Scénario concret | Attendu |
|---|---|---|
| Disclosure | Cause ouverte dans une carte et un accordéon | Toutes les options sont visibles et utilisables |
| Sélecteur | Séparateur avant Service modifié | Deux groupes lisibles sans faux élément sélectionnable |
| Erreur | Intitulé manquant dans une section fermée | Section ouverte, erreur résumée et cible accessible |
| Dates | Fin antérieure au début | Blocage, message lié au champ et correction possible |
| Dates | Frappe non confirmée sur une ancienne valeur valide | Aucune progression fondée sur une valeur obsolète |
| Multi-objets | Ajout d’un impact après un impact renseigné | Avancement distinct, pas de complétion héritée |
| Synthèse | Message long dans le récapitulatif | Labels/valeurs lisibles et repli sans débordement |
| Historique | Aucun brouillon | EmptyState adapté au contexte |
| Navigation | Largeur mobile avec sidebar de bureau | Accès à la navigation sans comprimer le formulaire |
| Footer | Défilement haut/bas et mobile | Actions visibles, contenu final atteignable |
| Illustration | Remplacement d’un bus latéral par un picto frontal | Vérifier le sens visuel ; accepter une exception justifiée |

## Rapport final attendu de l’autre LLM

1. Fichiers créés/modifiés et rôle de chacun.
2. Règles nouvelles, clarifications et éventuelles suppressions de doublons.
3. Tableau des contradictions résolues et des décisions encore ouvertes.
4. Exceptions produit conservées.
5. Vérifications exécutées avec leurs résultats et limites.
6. État Git final et consignes de reprise.

## Complément de recette — dashboard

- [ ] Le nom du composant réel est vérifié (TableCard, pas DataCard par analogie visuelle).
- [ ] Les pictogrammes d’objet couvrent les scopes et disposent d’un fallback explicite ; la couleur et le texte suivent les tokens et l’accessibilité.
- [ ] Les fonds derrière les rayons n’exposent pas de blanc parasite ; hauteur du header, icône et jonction sont mesurées.
- [ ] La sévérité reste lisible sans percevoir la couleur et ne s’annonce pas deux fois.
- [ ] Recherche, tri et filtres sont appliqués avant pagination ; vue par impact et sélection ont une portée explicite.
- [ ] Consultation, édition, duplication, suppression confirmée, absence de résultat et responsive sont vérifiés selon le périmètre.
- [ ] Les identifiants locaux ne sont pas présentés comme un référentiel métier serveur.

- [ ] Les infobulles des actions de carte ne répètent pas le titre : Dupliquer, Modifier, Consulter, Supprimer ; les cases restent contextualisées.
