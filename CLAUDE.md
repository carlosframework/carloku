# 🤖 CLAUDE.md

The marketing site for **Carloku** — the hosted CARLOS platform
(dashboard.carloku.com). Brand boundary: Carloku is the *hosted platform*
brand; CARLOS is the framework/CLI/console name. Never rename CARLOS things
to Carloku here.

Rules inherited from the `website` repo, which governs the sibling site:

- **One page, zero dependencies.** No frameworks, no fetched fonts, no
  analytics, no JavaScript, no build step.
- **Light and dark** via `prefers-color-scheme` — keep both working.
- **AI authorship is always marked** with a visible 🤖 (cascades from a
  heading); person-emoji (👨/👤/🧑) blocks are certified human and
  off-limits to LLM edits. Baseline: everything here is AI-written unless
  marked otherwise.
- **Don't overclaim.** The dashboard requires Keymail sign-in; pricing does
  not exist yet, so the site says nothing about it.

Deploys: bucket-mode CARLOS app `carloku` on flagship — ship a clean
`git archive` export via the pinfra `scripts/ship-app.sh` / `promote-app.sh`
(see the platform repo's CLAUDE.md "Deploy reality"). Merging does NOT
publish; the site is stale until someone ships.
