// 🤖 The pricing page shows no price that is not in the platform's price
// book. Every amount on the page is generated from copy-review/pricing/
// pricebook.json; the approved EUR strings are the book's EUR at band A;
// the other currencies' and bands' texts are the same words with the
// book's amounts.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const book = JSON.parse(readFileSync(new URL('copy-review/pricing/pricebook.json', root), 'utf8'));
const strings = JSON.parse(readFileSync(new URL('copy-review/pricing/strings.json', root), 'utf8'));
const S = Object.fromEntries(strings.map((s) => [s.id, s.text]));
execFileSync('node', [new URL('copy-review/pricing/build.mjs', root).pathname], { stdio: 'pipe', env: { ...process.env, PRICEBOOK_ALLOW_DRAFT: '1' } });
const page = readFileSync(new URL('src/pricing/index.html', root), 'utf8');
const preview = readFileSync(new URL('copy-review/pricing/preview/index.html', root), 'utf8');
const unesc = (t) => t.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const valuesOf = (html) => [...html.matchAll(/data-currency-values="([^"]*)"/g)].map((m) => JSON.parse(unesc(m[1])));
const bandValuesOf = (html) => [...html.matchAll(/data-band-values="([^"]*)"/g)].map((m) => JSON.parse(unesc(m[1])));
const re = (id) => id.replace(/\./g, '\\.');
const attr = (id, name) => {
  const m = preview.match(new RegExp(`data-copy="${re(id)}" ${name}="([^"]*)"`));
  assert.ok(m, id + ' carries ' + name);
  return JSON.parse(unesc(m[1]));
};
const text = (id) => preview.match(new RegExp(`data-copy="${re(id)}"[^>]*>([^<]*)<`))[1];
const money = (sym, minor) => sym + Math.floor(minor / 100) + (minor % 100 ? '.' + String(minor % 100).padStart(2, '0') : '');
const sym = Object.fromEntries(book.currencies.map((c) => [c.code.toUpperCase(), c.symbol]));
const planOf = (k) => book.plans.find((p) => p.key === k);

test('the book has the export schema, the three currencies, and a source note naming the export commit (equality with the platform file is checked by hand against that commit, not here)', () => {
  assert.equal(book.schema, 1);
  assert.deepEqual(book.currencies.map((c) => c.code), ['usd', 'eur', 'gbp']);
  assert.ok(/public-pricebook\.json at commit [0-9a-f]{8}/.test(readFileSync(new URL('copy-review/pricing/pricebook.source.txt', root), 'utf8')));
});

test('every priced string carries all three currencies, every banded one all four bands, and band A EUR is the approved text', () => {
  const all = valuesOf(page);
  assert.equal(all.length, 1 + 12 + 4 + 1, `found ${all.length} currency-priced strings`);
  for (const v of all) assert.deepEqual(Object.keys(v).sort(), ['EUR', 'GBP', 'USD']);
  for (const id of ['plan.free.price', 'over.rate.awake', 'over.rate.storage', 'over.rate.transfer', 'over.rate.writes', 'over.p2']) {
    assert.equal(attr(id, 'data-currency-values').EUR, S[id], id + ' EUR is the approved string');
  }
  const banded = bandValuesOf(page);
  assert.equal(banded.length, 3 + 3 + 3 + 4, `found ${banded.length} banded strings`);
  for (const v of banded) assert.deepEqual(Object.keys(v), ['A', 'B', 'C', 'D']);
  for (const id of ['plan.personal.price', 'plan.community.price', 'plan.business.price']) {
    const v = attr(id, 'data-band-values');
    for (const band of ['A', 'B', 'C', 'D']) assert.deepEqual(Object.keys(v[band]).sort(), ['EUR', 'GBP', 'USD']);
    assert.equal(v.A.EUR, S[id], id + ' band A EUR is the approved string');
  }
});

test('the static page, before any script runs, is the default currency at band A: what the controls show selected', () => {
  assert.equal(book.default_currency, 'usd');
  assert.ok(page.includes('<option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>'));
  for (const id of ['plan.personal.price', 'plan.community.price', 'plan.business.price']) assert.equal(text(id), attr(id, 'data-band-values').A.USD, id);
  for (const id of ['plan.free.price', 'over.rate.awake', 'over.p2']) assert.equal(text(id), attr(id, 'data-currency-values').USD, id);
  for (const id of ['plan.personal.i2', 'plan.business.i4']) assert.equal(text(id), attr(id, 'data-band-values').A, id);
  assert.equal(text('plan.personal.price'), '$28/y');
  assert.equal(text('plan.free.price'), '$0');
  const stripped = page.replace(/data-(currency|band)-values="[^"]*"/g, '');
  assert.equal((stripped.match(/€/g) || []).length, 0, 'no euro amount is in the static text');
});

