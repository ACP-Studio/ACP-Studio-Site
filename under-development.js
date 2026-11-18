/* under-development.js: counts down to the opening time and, when the time
   comes, sends the visitor to the real site. The opening time itself is set
   once, in boot.js (LAUNCH_AT). */
(function () {
  "use strict";

  // 18 Nov 2026, 18:00 in Dubai (GMT+4) = 14:00 UTC. Same value as in boot.js.
  var LAUNCH_AT = window.ACP_LAUNCH_AT || Date.UTC(2026, 10, 18,20, 0, 0);

  var els = {
    d: document.getElementById("cdDays"),
    h: document.getElementById("cdHours"),
    m: document.getElementById("cdMinutes"),
    s: document.getElementById("cdSeconds"),
  };

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function tick() {
    var left = LAUNCH_AT - Date.now();
    if (left <= 0) {
      location.replace("index.html");
      return false;
    }
    var total = Math.floor(left / 1000);
    els.d.textContent = pad(Math.floor(total / 86400));
    els.h.textContent = pad(Math.floor((total % 86400) / 3600));
    els.m.textContent = pad(Math.floor((total % 3600) / 60));
    els.s.textContent = pad(total % 60);
    return true;
  }

  if (tick()) {
    setInterval(tick, 1000);
  }

  // Show the opening time in the visitor's own time zone (hidden for people in Dubai)
  try {
    var zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var line = document.getElementById("devLocal");
    if (line && zone !== "Asia/UAE") {
      var local = new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(LAUNCH_AT));
      line.textContent = "In your time zone: " + local + ".";
      line.hidden = false;
    }
  } catch (e) {
    /* Intl not available: the Dubai time above is enough */
  }
})();
