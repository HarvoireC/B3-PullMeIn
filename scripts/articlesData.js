// Données d'articles d'exemple (côté client)
const articles = [
  {
    id: 1,
    title: "Introduction à l’intégration continue",
    author: "Jean Dupont",
    date: "10/01/2025",
    thumbnail: "assets/thumbnails/intro-ci.png",
    excerpt: "Découvrez les bases de l'intégration continue et comment l'appliquer dans vos projets.",
    content: `
      <p>L'intégration continue (CI) est une pratique qui consiste à intégrer fréquemment les modifications de code...</p>
      <h2>Pourquoi l'intégration continue ?</h2>
      <p>Elle permet de détecter rapidement les problèmes, d'automatiser les tests, etc.</p>
    `,
    sources: [
      { label: "Doc GitHub Actions", url: "https://docs.github.com/actions" },
      { label: "Martin Fowler - Continuous Integration", url: "https://martinfowler.com/articles/continuousIntegration.html" }
    ]
  },
  {
    id: 2,
    title: "Débuter avec Docker pour le développement",
    author: "Alice Martin",
    date: "15/02/2025",
    thumbnail: "assets/thumbnails/docker-basics.png",
    excerpt: "Un tour d'horizon de Docker pour standardiser les environnements et simplifier les déploiements.",
    content: `
      <p>Docker permet d'encapsuler une application et ses dépendances dans un conteneur portable.</p>
      <h2>Images et conteneurs</h2>
      <p>Les images sont des modèles immuables, les conteneurs sont des instances en exécution.</p>
    `,
    sources: [
      { label: "Documentation Docker", url: "https://docs.docker.com/" }
    ]
  },
  {
    id: 3,
    title: "Introduction à TypeScript",
    author: "Karim Ben",
    date: "02/03/2025",
    thumbnail: "assets/thumbnails/ts-intro.png",
    excerpt: "Pourquoi et comment adopter TypeScript dans vos projets JavaScript.",
    content: `
      <p>TypeScript ajoute un système de types à JavaScript, améliorant la maintenabilité et la robustesse.</p>
      <h2>Bénéfices</h2>
      <p>Meilleur tooling, autocomplétion, détection d'erreurs à la compilation, etc.</p>
    `,
    sources: [
      { label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" }
    ]
  }
];