test('plan prices and the band table are the book, per band and currency', () => {
  for (const [k, id] of [['personal', 'plan.personal.price'], ['community', 'plan.community.price'], ['business', 'plan.business.price']]) {
    const v = attr(id, 'data-band-values');
    for (const band of ['A', 'B', 'C', 'D']) for (const cur of ['USD', 'EUR', 'GBP']) {
      assert.ok(v[band][cur].startsWith(money(sym[cur], planOf(k).annual_unit_minor[cur.toLowerCase()][band])), `${k} ${band} ${cur}: ${v[band][cur]}`);
    }
  }
  assert.equal(attr('plan.personal.price', 'data-band-values').D.GBP, '£7.70/y');
  assert.equal(attr('plan.business.price', 'data-band-values').D.GBP, '£15.75/y per member');
  const cells = valuesOf(page.slice(page.indexOf('class="price-table"'), page.indexOf('class="price-table rates"')));
  assert.equal(cells.length, 12);
  let i = 0;
  for (const k of ['personal', 'community', 'business']) for (const band of ['A', 'B', 'C', 'D']) {
    for (const cur of ['USD', 'EUR', 'GBP']) assert.equal(cells[i][cur], money(sym[cur], planOf(k).annual_unit_minor[cur.toLowerCase()][band]), `${k} ${band} ${cur}`);
    i++;
  }
  // The two prices the rounding rule decides.
  assert.equal(cells[5].GBP, '£3.38');
  assert.equal(cells[7].GBP, '£1.58');
});

test('a band-scaled inclusion carries each band\'s figure by the platform\'s rule, and band A is the approved string', () => {
  const per = (k, resource, band) => Math.floor(planOf(k).resources_per_member[resource] * book.band_factors_bps[band] / 10000);
  assert.deepEqual(attr('plan.personal.i2', 'data-band-values'), { A: S['plan.personal.i2'], B: '63.75 awake hours a month', C: '42.5 awake hours a month', D: '29.75 awake hours a month' });
  assert.equal(per('personal', 'awake_seconds', 'D') / 3600, 29.75);
  assert.deepEqual(attr('plan.community.i2', 'data-band-values'), { A: S['plan.community.i2'], B: '0.375 GB of storage', C: '0.25 GB of storage', D: '0.175 GB of storage' });
  assert.deepEqual(attr('plan.business.i4', 'data-band-values'), { A: S['plan.business.i4'], B: '22,500 replication writes a month', C: '15,000 replication writes a month', D: '10,500 replication writes a month' });
  assert.equal(per('business', 'writes', 'D'), 10500);
  // Strings with no figure, and the free plan's, are not banded.
  for (const id of ['plan.personal.i1', 'plan.free.i3', 'plan.business.i5']) assert.ok(!preview.match(new RegExp(`data-copy="${re(id)}" data-band-values`)), id);
  // Every banded inclusion, every band: the approved string with band
  // A's figure swapped for the band's, recomputed here from the export
  // (review fourteen: a figure typed in the build for one band of one
  // inclusion must fail).
  const resourceOf = { personal: { i2: 'awake_seconds', i3: 'storage_byte_months', i4: 'transfer_bytes' }, community: { i1: 'awake_seconds', i2: 'storage_byte_months', i3: 'transfer_bytes' }, business: { i1: 'awake_seconds', i2: 'storage_byte_months', i3: 'transfer_bytes', i4: 'writes' } };
  const figure = (resource, amount) => {
    const n = resource === 'awake_seconds' ? amount / 3600 : resource === 'writes' ? amount : amount / 1e9;
    const text = n.toFixed(3).replace(/\.?0+$/, '');
    const [int, frac] = text.split('.');
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (frac ? '.' + frac : '');
  };
  let banded = 0;
  for (const [k, items] of Object.entries(resourceOf)) for (const [i, resource] of Object.entries(items)) {
    const id = `plan.${k}.${i}`;
    const v = attr(id, 'data-band-values');
    for (const band of ['A', 'B', 'C', 'D']) {
      const want = S[id].replace(/^[0-9][0-9,]*(\.[0-9]+)?/, figure(resource, per(k, resource, band)));
      assert.equal(v[band], want, `${id} ${band}`);
    }
    banded++;
  }
  assert.equal(banded, 10);
});

