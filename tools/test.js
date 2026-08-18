/* Pruebas funcionales del portafolio sobre un DOM simulado.
   Uso: node tools/test.js   (requiere: npm install jsdom)
   No modifica nada: carga la página en memoria, simula clics y comprueba el resultado. */

const { JSDOM, VirtualConsole } = require("jsdom");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const errors = [];
const vc = new VirtualConsole().on("jsdomError", (e) => {
  // jsdom no implementa la navegación a mailto:, que es lo que hace el formulario
  // cuando no hay endpoint configurado. Ese aviso es esperado.
  if (!/navigation to another Document/.test(e.message)) errors.push(e.message);
});

const dom = new JSDOM(fs.readFileSync(path.join(root, "index.html"), "utf8"), {
  runScripts: "dangerously",
  url: "http://127.0.0.1:8000/",
  pretendToBeVisual: true,
  virtualConsole: vc,
});
const { window } = dom;
window.addEventListener("error", (e) => errors.push(e.message));
window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }));
Object.defineProperty(window.navigator, "language", { value: "es-CO", configurable: true });

["js/content.js", "js/main.js"].forEach((f) => {
  const s = window.document.createElement("script");
  s.textContent = fs.readFileSync(path.join(root, f), "utf8");
  window.document.body.appendChild(s);
});
window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));

const $ = (s) => window.document.querySelector(s);
const $$ = (s) => Array.from(window.document.querySelectorAll(s));
const results = [];
const check = (label, cond, detail = "") => results.push({ label, pass: Boolean(cond), detail });

// --- Contenido renderizado ------------------------------------------------
check("Arranca en español", window.document.documentElement.lang === "es");
check("Nombre en el hero", $(".hero__name").textContent === "Ferley Orobio");
check("Rol en el hero", $(".hero__role").textContent === "Desarrollador Full Stack");
check("Estadísticas", $$("#heroStats li").length === 3, $$("#heroStats .stats__value").map((v) => v.textContent).join("/"));
check("Servicios", $$("#servicesGrid .card").length === 4, $$(".card__title").map((c) => c.textContent.split(" ")[0]).join(", "));
check("Iconos de servicio dibujados", $$("#servicesGrid .card__icon svg path, #servicesGrid .card__icon svg rect").length >= 4);
check("Pasos del método", $$("#processList .process__item").length === 4);
check("Filtros", $$("#workFilters .filter").length === 5, $$("#workFilters .filter").map((b) => b.textContent).join(" | "));
check("Proyectos", $$("#workGrid .project").length === 6);
check("Proyectos destacados", $$("#workGrid .project.is-featured").length === 2);
check("Grupos de tecnologías", $$("#skillsGrid .skill-group").length === 6);
check("Total de tecnologías listadas", $$("#skillsGrid .chip").length === 39, `${$$("#skillsGrid .chip").length} etiquetas`);
check("Párrafos de Sobre mí", $$("#aboutParagraphs p").length === 4);
check("Puntos destacados", $$("#aboutHighlights li").length === 4);
check("Experiencia", $$("#timeline .timeline__item").length === 2);
check("Asuntos del formulario", $$("#cSubject option").length === 4);
check("Redes sociales", $$("#socials a").length === 2);
check("Enlace mailto", $("#emailLink").getAttribute("href") === "mailto:Ferleyorobio68@gmail.com");
check("Teléfono oculto (campo vacío)", $("#phoneRow").hidden);
check("Botón de CV oculto (sin PDF)", $("#cvBtn").hidden);
check("Solo 2 proyectos enlazan a GitHub", $$("#workGrid .project__links a").length === 2,
  $$("#workGrid .project__links a").map((a) => a.href.split("/").pop()).join(", "));
check("Sin enlaces vacíos", $$("a[href='#']").length === 0);
check("Sin 'undefined' visible", !$$("main, header, footer").map((e) => e.textContent).join(" ").includes("undefined"));

