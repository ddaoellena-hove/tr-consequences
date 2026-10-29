# Document de Passation — Traffic Report (Déclaration de perturbation)

Ce document fournit tout le contexte technique, fonctionnel et architectural nécessaire à un développeur ou un agent LLM pour reprendre le travail sur ce projet sans perte de contexte.

## Actualisation du 29 octobre 2026

Le projet comprend désormais le tableau de bord et le formulaire. Pour les évolutions récentes et la passation des guidelines, lire [le dossier actualisé](docs/handoff-cadence-migration/README.md) et [le complément dashboard](docs/handoff-cadence-migration/EVOLUTIONS-TABLEAU-DE-BORD.md). Les snapshots et le manifeste y font référence ; les sections historiques ci-dessous ne couvrent pas toutes les évolutions du dashboard.

---

## 1. Contexte & Objectif du Projet

* **Nom du projet** : `traffic-report-prototype`
* **Contexte métier** : Outil destiné aux équipes d'exploitation des réseaux de transport de voyageurs (ici configuré en démonstration pour **Île-de-France Mobilités**).
* **Finalité** : Permettre à un opérateur de déclarer des perturbations (travaux, incidents, événements), de découper la perturbation en impacts indépendants sur une ligne, de modéliser visuellement les conséquences sur les tronçons (interrompu, réduit, retard), et de simuler la validation et sauvegarde locale de la déclaration.

---

## 2. Stack Technique & Dépendances

* **Node.js** : `>=22.12.0` (développé et testé sur Node 26 / npm 11).
* **Frontend** :
  * **React 19** (`react: 19.2.6`, `react-dom: 19.2.6`)
  * **Vite 8** (`vite: 8.3.5`, `@vitejs/plugin-react: 6.1.2`)
* **Design System** :
  * **Hove Cadence Design System 1.0.0** intégré localement via le paquet `@ddaoellena/cadence-ui` (`file:vendor/cadence-ui`).
  * Polices officielles servies localement : *ABC Diatype* (sans) et *Uxum Grotesque* (display).

---

## 3. Architecture des Fichiers

```text
traffic-report/
├── .github/
│   └── workflows/
│       └── ci.yml               # Pipeline CI GitHub Actions (validation build Node 22)
├── public/
│   └── fonts/                   # Polices woff2 copiées par scripts/prepare-assets.mjs
├── scripts/
│   ├── import-cadence.py        # Synchronisation des composants depuis la source hove-cadence-ui
│   └── prepare-assets.mjs       # Copie vendor/cadence-ui/fonts vers public/fonts avant build/dev
├── src/
│   ├── app.jsx                  # Composant principal (parcours, état, stepper, sélecteur sévérité)
│   ├── LineDiagram.jsx          # Schéma animé "thermomètre de ligne" (trajectoires boucles, bus SVG, demi-tours)
│   ├── main.jsx                 # Point d'entrée React (createRoot)
│   ├── styles.css               # Styles spécifiques du prototype (100% alignés sur tokens Cadence)
│   └── validation.mjs           # Règles de validation métier (chronologie, dates, messages)
├── vendor/
│   └── cadence-ui/              # Paquet local autonome contenant les composants Cadence intégrés
│       ├── fonts/               # Polices source Cadence
│       ├── src/                 # Composants TSX & CSS officiels importés
│       ├── package.json         # Manifeste du sous-paquet @ddaoellena/cadence-ui
│       └── provenance.json      # Empreintes SHA-256 et commit Git source
├── dist/                        # Build de production généré par Vite
├── index.html                   # Point d'entrée HTML Vite
├── package.json                 # Dépendances et scripts npm
├── package-lock.json
├── vercel.json                  # Configuration de déploiement Vercel (rewrites SPA & build)
├── vite.config.js               # Configuration Vite (ports 4173/4174, plugins)
├── README.md                    # Documentation générale
└── HANDOFF.md                   # Ce document de relais
```

---

## 4. Design System Cadence UI & Dépendance Locale

