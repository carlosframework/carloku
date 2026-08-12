# 🤖 CLAUDE.md

The marketing site for **Carloku** — the hosted CARLOS platform
(console.carloku.com). Brand boundary: Carloku is the *hosted platform*
brand; CARLOS is the framework/CLI/console name. Never rename CARLOS things
to Carloku here.

**Voice lives in PRODUCT.md** — the one feeling is lightness ("finally,
simple"); the landing page appeals to the heart, /get-started carries the
tech. Read it before touching copy.

Rules inherited from the `website` repo, which governs the sibling site:

- **Small site, zero dependencies.** Two pages (`/`, `/get-started/`) and
  one shared `site.css`. No frameworks, no fetched fonts, no analytics, no
  JavaScript, no build step.
- **Light and dark** via `prefers-color-scheme` — keep both working.
- **AI authorship is always marked** with a visible 🤖 (cascades from a
  heading); person-emoji (👨/👤/🧑) blocks are certified human and
  off-limits to LLM edits. Baseline: everything here is AI-written unless
  marked otherwise.
- **Don't overclaim.** The console requires Keymail sign-in; pricing does
  not exist yet, so the site says nothing about it.

Deploys: bucket-mode CARLOS app `carloku` on flagship — ship a clean
`git archive` export via the pinfra `scripts/ship-app.sh` / `promote-app.sh`
(see the platform repo's CLAUDE.md "Deploy reality"). Merging does NOT
publish; the site is stale until someone ships. Since platform PR #108
(2026-08-08), the fleet converges within seconds of ship+promote — no
need to wait for the next adoption pass. Verify by content, e.g.
`curl -s https://carloku.com/ | grep -i "<something from the change>"`,
or with `carlos channels -app carloku` showing the new sha promoted —
`X-Carlos-Version` is a binary-app header and STATIC routes like this
one never carry it (platform#112). For the same reason, `carlos deploy
-app carloku -kind static ...` isn't reliable here yet (its
wait-until-serving watch doesn't cover instance-less static apps): the
pinfra ship+promote scripts remain the operator default, and for this
app that pair IS the deploy.
