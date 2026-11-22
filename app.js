/**
 * ricardoruiz.tech — Interactive controls:
 *   - Bilingual EN / ES live switcher (persisted in localStorage)
 *   - Dark / Light theme switcher (persisted in localStorage)
 *   - Recruiter Role-Fit Lens (Financial Data / Analytics Engineering / Applied AI)
 *   - One-click Copy Email with accessible toast feedback
 *   - Curated secondary GitHub repos (filtered to exclude scratch/coursework clutter)
 *   - Subtle scroll-reveal and active section nav highlighting
 */
(() => {
  const EMAIL = "ricardo@ricardoruiz.tech";
  const GH_USER = "riru18";

  // Curated allow-list of clean additional public repos (excludes coursework/scratch clutter).
  const EXTRA_REPOS = [
    {
      name: "Data_Science",
      en: "Data science notebooks covering exploratory analysis, statistics, and modeling workflows.",
      es: "Notebooks de ciencia de datos: análisis exploratorio, estadística y modelado.",
      lang: "Python / Jupyter",
    },
    {
      name: "Estructura_Datos_UNED",
      en: "Core data structures and algorithmic implementations in Java.",
      es: "Estructuras de datos y algoritmos fundamentales implementados en Java.",
      lang: "Java",
    },
    {
      name: "RelationalDB",
      en: "Relational database schema design, normalization, and SQL query exercises.",
      es: "Diseño relacional, normalización y consultas SQL.",
      lang: "SQL",
    },
    {
      name: "sql-demo-book-2",
      en: "Interactive SQL reference and query demonstration workbook.",
      es: "Guía interactiva y demostraciones prácticas de consultas SQL.",
      lang: "SQL / Web",
    },
  ];

  // Role-fit recruiter lens content (EN + ES).
  const LENSES = {
    financial: {
      en: {
        title: "Financial & Index Data Specialist",
        body: "At LSEG (London Stock Exchange Group), I serve as final data-quality authority and audit liaison for FTSE Russell & J.P. Morgan indices covering 500 to 10,000+ securities — maintaining 0% controllable defects all year while diagnosing factor anomalies with T-SQL and Hampel outlier detection.",
      },
      es: {
        title: "Especialista en Datos Financieros e Índices",
        body: "En LSEG (London Stock Exchange Group) soy la autoridad final de calidad de datos y enlace de auditoría para índices FTSE Russell y J.P. Morgan (500 a 10,000+ valores), manteniendo 0% de defectos controlables todo el año mediante T-SQL y detección de valores atípicos Hampel.",
      },
      tags: ["T-SQL", "FTSE Russell Factors", "Worldscope", "Hampel Outlier Detection", "Audit & QA", "Equity Indices"],
    },
    analytics: {
      en: {
        title: "Analytics Engineering & SQL Automation",
        body: "I replace slow, manual data processes with parameterized, maintainable automation: cut T-SQL batch runtimes ~75% (~40 → ~10 min) via indexing, CTEs and temp tables, led a 6-analyst automation program across the U.S. & Costa Rica, and built end-to-end pipelines in Python, Apps Script, PLX, and Cloudflare Workers.",
      },
      es: {
        title: "Ingeniería de Analítica y Automatización SQL",
        body: "Transformo procesos lentos y manuales en automatización escalable: reduje tiempos de lote T-SQL en ~75% (~40 → ~10 min) con indexación, CTEs y tablas temporales, lideré a 6 analistas en EE. UU. y Costa Rica, y construyo pipelines completos en Python, Apps Script, PLX y Cloudflare Workers.",
      },
      tags: ["SQL Server", "CTEs & Indexing", "Python (Pandas/Polars)", "Power BI & DAX", "GitHub Actions", "Apps Script / PLX"],
    },
    ai: {
      en: {
        title: "Applied AI Adoption & Data Science",
        body: "Spearheaded AI tooling integration across analysts at LSEG, raising adoption from 10% to 90% in under a month through POCs and training. Completed TEC's Data Science & Machine Learning program (6-model classification benchmarks) and deployed multilingual semantic matching (bge-m3) in production.",
      },
      es: {
        title: "Adopción de IA Aplicada y Ciencia de Datos",
        body: "Lideré la adopción de herramientas de IA en LSEG, elevando el uso del 10% al 90% en menos de un mes con pruebas de concepto y capacitación. Completé el programa de Ciencia de Datos y ML del TEC y desplegué matching semántico multilingüe (bge-m3) en producción.",
      },
      tags: ["Agentic-AI Workflows", "GitHub Copilot", "ML Classification", "Workers AI (bge-m3)", "Python", "Statistics"],
    },
  };

  // ── Theme toggle ────────────────────────────────────────────────────────
  const THEME_KEY = "rr.theme";
  const root = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle");
  const iconSun = document.getElementById("icon-sun");
  const iconMoon = document.getElementById("icon-moon");

  function applyTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* private mode */ }
    if (iconSun && iconMoon) {
      iconSun.classList.toggle("is-hidden", theme !== "dark");
      iconMoon.classList.toggle("is-hidden", theme === "dark");
    }
    if (themeBtn) {
      themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  const savedTheme = (() => {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  })();
  applyTheme(savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark");

  themeBtn?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  // ── Bilingual EN / ES switcher ──────────────────────────────────────────
  const LANG_KEY = "rr.lang";
  let currentLang = (() => {
    try {
      const s = localStorage.getItem(LANG_KEY);
      if (s === "en" || s === "es") return s;
    } catch { /* ignore */ }
    return (navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en";
  })();

  let currentLens = "financial";

  function renderLens() {
    const data = LENSES[currentLens];
    if (!data) return;
    const copy = data[currentLang];
    const titleEl = document.getElementById("lens-title");
    const bodyEl = document.getElementById("lens-body");
    const tagsEl = document.getElementById("lens-tags");
    if (titleEl) titleEl.textContent = copy.title;
    if (bodyEl) bodyEl.textContent = copy.body;
    if (tagsEl) {
      tagsEl.textContent = "";
      for (const t of data.tags) {
        const s = document.createElement("span");
        s.className = "tag highlight";
        s.textContent = t;
        tagsEl.appendChild(s);
      }
    }
    document.querySelectorAll(".lens-btn").forEach((b) => {
      const on = b.getAttribute("data-lens") === currentLens;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  function renderExtraRepos() {
    const box = document.getElementById("extra-repos-grid");
    if (!box) return;
    box.textContent = "";
    for (const r of EXTRA_REPOS) {
      const a = document.createElement("a");
      a.className = "repo-mini";
      a.href = `https://github.com/${GH_USER}/${r.name}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      const name = document.createElement("span");
      name.className = "repo-mini-name";
      name.textContent = `${r.name} ↗`;

      const desc = document.createElement("span");
      desc.className = "repo-mini-desc";
      desc.textContent = r[currentLang];

      const meta = document.createElement("span");
      meta.className = "repo-mini-meta";
      meta.textContent = r.lang;

      a.append(name, desc, meta);
      box.appendChild(a);
    }
  }

  function applyLang(lang) {
    currentLang = lang;
    root.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
    document.querySelectorAll("[data-en]").forEach((el) => {
      const val = el.getAttribute(`data-${lang}`);
      if (val !== null) el.innerHTML = val;
    });
    document.querySelectorAll("[data-lang-btn]").forEach((b) => {
      const on = b.getAttribute("data-lang-btn") === lang;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    renderLens();
    renderExtraRepos();
  }

  document.querySelectorAll("[data-lang-btn]").forEach((b) => {
    b.addEventListener("click", () => {
      const next = b.getAttribute("data-lang-btn");
      if (next === "en" || next === "es") applyLang(next);
    });
  });

  document.querySelectorAll(".lens-btn").forEach((b) => {
    b.addEventListener("click", () => {
      const next = b.getAttribute("data-lens");
      if (next && LENSES[next]) {
        currentLens = next;
        renderLens();
      }
    });
  });

  // ── Toast & Copy Email ──────────────────────────────────────────────────
  const toast = document.getElementById("toast");
  let toastTimer = 0;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  document.querySelectorAll("[data-copy-email]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
        showToast(currentLang === "es" ? `Correo copiado: ${EMAIL}` : `Email copied: ${EMAIL}`);
      } catch {
        window.location.href = `mailto:${EMAIL}`;
      }
    });
  });

  // ── Scroll reveal + Active nav section ──────────────────────────────────
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
    );
    reveals.forEach((el) => io.observe(el));

    const navLinks = [...document.querySelectorAll(".nav-links a[href^='#']")];
    const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const navIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = `#${e.target.id}`;
          navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((s) => navIo.observe(s));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  const yr = document.getElementById("year");
  if (yr) yr.textContent = String(new Date().getFullYear());

  applyLang(currentLang);
})();
