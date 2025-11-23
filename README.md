# PullMeIn  
B3 – Intégration continue – Projet 1

## Présentation du projet

**PullMeIn** est un site communautaire qui centralise et partage des articles techniques rédigés par des professionnels et des passionnés.

Objectifs principaux :

- Permettre une **contribution simple** via un **formulaire en ligne**.
- Utiliser **GitHub**, une **API** et des **pipelines d’intégration continue** pour automatiser :
  - la création de Pull Requests,
  - la validation des contenus,
  - la génération des pages HTML.
- Garantir la **qualité éditoriale** et la **sécurité** des articles publiés (validation stricte du contenu).

Flux global :

1. Un utilisateur soumet un article via le formulaire du site.
2. L’API (hébergée sur Render) crée automatiquement une **Pull Request** avec un fichier JSON dans `data/articles/`.
3. La CI GitHub valide le contenu et génère les pages HTML.
4. Après merge, les pages sont mises à jour et le site est déployé sur **GitHub Pages**.

---

## Architecture générale

Le projet est découpé en trois grandes parties :

1. **Frontend statique** (HTML / CSS / JS – GitHub Pages)  
2. **Données d’articles** (fichiers JSON dans `data/articles/`)  
3. **Pipelines Node.js + GitHub Actions** (validation + génération HTML)

### Arborescence simplifiée

```txt
.
|____ data/
|     |____ articles/
|           |____ YYYY-MM-DD-slug-auteur.json   # Articles soumis (via l’API)
|
|____ article_detail_page/
|     |____ YYYY-MM-DD-slug-auteur.html         # Pages d’articles générées
|
|____ scripts/
|     |____ app.js                              # Fonctions utilitaires front
|     |____ validateArticles.js                 # Validation des articles JSON
|     |____ generateArticles.js                 # Génération HTML + articlesData.js
|     |____ articlesData.js                     # (GÉNÉRÉ) liste des articles pour le front
|
|____ styles.css                                # Styles globaux du site
|____ index.html                                # Accueil / login
|____ articles.html                             # Liste des articles
|____ submit.html                               # Formulaire "Proposer un article"
|____ about.html                                # Page "À propos"
|
|____ api/
|     |____ server.js                           # API Node/Express (Render)
|     |____ github.js                           # Intégration GitHub (Octokit)
|     |____ validation.js                       # Validation minimale côté API
|
|____ .github/
      |____ workflows/
            |____ ci.yml                        # CI sur PR (validation + build)
            |____ build-html.yml                # Build & commit HTML sur main
```

>  `scripts/articlesData.js` et `article_detail_page/*.html` sont **générés automatiquement** par la pipeline.  
> Ils ne doivent normalement pas être modifiés à la main.

---

## Frontend : pages du site (GitHub Pages)

Le site est statique et déployé sur **GitHub Pages** à partir de la branche `main`.

### Pages principales

- **`index.html`**  
  Page d’accueil / login.  
  Permet de se connecter ou de continuer en mode invité (affichage du pseudo dans la navbar, etc.).

- **`articles.html`**  
  Liste des derniers articles.  
  Cette page :
  - charge `scripts/app.js` (fonctions utilitaires),
  - charge `scripts/articlesData.js` (généré par la pipeline),
  - parcourt le tableau global `const articles = [...]`,
  - génère dynamiquement les cartes d’articles (titre, auteur, date, extrait, vignette, lien vers la page détaillée).

- **`article_detail_page/*.html`**  
  Une page HTML par article, générée automatiquement à partir des JSON dans `data/articles/`.  
  Chaque page affiche :
  - le titre, l’auteur et la date de publication,
  - une image de couverture / miniature,
  - le contenu complet de l’article (HTML),
  - la liste des sources citées (liens cliquables).

- **`submit.html`**  
  Formulaire **“Proposer un article”**.  
  Il permet de saisir :
  - titre,
  - auteur,
  - date,
  - URL de miniature,
  - contenu de l’article (HTML),
  - sources (une URL par ligne, ou sous une forme plus structurée côté JS).

  Le formulaire envoie ensuite les données à l’API hébergée sur Render via une requête `fetch` en `POST`.

- **`about.html`**  
  Page de présentation du projet : contexte, objectifs pédagogiques, etc.

---

## Format d’un article (JSON)

Chaque article soumis est représenté par un fichier JSON dans `data/articles/` :

```txt
data/articles/YYYY-MM-DD-slug-auteur.json
```

Exemple de fichier JSON :

```json
{
  "title": "Découvrir Next.js pour créer des apps modernes",
  "author": "corentin",
  "date": "10/10/2025",
  "thumbnail": "https://exemple.com/images/nextjs-thumb.jpg",
  "excerpt": "Présentation de Next.js, le framework React pour des apps web modernes.",
  "content": "<p>Contenu HTML de l’article…</p>",
  "sources": [
    "https://nextjs.org/docs",
    {
      "label": "MDN – JavaScript",
      "url": "https://developer.mozilla.org/fr/docs/Web/JavaScript"
    }
  ],
  "createdAt": "2025-11-22T10:00:00.000Z"
}
```

Champs principaux :

