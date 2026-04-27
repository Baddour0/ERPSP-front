/* Injects the sidebar + topbar into any page that calls renderLayout(title) */

function getUser() {
  try { return JSON.parse(store.get('erp_user')) || { name: getTenant(), role: 'Admin' }; }
  catch { return { name: getTenant(), role: 'Admin' }; }
}

function renderLayout(pageTitle, pageIcon = '📄') {
  // Guard: redirect if not logged in
  if (!getToken()) { window.location.href = 'index.html'; return; }

  const user = getUser();
  const initials = (user.name || 'U')[0].toUpperCase();

  const sidebar = `
<aside class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <div class="logo-icon"><img src="img/logo.png" alt="ERPSB Logo" onerror="this.src='https://via.placeholder.com/36x36?text=SB'"></div>
    <div>
      <div class="logo-text">ERPSB</div>
      <div class="logo-sub">${getTenant()}</div>
    </div>
  </div>

  <div class="sidebar-section-label">Overview</div>
  <a href="dashboard.html"  class="nav-item" data-page="dashboard.html">
    <span class="nav-icon">📊</span> Dashboard
  </a>

  <div class="sidebar-section-label">Finance</div>
  <a href="invoices.html"   class="nav-item" data-page="invoices.html">
    <span class="nav-icon">🧾</span> Invoices
    <span class="nav-badge" id="nb-overdue"></span>
  </a>
  <a href="accounts.html"   class="nav-item" data-page="accounts.html">
    <span class="nav-icon">📒</span> Chart of Accounts
  </a>
  <a href="journal.html"    class="nav-item" data-page="journal.html">
    <span class="nav-icon">📋</span> Journal Entries
  </a>

  <div class="sidebar-section-label">Contacts</div>
  <a href="partners.html"   class="nav-item" data-page="partners.html">
    <span class="nav-icon">👥</span> Partners
  </a>

  <div class="sidebar-footer">
    <div class="user-chip" onclick="logout()">
      <div class="user-avatar">${initials}</div>
      <div class="user-info">
        <div class="user-name">${user.name}</div>
        <div class="user-role">${user.role} · Sign out</div>
      </div>
    </div>
  </div>
</aside>`;

  const topbar = `
<header class="topbar">
  <button class="icon-btn" onclick="toggleSidebar()" title="Menu" style="display:none;" id="menu-btn">☰</button>
  <div class="topbar-title">${pageIcon} ${pageTitle}</div>
  <div class="topbar-search">
    <span style="color:var(--text-muted);font-size:14px;">🔍</span>
    <input type="text" placeholder="Search…" id="global-search"/>
  </div>
  <div class="topbar-actions">
    <button class="icon-btn" title="Notifications" id="notif-btn">🔔</button>
    <button class="icon-btn" title="Settings">⚙️</button>
  </div>
</header>`;

  document.body.insertAdjacentHTML('afterbegin', sidebar + topbar);

  // wrap existing content in .app-layout grid
  const main = document.getElementById('page-root');
  if (main) main.classList.add('main-content');

  setActiveNav();

  // Badge: overdue invoices
  const overdueCount = mock.invoices.filter(i => i.status === 'Overdue').length;
  const nb = document.getElementById('nb-overdue');
  if (nb && overdueCount) nb.textContent = overdueCount;

  // Mobile menu btn visibility
  if (window.innerWidth <= 768) {
    const mb = document.getElementById('menu-btn');
    if (mb) mb.style.display = 'flex';
  }
}
