import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const source = readFileSync(new URL('../src/site.js', import.meta.url), 'utf8');
function page(language, query = '', country = '') {
  const listeners = {};
  const selector = { value: 'USD', addEventListener: (name, fn) => listeners.currency = fn };
  const countrySelector = { value: country, addEventListener: (name, fn) => listeners.country = fn };
  const amount = { textContent: '$28', getAttribute: () => JSON.stringify({ USD: '$28', EUR: '€24', GBP: '£22' }) };
  const signup = { href: 'https://console.carloku.com/?plan=personal' };
  runInNewContext(source, {
    document: {
      querySelector: key => key === '[data-pricing-currency]' ? selector : key === '[data-pricing-country]' ? countrySelector : null,
      querySelectorAll: key => key === '[data-currency-values]' ? [amount] : key === '[data-pricing-signup]' ? [signup] : []
    },
    window: { location: { href: 'https://carloku.com/pricing/' + query } },
    navigator: { language }, Intl, URL
  });
  return { selector, countrySelector, amount, signup, listeners };
}
test('currency defaults from explicit locale region; language alone is not a country', () => {
  for (const [locale, expected] of [['en-US','USD'],['en-GB','GBP'],['en-IE','EUR'],['pl-PL','EUR'],['fr-CA','USD'],['en','USD'],['bad_locale','USD']]) {
    assert.equal(page(locale).selector.value, expected, locale);
  }
});
test('explicit choice overrides region and persists when billing country changes', () => {
  const p = page('en-IE', '?currency=gbp', 'IE');
  assert.equal(p.amount.textContent, '£22');
  assert.equal(new URL(p.signup.href).searchParams.get('plan'), 'personal');
  assert.equal(new URL(p.signup.href).searchParams.get('currency'), 'gbp');
  p.countrySelector.value = 'US'; p.listeners.country();
  assert.equal(p.selector.value, 'GBP');
  p.selector.value = 'USD'; p.listeners.currency();
  assert.equal(p.amount.textContent, '$28');
});
test('country sets default until a currency is explicitly chosen', () => {
  const p = page('en-US', '', 'IE');
  assert.equal(p.selector.value, 'EUR');
  p.countrySelector.value = 'GB'; p.listeners.country();
  assert.equal(p.selector.value, 'GBP');
});
test('unsupported URL currency is ignored and never forwarded', () => {
  const p = page('en-US', '?currency=xyz');
  assert.equal(p.selector.value, 'USD');
  assert.equal(new URL(p.signup.href).searchParams.get('currency'), 'usd');
});
