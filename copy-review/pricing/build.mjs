// 🤖 Renders the pricing page from copy-review/pricing/strings.json.
// Writes copy-review/pricing/preview/index.html (with data-copy bindings, for
// the review server) and src/pricing/index.html (the same page, bindings
// stripped, assets absolute). Re-run after an approved review is applied to
// strings.json; never edit the rendered files by hand.
import fs from "node:fs";
import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, "..", "..");
const strings = JSON.parse(fs.readFileSync(path.join(here, "strings.json"), "utf8"));
const S = Object.fromEntries(strings.map((s) => [s.id, s.text]));
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const t = (id, tag = "span", cls = "") => {
  if (!(id in S)) throw new Error("missing string " + id);
  return `<${tag}${cls ? ` class="${cls}"` : ""} data-copy="${id}">${esc(S[id])}</${tag}>`;
};
const li = (id) => `        <li data-copy="${id}">${esc(S[id])}</li>`;
const countries = JSON.parse(fs.readFileSync(path.join(here, "countries.json"), "utf8"));
const recs = (countries.countries || countries.records || []).slice().sort((a, b) => a.name.localeCompare(b.name));
const byBand = { A: [], B: [], C: [], D: [] };
for (const r of recs) byBand[r.band].push(r.name);
const bandList = Object.entries(byBand).map(([b, names]) =>
  `        <div class="band-col"><h3>Band ${b}</h3><p>${names.map(esc).join(", ")}</p></div>`).join("\n");

const card = (p, featured) => `      <article class="plan${featured ? " featured" : ""}">
        ${t(`plan.${p}.name`, "h3")}
        <p class="price">${t(`plan.${p}.price`)}</p>
${S[`plan.${p}.min`] ? `        <p class="min">${t(`plan.${p}.min`)}</p>\n` : ""}        <p class="for">${t(`plan.${p}.for`)}</p>
        <ul>
${Object.keys(S).filter((k) => k.startsWith(`plan.${p}.i`)).map(li).join("\n")}
        </ul>
        <a class="btn ${featured ? "btn-primary" : "btn-quiet"}" href="https://console.carloku.com" data-copy="plan.${p}.cta">${esc(S[`plan.${p}.cta`])}</a>
      </article>`;

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title data-copy="meta.title">${esc(S["meta.title"])}</title>
<meta name="description" content="🤖 ${esc(S["meta.description"])}">
<meta property="og:title" content="${esc(S["meta.title"])}">
<meta property="og:description" content="${esc(S["meta.description"])}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://carloku.com/pricing/">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0e0c13" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/GeistMono-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="/"><svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#5b3e96"/><circle cx="30" cy="32" r="17" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-dasharray="88.8 18" stroke-dashoffset="-9"/><circle cx="51" cy="44" r="5" fill="#c9b2f7"/></svg>Carloku</a>
    <nav aria-label="Site">
      <a href="/#workflow">How it works</a>
      <a href="/#open">Open source</a>
      <a href="/pricing/" aria-current="page" data-copy="nav.pricing">${esc(S["nav.pricing"])}</a>
      <a href="/get-started/">Get started</a>
    </nav>
    <a class="head-cta" href="https://console.carloku.com">Dashboard</a>
  </div>
</header>
<main id="main">
  <div class="page-hero">
    <div class="wrap narrow">
      <h1><span data-copy="hero.title">${esc(S["hero.title"])}</span><span class="dot">.</span></h1>
      <p class="lede" data-copy="hero.lede">${esc(S["hero.lede"])}</p>
      <p class="hero-note" data-copy="hero.new">${esc(S["hero.new"])}</p>
    </div>
  </div>
  <section class="plans-section">
    <div class="wrap">
      ${t("plans.heading", "h2")}
      <div class="plans">
${card("free", false)}
${card("personal", true)}
${card("community", false)}
${card("business", false)}
      </div>
      <p class="plans-note" data-copy="plans.note">${esc(S["plans.note"])}</p>
    </div>
  </section>
  <section class="tint">
    <div class="wrap narrow prose">
      ${t("member.heading", "h2")}
      <p data-copy="member.p1">${esc(S["member.p1"])}</p>
      <p data-copy="member.p2">${esc(S["member.p2"])}</p>
    </div>
  </section>
  <section>
    <div class="wrap narrow prose">
      ${t("bands.heading", "h2")}
      <p data-copy="bands.p1">${esc(S["bands.p1"])}</p>
      <ul>
