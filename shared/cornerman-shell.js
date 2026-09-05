(function () {
  "use strict";

  const shellScript = document.currentScript;
  const appRoot = new URL("../", shellScript.src);

  const route = (path) => new URL(path, appRoot).href;
  const normalizePath = (value) => {
    const url = new URL(value, window.location.href);
    return url.pathname.replace(/\/index\.html$/, "/").replace(/\/$/, "") || "/";
  };

  const currentPath = normalizePath(window.location.href);
  const pageTitles = {
    "console": "Console",
    "console/match-launch": "Match Capture",
    "console/compact-console.modular": "Match Capture",
    "console/classic-console.modular": "Match Capture",
    "console/overlay-console.modular": "Match Capture",
    "hub": "Hub",
    "history/match-history": "Match History",
    "history/match-detail": "Match Detail",
    "athletes/athlete-dashboard": "Athlete Dashboard",
    "events/team-dashboard": "Team Dashboard",
    "recon": "Recommendations",
    "recon/recon-notes": "Recon Capture",
    "opponents/opponent-dashboard": "Opponent Dashboard",
    "patterns": "Competition Trends",
    "tournament/tournament-manager": "Tournament Manager",
    "media/media-index": "YouTube / Evidence",
    "media/live": "Recording",
    "media/live/viewer": "Review",
    "bridge/match-import": "Sandman Handoff",
    "roster/athlete-stat-log": "Roster",
    "reports": "Reports"
  };

  const relativePath = currentPath
    .replace(normalizePath(appRoot.href), "")
    .replace(/^\//, "")
    .replace(/\.html$/, "");
  const pageTitle = document.body.dataset.shellTitle || pageTitles[relativePath] || document.title;

  const navigation = [
    {
      label: "Home / Command",
      items: [
        ["Console", "console/index.html"],
        ["Hub", "hub/index.html"]
      ]
    },
    {
      label: "Core",
      items: [
        ["Match Capture", "console/match-launch.html"],
        ["Match History", "history/match-history.html"],
        ["Athlete Dashboard", "athletes/athlete-dashboard.html"],
        ["Team Dashboard", "events/team-dashboard.html"],
        ["Tournament Manager", "tournament/tournament-manager.html"]
      ]
    },
    {
      label: "Intelligence",
      items: [
        ["Recon Capture", "recon/recon-notes.html"],
        ["Opponent Dashboard", "opponents/opponent-dashboard.html"],
        ["Competition Trends", "patterns/index.html"],
        ["Recommendations", "recon/index.html"]
      ]
    },
    {
      label: "Media",
      items: [
        ["Recording", "media/live/index.html"],
        ["Review", "media/live/viewer.html"],
        ["YouTube / Evidence", "media/media-index.html"]
      ]
    },
    {
      label: "Bridge",
      items: [["Sandman Handoff", "bridge/match-import.html"]]
    },
    {
      label: "Utility",
      items: [
        ["Roster", "roster/athlete-stat-log.html"],
        ["Reports", "reports/index.html"]
      ]
    }
  ];

  const activeRouteAliases = {
    "history/match-detail": "history/match-history.html",
    "console/compact-console.modular": "console/match-launch.html",
    "console/classic-console.modular": "console/match-launch.html",
    "console/overlay-console.modular": "console/match-launch.html"
  };
  const activePath = normalizePath(route(activeRouteAliases[relativePath] || `${relativePath}.html`));

  const topbar = document.createElement("header");
  topbar.className = "cornerman-topbar";
  topbar.innerHTML = `
    <button class="cornerman-menu-button" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="cornerman-drawer">
      <span class="cornerman-menu-icon" aria-hidden="true"></span>
    </button>
    <div class="cornerman-brand-lockup">
      <span class="cornerman-brand">Cornerman<span class="cornerman-brand-mark">AI</span></span>
      <span class="cornerman-page-title"></span>
    </div>
    <span class="cornerman-topbar-context">Command System</span>
  `;
  topbar.querySelector(".cornerman-page-title").textContent = pageTitle;

  const backdrop = document.createElement("div");
  backdrop.className = "cornerman-drawer-backdrop";
  backdrop.hidden = true;

  const drawer = document.createElement("aside");
  drawer.id = "cornerman-drawer";
  drawer.className = "cornerman-drawer";
  drawer.setAttribute("aria-label", "CornermanAI navigation");
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = `
    <div class="cornerman-drawer-header">
      <div>
        <span class="cornerman-drawer-kicker">Navigation</span>
        <span class="cornerman-drawer-product">CornermanAI</span>
      </div>
      <button class="cornerman-drawer-close" type="button" aria-label="Close navigation">×</button>
    </div>
    <nav class="cornerman-drawer-nav"></nav>
  `;

  const nav = drawer.querySelector(".cornerman-drawer-nav");
  navigation.forEach((group) => {
    const section = document.createElement("section");
    section.className = "cornerman-nav-group";

    const heading = document.createElement("h2");
    heading.className = "cornerman-nav-heading";
    heading.textContent = group.label;
    section.appendChild(heading);

    group.items.forEach(([label, path]) => {
      const link = document.createElement("a");
      link.className = "cornerman-nav-link";
      link.href = route(path);
      link.textContent = label;
      if (normalizePath(link.href) === currentPath || normalizePath(link.href) === activePath) {
        link.setAttribute("aria-current", "page");
      }
      section.appendChild(link);
    });

    nav.appendChild(section);
  });

  document.body.classList.add("has-cornerman-shell");
  document.body.prepend(backdrop);
  document.body.prepend(drawer);
  document.body.prepend(topbar);

  const menuButton = topbar.querySelector(".cornerman-menu-button");
  const closeButton = drawer.querySelector(".cornerman-drawer-close");
  let restoreFocus = menuButton;

  const getFocusable = () => Array.from(
    drawer.querySelectorAll('a[href], button:not([disabled])')
  );

  function openDrawer() {
    restoreFocus = document.activeElement;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      drawer.dataset.open = "true";
      backdrop.dataset.open = "true";
    });
    drawer.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("cornerman-drawer-open");
    closeButton.focus();
  }

  function closeDrawer() {
    drawer.dataset.open = "false";
    backdrop.dataset.open = "false";
    drawer.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("cornerman-drawer-open");
    window.setTimeout(() => {
      if (drawer.dataset.open !== "true") backdrop.hidden = true;
    }, 200);
    restoreFocus?.focus?.();
  }

  menuButton.addEventListener("click", openDrawer);
  closeButton.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeDrawer();
  });

  document.addEventListener("keydown", (event) => {
    if (drawer.dataset.open !== "true") return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = getFocusable();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
