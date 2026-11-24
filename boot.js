(function () {
  "use strict";

  var KEY = "acpStudioUser";
  var MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  var CLOCK_SKEW_MS = 5 * 60 * 1000;
  var root = document.documentElement;

  root.classList.add("js");

  // Language: set it before the page paints so there is no flash of the wrong
  // language or direction. i18n.js translates the text itself.
  var LANG_KEY = "acpLang";
  var lang = "en";
  try {
    if (localStorage.getItem(LANG_KEY) === "ar") lang = "ar";
  } catch (e) {
  }
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";
  window.ACP_LANG_KEY = LANG_KEY;
  window.ACP_LANG = lang;

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

  // Lets the CSS show the logged-out island (only the language button) from the first paint
  root.setAttribute("data-auth", readUser() ? "in" : "out");

  // false: show the page immediately when a saved login exists and check it
  //        with the server in the background (script.js sends you to
  //        login.html if the server says no). Much faster first view.
  // true:  keep the page blank until the server has answered (old behaviour).
  var VERIFY_BEFORE_SHOW = false;

  // Closing notice: a logged-in user who opens the site in a new browser session
  // (new tab or window, after closing it) is sent to closing.html once.
  // sessionStorage remembers that they have seen it until the tab is closed.
  var CLOSING_SEEN_KEY = "acpClosingSeen";
  var SHOW_CLOSING_NOTICE = true;

  function sessionWorks() {
    try {
      sessionStorage.setItem(CLOSING_SEEN_KEY + "_test", "1");
      sessionStorage.removeItem(CLOSING_SEEN_KEY + "_test");
      return true;
    } catch (e) {
      return false;
    }
  }

  if (root.getAttribute("data-access") === "members") {
    if (!readUser()) {
      root.style.visibility = "hidden";
      location.replace("login.html");
    } else if (root.getAttribute("data-page") === "closing") {
      try {
        sessionStorage.setItem(CLOSING_SEEN_KEY, "1");
      } catch (e) {
      }
    } else if (
      SHOW_CLOSING_NOTICE &&
      sessionWorks() &&
      !sessionStorage.getItem(CLOSING_SEEN_KEY)
    ) {
      root.setAttribute("data-closing-redirect", "1");
      root.style.visibility = "hidden";
      location.replace("closing.html");
    } else if (VERIFY_BEFORE_SHOW) {
      root.style.visibility = "hidden";
      setTimeout(function () {
        if (root.style.visibility === "hidden") location.replace("login.html");
      }, 10000);
    }
  }
})();