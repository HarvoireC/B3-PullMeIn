// scripts/validateArticles.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'articles');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}


const FORBIDDEN_PATTERNS = [
  /<\s*script\b/i,
  /javascript:/i,
  /on\w+\s*=/i,           
  /<\s*iframe\b/i,
  /<\s*style\b/i,
  /<\s*link\b/i,
  /<\s*meta\b/i,
  /<\s*object\b/i,
  /<\s*embed\b/i,
];


function findDangerousContent(value) {
  if (typeof value !== 'string') return null;
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(value)) {
      return `contient un motif interdit (${pattern})`;
    }
  }
  return null;
}

function validateArticle(article, fileName) {
  const errors = [];

  // Champs obligatoires
  if (!isNonEmptyString(article.title)) errors.push('title manquant');
  if (!isNonEmptyString(article.author)) errors.push('author manquant');
  if (!isNonEmptyString(article.date)) errors.push('date manquante');
  if (!isNonEmptyString(article.thumbnail)) errors.push('thumbnail manquant');
  if (!isNonEmptyString(article.content)) errors.push('content manquant');
  if (!Array.isArray(article.sources) || article.sources.length === 0) {
    errors.push('sources manquantes');
  }

  const fieldsToCheck = [
    ['title', article.title],
    ['author', article.author],
    ['date', article.date],
    ['thumbnail', article.thumbnail],
    ['excerpt', article.excerpt],
    ['content', article.content],
  ];

  for (const [fieldName, value] of fieldsToCheck) {
    const danger = findDangerousContent(value);
    if (danger) {
      errors.push(`${fieldName} ${danger}`);
    }
  }

  if (Array.isArray(article.sources)) {
    article.sources.forEach((src, index) => {
      let value = src;
      if (src && typeof src === 'object') {
        if (src.label) {
          const dangerLabel = findDangerousContent(src.label);
          if (dangerLabel) {
            errors.push(`sources[${index}].label ${dangerLabel}`);
          }
        }
        value = src.url;
      }

      const dangerUrl = findDangerousContent(value);
      if (dangerUrl) {
        errors.push(`sources[${index}] ${dangerUrl}`);
      }
    });
  }

  if (errors.length) {
    console.error(`Erreurs dans ${fileName}:`);
    errors.forEach(e => console.error('  -', e));
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
