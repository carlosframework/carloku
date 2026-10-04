# 🤖 AGENTS.md

The canonical agent-instructions file for this repo — keep it current here,
not in a tool-specific file. (Claude Code reads it via the `CLAUDE.md`
pointer.)

The marketing site for **Carloku** — the hosted CARLOS platform
(console.carloku.com). Brand boundary: Carloku is the *hosted platform*
brand; CARLOS is the framework/CLI/console name. Never rename CARLOS things
to Carloku here.

**Voice lives in PRODUCT.md** — the one feeling is lightness ("finally,
simple"); the landing page appeals to the heart, /get-started carries the
tech. Read it before touching copy.

Rules inherited from the `website` repo, which governs the sibling site:

- **Small site, nothing fetched.** `/` and `/get-started/` are hand-written
  and share one `site.css`. No frameworks, no analytics, and nothing pulled
  from another origin — the two Geist faces in `fonts/` are self-hosted. The
  only script is `site.js`: 2KB, hand-written, and pure enhancement (the hero
  terminal types itself, the header grows a hairline on scroll). The pages
  read fine with it blocked; keep it that way, and don't add a second one.
- **`/docs` is built; the rest of the site is not.** Docs pages come from the
  markdown in `src/docs/` through Eleventy, the same pipeline rastrillo.org
  uses, run here before you ship. `_site/` is gitignored and never committed;
  Eleventy and markdown-it are devDependencies that no visitor ever meets.
  See "Building the docs" below.
- **Light and dark** via `prefers-color-scheme` — keep both working.
- **AI authorship is always marked** with a visible 🤖 (cascades from a
  heading); person-emoji (👨/👤/🧑) blocks are certified human and
  off-limits to LLM edits. Baseline: everything here is AI-written unless
  marked otherwise.
- **Don't overclaim.** The console requires Keymail sign-in; pricing does
  not exist yet, so the site says nothing about it.

## Building the docs

`/docs` is ten pages of markdown under `src/docs/`, rendered by Eleventy into
`_site/` before you ship. **The corpus is authored here, by hand.** That is the
opposite of carlosframework.com, whose `/docs` corpus is vendored out of the
platform repo by a sync script: there is no sync step in this repo, nothing
under `src/docs/` or `src/_data/docsnav.json` is generated, and nothing will
overwrite an edit you make. The markdown IS the source — edit it here.

```
npm install
npm run check          # builds, then gates the rendered output
npm run serve          # localhost:8080, live reload
```

`npm run check` is `eleventy` followed by `hack/check-docs.mjs`, which reads
`_site/` after the build: the hand-written pages and shared assets were
emitted at all; every nav entry has a built page and a built `.md` twin; every
internal `/docs` href resolves to a built file, and to a real `id="…"` when it
carries a fragment; and `slugify` in `eleventy.config.js` agrees with Go's
`internal/docsite.Anchor` on every case in `src/_data/docsanchors.json`. That
last one is why the anchor fixture is vendored rather than retyped: a heading
whose fragment the platform's Go gate accepts cannot 404 in a browser here
because the two slug rules drifted.

**Eleventy does not clean stale output.** Delete or rename a page and its old
built HTML stays in `_site/` until you remove it — and the gate will *not*
notice, because every check it runs is satisfied by a file that should no
longer exist. `_site/` is gitignored, so a stale page never shows up in a diff
either. **Build clean whenever you are verifying anything:**

```
rm -rf _site && npm run check
```

The deploy sequence below gets this for free: it builds inside a fresh
`git archive` export, which has no `_site/` in it at all.

`index.html` and `get-started/index.html` are hand-written and pass through the
build byte-identical — `templateFormats` excludes `html` on purpose, so
Eleventy copies them instead of rendering them as templates. If either changes
in `_site/` without you editing its source, something is wrong.

## Deploying

Merging does **not** publish. The live site is stale until someone deploys.

**Since 2026-10-04 the site is an ordinary console app** (platform #209):

| | |
| --- | --- |
| console | `https://console.carloku.com` |
| account / app | `bes` (named `carloku`) / `website` |
| channel | `edge`, the app's only channel |
| kind | `static` |
| platform URL | `https://website.bes.oncarlos.com` |
| custom domains | `carloku.com`, `www.carloku.com` |

carloku.com and www.carloku.com are **platform claims** on that app. They are
in the flagship's own zone, which `carlos domains attach` refuses to members,
so the operator attached them with `carlos domains attach --platform`. Only an
ops account owner or a `CARLOS_SYSTEM_OPERATORS` address can change or detach
them. A deploy never touches them: deploy the app and both hostnames follow.

**There is a build step, so what ships is `_site/`, never the repo tree.** A
tree ship has no `_site/` in it: it would publish `index.html` buried under
`src/`, no built pages, and no `/docs` at all.

```
SHA=$(git rev-parse --short HEAD)      # the sha you are shipping

# 1. Clean export. Never deploy a working checkout: the packer takes every
#    regular file it sees, including .git, node_modules/ and .claude/.
rm -rf "$TMPDIR/carloku-ship" && mkdir -p "$TMPDIR/carloku-ship"
git archive "$SHA" --prefix=export/ | tar -x -C "$TMPDIR/carloku-ship"
cd "$TMPDIR/carloku-ship/export"

# 2. Build, and gate the rendered output. `check` runs eleventy, then
#    hack/check-docs.mjs over what it produced.
npm ci
npm run check

# 3. Cache-bust BOTH stylesheets across every built page — see Caching
#    below; this is not optional.
find _site -name '*.html' -exec sed -i \
  -e "s/\.css\"/.css?v=$SHA\"/g" \
  -e "s/\.css?v=[^\"]*\"/.css?v=$SHA\"/g" {} +

grep -rho '\.css?v=[^"]*"' _site --include='*.html' | sort -u   # ONE line: your sha
grep -rn '\.css"' _site --include='*.html' \
  && echo "UNBUSTED LINK — do not ship" || echo "cache-bust ok"

# 4. Deploy the BUILT OUTPUT through the console. --version is required:
#    the export has no .git, so the default (git rev-parse) has nothing to
#    read.
carlos deploy --console https://console.carloku.com \
  --account bes --app website --kind static \
  --version "$SHA" --label "<one line about the change>" --no-prompt _site
```

`carlos deploy` ships, promotes onto `edge` and watches the platform URL until
`X-Carlos-Version` reports the new sha. It runs as whoever is signed in
(`carlos auth login --console https://console.carloku.com`) and needs that
address to be a member of `bes`. Use a current `carlos` binary. An old one on
your `PATH` may not know this console's API.

**Step 3 explained, because both halves are load-bearing.** The links in `src/`
are plain (`href="/site.css"`), so the first expression stamps a token onto a
bare link and the second re-stamps a link that already carries one. Both end at
the closing quote on purpose, and so does the verification grep. A sha
beginning with `0` — this app has already shipped `01b5365` — makes
`?v=01b5365` contain the literal substring `?v=0`, so an unanchored grep for
`?v=0` calls every freshly bumped file stale (13 of 13, measured), and an
unanchored `sed` run twice yields `?v=01b536501b5365`. Anchoring on `"` fixes
both and makes step 3 idempotent: run it again and again, the answer is the
same. Don't hard-code link or page counts anywhere; the corpus grows, which is
also why the `find` walks `_site` instead of naming files.

**Caching: the edge sends no `Cache-Control` and no `ETag` on static routes,
only `Last-Modified`** (confirmed live on carloku.com 2026-08-27). Browsers
therefore apply HEURISTIC caching, roughly 10% of the age since
`Last-Modified`, so a returning visitor can hold a stale page for days. This
bit the sibling site the day its redesign shipped: one browser served the whole
old page, another served the NEW html against the OLD stylesheet. The real fix
is server-side `Cache-Control` on static routes — platform issue
**carlosframework/platform#234**. Until that lands, **step 3 is a required part
of deploying this site**, and it is required for `docs.css` exactly as much as
for `site.css`: the docs pages link both, and a docs page rendered against a
stale `docs.css` loses its whole layout.

**Verify** by header and by content, and verify `/docs` **specifically**: the
landing page looks right whether or not the built docs made it into the
artifact.

```
carlos channels --console https://console.carloku.com --account bes --app website
carlos releases --console https://console.carloku.com --account bes --app website

curl -sI https://carloku.com/docs/ | grep -i x-carlos-version      # your sha
curl -s https://carloku.com/ | grep -i "<something from the change>"
curl -s https://carloku.com/docs/ | grep -o 'docs\.css?v=[^"]*'    # your sha
```

Every edge serves the site, so to check one directly add
`--resolve carloku.com:443:<edge-ip>`. The four flagship edges are
99.81.104.219 (Ireland), 16.60.78.128 (London), 44.210.206.26 (Virginia) and
54.252.186.195 (Sydney). `-I` sends a HEAD, and HEAD is excluded from edge
compression, so anything about `Content-Encoding` needs a GET.

**Rollback** is a pointer move. Every release stays in the bucket, cache-busted
as it was shipped, so a rollback restores a self-consistent page-plus-stylesheet
pair:

```
carlos rollback --console https://console.carloku.com --account bes --app website edge
# or, to a named release:
carlos promote --console https://console.carloku.com --account bes --app website <sha> edge
```

**DNS** is in DNSimple, by hand (the carloku.com zone is not in the
carloku-infrastructure tofu). The apex is an `ALIAS` and `www` a `CNAME`, both
to `website.bes.oncarlos.com`, so the site follows the app wherever the
platform places it. `dashboard` and `console` are CNAMEs to the console and are
not this site's. One trade-off: DNSimple resolves the apex ALIAS from its own
servers, so carloku.com gets whichever edge `website.bes.oncarlos.com`
latency-steers DNSimple to, not the visitor's nearest. `www` keeps per-visitor
steering.

**History.** Until 2026-10-04 the site was `bab/carloku`, a direct-bucket app
shipped with the pinfra `ship-app.sh` onto `canary/rehearsal`, with box-local
routes on the Ireland box. Those routes were removed when the hostnames moved
to `bes/website`. The old app's releases are still in the bucket, but nothing
routes to it: **never ship to `bab/carloku` again.**
