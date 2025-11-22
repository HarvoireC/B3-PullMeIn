// Common app logic for PullMeIn
(function () {
  const STORAGE_KEY = 'pullmein_user';

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Impossible de lire l’utilisateur depuis le stockage.', e);
      return null;
    }
  }

  function setCurrentUser(user) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Impossible d’enregistrer l’utilisateur.', e);
    }
  }

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function updateNavbarUser() {
    const span = document.getElementById('navUser');
    if (!span) return;
    const user = getCurrentUser();
    span.textContent = user ? `Connecté en tant que ${user.name}` : 'Invité';
  }

  function ensureHeader(active) {
    // Inject header if not present (for safety on non-index pages)
    if (document.querySelector('.site-header')) return;
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="container nav">
        <div class="brand">
          <h1 class="logo"><a href="articles.html">PullMeIn</a></h1>
        </div>
        <nav class="nav-menu">
          <a href="articles.html" ${active === 'articles' ? 'class="active"' : ''}>Articles</a>
          <a href="submit.html" ${active === 'submit' ? 'class="active"' : ''}>Proposer un article</a>
          <a href="about.html" ${active === 'about' ? 'class="active"' : ''}>À propos</a>
        </nav>
        <div class="user-chip" id="navUser">Invité</div>
      </div>
    `;
    document.body.prepend(header);
  }

  // Expose API globally
  window.getCurrentUser = getCurrentUser;
  window.setCurrentUser = setCurrentUser;
  window.getQueryParam = getQueryParam;
  window.updateNavbarUser = updateNavbarUser;
  window.ensureHeader = ensureHeader;
})();