- `title` *(obligatoire)* : titre de l’article.
- `author` *(obligatoire)* : nom du contributeur.
- `date` *(obligatoire)* : date de publication (format libre, ex. `dd/MM/YYYY`).
- `thumbnail` *(obligatoire)* : URL de la miniature (image accessible publiquement).
- `excerpt` *(optionnel mais recommandé)* : résumé / description courte.
- `content` *(obligatoire)* : contenu principal de l’article en HTML.
- `sources` *(obligatoire)* :
  - tableau de chaînes (URLs simples), **ou**
  - tableau d’objets `{ "label": "Nom lisible", "url": "https://..." }`.
- `createdAt` *(ajouté côté API)* : horodatage technique de création.

---

## API de soumission (backend sur Render)

Le backend de soumission est une API Node/Express, **hébergée sur Render.com**, dont le code est dans le dossier `api/`.

### Endpoint principal

- `POST /api/articles`  
  URL complète fournie par Render, par exemple :

```text
https://<nom-du-service>.onrender.com/api/articles
```

Le frontend (`submit.html`) appelle cet endpoint en envoyant un JSON :

```js
fetch('https://b3-pullmein.onrender.com/api/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

### Rôle de l’API

1. **Validation minimale** des champs obligatoires (présence de `title`, `author`, `date`, `thumbnail`, `content`, au moins une `source`).
2. Construction d’un nouveau fichier JSON dans `data/articles/` avec un nom du type :

   ```txt
   YYYY-MM-DD-slug-auteur.json
   ```

3. Création d’une **nouvelle branche** et d’un **commit** contenant ce fichier JSON.
4. Création d’une **Pull Request** sur le dépôt GitHub cible, via l’API GitHub (librairie Octokit).

### Variables d’environnement (Render)

Les informations sensibles nécessaires pour interagir avec GitHub ne sont **pas** stockées dans le dépôt.  
Elles sont configurées comme **variables d’environnement** sur Render :

- `GITHUB_TOKEN` : *Personal Access Token* GitHub avec les droits sur le dépôt.
- `GITHUB_OWNER` : propriétaire du dépôt (nom du compte ou de l’organisation).
- `GITHUB_REPO` : nom du dépôt (ex. `B3-PullMeIn`).
- `GITHUB_BASE_BRANCH` : branche de base (en général `main`).

Ces variables sont lues par le code (ex. dans `api/github.js` via `process.env`) et ne sont jamais commitées.

---

## Validation & sécurité (anti-script / anti-XSS)

La validation côté CI, implémentée dans `scripts/validateArticles.js`, a deux rôles :

1. Vérifier que le JSON respecte le **format attendu** (champs obligatoires, types, non vide).
2. Refuser tout contenu potentiellement **dangereux pour le site** (XSS / injection de script).

### 1. Validation des champs

Pour chaque JSON dans `data/articles/`, la commande `npm run validate:articles` vérifie au minimum :

- `title`, `author`, `date`, `thumbnail`, `content` sont des chaînes non vides.
- `sources` est un tableau non vide (au moins une source).

En cas de problème, la pipeline affiche un message clair dans les logs, par exemple :

```text
Erreurs dans 2025-11-22-mon-article-auteur.json:
  - title manquant
  - sources manquantes
```

### 2. Détection de contenu dangereux

Pour **tous les champs texte** (titre, auteur, date, thumbnail, excerpt, content, sources, etc.), la pipeline refuse les JSON contenant certains motifs jugés dangereux, par exemple :

- `<script`  
- `javascript:`  
- attributs d’événement HTML : `onclick=`, `onload=`, `onerror=`, `onmouseover=`, etc.  
- certaines balises : `<iframe`, `<style`, `<link`, `<meta`, `<object`, `<embed`, …

Exemples de contenus **refusés** :

```html
<script>alert('xss');</script>
<img src="x" onerror="alert('xss')">
<a href="javascript:alert('boom')">Lien</a>
```

Si un auteur souhaite afficher du HTML **en tant que texte**, il doit l’échapper, par exemple :

```html
&lt;script&gt;alert('demo');&lt;/script&gt;
```

En cas de motif interdit, la CI :

- logue les erreurs,
- retourne un code de sortie non nul,
- marque la Pull Request en **échec** → la PR ne peut pas être mergée tant que le contenu n’est pas corrigé.

---

## Pipelines GitHub Actions

Deux workflows principaux sont définis dans `.github/workflows` :

### 1. `ci.yml` – CI sur Pull Request

Déclenché sur chaque **Pull Request** vers `main` :

```yaml
on:
  pull_request:
    branches:
      - main
```

Tâches principales :

1. `npm install`
2. `npm run validate:articles`  
   → valide tous les JSON dans `data/articles/` (présence des champs, contenu sécurisé).
3. `npm run build:articles`  
   → teste la génération des pages HTML (`article_detail_page`) et de `scripts/articlesData.js`.

Si une étape échoue, la PR est en **rouge**.

---

### 2. `build-html.yml` – Build & Commit HTML sur `main`

Déclenché sur chaque **push** sur `main` :

```yaml
on:
  push:
    branches:
      - main
