# carloku.com

🤖 Marketing site for Carloku, the hosted CARLOS platform, plus the customer
docs at /docs. The marketing pages are hand-written static HTML; the docs are
markdown under `src/docs/`, built by Eleventy before shipping.

**There is a build step, and it decides what the site serves.** Eleventy reads
`src/` and writes `_site/`, and `_site/` is what ships — never the repo tree.
So: **if a URL should return it, the file goes under `src/`.** A file at the
repo root is a repo file, not a page, and will not be served. Anything the site
needs — a page, a stylesheet, a font, an image — lives under `src/`, and a
non-template asset also needs an `addPassthroughCopy` line in
`eleventy.config.js` to be emitted at all.

```
npm install
npm run check   # build, then gate the rendered output
npm run serve   # localhost:8080
```

See AGENTS.md for the deploy runbook and the rules of the repo; see
https://carlosframework.com for the framework itself.
