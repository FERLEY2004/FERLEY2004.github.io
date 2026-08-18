/* ============================================================================
   LÓGICA DEL PORTFOLIO
   No necesitas tocar este archivo para personalizar la web: edita content.js.
   ========================================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const STORAGE = { lang: "lang", theme: "theme" };
  const SUPPORTED = ["es", "en"];

  // El almacenamiento puede lanzar en navegación privada o con cookies bloqueadas.
  const store = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch {}
    },
  };

  let lang = resolveLang();
  let t = CONTENT[lang];
  let activeFilter = "*";
  let activeTab = "work";

  /* --------------------------------------------------------------------------
     Catálogo de iconos. El campo "icon" de cada servicio en content.js
     elige uno de estos nombres.
     ----------------------------------------------------------------------- */
  const ICONS = {
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5 9-5zM3 17l9 5 9-5M3 12l9 5 9-5"/>',
    gauge: '<path d="M12 21a9 9 0 1 1 9-9"/><path d="m12 13 5-4"/><circle cx="12" cy="13" r="1.6"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L21 21H3l9.7-15.7a4 4 0 0 1 2-1.6"/><circle cx="17" cy="7" r="4"/>',
    bot: '<rect x="3.5" y="8" width="17" height="12" rx="3"/><path d="M12 3.5V8"/><circle cx="12" cy="2.6" r="1.1"/><path d="M8.8 13v1.6M15.2 13v1.6M9.5 17.2h5"/>',
    plug: '<path d="M9 2v6M15 2v6"/><path d="M6.5 8h11v3.2a5.5 5.5 0 0 1-11 0z"/><path d="M12 16.7V22"/>',
    cart: '<circle cx="9.5" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2 3h2.6l2.5 11.4a1.8 1.8 0 0 0 1.8 1.4h8.4a1.8 1.8 0 0 0 1.8-1.4L21 7H5.6"/>',
    boxes: '<path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5z"/><path d="M3 15.5 12 20l9-4.5"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/>',
    github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19.9 5a4.9 4.9 0 0 0-.1-3.6s-1.1-.3-3.7 1.4a12.7 12.7 0 0 0-6.6 0C6.9 1.1 5.8 1.4 5.8 1.4A4.9 4.9 0 0 0 5.7 5a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    twitter: '<path d="M22 4.5a8.4 8.4 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3 8.3 8.3 0 0 1-2.6 1A4.2 4.2 0 0 0 11.6 7 11.9 11.9 0 0 1 3 2.6a4.2 4.2 0 0 0 1.3 5.6A4.1 4.1 0 0 1 2.4 7.7a4.2 4.2 0 0 0 3.4 4.1 4.2 4.2 0 0 1-1.9.1 4.2 4.2 0 0 0 3.9 2.9A8.4 8.4 0 0 1 2 16.6a11.9 11.9 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5A8.3 8.3 0 0 0 22 4.5z"/>',
    website: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
  };

  const icon = (name, cls = "icon") =>
    `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const initialsOf = (name) =>
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  /* --------------------------------------------------------------------------
     Idioma
     ----------------------------------------------------------------------- */
  function resolveLang() {
    const saved = store.get(STORAGE.lang);
    if (SUPPORTED.includes(saved)) return saved;
    const browser = (navigator.language || "es").slice(0, 2).toLowerCase();
    return SUPPORTED.includes(browser) ? browser : "es";
  }

  function getPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  }

  function applyTranslations() {
    document.documentElement.lang = lang;

    $$("[data-i18n]").forEach((el) => {
      const value = getPath(t, el.dataset.i18n);
      if (typeof value === "string") el.textContent = value;
    });

    $$("[data-bind]").forEach((el) => {
      const value = getPath({ profile: PROFILE }, el.dataset.bind);
      if (typeof value === "string") el.textContent = value;
    });

    $$(".lang-switch__btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });
  }

  function setLang(next) {
    if (!SUPPORTED.includes(next)) return;
    store.set(STORAGE.lang, next);
    if (next === lang) return;
    lang = next;
    t = CONTENT[lang];
    renderAll();
  }

  /* --------------------------------------------------------------------------
     Tema
     ----------------------------------------------------------------------- */
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    store.set(STORAGE.theme, theme);
    const btn = $("#themeToggle");
    if (btn) btn.setAttribute("aria-label", theme === "dark" ? t.theme.toLight : t.theme.toDark);
  }

  function initTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current);
    $("#themeToggle").addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next);
    });
  }

  /* --------------------------------------------------------------------------
     Render de secciones
     ----------------------------------------------------------------------- */
  function renderProfile() {
    $$("[data-bind='profile.initials']").forEach((el) => {
      el.textContent = PROFILE.initials || initialsOf(PROFILE.name);
    });

    const email = PROFILE.email;
    const emailLink = $("#emailLink");
    emailLink.href = `mailto:${email}`;
    emailLink.textContent = email;

    const phoneRow = $("#phoneRow");
    if (PROFILE.phone) {
      const phoneLink = $("#phoneLink");
      phoneLink.href = `tel:${PROFILE.phone.replace(/\s+/g, "")}`;
      phoneLink.textContent = PROFILE.phone;
      phoneRow.hidden = false;
    } else {
      phoneRow.hidden = true;
    }

    const cvBtn = $("#cvBtn");
    const cvUrl = lang === "en" ? PROFILE.cvEn : PROFILE.cvEs;
    if (cvUrl) {
      cvBtn.href = cvUrl;
      cvBtn.hidden = false;
    } else {
      cvBtn.hidden = true;
    }

    const badge = $("#heroBadge");
    badge.classList.toggle("is-off", !PROFILE.available);
    $("[data-i18n='hero.badge']", badge).textContent = PROFILE.available
      ? t.hero.badge
      : t.hero.badgeOff;

    $("#availabilityText").textContent = PROFILE.available
      ? t.contact.availabilityText
      : t.contact.availabilityOff;

    const socialsHtml = Object.entries(PROFILE.social)
      .filter(([, url]) => url)
      .map(
        ([net, url]) =>
          `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="${net}">${icon(net)}</a></li>`
      )
      .join("");

    ["#socials", "#socialsInfo", "#socialsFooter"].forEach((sel) => {
      $(sel).innerHTML = socialsHtml;
    });

    $("#year").textContent = new Date().getFullYear();
  }

  function renderHero() {
    $("#heroStats").innerHTML = t.hero.stats
      .map(
        (s) => `
        <li>
          <p class="stats__value">${escapeHtml(s.value)}</p>
          <p class="stats__label">${escapeHtml(s.label)}</p>
        </li>`
      )
      .join("");
  }

  function renderServices() {
    $("#servicesGrid").innerHTML = t.services.items
      .map(
        (s) => `
        <article class="card reveal">
          <div class="card__icon">${icon(s.icon)}</div>
          <h3 class="card__title">${escapeHtml(s.title)}</h3>
          <p class="card__text">${escapeHtml(s.text)}</p>
          <ul class="card__bullets">
            ${s.bullets.map((b) => `<li>${icon("check")}<span>${escapeHtml(b)}</span></li>`).join("")}
          </ul>
          ${s.price ? `<p class="card__price">${escapeHtml(s.price)}</p>` : ""}
        </article>`
      )
      .join("");
  }

  function renderProcess() {
    $("#processList").innerHTML = t.process.steps
      .map(
        (s) => `
        <li class="process__item reveal">
          <h3 class="process__title">${escapeHtml(s.title)}</h3>
          <p class="process__text">${escapeHtml(s.text)}</p>
        </li>`
      )
      .join("");
  }

  function renderWork() {
    const categories = [...new Set(t.work.items.map((p) => p.category))];
    if (!categories.includes(activeFilter)) activeFilter = "*";

    $("#workFilters").innerHTML = [
      `<button type="button" class="filter${activeFilter === "*" ? " is-active" : ""}" data-filter="*">${escapeHtml(t.work.filterAll)}</button>`,
      ...categories.map(
        (c) =>
          `<button type="button" class="filter${activeFilter === c ? " is-active" : ""}" data-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`
      ),
    ].join("");

    $("#workGrid").innerHTML = t.work.items
      .map((p) => {
        const visible = activeFilter === "*" || p.category === activeFilter;
        const thumb = p.image
          ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy">`
          : `<p class="project__thumb-text">${escapeHtml(p.title)}</p>`;

        const links = [
          p.demo
            ? `<a href="${escapeHtml(p.demo)}" target="_blank" rel="noopener noreferrer">${icon("external")}<span>${escapeHtml(t.work.demo)}</span></a>`
            : "",
          p.code
            ? `<a href="${escapeHtml(p.code)}" target="_blank" rel="noopener noreferrer">${icon("github")}<span>${escapeHtml(t.work.code)}</span></a>`
            : "",
        ].join("");

        return `
        <article class="project reveal${p.featured ? " is-featured" : ""}${visible ? "" : " is-hidden"}" data-category="${escapeHtml(p.category)}">
          <div class="project__thumb">
            ${thumb}
            <span class="project__tag">${escapeHtml(p.category)}</span>
          </div>
          <div class="project__body">
            <h3 class="project__title">${escapeHtml(p.title)}</h3>
            <p class="project__text">${escapeHtml(p.text)}</p>
            ${p.result ? `<p class="project__result">${icon("trend")}<span>${escapeHtml(p.result)}</span></p>` : ""}
            <ul class="project__tags">${p.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>
            ${links ? `<div class="project__links">${links}</div>` : ""}
          </div>
        </article>`;
      })
      .join("");
  }

  function renderSkills() {
    $("#skillsGrid").innerHTML = t.skills.groups
      .map(
        (g) => `
        <div class="skill-group reveal">
          <h3 class="skill-group__title">${escapeHtml(g.title)}</h3>
          <ul class="chips">${g.items.map((i) => `<li class="chip">${escapeHtml(i)}</li>`).join("")}</ul>
        </div>`
      )
      .join("");
  }

  function renderAbout() {
    $("#aboutParagraphs").innerHTML = t.about.paragraphs
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join("");

    $("#aboutHighlights").innerHTML = t.about.highlights
      .map((h) => `<li>${icon("check")}<span>${escapeHtml(h)}</span></li>`)
      .join("");

    const photo = $("#aboutPhoto");
    if (photo && t.about.photoAlt) photo.alt = t.about.photoAlt;
  }

  function renderTimeline() {
    const items = activeTab === "work" ? t.experience.jobs : t.experience.education;

    $("#timeline").innerHTML = items
      .map(
        (item) => `
        <li class="timeline__item reveal">
          <p class="timeline__date">${escapeHtml(item.date)}</p>
          <h3 class="timeline__role">${escapeHtml(item.role)}</h3>
          <p class="timeline__org">${escapeHtml(item.org)}</p>
          <p class="timeline__text">${escapeHtml(item.text)}</p>
        </li>`
      )
      .join("");

    $$(".tab").forEach((tab) => {
      const active = tab.dataset.tab === activeTab;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
  }

  function renderContactForm() {
    const select = $("#cSubject");
    select.innerHTML = t.contact.subjects
      .map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`)
      .join("");

    $("#cName").placeholder = t.contact.formPlaceholderName;
    $("#cEmail").placeholder = t.contact.formPlaceholderEmail;
    $("#cMessage").placeholder = t.contact.formMessagePlaceholder;
    $("#copyEmail").textContent = t.contact.copy;
    $("#formStatus").textContent = "";
    $("#formStatus").className = "form-status";
  }

  function renderAll() {
    applyTranslations();
    renderProfile();
    renderHero();
    renderServices();
    renderProcess();
    renderWork();
    renderSkills();
    renderAbout();
    renderTimeline();
    renderContactForm();
    setTheme(document.documentElement.getAttribute("data-theme"));
    observeReveals();
    $("#menuBtn").setAttribute("aria-label", t.menu.open);
    $("#toTop").setAttribute("aria-label", t.footer.backToTop);
  }

  /* --------------------------------------------------------------------------
     Interacciones
     ----------------------------------------------------------------------- */
  function initHeader() {
    const header = $("#header");
    const nav = $("#nav");
    const menuBtn = $("#menuBtn");
    const toTop = $("#toTop");

    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 20);
      toTop.classList.toggle("is-visible", y > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const closeMenu = () => {
      nav.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", t.menu.open);
    };

    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? t.menu.close : t.menu.open);
    });

    $$(".nav__link").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (e) => {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
        closeMenu();
      }
    });
  }

  function initScrollSpy() {
    const links = $$(".nav__link");
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) =>
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

  let revealObserver = null;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, i) => {
            if (!entry.isIntersecting) return;
            entry.target.style.transitionDelay = `${Math.min(i, 5) * 70}ms`;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );
    }

    $$(".reveal:not(.is-visible)").forEach((el) => revealObserver.observe(el));
  }

  function initDelegatedEvents() {
    $$(".lang-switch__btn").forEach((btn) =>
      btn.addEventListener("click", () => setLang(btn.dataset.lang))
    );

    $("#workFilters").addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      $$(".filter").forEach((f) => f.classList.toggle("is-active", f === btn));
      $$(".project").forEach((card) => {
        const show = activeFilter === "*" || card.dataset.category === activeFilter;
        card.classList.toggle("is-hidden", !show);
      });
    });

    $$(".tab").forEach((tab) =>
      tab.addEventListener("click", () => {
        activeTab = tab.dataset.tab;
        renderTimeline();
        observeReveals();
      })
    );

    $("#copyEmail").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      try {
        await navigator.clipboard.writeText(PROFILE.email);
        btn.textContent = t.contact.copied;
        setTimeout(() => (btn.textContent = t.contact.copy), 2000);
      } catch {
        window.location.href = `mailto:${PROFILE.email}`;
      }
    });
  }

  /* --------------------------------------------------------------------------
     Formulario de contacto
     ----------------------------------------------------------------------- */
  function initForm() {
    const form = $("#contactForm");
    const status = $("#formStatus");
    const submitBtn = $("#submitBtn");
    const submitLabel = $("span", submitBtn);

    const setError = (input, message) => {
      const field = input.closest(".field");
      field.classList.toggle("has-error", Boolean(message));
      $(`[data-error-for="${input.id}"]`).textContent = message || "";
      input.setAttribute("aria-invalid", message ? "true" : "false");
    };

    const validate = () => {
      const name = $("#cName");
      const email = $("#cEmail");
      const message = $("#cMessage");
      let valid = true;

      if (name.value.trim().length < 2) { setError(name, t.errors.name); valid = false; }
      else setError(name, "");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { setError(email, t.errors.email); valid = false; }
      else setError(email, "");

      if (message.value.trim().length < 20) { setError(message, t.errors.message); valid = false; }
      else setError(message, "");

      return valid;
    };

    ["cName", "cEmail", "cMessage"].forEach((id) => {
      const input = $(`#${id}`);
      input.addEventListener("blur", () => { if (input.value) validate(); });
      input.addEventListener("input", () => {
        if (input.closest(".field").classList.contains("has-error")) validate();
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = "";
      status.className = "form-status";
      if (!validate()) return;

      const data = Object.fromEntries(new FormData(form).entries());

      if (data._gotcha) {
        status.textContent = t.contact.success;
        status.classList.add("is-success");
        form.reset();
        return;
      }

      // Sin endpoint configurado: se abre el cliente de correo del visitante.
      if (!PROFILE.formEndpoint) {
        const body = `${data.name} <${data.email}>\n\n${data.message}`;
        window.location.href =
          `mailto:${PROFILE.email}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
        status.textContent = t.contact.success;
        status.classList.add("is-success");
        form.reset();
        return;
      }

      submitBtn.disabled = true;
      submitLabel.textContent = t.contact.sending;

      try {
        const isAjaxJson = /formsubmit\.co\/ajax/i.test(PROFILE.formEndpoint);
        const payload = {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          _subject: `Portafolio: ${data.subject} — ${data.name}`,
          _template: "table",
          _captcha: "false",
        };

        const res = await fetch(PROFILE.formEndpoint, {
          method: "POST",
          headers: isAjaxJson
            ? { Accept: "application/json", "Content-Type": "application/json" }
            : { Accept: "application/json" },
          body: isAjaxJson ? JSON.stringify(payload) : new FormData(form),
        });

        const json = await res.json().catch(() => ({}));
        const failed = !res.ok || json.success === false || json.success === "false";
        if (failed) throw new Error("Request failed");

        status.textContent = t.contact.success;
        status.classList.add("is-success");
        form.reset();
      } catch {
        status.innerHTML = `${escapeHtml(t.contact.error)} <a href="mailto:${escapeHtml(PROFILE.email)}">${escapeHtml(PROFILE.email)}</a>`;
        status.classList.add("is-error");
      } finally {
        submitBtn.disabled = false;
        submitLabel.textContent = t.contact.send;
      }
    });
  }

  /* --------------------------------------------------------------------------
     Arranque
     ----------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderAll();
    initTheme();
    initHeader();
    initScrollSpy();
    initDelegatedEvents();
    initForm();
  });
})();
