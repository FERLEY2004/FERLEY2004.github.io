/* Comprobaciones de coherencia del portafolio.
   Uso: node tools/verify.js
   No modifica nada: solo lee los archivos del proyecto e informa de problemas. */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const mainSrc = fs.readFileSync(path.join(root, "js", "main.js"), "utf8");
const contentSrc = fs.readFileSync(path.join(root, "js", "content.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css", "styles.css"), "utf8");

eval(contentSrc + "\nglobalThis.CONTENT = CONTENT; globalThis.PROFILE = PROFILE;");

const problems = [];
const ok = [];
const getPath = (o, p) => p.split(".").reduce((a, k) => (a == null ? undefined : a[k]), o);

// Los IDs que busca el JavaScript existen en el HTML
const htmlIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const usedIds = new Set([...mainSrc.matchAll(/\$\("#([A-Za-z0-9_-]+)"/g)].map((m) => m[1]));
for (const id of usedIds) if (!htmlIds.has(id)) problems.push(`main.js busca #${id}, no existe en el HTML`);
ok.push(`IDs: ${usedIds.size}`);

// Las claves de traducción existen en los dos idiomas
const i18nKeys = new Set([...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]));
for (const k of i18nKeys) for (const l of ["es", "en"])
  if (typeof getPath(CONTENT[l], k) !== "string") problems.push(`data-i18n="${k}" ausente en ${l}`);
ok.push(`Claves data-i18n: ${i18nKeys.size}`);

const tKeys = new Set([...mainSrc.matchAll(/\bt\.([a-zA-Z]+)\.([a-zA-Z]+)/g)].map((m) => `${m[1]}.${m[2]}`));
for (const k of tKeys) for (const l of ["es", "en"])
  if (getPath(CONTENT[l], k) === undefined) problems.push(`t.${k} ausente en ${l}`);
ok.push(`Claves t.*: ${tKeys.size}`);

// Los bloques es y en tienen la misma estructura
(function walk(a, b, trail = "") {
  if (Array.isArray(a)) {
    if (a.length !== b.length) problems.push(`Distinto nº de elementos en ${trail}: es=${a.length}, en=${b.length}`);
    a.forEach((x, i) => b[i] !== undefined && walk(x, b[i], `${trail}[${i}]`));
    return;
  }
  if (a && typeof a === "object") {
    for (const k of Object.keys(a)) {
      const p = `${trail}${trail ? "." : ""}${k}`;
      if (!(k in b)) problems.push(`Falta "${p}" en el bloque en`);
      else walk(a[k], b[k], p);
    }
    for (const k of Object.keys(b)) if (!(k in a)) problems.push(`Falta "${trail}.${k}" en el bloque es`);
  }
})(CONTENT.es, CONTENT.en);
ok.push("Paridad es/en");

const binds = new Set([...html.matchAll(/data-bind="profile\.([^"]+)"/g)].map((m) => m[1]));
for (const b of binds) if (getPath(PROFILE, b) === undefined) problems.push(`data-bind profile.${b} inexistente`);
ok.push(`data-bind: ${binds.size}`);

// Los iconos referenciados están definidos
const iconBlock = mainSrc.match(/ICONS = \{([\s\S]*?)\n {2}\};/)[1];
const iconNames = new Set([...iconBlock.matchAll(/^ {4}([a-zA-Z]+):/gm)].map((m) => m[1]));
const needed = new Set([
  ...Object.keys(PROFILE.social).filter((k) => PROFILE.social[k]),
  ...CONTENT.es.services.items.map((s) => s.icon),
  ...CONTENT.en.services.items.map((s) => s.icon),
  "check", "trend", "external", "github",
]);
for (const n of needed) if (!iconNames.has(n)) problems.push(`Icono "${n}" usado y no definido`);
const unusedIcons = [...iconNames].filter((n) => !needed.has(n));
if (unusedIcons.length) ok.push(`Aviso, iconos definidos sin usar: ${unusedIcons.join(", ")}`);
ok.push(`Iconos usados: ${needed.size}`);

// Los archivos referenciados existen
const assets = new Set([...html.matchAll(/(?:src|href)="((?!http|#|mailto|tel)[^"]+)"/g)].map((m) => m[1]));
for (const a of assets) if (!a.endsWith(".pdf") && !fs.existsSync(path.join(root, a))) problems.push(`No existe: ${a}`);
ok.push(`Rutas locales: ${assets.size}`);

// Las clases que genera el JavaScript tienen estilos
const jsClasses = new Set([...mainSrc.matchAll(/class="([^"$]+)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean));
const missing = [...jsClasses].filter((c) => !css.includes(`.${c}`));
if (missing.length) problems.push(`Clases del JS sin estilo: ${missing.join(", ")}`);
ok.push(`Clases del JS: ${jsClasses.size}`);

// No quedan restos de la plantilla original
["Tu Nombre", "tunombre@", "tuusuario", "Madrid"].forEach((n) => {
  if (html.includes(n) || contentSrc.includes(n)) problems.push(`Resto de plantilla: "${n}"`);
});

// Los enlaces de los proyectos apuntan a repositorios propios
CONTENT.es.work.items.forEach((p, i) => {
  if (p.demo === "#" || p.code === "#") problems.push(`Proyecto ${i}: enlace "#"`);
  if (p.code && !p.code.startsWith("https://github.com/FERLEY2004/")) problems.push(`Proyecto ${i}: repositorio ajeno`);
});

["es", "en"].forEach((l) => {
  const cats = [...new Set(CONTENT[l].work.items.map((p) => p.category))];
  ok.push(`Filtros ${l}: ${cats.join(" / ")}`);
});
ok.push(`Proyectos: ${CONTENT.es.work.items.length}, destacados: ${CONTENT.es.work.items.filter((p) => p.featured).length}`);
ok.push(`Marcadores COMPLETAR pendientes: ${(contentSrc.match(/COMPLETAR/g) || []).length}`);

console.log("\n=== COMPROBACIONES ===");
ok.forEach((o) => console.log("  . " + o));
console.log("\n=== RESULTADO ===");
if (!problems.length) console.log("  Sin problemas detectados.");
else { problems.forEach((p) => console.log("  [X] " + p)); process.exitCode = 1; }