test('overage rates are the book\'s exact figures, per currency, never rounded', () => {
  const rates = valuesOf(page.slice(page.indexOf('class="price-table rates"')));
  const o = book.overage;
  assert.equal(rates[0].USD, '$0.012 per hour');
  assert.equal(rates[1].USD, '$0.1272 per GB per month');
  assert.equal(rates[1].GBP, '£0.0954 per GB per month');
  assert.equal(rates[3].GBP, '£0.0207 per 1,000');
  assert.equal(rates[2].EUR, S['over.rate.transfer']);
  // Every displayed rate parses back to the exported micro amount.
  const meters = ['awake_hour_micro', 'storage_gb_month_micro', 'transfer_gb_micro', 'writes_1000_micro'];
  meters.forEach((meter, i) => {
    for (const [cur, s] of [['USD', '$'], ['EUR', '€'], ['GBP', '£']]) {
      const shown = rates[i][cur].match(new RegExp('^\\' + s + '([0-9]+\\.[0-9]{3,})'));
      assert.ok(shown, rates[i][cur]);
      assert.equal(Math.round(Number(shown[1]) * 1e6), o[cur.toLowerCase()][meter], `${meter} ${cur}: ${rates[i][cur]}`);
    }
  });
  assert.ok(rates[4].USD.startsWith('Minimum ' + money('$', o.usd.invoice_floor_micro / 10000)), rates[4].USD);
  assert.ok(rates[4].GBP.startsWith('Minimum ' + money('£', o.gbp.invoice_floor_micro / 10000)), rates[4].GBP);
});

test('the controls carry the five approved strings, and every country option its default currency and band from the book', () => {
  const currency = JSON.parse(readFileSync(new URL('copy-review/currency/result.json', root), 'utf8'));
  assert.equal(currency.action, 'approve');
  for (const s of currency.strings) assert.ok(page.includes('>' + s.text + '<'), s.id);
  assert.ok(page.includes('data-pricing-currency'));
  for (const [iso, band] of Object.entries(book.country_band)) {
    assert.ok(page.includes(`<option value="${iso}" data-currency="${(book.country_currency[iso] || book.default_currency).toUpperCase()}" data-band="${band}">`), iso);
  }
  assert.equal((page.match(/<option value="[A-Z]{2}" data-currency=/g) || []).length, Object.keys(book.country_band).length, 'the country list is the book\'s');
  assert.ok(page.includes('<option value="IE" data-currency="EUR" data-band="A">'));
  assert.ok(page.includes('<option value="GB" data-currency="GBP" data-band="A">'));
  assert.ok(page.includes('<option value="IN" data-currency="USD" data-band="D">'));
  assert.ok(page.includes('<option value="CH" data-currency="USD" data-band="A">'));
  assert.equal((page.match(/data-pricing-signup/g) || []).length, 5);
  // Without the script the links still carry both parameters, empty, so
  // the console forgets an earlier visit's choices rather than reusing them.
  assert.equal((page.match(/href="https:\/\/console\.carloku\.com\/\?(?:plan=[a-z]+&amp;)?currency=&amp;country=" data-pricing-signup/g) || []).length, 5, 'every signup link carries empty currency and country');
  assert.ok(page.includes('data-pricing-currency data-default-currency="USD"'));
});

