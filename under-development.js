// Under Development page: the interactive clock.
// Plain JS, no libraries. Loaded after script.js (which runs the island).
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var faceBtn = document.getElementById("clockFace");
  var ticksEl = document.getElementById("clockTicks");
  var numbersEl = document.getElementById("clockNumbers");
  var handHour = document.getElementById("handHour");
  var handMinute = document.getElementById("handMinute");
  var handSecond = document.getElementById("handSecond");
  var timeEl = document.getElementById("digitalTime");
  var ampmEl = document.getElementById("digitalAmPm");
  var dateEl = document.getElementById("clockDate");
  var zoneLocalBtn = document.getElementById("zoneLocal");
  var zoneCairoBtn = document.getElementById("zoneCairo");
  var formatBtn = document.getElementById("formatToggle");

  if (!faceBtn || !timeEl) return;

  // ----- Settings (remembered in this browser; ignored if storage is blocked) -----
  var PREF_KEY = "acpClockPrefs";
  var state = { zone: "local", hour24: false };

  try {
    var saved = JSON.parse(localStorage.getItem(PREF_KEY) || "null");
    if (saved && (saved.zone === "local" || saved.zone === "cairo")) state.zone = saved.zone;
    if (saved && typeof saved.hour24 === "boolean") state.hour24 = saved.hour24;
  } catch (e) {
    /* storage unavailable: use the defaults */
  }

  function savePrefs() {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable */
    }
  }

  // ----- Draw the face: 60 ticks and the 12 numbers -----
  function svgEl(name, attrs) {
    var el = document.createElementNS(SVG_NS, name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  for (var i = 0; i < 60; i++) {
    var major = i % 5 === 0;
    var angle = (i * 6 * Math.PI) / 180;
    var outer = 84;
    var inner = major ? 74 : 79;
    ticksEl.appendChild(
      svgEl("line", {
        x1: (100 + Math.sin(angle) * inner).toFixed(2),
        y1: (100 - Math.cos(angle) * inner).toFixed(2),
        x2: (100 + Math.sin(angle) * outer).toFixed(2),
        y2: (100 - Math.cos(angle) * outer).toFixed(2),
        class: "tick " + (major ? "tick-major" : "tick-minor"),
      }),
    );
  }

  for (var n = 1; n <= 12; n++) {
    var a = (n * 30 * Math.PI) / 180;
    var label = svgEl("text", {
      x: (100 + Math.sin(a) * 58).toFixed(2),
      y: (100 - Math.cos(a) * 58).toFixed(2),
      class: "clock-number",
    });
    label.textContent = String(n);
    numbersEl.appendChild(label);
  }

  // ----- Time in the chosen zone -----
  var formatters = {};

  function partsFormatter(zone) {
    var key = zone === "cairo" ? "Africa/Cairo" : "local";
    if (!formatters[key]) {
      var opts = { hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" };
      if (zone === "cairo") opts.timeZone = "Africa/Cairo";
      try {
        formatters[key] = new Intl.DateTimeFormat("en-GB", opts);
      } catch (e) {
        formatters[key] = null;
      }
    }
    return formatters[key];
  }

  function readParts(date) {
    var fmt = partsFormatter(state.zone);
    if (!fmt) {
      return { h: date.getHours(), m: date.getMinutes(), s: date.getSeconds() };
    }
    var out = { h: 0, m: 0, s: 0 };
    fmt.formatToParts(date).forEach(function (p) {
      if (p.type === "hour") out.h = parseInt(p.value, 10) % 24;
      if (p.type === "minute") out.m = parseInt(p.value, 10);
      if (p.type === "second") out.s = parseInt(p.value, 10);
    });
    return out;
  }

  function dateText(date) {
    var opts = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
    if (state.zone === "cairo") opts.timeZone = "Africa/Cairo";
    try {
      return new Intl.DateTimeFormat("en-GB", opts).format(date);
    } catch (e) {
      return date.toDateString();
    }
  }

  function zoneName() {
    if (state.zone === "cairo") return "Cairo";
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // "America/New_York" -> "New York"
      return tz ? tz.split("/").pop().replace(/_/g, " ") : "Your time";
    } catch (e) {
      return "Your time";
    }
  }

  function pad(v) {
    return v < 10 ? "0" + v : String(v);
  }

  // ----- Render -----
  var lastSecond = -1;
  var current = { h: 0, m: 0, s: 0 };

  function renderDigital(date) {
    var h = current.h;
    var suffix = "";
    if (!state.hour24) {
      suffix = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
    }
    timeEl.textContent = pad(h) + ":" + pad(current.m) + ":" + pad(current.s);
    ampmEl.hidden = state.hour24;
    ampmEl.textContent = suffix;
    dateEl.textContent = dateText(date) + " · " + zoneName();
  }

  function rotate(el, deg) {
    el.setAttribute("transform", "rotate(" + deg.toFixed(2) + " 100 100)");
  }

  function frame() {
    var now = Date.now();
    var whole = Math.floor(now / 1000);

    // Text and time parts only change once a second
    if (whole !== lastSecond) {
      lastSecond = whole;
      current = readParts(new Date(now));
      renderDigital(new Date(now));
    }

    // Hands glide between seconds (a step each second if motion is reduced)
    var sec = current.s + (reduceMotion ? 0 : (now % 1000) / 1000);
    var min = current.m + sec / 60;
    var hr = (current.h % 12) + min / 60;

    rotate(handSecond, sec * 6);
    rotate(handMinute, min * 6);
    rotate(handHour, hr * 30);

    if (!document.hidden) {
      rafId = requestAnimationFrame(frame);
    }
  }

  var rafId = 0;

  function start() {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  // Do not waste battery while the tab is in the background
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) start();
  });

  // ----- Controls -----
  function syncControls() {
    zoneLocalBtn.setAttribute("aria-pressed", String(state.zone === "local"));
    zoneCairoBtn.setAttribute("aria-pressed", String(state.zone === "cairo"));
    formatBtn.setAttribute("aria-pressed", String(state.hour24));
    formatBtn.textContent = state.hour24 ? "24h" : "12h";
    formatBtn.setAttribute(
      "aria-label",
      state.hour24 ? "24-hour time. Press for 12-hour." : "12-hour time. Press for 24-hour.",
    );
  }

  function refreshNow() {
    lastSecond = -1; // force the text to redraw on the next frame
    start();
  }

  function setZone(zone) {
    if (state.zone === zone) return;
    state.zone = zone;
    syncControls();
    savePrefs();
    refreshNow();
  }

  function toggleFormat() {
    state.hour24 = !state.hour24;
    syncControls();
    savePrefs();
    refreshNow();
  }

  zoneLocalBtn.addEventListener("click", function () {
    setZone("local");
  });
  zoneCairoBtn.addEventListener("click", function () {
    setZone("cairo");
  });
  formatBtn.addEventListener("click", toggleFormat);
  faceBtn.addEventListener("click", toggleFormat); // tapping the clock does the same

  // ----- Tilt toward the pointer (mouse only, and only if motion is allowed) -----
  if (canTilt && !reduceMotion) {
    var stage = document.getElementById("clockStage");

    stage.addEventListener("pointermove", function (e) {
      var r = faceBtn.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      dx = Math.max(-1, Math.min(1, dx));
      dy = Math.max(-1, Math.min(1, dy));
      faceBtn.style.setProperty("--tilt-y", (dx * 9).toFixed(2) + "deg");
      faceBtn.style.setProperty("--tilt-x", (-dy * 9).toFixed(2) + "deg");
    });

    stage.addEventListener("pointerleave", function () {
      faceBtn.style.setProperty("--tilt-x", "0deg");
      faceBtn.style.setProperty("--tilt-y", "0deg");
    });
  }

  syncControls();
  start();
})();