${["a", "b", "c", "d"].map((b) => li("bands." + b)).join("\n")}
      </ul>
      <table class="price-table">
        <thead><tr><th scope="col"><span class="visually-hidden">Plan</span></th><th scope="col">A</th><th scope="col">B</th><th scope="col">C</th><th scope="col">D</th></tr></thead>
        <tbody>
          <tr><th scope="row" data-copy="bands.table.personal">${esc(S["bands.table.personal"])}</th><td>€24</td><td>€18</td><td>€12</td><td>€8.40</td></tr>
          <tr><th scope="row" data-copy="bands.table.community">${esc(S["bands.table.community"])}</th><td>€5</td><td>€3.75</td><td>€2.50</td><td>€1.75</td></tr>
          <tr><th scope="row" data-copy="bands.table.business">${esc(S["bands.table.business"])}</th><td>€50</td><td>€37.50</td><td>€25</td><td>€17.50</td></tr>
        </tbody>
      </table>
      <p data-copy="bands.p2">${esc(S["bands.p2"])}</p>
      <p data-copy="bands.p3">${esc(S["bands.p3"])}</p>
      <details class="bands-all">
        <summary data-copy="bands.list.summary">${esc(S["bands.list.summary"])}</summary>
${bandList}
      </details>
    </div>
  </section>
  <section class="tint">
    <div class="wrap narrow prose">
      ${t("over.heading", "h2")}
      <p data-copy="over.p1">${esc(S["over.p1"])}</p>
      <table class="price-table rates">
        <tbody>
          <tr><th scope="row" data-copy="over.table.awake">${esc(S["over.table.awake"])}</th><td data-copy="over.rate.awake">${esc(S["over.rate.awake"])}</td></tr>
          <tr><th scope="row" data-copy="over.table.storage">${esc(S["over.table.storage"])}</th><td data-copy="over.rate.storage">${esc(S["over.rate.storage"])}</td></tr>
          <tr><th scope="row" data-copy="over.table.transfer">${esc(S["over.table.transfer"])}</th><td data-copy="over.rate.transfer">${esc(S["over.rate.transfer"])}</td></tr>
          <tr><th scope="row" data-copy="over.table.writes">${esc(S["over.table.writes"])}</th><td data-copy="over.rate.writes">${esc(S["over.rate.writes"])}</td></tr>
        </tbody>
      </table>
      <p data-copy="over.p2">${esc(S["over.p2"])}</p>
      <p data-copy="over.p3">${esc(S["over.p3"])}</p>
    </div>
  </section>
  <section class="band">
    <div class="wrap">
      ${t("half.heading", "h2")}
      <p data-copy="half.p1">${esc(S["half.p1"])}</p>
    </div>
  </section>
  <section>
    <div class="wrap narrow prose">
      ${t("promise.heading", "h2")}
      <p data-copy="promise.p1">${esc(S["promise.p1"])}</p>
      ${t("pay.heading", "h2")}
      <p data-copy="pay.p1">${esc(S["pay.p1"])}</p>
      <p data-copy="pay.p2">${esc(S["pay.p2"])}</p>
      <p data-copy="pay.p3">${esc(S["pay.p3"])}</p>
      <p data-copy="pay.p4">${esc(S["pay.p4"])}</p>
    </div>
  </section>
  <section class="close-cta">
    <div class="wrap">
      <h2><span data-copy="start.heading">${esc(S["start.heading"])}</span><span class="dot">.</span></h2>
      <p data-copy="start.p1">${esc(S["start.p1"])}</p>
      <div class="cta">
        <a class="btn btn-primary" href="https://console.carloku.com" data-copy="start.cta.console">${esc(S["start.cta.console"])}</a>
        <a class="btn btn-quiet" href="/get-started/" data-copy="start.cta.guide">${esc(S["start.cta.guide"])}</a>
      </div>
    </div>
  </section>
</main>
<footer>
  <div class="wrap">
    <p>🤖 Written by an LLM (Claude), on the ideas, instruction, and editing of humans.
    AI-written text here is always marked and always disclosed; see
    <a href="https://11factor.org/#x">factor X</a>.</p>
    <p><a href="/">← carloku.com</a> · <a href="https://github.com/carlosframework/carloku">Source on GitHub</a>.</p>
  </div>
</footer>
<script src="/site.js" defer></script>
</body>
</html>
`;
fs.mkdirSync(path.join(root, "src", "pricing"), { recursive: true });
fs.writeFileSync(path.join(root, "src", "pricing", "index.html"), page.replace(/ data-copy(?:-title)?="[^"]*"/g, ""));
const prev = path.join(here, "preview");
fs.mkdirSync(path.join(prev, "fonts"), { recursive: true });
for (const f of ["site.css", "favicon.svg"]) fs.copyFileSync(path.join(root, "src", f), path.join(prev, f));
for (const f of fs.readdirSync(path.join(root, "src", "fonts"))) fs.copyFileSync(path.join(root, "src", "fonts", f), path.join(prev, "fonts", f));
let previewHtml = page
  .replace(/href="\/site\.css"/, 'href="site.css"')
  .replace(/href="\/fonts\//g, 'href="fonts/"'.slice(0, -1))
  .replace(/href="\/favicon\.svg"/, 'href="favicon.svg"')
  .replace(/<script src="\/site\.js" defer><\/script>\n/, "");
fs.writeFileSync(path.join(prev, "index.html"), previewHtml);
console.log("wrote src/pricing/index.html and copy-review/pricing/preview/index.html", strings.length, "strings");
