// api/validation.js
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validation simple des champs principaux d'un article.
 * @param {object} body
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateArticlePayload(body) {
  const errors = [];
  const { title, author, date, thumbnail, content, sources } = body || {};

  if (!isNonEmptyString(title)) errors.push('Le titre est obligatoire.');
  if (!isNonEmptyString(author)) errors.push("Le nom de l’auteur est obligatoire.");
  if (!isNonEmptyString(date)) errors.push('La date est obligatoire.');
  if (!isNonEmptyString(thumbnail)) errors.push('La miniature est obligatoire.');
  if (!isNonEmptyString(content)) errors.push('Le contenu est obligatoire.');
  if (!Array.isArray(sources) || sources.length === 0) {
    errors.push('Au moins une source est requise.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = { validateArticlePayload };
