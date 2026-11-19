(function () {
  "use strict";

  var KEY = "acpStudioUser";
  var MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  var CLOCK_SKEW_MS = 5 * 60 * 1000;
  var root = document.documentElement;

  root.classList.add("js");

  if (window.top !== window.self) {
    root.style.display = "none";
    try {
      window.top.location.href = window.location.href;
    } catch (e) {
    }
  }

  function readUser() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var user = JSON.parse(raw);
      if (!user || typeof user !== "object") return null;
      if (typeof user.email !== "string") return null;
      if (user.email.length < 6 || user.email.length > 254) return null;
      if (user.email.indexOf("@") < 1) return null;
      if (typeof user.signedInAt !== "number" || !isFinite(user.signedInAt)) {
        return null;
      }
      if (typeof user.accessToken !== "string" || user.accessToken.length < 20) return null;
      if (typeof user.refreshToken !== "string" || user.refreshToken.length < 5) return null;
      var age = Date.now() - user.signedInAt;
      if (age < -CLOCK_SKEW_MS || age > MAX_AGE_MS) return null;
      return user;
    } catch (e) {
      return null;
    }
  }

  window.ACP_STORAGE_KEY = KEY;
  window.acpReadUser = readUser;

  if (root.getAttribute("data-access") === "members") {
    root.style.visibility = "hidden";
    if (!readUser()) {
      location.replace("login.html");
    } else {
      setTimeout(function () {
        if (root.style.visibility === "hidden") location.replace("login.html");
      }, 10000);
    }
  }
})();