(async function () {
  "use strict";

  const THEME_KEY = "cornerman_theme";
  const savedTheme = localStorage.getItem(THEME_KEY);
  const initialTheme = savedTheme === "night" ? "night" : "day";
  document.documentElement.dataset.theme = initialTheme;

  const shellScript = document.currentScript;
  const appRoot = new URL("../", shellScript.src);
  const entitlements = await import(new URL("./cornerman-entitlements.js", shellScript.src));
  const workspaceResolver = await import(new URL("./cornerman-workspace.js", shellScript.src));
  const currentWorkspace = workspaceResolver.getCurrentWorkspace();

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
        ["Console", "console/index.html", null],
        ["Hub", "hub/index.html", null]
      ]
    },
    {
      label: "Core",
      items: [
        ["Match Capture", "console/match-launch.html", "match_capture"],
        ["Match History", "history/match-history.html", "match_history"],
        ["Athlete Dashboard", "athletes/athlete-dashboard.html", "athlete_dashboard"],
        ["Team Dashboard", "events/team-dashboard.html", "team_dashboard"],
        ["Tournament Manager", "tournament/tournament-manager.html", "tournament_manager"]
      ]
    },
    {
      label: "Intelligence",
      items: [
        ["Recon Capture", "recon/recon-notes.html", "recon_capture"],
        ["Opponent Dashboard", "opponents/opponent-dashboard.html", "opponent_dashboard"],
        ["Competition Trends", "patterns/index.html", "competition_trends"],
        ["Recommendations", "recon/index.html", "recommendations"]
      ]
    },
    {
      label: "Media",
      items: [
        ["Recording", "media/live/index.html", "media_review"],
        ["Review", "media/live/viewer.html", "media_review"],
        ["YouTube / Evidence", "media/media-index.html", "media_library"]
      ]
    },
    {
      label: "Bridge",
      items: [["Sandman Handoff", "bridge/match-import.html", "sandman_handoff"]]
    },
    {
      label: "Utility",
      items: [
        ["Roster", "roster/athlete-stat-log.html", "roster"],
        ["Reports", "reports/index.html", "reports"]
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
    <section class="cornerman-settings" aria-labelledby="cornerman-appearance-label">
      <span class="cornerman-settings-label" id="cornerman-appearance-label">Settings · Appearance</span>
      <div class="cornerman-theme-toggle" role="group" aria-label="Appearance theme">
        <button class="cornerman-theme-option" type="button" data-theme-choice="day">Day</button>
        <button class="cornerman-theme-option" type="button" data-theme-choice="night">Night</button>
      </div>
      <span class="cornerman-settings-label cornerman-access-label">Workspace</span>
      <div class="cornerman-workspace-summary">
        <strong></strong>
        <span></span>
      </div>
      <span class="cornerman-settings-label cornerman-access-label">Development Tier</span>
      <div class="cornerman-tier-toggle" role="group" aria-label="Development Tier">
        <button class="cornerman-tier-option" type="button" data-tier-choice="free">Free</button>
        <button class="cornerman-tier-option" type="button" data-tier-choice="basic">Basic</button>
        <button class="cornerman-tier-option" type="button" data-tier-choice="plus">Plus</button>
        <button class="cornerman-tier-option" type="button" data-tier-choice="pro">Pro</button>
      </div>
      <small class="cornerman-dev-note">Local development override — not billing.</small>
    </section>
  `;

  const nav = drawer.querySelector(".cornerman-drawer-nav");
  drawer.querySelector(".cornerman-workspace-summary strong").textContent = currentWorkspace.name;
  drawer.querySelector(".cornerman-workspace-summary span").textContent =
    `${currentWorkspace.type === "team" ? "Team" : "Individual"} · ${currentWorkspace.tier.toUpperCase()}` +
    (currentWorkspace.integrations.length ? ` · ${currentWorkspace.integrations.join(", ")}` : "");
  const themeButtons = Array.from(drawer.querySelectorAll("[data-theme-choice]"));
  function setTheme(theme, persist) {
    const nextTheme = theme === "night" ? "night" : "day";
    document.documentElement.dataset.theme = nextTheme;
    themeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === nextTheme));
    });
    if (persist) localStorage.setItem(THEME_KEY, nextTheme);
  }
  setTheme(initialTheme, false);
  themeButtons.forEach((button) => {
    button.addEventListener("click", () => setTheme(button.dataset.themeChoice, true));
  });
  const tierButtons = Array.from(drawer.querySelectorAll("[data-tier-choice]"));
  function renderTier(tier) {
    tierButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.tierChoice === tier));
    });
  }
  renderTier(entitlements.getCurrentTier());
  tierButtons.forEach((button) => {
    button.addEventListener("click", () => {
      entitlements.setDevelopmentTier(button.dataset.tierChoice);
      window.location.reload();
    });
  });
  navigation.forEach((group) => {
    const section = document.createElement("section");
    section.className = "cornerman-nav-group";
    let visibleItemCount = 0;

    const heading = document.createElement("h2");
    heading.className = "cornerman-nav-heading";
    heading.textContent = group.label;
    section.appendChild(heading);

    group.items.forEach(([label, path, feature]) => {
      if (feature && !entitlements.canUse(feature)) return;
      visibleItemCount += 1;
      const link = document.createElement("a");
      link.className = "cornerman-nav-link";
      link.href = route(path);
      link.textContent = label;
      if (normalizePath(link.href) === currentPath || normalizePath(link.href) === activePath) {
        link.setAttribute("aria-current", "page");
      }
      section.appendChild(link);
    });

    if (visibleItemCount) nav.appendChild(section);
  });

  document.body.classList.add("has-cornerman-shell");
  document.body.prepend(backdrop);
  document.body.prepend(drawer);
  document.body.prepend(topbar);

  const routePath = new URL(window.location.href).pathname
    .replace(appRoot.pathname, "")
    .replace(/^\//, "");
  const guardedFeature = entitlements.getFeatureForRoute(routePath);
  if (guardedFeature && !entitlements.canUse(guardedFeature)) {
    const main = document.querySelector("main");
    const requiredTier = entitlements.getRequiredTier(guardedFeature);
    const featureName = pageTitle || guardedFeature.replaceAll("_", " ");
    if (main) {
      main.innerHTML = "";
      const access = document.createElement("section");
      access.className = "cornerman-access-message";
      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = "Access";
      const heading = document.createElement("h1");
      heading.textContent = featureName;
      const message = document.createElement("p");
      message.textContent = `This feature is available on ${requiredTier.toUpperCase()}. Your current development tier is ${entitlements.getCurrentTier().toUpperCase()}.`;
      const upgrade = document.createElement("button");
      upgrade.type = "button";
      upgrade.disabled = true;
      upgrade.textContent = "Upgrade";
      const note = document.createElement("small");
      note.textContent = "Billing is not connected yet.";
      access.append(eyebrow, heading, message, upgrade, note);
      main.appendChild(access);
    }
  }

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
