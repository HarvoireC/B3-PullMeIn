# PullMeIn
B3 Intégration continue - Projet 1

## 🎯 Présentation du projet

**PullMeIn** est un site communautaire qui centralise et partage des articles techniques rédigés par des professionnels et des passionnés.

L’objectif principal du projet est de :

- favoriser une participation ouverte (via un formulaire en ligne) ;
- automatiser au maximum le processus de contribution grâce à **GitHub** et à une **pipeline d’intégration continue** ;
- garantir la **qualité éditoriale** des articles publiés.

Les articles sont soumis via un **formulaire sur le site**, puis automatiquement transformés en pull request sur ce dépôt.  
Chaque pull request est ensuite validée par une pipeline GitHub (CI) ainsi que par un mainteneur.

---

## Fonctionnement général

1. Un utilisateur remplit un **formulaire de contribution** directement sur le site PullMeIn :
   - titre de l’article ;
   - auteur ;
   - date de publication ;
   - contenu de l’article ;
   - liens vers les sources ;
   - miniature + au minimum une image.

2. Le backend du site :
   - valide les données envoyées ;
   - génère un fichier de données (JSON) décrivant l’article ;
   - crée une **Pull Request** sur ce dépôt via l’API GitHub.

3. Sur GitHub, une **pipeline d’intégration continue** se déclenche automatiquement sur chaque PR :
   - vérification de la structure des données ;
   - vérification des champs obligatoires (titre, date, contenu, images, sources, etc.) ;
   - vérification du format des liens des sources ;
   - génération des pages HTML finales à partir de templates.

4. Une fois la PR validée et mergée par un mainteneur :
   - le site est reconstruit et déployé automatiquement ;
   - le nouvel article apparaît sur la page d’accueil et dispose de sa page détaillée.

---

## Structure du projet

```txt
.
|____ data/
|     |____ articles/
|           |____ YYYY-MM-DD-slug-auteur.json
|
|____ article_detail_page/
|     |____ [slug]-[auteur]-[date : format dd/MM/YYYY].html
|
|____ articles_home_page/
|     |____ HomePage.html
|
|____ scripts/
|     |____ generate-articles.js      # Génération HTML à partir de data/articles
|     |____ validate-articles.js      # Validation du contenu des articles
|
|____ .github/
      |____ workflows/
            |____ ci.yml              # Pipeline GitHub Actions
