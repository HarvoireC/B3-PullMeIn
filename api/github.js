// api/github.js
const { Octokit } = require('@octokit/rest');
const crypto = require('crypto');

// Le token GitHub doit être fourni via une variable d'environnement GITHUB_TOKEN
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const OWNER = process.env.GITHUB_OWNER; // ex : "TonPseudo"
const REPO = process.env.GITHUB_REPO;   // ex : "pullmein"
const BASE_BRANCH = process.env.GITHUB_BASE_BRANCH || 'main';

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Crée une branche, ajoute un fichier JSON dans data/articles, et ouvre une PR.
 * @param {object} articlePayload
 * @returns {Promise<{branchName: string, filePath: string, prUrl: string, prNumber: number}>}
 */
async function createArticlePr(articlePayload) {
  if (!OWNER || !REPO) {
    throw new Error('Les variables GITHUB_OWNER et GITHUB_REPO doivent être définies.');
  }

  const dateIso = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const slug = slugify(articlePayload.title || 'article');
  const authorSlug = slugify(articlePayload.author || 'auteur');
  const fileName = `${dateIso}-${slug}-${authorSlug}.json`;
  const filePath = `data/articles/${fileName}`;

  const jsonContent = JSON.stringify(
    {
      ...articlePayload,
      createdAt: new Date().toISOString(),
    },
    null,
    2
  );

  const branchSuffix = crypto.randomBytes(4).toString('hex');
  const branchName = `article/${slug}-${branchSuffix}`;

  // 1. Récupérer le SHA de la branche de base
  const baseRef = await octokit.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BASE_BRANCH}`,
  });

  const baseSha = baseRef.data.object.sha;

  // 2. Créer une nouvelle branche à partir de baseSha
  await octokit.git.createRef({
    owner: OWNER,
    repo: REPO,
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });

  // 3. Créer le fichier JSON dans cette branche
  const contentBase64 = Buffer.from(jsonContent, 'utf8').toString('base64');

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: filePath,
    message: `feat: ajout article ${articlePayload.title}`,
    content: contentBase64,
    branch: branchName,
  });

  // 4. Créer la Pull Request
  const prTitle = `Ajout article : ${articlePayload.title}`;
  const prBody = [
    `Titre : ${articlePayload.title}`,
    `Auteur : ${articlePayload.author}`,
    `Date : ${articlePayload.date}`,
    '',
    'Article soumis via le formulaire PullMeIn.',
  ].join('\n');

  const pr = await octokit.pulls.create({
    owner: OWNER,
    repo: REPO,
    title: prTitle,
    head: branchName,
    base: BASE_BRANCH,
    body: prBody,
  });

  return {
    branchName,
    filePath,
    prUrl: pr.data.html_url,
    prNumber: pr.data.number,
  };
}

module.exports = {
  createArticlePr,
};
