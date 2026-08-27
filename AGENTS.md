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

Merging does **not** publish. `carloku.com` is a bucket-mode CARLOS app on the
flagship, and the live site is stale until someone ships.

**There is a build step now, so what ships is `_site/` — never the repo tree.**
A tree ship has no `_site/` in it: it would publish `index.html` buried under
`src/`, no built pages, and no `/docs` at all.

The deployment coordinates, confirmed against the bucket on 2026-08-27:

| | |
| --- | --- |
| app | `carloku` |
| account (sqid) | `bab` |
| channel | `canary/rehearsal` — the app's only channel |
| kind | `static` |
| bucket | `carlos-flagship-271376211898` |
| AWS profile / region | `keymail` / `eu-west-1` |

```
SHA=$(git rev-parse --short HEAD)      # the sha you are shipping

# 1. Clean export. Never ship a working checkout — PackDir packs every
#    regular file it sees, including .git, node_modules/ and .claude/.
rm -rf /tmp/carloku-ship && mkdir -p /tmp/carloku-ship
git archive "$SHA" --prefix=export/ | tar -x -C /tmp/carloku-ship
cd /tmp/carloku-ship/export

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

# 4. Ship the BUILT OUTPUT, then promote. The pinfra scripts are the
#    canonical form for this app: the signing key is read from SSM inside
#    the script and never appears in a terminal or a transcript.
cd ~/github.com/carlosframework/platform-infrastructure
CARLOS_BIN=$(command -v carlos) scripts/ship-app.sh \
  keymail carlos-flagship-271376211898 \
  carloku "$SHA" canary/rehearsal static /tmp/carloku-ship/export/_site
```

`ship-app.sh` takes `<aws-profile> <bucket> <app> <version> <channel> <kind>
<file-or-dir>` and does both halves. The equivalent by hand, if you are not in
the pinfra checkout, is:

```
export AWS_PROFILE=keymail AWS_REGION=eu-west-1 \
       CARLOS_DEPLOYMENT_BUCKET=carlos-flagship-271376211898
carlos ship --app carloku --kind static --version "$SHA" _site
CARLOS_RELEASE_KEY=$(aws ssm get-parameter --name /carlos/release-key \
  --with-decryption --query Parameter.Value --output text) \
  carlos promote --app carloku "$SHA" canary/rehearsal
```

The env matters: without `CARLOS_DEPLOYMENT_BUCKET` the CLI goes through the
console API, where this app was never registered, and fails with "not found".
This is bucket mode. Use a current `carlos` binary — the ship/promote pair is
the platform's own release path, and an old binary on your `PATH` is a real
hazard here.

**Step 3 explained, because both halves are load-bearing.** The links in `src/`
are plain (`href="/site.css"`), so the first expression stamps a token onto a
bare link and the second re-stamps a link that already carries one. Both end at
the closing quote on purpose, and so does the verification grep. A sha
beginning with `0` — this app has already shipped `01b5365` — makes
`?v=01b5365` contain the literal substring `?v=0`, so an unanchored grep for
`?v=0` calls every freshly bumped file stale (13 of 13, measured), and an
unanchored `sed` run twice yields `?v=01b536501b5365`. Anchoring on `"` fixes
both and makes step 3 idempotent: run it again and again, the answer is the
same. Today that is 24 links across 13 built pages — 13 × `site.css`, 11 ×
`docs.css`. Don't hard-code those counts anywhere; the corpus grows, which is
also why the `find` walks `_site` instead of naming files.

**Caching: the edge sends no `Cache-Control` and no `ETag` on this static
route — only `Last-Modified`** (confirmed live on carloku.com 2026-08-27).
Browsers therefore apply HEURISTIC caching, roughly 10% of the age since
`Last-Modified`, so a returning visitor can hold a stale page for days. This
bit the sibling site the day its redesign shipped: one browser served the whole
old page, another served the NEW html against the OLD stylesheet. The real fix
is server-side `Cache-Control` on static routes — platform issue
**carlosframework/platform#234**. Until that lands, **step 3 is a required part
of deploying this site**, and it is required for `docs.css` exactly as much as
for `site.css`: the docs pages link both, and a docs page rendered against a
stale `docs.css` loses its whole layout.

**Convergence is seconds, not minutes** (platform PR #108, live 2026-08-08): a
promote is picked up by the edge within ~2s. Verify by header and by content,
and verify `/docs` **specifically** — the landing page looks right whether or
not the built docs made it into the artifact:

```
# by header — --resolve so a stale DNS answer cannot satisfy it. 99.81.104.219
# is the flagship, where the carloku.com A record points.
curl -sI --resolve carloku.com:443:99.81.104.219 \
  https://carloku.com/docs/ | grep -i x-carlos-version

# by content
curl -s https://carloku.com/ | grep -i "<something from the change>"
curl -s https://carloku.com/docs/ | grep -o 'docs\.css?v=[^"]*'   # your sha
```

Static routes do carry `X-Carlos-Version` (platform#112). `-I` is fine for that
header, but it sends a HEAD, and HEAD is excluded from edge compression —
anything about `Content-Encoding` needs a GET.

**`carlos channels` cannot verify this app.** It is direct-bucket and invisible
to the console API: `carlos channels -app carloku` answers "not found"
(re-confirmed 2026-08-27). Verify by header or content as above, or read the
pointer out of the bucket
(`aws s3 cp s3://carlos-flagship-271376211898/apps/bab/carloku/channels/canary/rehearsal.json -`).

Rollback is a pointer move, like any CARLOS app — promote the previous good sha
back onto the same channel; the edge picks it up in seconds:

```
cd ~/github.com/carlosframework/platform-infrastructure
CARLOS_BIN=$(command -v carlos) scripts/promote-app.sh \
  keymail carlos-flagship-271376211898 bab carloku <previous-sha> canary/rehearsal
```

That previous release is still in the bucket under
`apps/bab/carloku/releases/<sha>/`, cache-busted as it was shipped, so a
rollback restores a self-consistent page-plus-stylesheet pair.

(The channel is `canary/rehearsal`, not `stable`, for the same reason the
sibling site's is: `stable` bakes 72h on a box's *first* sighting of a channel
head, which would mean 72h of downtime for a never-before-served route. A
future `stable` flip is optional cleanup, not required.)
