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
execFileSync('node', [new URL('copy-review/pricing/build.mjs', root).pathname], { stdio: 'pipe' });
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

test('the book is the platform export, at the version the console sells from', () => {
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
});

test('overage rates and the floor are the book, per currency', () => {
  const rates = valuesOf(page.slice(page.indexOf('class="price-table rates"')));
  const o = book.overage;
  assert.equal(rates[0].USD, `$${(o.usd.awake_hour_micro / 1e6).toFixed(3)} per hour`);
  assert.equal(rates[1].GBP, `£${(o.gbp.storage_gb_month_micro / 1e6).toFixed(3)} per GB per month`);
  assert.equal(rates[2].EUR, S['over.rate.transfer']);
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
  assert.ok(page.includes('<option value="IE" data-currency="EUR" data-band="A">'));
  assert.ok(page.includes('<option value="GB" data-currency="GBP" data-band="A">'));
  assert.ok(page.includes('<option value="IN" data-currency="USD" data-band="D">'));
  assert.ok(page.includes('<option value="CH" data-currency="USD" data-band="A">'));
  assert.equal((page.match(/data-pricing-signup/g) || []).length, 5);
});

test('no euro amount on the page is typed in the script: each comes from a string or the book', () => {
  const stripped = page.replace(/data-(currency|band)-values="[^"]*"/g, '');
  for (const m of stripped.matchAll(/€[0-9][0-9.,]*/g)) {
    const amount = m[0];
    const inBook = Object.values(book.plans).some((p) => Object.values(p.annual_unit_minor.eur).some((minor) => money('€', minor) === amount));
    const inStrings = strings.some((s) => s.text.includes(amount));
    assert.ok(inBook || inStrings, amount + ' is on the page and in neither the book nor an approved string');
  }
});
