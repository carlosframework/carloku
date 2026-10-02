// 🤖 Carloku
(function () {
  "use strict";

  var head = document.querySelector(".site-head");
  if (head) {
    var onScroll = function () {
      head.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // The pricing page's currency and billing-country controls. The currency
  // picks the text of every element carrying data-currency-values; the
  // country picks the band (its option's data-band) for every element
  // carrying data-band-values, whose texts are by band and then, where the
  // amount is money, by currency. Both are forwarded to the console on
  // the signup links: ?country= is the country selected or empty, and
  // ?currency= is the currency only when the visitor chose it (the URL or
  // the control), else empty. A guess from the browser's locale or a
  // country's default is shown here but never sent as a choice, and an
  // empty value tells the console to forget an earlier one. At the console
  // they are suggestions: checkout prices from the country the buyer gives
  // there, in the currency the buyer confirms there. Nothing here is a
  // price.
  var currencySelect = document.querySelector("[data-pricing-currency]");
  if (currencySelect) {
    // What is sold, and the book's default, are the control's own
    // options and its data-default-currency, both from the price book.
    var supported = Array.prototype.map.call(currencySelect.querySelectorAll("option"), function (o) { return o.value; });
    var fallback = currencySelect.getAttribute("data-default-currency");
    if (supported.indexOf(fallback) === -1) fallback = supported[0];
    var countrySelect = document.querySelector("[data-pricing-country]");
    var explicit = false;
    // countryCurrency is a country's default currency as the price book
    // put it on the country's option (data-currency); a country that is
    // not an option (a locale's region the book does not sell to, say)
    // takes the book's default, which is the first currency offered.
    function countryCurrency(country) {
      var opt = countrySelect && /^[A-Z]{2}$/.test(country || "") && countrySelect.querySelector('option[value="' + country + '"]');
      var c = opt && opt.getAttribute("data-currency");
      return supported.indexOf(c) !== -1 ? c : fallback;
    }
    // countryOption is the selected country's option, or null when none
    // is selected or the value matches no option.
    function countryOption() {
      var value = countrySelect && countrySelect.value;
      if (!value || !/^[A-Z]{2}$/.test(value)) return null;
      return countrySelect.querySelector('option[value="' + value + '"]');
    }
    function selectedBand() {
      var opt = countryOption();
      var band = opt && opt.getAttribute("data-band");
      return band === "B" || band === "C" || band === "D" ? band : "A";
    }
    function render(currency) {
      if (supported.indexOf(currency) === -1) return;
      currencySelect.value = currency;
      var band = selectedBand();
      document.querySelectorAll("[data-currency-values]").forEach(function (el) {
        try {
          var values = JSON.parse(el.getAttribute("data-currency-values"));
          if (typeof values[currency] === "string") el.textContent = values[currency];
        } catch (_) {}
      });
      document.querySelectorAll("[data-band-values]").forEach(function (el) {
        try {
          var text = JSON.parse(el.getAttribute("data-band-values"))[band];
          if (text && typeof text === "object") text = text[currency];
          if (typeof text === "string") el.textContent = text;
        } catch (_) {}
      });
      var country = countryOption() ? countrySelect.value : "";
      document.querySelectorAll("[data-pricing-signup]").forEach(function (el) {
        var url = new URL(el.href, window.location.href);
        url.searchParams.set("currency", explicit ? currency.toLowerCase() : "");
        url.searchParams.set("country", country);
        el.href = url.href;
      });
    }
    var initial = fallback;
    try {
      var params = new URL(window.location.href).searchParams;
      var wanted = params.get("country");
      if (countrySelect && wanted && /^[A-Za-z]{2}$/.test(wanted) && countrySelect.querySelector('option[value="' + wanted.toUpperCase() + '"]')) {
        countrySelect.value = wanted.toUpperCase();
      }
      var requested = params.get("currency");
      requested = requested && requested.toUpperCase();
      if (supported.indexOf(requested) !== -1) {
        initial = requested;
        explicit = true;
      } else if (countrySelect && countrySelect.value) {
        initial = countryCurrency(countrySelect.value);
      } else {
        var region = new Intl.Locale(navigator.language).region;
        initial = countryCurrency(region);
      }
    } catch (_) {}
    render(initial);
    currencySelect.addEventListener("change", function () {
      explicit = true;
      render(currencySelect.value);
    });
    if (countrySelect) countrySelect.addEventListener("change", function () {
      render(explicit ? currencySelect.value : countryCurrency(countrySelect.value));
    });
  }

  var body = document.querySelector(".term-body");
  if (!body) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var lines = Array.prototype.slice.call(body.querySelectorAll(".line"));
  var caretLine = lines.pop(); // trailing caret stays put until the end
  var texts = lines.map(function (el) { return el.textContent; });
  // A line can hold markup — the last one's URL is a real link — and typing
  // sets textContent, which would throw those children away. Keep the
  // original markup and put it back the moment the line finishes.
  var htmls = lines.map(function (el) { return el.innerHTML; });
  lines.forEach(function (el) {
    el.textContent = "";
    el.style.display = "none";
  });
  if (caretLine) caretLine.style.display = "none";

  var li = 0;
  function nextLine() {
    if (li >= lines.length) {
      if (caretLine) caretLine.style.display = "";
      return;
    }
    var el = lines[li];
    var text = texts[li];
    var html = htmls[li];
    li++;
    el.style.display = "";
    if (el.hasAttribute("data-type")) {
      var ci = 0;
      (function typeChar() {
        if (ci <= text.length) {
          el.textContent = text.slice(0, ci);
          ci++;
          setTimeout(typeChar, 14);
        } else {
          el.innerHTML = html;
          setTimeout(nextLine, 160);
        }
      })();
    } else {
      el.innerHTML = html;
      setTimeout(nextLine, el.classList.contains("ok") ? 260 : 120);
    }
  }
  setTimeout(nextLine, 450);
})();
