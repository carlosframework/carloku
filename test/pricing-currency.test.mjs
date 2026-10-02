import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const source = readFileSync(new URL('../src/site.js', import.meta.url), 'utf8');
// A page with the two controls, one currency-priced element (an overage
// rate), one band-and-currency-priced element (a plan price), one
// band-scaled inclusion and one signup link. The country options are
// the four the cases need, each with its default currency and its band.
const options = { IE: ['EUR', 'A'], GB: ['GBP', 'A'], US: ['USD', 'A'], IN: ['USD', 'D'], PL: ['EUR', 'C'] };
function page(language, query = '', country = '') {
  const listeners = {};
  const selector = {
    value: 'USD', addEventListener: (name, fn) => listeners.currency = fn,
    getAttribute: (a) => a === 'data-default-currency' ? 'USD' : null,
    querySelectorAll: () => ['USD', 'EUR', 'GBP'].map((v) => ({ value: v })),
  };
  const countrySelector = {
    value: country,
    addEventListener: (name, fn) => listeners.country = fn,
    querySelector: (sel) => {
      const iso = sel.match(/^option\[value="([A-Z]{2})"\]$/)[1];
      return options[iso] ? { getAttribute: (a) => a === 'data-band' ? options[iso][1] : a === 'data-currency' ? options[iso][0] : null } : null;
    },
  };
  const rate = { textContent: '$0.012 per hour', getAttribute: () => JSON.stringify({ USD: '$0.012 per hour', EUR: '€0.010 per hour', GBP: '£0.009 per hour' }) };
  const price = { textContent: '$28/y', getAttribute: () => JSON.stringify({
    A: { USD: '$28/y', EUR: '€24/y', GBP: '£22/y' }, B: { USD: '$21/y', EUR: '€18/y', GBP: '£16.50/y' },
    C: { USD: '$14/y', EUR: '€12/y', GBP: '£11/y' }, D: { USD: '$9.80/y', EUR: '€8.40/y', GBP: '£7.70/y' } }) };
  const hours = { textContent: '85 awake hours a month', getAttribute: () => JSON.stringify({ A: '85 awake hours a month', B: '63.75 awake hours a month', C: '42.5 awake hours a month', D: '29.75 awake hours a month' }) };
  const signup = { href: 'https://console.carloku.com/?plan=personal' };
  runInNewContext(source, {
    document: {
      querySelector: key => key === '[data-pricing-currency]' ? selector : key === '[data-pricing-country]' ? countrySelector : null,
      querySelectorAll: key => key === '[data-currency-values]' ? [rate] : key === '[data-band-values]' ? [price, hours] : key === '[data-pricing-signup]' ? [signup] : []
    },
    window: { location: { href: 'https://carloku.com/pricing/' + query } },
    navigator: { language }, Intl, URL
  });
  const link = () => new URL(signup.href).searchParams;
  return { selector, countrySelector, rate, price, hours, signup, link, listeners };
}
test('currency defaults from explicit locale region; language alone is not a country', () => {
  for (const [locale, expected] of [['en-US','USD'],['en-GB','GBP'],['en-IE','EUR'],['pl-PL','EUR'],['fr-CA','USD'],['en','USD'],['bad_locale','USD']]) {
    assert.equal(page(locale).selector.value, expected, locale);
  }
});
test('a locale or country default is shown but never sent as a choice; an explicit choice is', () => {
  const guessed = page('en-GB', '', '');
  assert.equal(guessed.selector.value, 'GBP');
  assert.equal(guessed.price.textContent, '£22/y');
  assert.equal(guessed.link().get('currency'), '', 'the locale guess is not a choice');
  assert.equal(guessed.link().get('country'), '', 'no country was selected');
  assert.ok(guessed.signup.href.includes('currency=') && guessed.signup.href.includes('country='), 'both are present, empty, so the console forgets earlier ones');
  const byCountry = page('en-US', '', 'IE');
  assert.equal(byCountry.selector.value, 'EUR');
  assert.deepEqual([byCountry.link().get('currency'), byCountry.link().get('country')], ['', 'IE']);
  byCountry.selector.value = 'USD'; byCountry.listeners.currency();
  assert.deepEqual([byCountry.link().get('currency'), byCountry.link().get('country')], ['usd', 'IE']);
});
test('explicit choice overrides region and persists when billing country changes', () => {
  const p = page('en-IE', '?currency=gbp', 'IE');
  assert.equal(p.price.textContent, '£22/y');
  assert.equal(p.rate.textContent, '£0.009 per hour');
  assert.equal(p.link().get('plan'), 'personal');
  assert.equal(p.link().get('currency'), 'gbp');
  assert.equal(p.link().get('country'), 'IE');
  p.countrySelector.value = 'US'; p.listeners.country();
  assert.equal(p.selector.value, 'GBP');
  assert.equal(p.link().get('country'), 'US');
  p.selector.value = 'USD'; p.listeners.currency();
  assert.equal(p.price.textContent, '$28/y');
});
test('country sets default until a currency is explicitly chosen', () => {
  const p = page('en-US', '', 'IE');
  assert.equal(p.selector.value, 'EUR');
  p.countrySelector.value = 'GB'; p.listeners.country();
  assert.equal(p.selector.value, 'GBP');
});
test('a band D country with an explicit currency keeps the currency and changes the band: price, inclusions and the signup link', () => {
  const p = page('en-US', '?currency=gbp', '');
  assert.equal(p.price.textContent, '£22/y');
  assert.equal(p.hours.textContent, '85 awake hours a month');
  assert.equal(p.link().get('country'), '');
  p.countrySelector.value = 'IN'; p.listeners.country();
  assert.equal(p.selector.value, 'GBP', 'the explicit currency stays');
  assert.equal(p.price.textContent, '£7.70/y', 'the price is band D in pounds');
  assert.equal(p.hours.textContent, '29.75 awake hours a month', 'the inclusions are band D');
  assert.equal(p.rate.textContent, '£0.009 per hour', 'overage rates do not change with the band');
  assert.deepEqual([p.link().get('currency'), p.link().get('country'), p.link().get('plan')], ['gbp', 'IN', 'personal']);
  // Back to a band A country: full price, full inclusions, same currency.
  p.countrySelector.value = 'US'; p.listeners.country();
  assert.equal(p.price.textContent, '£22/y');
  assert.equal(p.hours.textContent, '85 awake hours a month');
  // No country: band A, and the link says so with an empty country, which
  // clears one the console remembered from an earlier visit.
  p.countrySelector.value = ''; p.listeners.country();
  assert.equal(p.price.textContent, '£22/y');
  assert.equal(p.link().get('country'), '');
  assert.equal(p.link().get('currency'), 'gbp');
});
test('a band C country without an explicit currency takes its default currency and its band', () => {
  const p = page('en-US', '', '');
  p.countrySelector.value = 'PL'; p.listeners.country();
  assert.equal(p.selector.value, 'EUR');
  assert.equal(p.price.textContent, '€12/y');
  assert.equal(p.hours.textContent, '42.5 awake hours a month');
  assert.deepEqual([p.link().get('currency'), p.link().get('country')], ['', 'PL'], 'the country default is not a choice');
});
test('the link back from the console preselects the country and currency it carries', () => {
  const p = page('en-US', '?country=in&currency=gbp', '');
  assert.equal(p.countrySelector.value, 'IN');
  assert.equal(p.selector.value, 'GBP');
  assert.equal(p.price.textContent, '£7.70/y');
  const q = page('en-US', '?country=XX', '');
  assert.equal(q.countrySelector.value, '', 'an unknown country is ignored');
  assert.equal(q.link().get('country'), '');
});
test('unsupported URL currency is ignored and never forwarded', () => {
  const p = page('en-US', '?currency=xyz');
  assert.equal(p.selector.value, 'USD');
  assert.equal(p.link().get('currency'), '');
});
test('a country\'s default currency comes from its option, not from a list in the script', () => {
  const p = page('en-US', '', '');
  p.countrySelector.value = 'GB'; p.listeners.country();
  assert.equal(p.selector.value, 'GBP');
  p.countrySelector.value = 'IN'; p.listeners.country();
  assert.equal(p.selector.value, 'USD');
  p.countrySelector.value = 'PL'; p.listeners.country();
  assert.equal(p.selector.value, 'EUR');
});