```

Tâches principales :

1. `npm install`
2. `npm run build:articles`  
   → génère / régénère :
   - `article_detail_page/*.html`
   - `scripts/articlesData.js`
3. Si des changements sont détectés sur ces fichiers :
   - `git add article_detail_page scripts/articlesData.js`
   - `git commit -m "build: generate articles HTML [skip ci]"`
   - `git push` (via `github-actions[bot]`)

Résultat :

- les pages d’articles et la liste des articles pour le front sont toujours **à jour** dans la branche `main` ;
- GitHub Pages déploie automatiquement la dernière version du site.

---

## Scripts npm (développeurs)

À la racine du projet :

```bash
npm install
```

Scripts disponibles :

```bash
npm run validate:articles   # Valide tous les JSON dans data/articles/
npm run build:articles      # Génère les pages HTML + scripts/articlesData.js
npm run start:api           # Lance l'API en local (optionnel, si variables d'env définies)
```

En production, l’API utilisée est celle déployée sur **Render**.  
Le lancement local (`npm run start:api`) est surtout utile pour des tests en développement.

---

## Règles éditoriales

Pour qu’un article soit accepté :

-  Le fichier JSON dans `data/articles/` est valide (parse JSON OK).
-  Champs obligatoires remplis :
  - `title`, `author`, `date`, `thumbnail`, `content`, `sources`.
-  Contenu :
  - clair, structuré, technique ou pédagogique,
  - au minimum une **miniature** (thumbnail),
  - au minimum une **source** avec une URL valide.
-  Aucun contenu dangereux :
  - pas de `<script>`,
  - pas de `javascript:`,
  - pas de `on...=`,
  - pas de balises bloquées (iframe, object, embed, etc.).
-  La CI GitHub est entièrement **verte**.

---

## Contribution

### Pour un contributeur

1. Aller sur le site PullMeIn (déployé via GitHub Pages).
2. Cliquer sur **“Proposer un article”** (`submit.html`).
3. Remplir le formulaire (titre, auteur, date, miniature, contenu, sources).
4. Soumettre le formulaire :
   - l’API sur Render crée automatiquement une **Pull Request** avec un JSON dans `data/articles/`.
5. Sur GitHub :
   - vérifier la PR,
   - corriger si la CI signale des erreurs,
   - attendre la validation par un mainteneur.

### Pour un mainteneur

1. Vérifier le fichier JSON ajouté dans `data/articles/` par la PR.
2. S’assurer que la CI (`ci.yml`) est en **succès**.
3. Merger la Pull Request dans `main`.
4. Vérifier le run de `build-html.yml` (génération et commit des HTML).
5. Vérifier sur le site (GitHub Pages) que :
   - l’article apparaît bien sur `articles.html`,
   - la page détaillée est correctement générée.

---

## 📊 Schéma du flux

```text
                          +----------------------+
                          |      Utilisateur     |
                          |  (navigateur web)    |
                          +----------+-----------+
                                     |
                                     | 1. Accède au site
                                     v
                      +-------------------------------+
                      |       GitHub Pages            |
                      |   (site statique PullMeIn)    |
                      +-------------------------------+
                          |                    |
          2. Liste des    |                    | 3. Formulaire "Proposer un article"
          articles        |                    v
                          |        +-------------------------------+
                          |        |         submit.html           |
                          |        |  (formulaire de contribution) |
                          |        +-------------------------------+
                          |                    |
                          |    4. POST JSON    |
                          |    vers l'API      v
                          |        +-------------------------------+
                          |        |  API Node/Express sur Render  |
                          |        |      (/api/articles)          |
                          |        +-------------------------------+
                          |                    |
                          |   5. Crée une PR   v
                          |        +-------------------------------+
                          |        |       Dépôt GitHub            |
                          |        |  (data/articles/*.json)       |
                          |        +-------------------------------+
                          |                    |
                          |   6. CI sur PR     v
                          |   (ci.yml)   +-------------------------+
                          |              |  GitHub Actions (CI)    |
                          |              | - validateArticles      |
                          |              | - buildArticles (test)  |
                          |              +-----------+-------------+
                          |                          |
                          |        PR OK + merge     v
                          |        sur main   +--------------------+
                          |                   |   Branche main      |
                          |                   +----------+----------+
                          |                              |
                          |      7. build-html.yml       v
                          |         (sur push main) +-------------------------+
                          |                          | GitHub Actions (Build) |
                          |                          | - buildArticles        |
                          |                          | - commit HTML + JS     |
                          |                          +-----------+------------+
                          |                                      |
                          |       8. GitHub Pages redeploie      v
                          +----------------------------------+----------------+
                                                             |
                                                             v
                                               +-------------------------------+
                                               |   Site PullMeIn mis à jour    |
                                               | (nouvel article disponible)   |
                                               +-------------------------------+
```

---

PullMeIn sert à la fois de **plateforme de partage** d’articles techniques et de démonstration concrète d’un workflow d’intégration continue complet :  
**formulaire → API Render → PR GitHub → CI → génération HTML → déploiement GitHub Pages**.

## Crédits 
Corentin Harvoire
Louis Astori
Killian Guillemot
