(() => {
  "use strict";

  const root = document.documentElement;
  const themeButton = document.querySelector("#themeToggle");
  const menuButton = document.querySelector("#menuToggle");
  const nav = document.querySelector("#primaryNav");

  // Storage can be unavailable in private browsing or restricted file contexts.
  const storage = {
    get(key) { try { return window.localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch (_) { /* Keep the current-page setting. */ } }
  };

  const savedTheme = storage.get("kds-theme");
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  root.dataset.theme = savedTheme === "light" || savedTheme === "dark"
    ? savedTheme
    : (prefersLight ? "light" : "dark");

  function updateThemeButton() {
    if (!themeButton) return;
    const isLight = root.dataset.theme === "light";
    const label = isLight ? "Switch to dark mode" : "Switch to light mode";
    themeButton.textContent = isLight ? "☀" : "☾";
    themeButton.setAttribute("aria-label", label);
    themeButton.setAttribute("title", label);
  }
  updateThemeButton();

  themeButton?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    storage.set("kds-theme", root.dataset.theme);
    updateThemeButton();
  });

  function closeMenu() {
    nav?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    if (menuButton) {
      menuButton.textContent = "☰";
      menuButton.setAttribute("aria-label", "Open navigation");
    }
  }

  menuButton?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("open") ?? false;
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    menuButton.textContent = isOpen ? "×" : "☰";
  });

  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", event => {
    if (nav?.classList.contains("open") && !nav.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
  });

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  nav?.querySelectorAll("a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });

  // Reveal content without hiding it when the browser lacks IntersectionObserver.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px 40px 0px" });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  // Portfolio category filters.
  const filterButtons = [...document.querySelectorAll(".filter-btn")];
  const portfolioCards = [...document.querySelectorAll(".work-card[data-category]")];
  filterButtons.forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.filter || "all";
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    portfolioCards.forEach(card => {
      card.hidden = !(filter === "all" || card.dataset.category === filter);
    });
  }));

  // This is a mailto helper, not a server-side form submission.
  const form = document.querySelector("#contactForm");
  form?.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "Website enquiry").trim();
    const service = String(data.get("service") || "Not specified").trim();
    const message = String(data.get("message") || "").trim();
    const body = `Name: ${name}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${message}`;
    const mailto = `mailto:kenilpatel2605@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const note = document.querySelector("#formNote");
    if (note) note.textContent = "Your email app should open with the enquiry prepared. Please review it and press Send.";
    window.location.href = mailto;
  });
})();