// --- Idioma ---------------------------------------------------------------
$$(".lang-switch__btn").find((b) => b.dataset.lang === "en").click();
check("Cambio a inglés", $(".hero__role").textContent === "Full Stack Developer");
check("Proyectos traducidos", $("#workGrid .project__title").textContent === "Enterprise AI chatbots");
check("Filtros traducidos", $$("#workFilters .filter").length === 5, $$("#workFilters .filter").map((b) => b.textContent).join(" | "));
check("Tecnologías traducidas", $("#skillsGrid .skill-group__title").textContent === "Development");
check("Idioma guardado", window.localStorage.getItem("lang") === "en");
$$(".lang-switch__btn").find((b) => b.dataset.lang === "es").click();
check("Vuelta a español", $(".hero__role").textContent === "Desarrollador Full Stack");

// --- Tema -----------------------------------------------------------------
const before = window.document.documentElement.getAttribute("data-theme");
$("#themeToggle").click();
const after = window.document.documentElement.getAttribute("data-theme");
check("Cambio de tema", before !== after, `${before} -> ${after}`);
check("Tema guardado", window.localStorage.getItem("theme") === after);
$("#themeToggle").click();

// --- Filtros --------------------------------------------------------------
$$("#workFilters .filter").find((b) => b.dataset.filter === "Sistemas empresariales").click();
check("Filtro 'Sistemas empresariales' deja 3", $$("#workGrid .project:not(.is-hidden)").length === 3);
$$("#workFilters .filter").find((b) => b.dataset.filter === "Inteligencia artificial").click();
check("Filtro 'Inteligencia artificial' deja 1", $$("#workGrid .project:not(.is-hidden)").length === 1);
$$("#workFilters .filter")[0].click();
check("Filtro 'Todos' restaura los 6", $$("#workGrid .project:not(.is-hidden)").length === 6);

// --- Pestañas y menú ------------------------------------------------------
$$(".tab").find((x) => x.dataset.tab === "edu").click();
check("Pestaña Formación", $$("#timeline .timeline__item").length === 1);
$$(".tab").find((x) => x.dataset.tab === "work").click();
check("Vuelta a Experiencia", $$("#timeline .timeline__item").length === 2);

$("#menuBtn").click();
check("El menú se abre", $("#nav").classList.contains("is-open"));
$(".nav__link").click();
check("El menú se cierra al navegar", !$("#nav").classList.contains("is-open"));

// --- Formulario -----------------------------------------------------------
$("#contactForm").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
check("Formulario vacío: 3 errores", $$(".field.has-error").length === 3);
$("#cName").value = "Laura Méndez";
$("#cEmail").value = "laura@empresa.com";
$("#cMessage").value = "Hola Ferley, vimos tu portafolio y queremos hablar de una vacante.";
$("#contactForm").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
check("Datos válidos: sin errores", $$(".field.has-error").length === 0);

// --- Accesibilidad --------------------------------------------------------
check("Enlaces externos con rel=noopener", $$('a[target="_blank"]').every((a) => (a.getAttribute("rel") || "").includes("noopener")));
check("Inputs con etiqueta", $$("#contactForm input, #contactForm select, #contactForm textarea").every((i) => window.document.querySelector(`label[for="${i.id}"]`)));
check("Un solo h1", $$("h1").length === 1);
check("SVG ocultos a lectores de pantalla", $$("svg:not([aria-hidden])").length === 0);
check("Encabezados sin saltos de nivel", $$("h1,h2,h3,h4").every((h, i, a) => i === 0 || +h.tagName[1] - +a[i - 1].tagName[1] <= 1));

const failed = results.filter((r) => !r.pass);
console.log("\n=== PRUEBAS FUNCIONALES ===");
results.forEach((r) => console.log(`  ${r.pass ? "OK   " : "FALLA"} ${r.label}${r.detail ? "  ->  " + r.detail : ""}`));
console.log("\n=== ERRORES DE CONSOLA ===");
console.log(errors.length ? errors.map((e) => "  " + e).join("\n") : "  Ninguno");
console.log(`\n=== ${results.length - failed.length}/${results.length} pruebas superadas ===`);
if (failed.length || errors.length) process.exitCode = 1;
