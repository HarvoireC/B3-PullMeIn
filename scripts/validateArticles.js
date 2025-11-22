// scripts/validateArticles.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'articles');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateArticle(article, fileName) {
  const errors = [];
  if (!isNonEmptyString(article.title)) errors.push('title manquant');
  if (!isNonEmptyString(article.author)) errors.push('author manquant');
  if (!isNonEmptyString(article.date)) errors.push('date manquante');
  if (!isNonEmptyString(article.thumbnail)) errors.push('thumbnail manquant');
  if (!isNonEmptyString(article.content)) errors.push('content manquant');
  if (!Array.isArray(article.sources) || article.sources.length === 0) {
    errors.push('sources manquantes');
  }

  if (errors.length) {
    console.error(`Erreurs dans ${fileName}: ${errors.join(', ')}`);
    return false;
  }

  return true;
}

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.warn('Répertoire data/articles inexistant, aucune validation.');
    return;
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  if (!files.length) {
    console.warn('Aucun article trouvé dans data/articles.');
    return;
  }

  let allValid = true;

  files.forEach(file => {
    const full = path.join(DATA_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      console.error(`JSON invalide dans ${file}`);
      allValid = false;
      return;
    }
    if (!validateArticle(json, file)) {
      allValid = false;
    }
  });

  if (!allValid) {
    process.exit(1);
  }
}

main();
