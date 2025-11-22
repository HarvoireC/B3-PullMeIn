// scripts/generateArticles.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'articles');
const DETAIL_DIR = path.join(__dirname, '..', 'article_detail_page');
const SCRIPTS_DIR = path.join(__dirname, '..', 'scripts');

if (!fs.existsSync(DETAIL_DIR)) {
  fs.mkdirSync(DETAIL_DIR, { recursive: true });
}

function loadArticles() {
  if (!fs.existsSync(DATA_DIR)) {
    return [];
  }
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const articles = files.map(f => {
    const full = path.join(DATA_DIR, f);
    const raw = fs.readFileSync(full, 'utf8');
    const json = JSON.parse(raw);
    return { ...json, _fileName: f };
  });
  return articles;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function generateHtml(article) {
  const safeTitle = escapeHtml(article.title || 'Article');
  const safeAuthor = escapeHtml(article.author || '');
  const safeDate = escapeHtml(article.date || '');
  const contentHtml = article.content || '';
  const sourcesHtml = Array.isArray(article.sources) && article.sources.length
    ? `<ul>
        ${article.sources
          .map(url => `<li><a href="${url}" target="_blank" rel="noopener">${url}</a></li>`)
          .join('')}
      </ul>`
    : '<p>Aucune source</p>';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="../styles.css">
  <meta name="robots" content="noindex">
</head>
<body>
  <header class="site-header">
    <div class="container nav">
      <div class="brand">
        <h1 class="logo"><a href="../articles.html">PullMeIn</a></h1>
      </div>
      <nav class="nav-menu">
        <a href="../articles.html">Articles</a>
        <a href="../submit.html">Proposer un article</a>
        <a href="../about.html">À propos</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <article class="article">
      <header>
        <div class="meta">Par ${safeAuthor} — ${safeDate}</div>
        <h1>${safeTitle}</h1>
      </header>
      ${article.thumbnail ? `<div class="cover"><img src="${article.thumbnail}" alt="Image de couverture"></div>` : ''}
      <section class="content">
        ${contentHtml}
      </section>
      <section class="sources">
        <h3>Sources</h3>
        ${sourcesHtml}
      </section>
      <p><a href="../articles.html" class="btn secondary">← Retour aux articles</a></p>
    </article>
  </main>
</body>
</html>`;
}

function main() {
  const articles = loadArticles();

  // Génération des fichiers HTML
  articles.forEach(article => {
    const slugBase = path.basename(article._fileName, '.json');
    const htmlPath = path.join(DETAIL_DIR, `${slugBase}.html`);
    const htmlContent = generateHtml(article);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  });

  // Génération d'un articlesData.js pour le front
  const frontData = articles.map((a, index) => ({
    id: a.id || index + 1,
    title: a.title,
    author: a.author,
    date: a.date,
    thumbnail: a.thumbnail,
    excerpt: a.excerpt || '',
    detailPath: `article_detail_page/${path.basename(a._fileName, '.json')}.html`,
  }));

  const jsContent = `// Fichier généré automatiquement par scripts/generateArticles.js
const articles = ${JSON.stringify(frontData, null, 2)};`;

  fs.writeFileSync(path.join(SCRIPTS_DIR, 'articlesData.js'), jsContent, 'utf8');
}

main();