test('a page built from a draft book says so on its first line, and the check refuses it unless a review build is asked for', () => {
  const marked = page.startsWith(`<!-- PRICE BOOK ${book.price_book} IS ${book.status.toUpperCase()}: not approved for sale, not for publication -->`);
  assert.equal(marked, book.status !== 'approved');
  const check = new URL('hack/check-pricebook.mjs', root).pathname;
  const build = new URL('copy-review/pricing/build.mjs', root).pathname;
  const envWith = (v) => { const e = { ...process.env }; if (v === undefined) delete e.PRICEBOOK_ALLOW_DRAFT; else e.PRICEBOOK_ALLOW_DRAFT = v; return e; };
  // Only exactly "1" allows a draft through: unset, empty, "0" and "false" do not.
  for (const v of [undefined, '', '0', 'false', 'yes']) {
    assert.throws(() => execFileSync('node', [check], { stdio: 'pipe', env: envWith(v) }), /must not be published/, `check with ${JSON.stringify(v)}`);
    assert.throws(() => execFileSync('node', [build], { stdio: 'pipe', env: envWith(v) }), /not approved/, `build with ${JSON.stringify(v)}`);
  }
  // The ordinary build runs the check too, so a draft page cannot be
  // published by `npm run build` any more than by `npm run check`.
  const scripts = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')).scripts;
  assert.ok(scripts.build.startsWith('node hack/check-pricebook.mjs && '), scripts.build);
  assert.ok(scripts.check.includes('node hack/check-pricebook.mjs'), scripts.check);
  // A refused build still wrote the preview, for review.
  assert.ok(readFileSync(new URL('copy-review/pricing/preview/index.html', root), 'utf8').includes('data-pricing-currency'));
  execFileSync('node', [check], { stdio: 'pipe', env: envWith('1') });
  execFileSync('node', [build], { stdio: 'pipe', env: envWith('1') });
});

test('every priced element shows, as static text, exactly its own USD value, and no amount anywhere is typed in the script', () => {
  // The static page is the USD fallback (no script): each element that
  // carries per-currency values must show its own USD value, and each
  // banded element its own band A USD value. A literal typed into the
  // build script in place of the slot's value fails here, whatever other
  // amount it happens to equal.
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  let slots = 0;
  for (const m of page.matchAll(/<([a-z]+)[^>]*data-currency-values="([^"]*)"[^>]*>([^<]*)</g)) {
    const v = JSON.parse(unesc(m[2]));
    assert.equal(m[3], esc(v.USD), 'static text of a priced element is its USD value: ' + m[0].slice(0, 120));
    slots++;
  }
  for (const m of page.matchAll(/<([a-z]+)[^>]*data-band-values="([^"]*)"[^>]*>([^<]*)</g)) {
    const v = JSON.parse(unesc(m[2]));
    // Inclusions are banded without a currency (one text per band).
    const want = typeof v.A === 'string' ? v.A : v.A.USD;
    assert.equal(m[3], esc(want), 'static text of a banded element is its band A (USD) value: ' + m[0].slice(0, 120));
    slots++;
  }
  assert.ok(slots >= 17, `found ${slots} priced elements`);
  // And every amount in every currency value, or in static text outside
  // those elements, is a book amount (an annual price, an overage rate or
  // floor, spelt as the page spells it) or sits in an approved string.
  // A rate as the page spells it (as short as it is exact); a floor as a
  // price (two decimals), since the floors are whole cents.
  const micro = (sym, m) => [sym + (m / 1e6).toString(), money(sym, m / 10000)];
  const rates = (code) => Object.values(book.overage[code]).flatMap((m) => micro(sym[code.toUpperCase()], m));
  const annual = (code) => book.plans.flatMap((p) => Object.values(p.annual_unit_minor[code]).map((minor) => money(sym[code.toUpperCase()], minor)));
  const known = Object.fromEntries(book.currencies.map((c) => [c.code.toUpperCase(), new Set([...annual(c.code), ...rates(c.code)])]));
  const candidates = [];
  for (const m of page.replace(/data-(currency|band)-values="[^"]*"/g, '').matchAll(/[€$£][0-9][0-9.,]*/g)) candidates.push(m[0]);
  for (const v of valuesOf(page)) for (const text of Object.values(v)) for (const m of String(text).matchAll(/[€$£][0-9][0-9.,]*/g)) candidates.push(m[0]);
  for (const v of bandValuesOf(page)) for (const perBand of Object.values(v)) for (const text of (typeof perBand === 'string' ? [perBand] : Object.values(perBand))) for (const m of String(text).matchAll(/[€$£][0-9][0-9.,]*/g)) candidates.push(m[0]);
  assert.ok(candidates.length > 20, `found ${candidates.length} amounts to check`);
  const bySymbol = { '€': 'EUR', '$': 'USD', '£': 'GBP' };
  for (const amount of candidates) {
    const code = bySymbol[amount[0]];
    const inBook = known[code].has(amount);
    const inStrings = strings.some((s) => new RegExp('(^|[^0-9.])' + amount.replace(/[.$]/g, '\\$&') + '(?![0-9.])').test(s.text));
    assert.ok(inBook || inStrings, amount + ' (' + code + ') is on the page and in neither the book nor an approved string');
  }
});
