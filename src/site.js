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

  var currencySelect = document.querySelector("[data-pricing-currency]");
  if (currencySelect) {
    var supported = ["USD", "EUR", "GBP"];
    var eu = "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE".split(" ");
    var countrySelect = document.querySelector("[data-pricing-country]");
    var explicit = false;
    function countryCurrency(country) {
      return country === "GB" ? "GBP" : eu.indexOf(country) !== -1 ? "EUR" : "USD";
    }
    function renderCurrency(currency) {
      if (supported.indexOf(currency) === -1) return;
      currencySelect.value = currency;
      document.querySelectorAll("[data-currency-values]").forEach(function (el) {
        try {
          var values = JSON.parse(el.getAttribute("data-currency-values"));
          if (typeof values[currency] === "string") el.textContent = values[currency];
        } catch (_) {}
      });
      document.querySelectorAll("[data-pricing-signup]").forEach(function (el) {
        var url = new URL(el.href, window.location.href);
        url.searchParams.set("currency", currency.toLowerCase());
        el.href = url.href;
      });
    }
    var initial = "USD";
    try {
      var requested = new URL(window.location.href).searchParams.get("currency");
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
    renderCurrency(initial);
    currencySelect.addEventListener("change", function () {
      explicit = true;
      renderCurrency(currencySelect.value);
    });
    if (countrySelect) countrySelect.addEventListener("change", function () {
      if (!explicit) renderCurrency(countryCurrency(countrySelect.value));
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
