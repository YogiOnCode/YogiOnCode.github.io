// Theme: follows the OS until the visitor picks one; the pick is remembered per browser.
(function () {
  var root = document.documentElement;
  try { var saved = localStorage.getItem("theme"); if (saved) root.dataset.theme = saved; } catch (e) {}
  var btn = document.querySelector(".theme-btn");
  function isDark() {
    return root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  }
  if (btn) btn.addEventListener("click", function () {
    root.dataset.theme = isDark() ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });
})();

var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Sections fade in once as they scroll into view.
(function () {
  var items = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(function (el) { io.observe(el); });
})();

// Hero: type the command once.
(function () {
  var el = document.querySelector("[data-type]");
  if (!el) return;
  var text = el.dataset.type;
  if (reduceMotion) { el.textContent = text; return; }
  var i = 0;
  (function tick() {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, 70);
  })();
})();

// Hero stack grid: a contribution-graph "LED" that spells the stack, one word at a time.
(function () {
  var led = document.getElementById("led"), cap = document.getElementById("led-cap");
  if (!led) return;
  // 5x7 pixel font, one string per row.
  var FONT = {
    "C": ["01110","10001","10000","10000","10000","10001","01110"],
    "#": ["01010","01010","11111","01010","11111","01010","01010"],
    ".": ["00000","00000","00000","00000","00000","01100","01100"],
    "N": ["10001","11001","10101","10011","10001","10001","10001"],
    "E": ["11111","10000","10000","11110","10000","10000","11111"],
    "T": ["11111","00100","00100","00100","00100","00100","00100"],
    "W": ["10001","10001","10001","10101","10101","10101","01010"],
    "P": ["11110","10001","10001","11110","10000","10000","10000"],
    "F": ["11111","10000","10000","11110","10000","10000","10000"],
    "I": ["01110","00100","00100","00100","00100","00100","01110"],
    "/": ["00001","00010","00010","00100","01000","01000","10000"],
    "S": ["01111","10000","10000","01110","00001","00001","11110"],
    "U": ["10001","10001","10001","10001","10001","10001","01110"],
    "R": ["11110","10001","10001","11110","10100","10010","10001"],
    "A": ["01110","10001","10001","11111","10001","10001","10001"],
    "L": ["10000","10000","10000","10000","10000","10000","11111"],
    "O": ["01110","10001","10001","10001","10001","10001","01110"],
    "D": ["11110","10001","10001","10001","10001","10001","11110"],
    "Y": ["10001","10001","01010","00100","00100","00100","00100"],
    "H": ["10001","10001","10001","11111","10001","10001","10001"]
  };
  var WORDS = [
    { w: "C#",     cap: "C# · async · multithreading" },
    { w: ".NET",   cap: ".NET 6 / 8" },
    { w: "WPF",    cap: "WPF · MVVM" },
    { w: "TCP/IP", cap: "TCP/IP · Siemens S7 PLC" },
    { w: "PYTHON", cap: "Python · Django · Celery · FastAPI" },
    { w: "CLOUD",  cap: "GCP · Cloud Run · BigQuery · Docker" },
    { w: "AI",     cap: "Claude agents with guardrails" }
  ];
  var COLS = 36, ROWS = 7, cells = [];
  for (var c = 0; c < COLS; c++) for (var r = 0; r < ROWS; r++) {
    var cell = document.createElement("i");
    cell.style.transitionDelay = (Math.random() * 0.35).toFixed(2) + "s";
    led.appendChild(cell); cells.push(cell);
  }
  function draw(word) {
    var lit = {}, width = word.length * 6 - 1, x0 = Math.floor((COLS - width) / 2);
    word.split("").forEach(function (ch, k) {
      FONT[ch].forEach(function (row, y) {
        row.split("").forEach(function (bit, x) { if (bit === "1") lit[(x0 + k * 6 + x) * ROWS + y] = true; });
      });
    });
    cells.forEach(function (cell, i) {
      // Letters at full strength; the rest is faint "commit noise", like a contribution graph.
      var n = Math.random();
      cell.dataset.l = lit[i] ? 4 : n < 0.04 ? 2 : n < 0.16 ? 1 : 0;
    });
  }
  var idx = 0;
  function next() { draw(WORDS[idx].w); cap.textContent = WORDS[idx].cap; idx = (idx + 1) % WORDS.length; }
  next();
  // Always cycle with the fade, so every visitor sees all six pillars the same way.
  setInterval(next, 2600);
})();

// Architecture diagram: hover or focus a box to explain it in plain English.
(function () {
  var info = document.querySelector(".diagram-info");
  if (!info) return;
  var fallback = info.innerHTML;
  document.querySelectorAll(".diagram .node").forEach(function (node) {
    function show() {
      document.querySelectorAll(".diagram .node.active").forEach(function (n) { n.classList.remove("active"); });
      node.classList.add("active");
      info.innerHTML = "<b>" + node.dataset.name + "</b>" + node.dataset.info;
    }
    node.addEventListener("mouseenter", show);
    node.addEventListener("focus", show);
    node.addEventListener("click", show);
  });
  var svg = document.querySelector(".diagram");
  svg.addEventListener("mouseleave", function () {
    document.querySelectorAll(".diagram .node.active").forEach(function (n) { n.classList.remove("active"); });
    info.innerHTML = fallback;
  });
})();
