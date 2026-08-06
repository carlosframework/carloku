// 🤖 Carloku — hand-written, dependency-free. Two jobs only:
// 1. the hero terminal types its session once (skipped under reduced motion),
// 2. the sticky header grows its hairline once the page scrolls.
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

  var body = document.querySelector(".term-body");
  if (!body) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var lines = Array.prototype.slice.call(body.querySelectorAll(".line"));
  var caretLine = lines.pop(); // trailing caret stays put until the end
  var texts = lines.map(function (el) { return el.textContent; });
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
          setTimeout(nextLine, 160);
        }
      })();
    } else {
      el.textContent = text;
      setTimeout(nextLine, el.classList.contains("ok") ? 260 : 120);
    }
  }
  setTimeout(nextLine, 450);
})();
