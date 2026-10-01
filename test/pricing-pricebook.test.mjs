// 🤖 The pricing page shows no price that is not in the platform's price
// book. Every amount on the page is generated from copy-review/pricing/
// pricebook.json; the approved EUR strings are the book's EUR; and the
// other currencies' texts are the same words with the book's amounts.
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
const money = (sym, minor) => sym + Math.floor(minor / 100) + (minor % 100 ? '.' + String(minor % 100).padStart(2, '0') : '');
const sym = Object.fromEntries(book.currencies.map((c) => [c.code.toUpperCase(), c.symbol]));

test('the book is the platform export, at the version the console sells from', () => {
  assert.equal(book.schema, 1);
  assert.deepEqual(book.currencies.map((c) => c.code), ['usd', 'eur', 'gbp']);
  assert.ok(/public-pricebook\.json at commit [0-9a-f]{8}/.test(readFileSync(new URL('copy-review/pricing/pricebook.source.txt', root), 'utf8')));
});

test('every priced string on the page carries all three currencies, and EUR is the approved text', () => {
  const all = valuesOf(page);
  assert.ok(all.length >= 3 + 12 + 4 + 1, `found ${all.length} priced strings`);
  for (const v of all) assert.deepEqual(Object.keys(v).sort(), ['EUR', 'GBP', 'USD']);
  for (const id of ['plan.personal.price', 'plan.community.price', 'plan.business.price', 'over.rate.awake', 'over.rate.storage', 'over.rate.transfer', 'over.rate.writes', 'over.p2']) {
    const m = preview.match(new RegExp(`data-copy="${id.replace(/\./g, '\\.')}" data-currency-values="([^"]*)"`));
    assert.ok(m, id + ' is priced from the book');
    assert.equal(JSON.parse(unesc(m[1])).EUR, S[id], id + ' EUR is the approved string');
  }
});

test('plan prices and the band table are the book, per currency', () => {
  const planOf = (k) => book.plans.find((p) => p.key === k);
  for (const [k, id] of [['personal', 'plan.personal.price'], ['community', 'plan.community.price'], ['business', 'plan.business.price']]) {
    const m = preview.match(new RegExp(`data-copy="${id.replace(/\./g, '\\.')}" data-currency-values="([^"]*)"`));
    const v = JSON.parse(unesc(m[1]));
    for (const cur of ['USD', 'EUR', 'GBP']) {
      assert.ok(v[cur].startsWith(money(sym[cur], planOf(k).annual_unit_minor[cur.toLowerCase()].A)), `${k} ${cur}: ${v[cur]}`);
    }
  }
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

test('overage rates and the floor are the book, per currency', () => {
  const rates = valuesOf(page.slice(page.indexOf('class="price-table rates"')));
  const o = book.overage;
  assert.equal(rates[0].USD, `$${(o.usd.awake_hour_micro / 1e6).toFixed(3)} per hour`);
  assert.equal(rates[1].GBP, `£${(o.gbp.storage_gb_month_micro / 1e6).toFixed(3)} per GB per month`);
  assert.equal(rates[2].EUR, S['over.rate.transfer']);
  assert.ok(rates[4].USD.startsWith('Minimum ' + money('$', o.usd.invoice_floor_micro / 10000)), rates[4].USD);
  assert.ok(rates[4].GBP.startsWith('Minimum ' + money('£', o.gbp.invoice_floor_micro / 10000)), rates[4].GBP);
});

test('the controls carry the five approved strings and the country defaults from the book', () => {
  const currency = JSON.parse(readFileSync(new URL('copy-review/currency/result.json', root), 'utf8'));
  assert.equal(currency.action, 'approve');
  for (const s of currency.strings) assert.ok(page.includes('>' + s.text + '<'), s.id);
  assert.ok(page.includes('data-pricing-currency'));
  assert.ok(page.includes('<option value="IE" data-currency="EUR">'));
  assert.ok(page.includes('<option value="GB" data-currency="GBP">'));
  assert.ok(page.includes('<option value="US" data-currency="USD">'));
  assert.ok(page.includes('<option value="CH" data-currency="USD">'));
  assert.equal((page.match(/data-pricing-signup/g) || []).length, 5);
});

test('no euro amount on the page is typed in the script: each comes from a string or the book', () => {
  // Every € on the page is inside an element the book priced, or in a
  // string the review approved.
  const stripped = page.replace(/data-currency-values="[^"]*"/g, '');
  for (const m of stripped.matchAll(/€[0-9][0-9.,]*/g)) {
    const amount = m[0];
    const inBook = Object.values(book.plans).some((p) => Object.values(p.annual_unit_minor.eur).some((minor) => money('€', minor) === amount));
    const inStrings = strings.some((s) => s.text.includes(amount));
    assert.ok(inBook || inStrings, amount + ' is on the page and in neither the book nor an approved string');
  }
});