### 4.1 Pourquoi `vendor/cadence-ui` est dans Git ?
Le paquet `@ddaoellena/cadence-ui` est référencé dans [package.json](file:///Users/ddao-ellena/tr-consequences%20/traffic-report/package.json) comme une dépendance de type fichier :
```json
"dependencies": {
  "@ddaoellena/cadence-ui": "file:vendor/cadence-ui"
}
```
Pour que les builds distants (sur **GitHub Actions** ou **Vercel**) fonctionnent sans dépendre d'un chemin absolu sur la machine hôte, **l'intégralité du dossier `vendor/cadence-ui` est versionnée dans Git**.

### 4.2 Source d'origine et synchronisation
* Le dépôt source de Cadence UI se trouve en local sur la machine :
  `/Users/ddao-ellena/hove-cadence-ui`
* Pour importer ou mettre à jour des composants Cadence :
  1. Éditer [scripts/import-cadence.py](file:///Users/ddao-ellena/tr-consequences%20/traffic-report/scripts/import-cadence.py) si un nouveau composant racine doit être ajouté à la liste `entries`.
  2. Lancer la synchronisation :
     ```bash
     python3 scripts/import-cadence.py /Users/ddao-ellena/hove-cadence-ui
     ```
  3. Le script résout automatiquement les dépendances locales (`.tsx`, `.ts`, `.css`), copie les polices et met à jour `provenance.json` avec les hashs SHA-256.

### 4.3 Composants Cadence actuellement importés
* Structure & Navigation : `AppLayout`, `Sidebar`, `Avatar`
* Boutons & Contrôles : `PrimaryButton`, `GhostButton`, `Dropdown`, `TextInput`, `TextArea`
* Feedback & États : `Stepper`, `InlineAlert`, `Indicator`, `LineBadge`, `Icons`
* Tokens : `vendor/cadence-ui/src/tokens.css` (variables `--cadence-*`)

---

## 5. Fonctionnement de l'Application ([src/app.jsx](file:///Users/ddao-ellena/tr-consequences%20/traffic-report/src/app.jsx))

### 5.1 Structure de page
L'application est encapsulée dans le composant officiel `<AppLayout>` :
* **Sidebar Cadence** :
  * Thème produit : `product="traffic-report"` (couleur de fond ardoise et logo vectoriel officiel).
  * Repli/dépliement fluide géré nativement (220 px ↔ 80 px).
  * Client : *Île-de-France Mobilités*.
  * Sections : *Perturbations* (actions *Nouvelle déclaration* et *Mes déclarations*).
  * Pied de sidebar : sélecteur de réseau (`scope`) et profil utilisateur connecté (`user` : Hector Malot).
* **Conteneur blanc arrondi (`.app-layout__container`)** :
  * Défilement interne propre (`cadence-scrollbar`).
  * Barre utilitaire supérieure (`.content-top-bar`) avec fil d'Ariane et badges.
  * Bloc rétractable « Informations générales » (`<details className="general panel">`).
  * Bloc de déclaration d'impacts (`<section className="panel impact">`).
  * Schéma SVG de conséquence (`<LineDiagram>`) avec animation Web Animations API des bus en navette ou boucle complète.
  * Carte explicative « Conséquence sur l'objet » avec puce `PassantTag` et texte enrichi.
  * Barre d'options de rendu interactives (Tweaks : code couleur, tag passant/bloquant, animation, vitesse, arrêts).
  * Pied de page d'actions (Enregistrer le brouillon, Valider la déclaration).

### 5.2 Modèle de Données & Sévérités
* **Les 6 Sévérités Officielles** (alignées sur `Sévérité de l'impact.html`) :
  1. `bloquante` (`#DA1E28`) : Tronçon bloquant (non passant, contournement proposé)
  2. `interrompu` (`#A1141B`) : Tronçon non passant (aucune circulation calculée)
  3. `modifie` (`#FD4703`) : Tronçon passant (circulations maintenues, offre adaptée)
  4. `reduit` (`#FD7542`) : Tronçon passant (circulations maintenues, fréquence réduite)
  5. `perturbe` (`#FFA144`) : Tronçon passant (circulations maintenues, retards signalés)
  6. `informative` (`#3EAAC5`) : Tronçon passant (aucun impact itinéraire, message d'info)
* **Perturbation** :
  * `title` (string) : Nom de l'incident (ex. *Travaux sur la ligne 12*).
  * `cause` (string) : *Travaux*, *Incident technique*, *Événement*.
  * `impacts` (Array) : Liste des impacts configurés.
* **Impact** :
  * `severity` : `'bloquante'` | `'interrompu'` | `'modifie'` | `'reduit'` | `'perturbe'` | `'informative'`
  * `from` (number) : Index station de début (0 à 5).
  * `to` (number) : Index station de fin (doit être `> from`).
  * `start` (string) : Date/heure ISO locale (`YYYY-MM-DDTHH:mm`).
  * `end` (string) : Date/heure ISO locale (doit être `> start`).
  * `message` (string) : Message d'information à destination des voyageurs.

### 5.3 Persistance locale
* Les brouillons sont stockés dans le `localStorage` sous la clé `'traffic-report-draft'`.
* La fonction `loadDraft()` vérifie l'intégrité de la structure avant de restaurer les données au chargement.
* Une boîte de dialogue `<dialog>` (« Mes déclarations ») affiche le brouillon enregistré.

---

## 6. Commandes & Cycle de Vie

| Commande | Action | Détail |
| :--- | :--- | :--- |
| `npm install` | Installation des dépendances | Installe React, Vite et le paquet local `vendor/cadence-ui`. |
| `npm run dev` | Serveur de développement | Lance Vite sur **http://localhost:4173** (exécute `predev` pour préparer les polices). |
| `npm run build` | Compilation de production | Lance `prebuild` puis compile les assets dans `dist/`. |
| `npm run preview` | Prévisualisation du build | Sert le dossier `dist/` sur **http://localhost:4174**. |

---

## 7. Configuration GitHub & Vercel

### 7.1 Pousser sur GitHub
Pour associer le dépôt à GitHub :
```bash
git remote add origin https://github.com/<organisation-ou-utilisateur>/<nom-du-repo>.git
git branch -M main
git push -u origin main
```
*Le fichier `.github/workflows/ci.yml` exécutera automatiquement un test de compilation sur chaque push ou pull request.*

### 7.2 Déployer sur Vercel
1. Aller sur le tableau de bord Vercel et cliquer sur **Add New Project**.
2. Importer le dépôt GitHub.
3. Paramètres de build (détectés automatiquement via [vercel.json](file:///Users/ddao-ellena/tr-consequences%20/traffic-report/vercel.json)) :
   * **Framework Preset** : `Vite`
   * **Build Command** : `npm run build`
   * **Output Directory** : `dist`
4. Déployer.

---

## 8. Règles d'Or pour les Futurs Agents LLM / Développeurs

1. **Respect absolu des Design Tokens** :
   * Toute règle CSS dans [src/styles.css](file:///Users/ddao-ellena/tr-consequences%20/traffic-report/src/styles.css) doit utiliser les tokens `var(--cadence-*)` (police, taille, rayon, couleur, z-index).
   * Consulter `vendor/cadence-ui/src/tokens.css` pour connaître la liste exhaustive des variables.
2. **Ne jamais modifier directement `vendor/cadence-ui/src/`** :
   * Si un composant du design system doit évoluer, faire la modification dans `/Users/ddao-ellena/hove-cadence-ui` puis relancer le script de synchronisation `python3 scripts/import-cadence.py`.
3. **Conserver `file:vendor/cadence-ui` commitée** :
   * Ne jamais ajouter `vendor/` au `.gitignore`, sous peine de casser immédiatement le build Vercel et GitHub Actions.
4. **Dates et Fuseaux horaires** :
   * Les champs `datetime-local` s'interprètent dans le fuseau local du navigateur. Les fonctions de validation se trouvent dans [src/validation.mjs](file:///Users/ddao-ellena/tr-consequences%20/traffic-report/src/validation.mjs).

---

## 9. Pistes d'Évolution & Backlog Suggéré

* [ ] **Connexion API** : Remplacer la persistance `localStorage` par des appels API REST / GraphQL vers le backend Traffic Report.
* [ ] **Multi-lignes** : Permettre de sélectionner d'autres lignes que la Ligne 12 (chargement des stations dynamique).
* [ ] **Export normalisé** : Générateur d'export aux formats SIRI-SX / NeTEx ou GTFS-RT Service Alerts.
* [ ] **Gestion des suppressions d'impacts** : Ajouter un bouton pour supprimer un impact spécifique lorsqu'il y en a plusieurs.
