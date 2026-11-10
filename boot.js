/* boot.js: runs first on every page (loaded in <head>, no defer).
   1. Marks the page as "JavaScript is on". The CSS only hides the fade-in
      items when this class exists, so the site is never blank if scripts fail.
   2. On members-only pages (<html data-access="members">), sends visitors who
      are not logged in to login.html before anything is drawn.
   3. Provides acpReadUser(), the one place that decides whether the saved
      login is real. script.js uses it too, so the two can never disagree.

   Note: this is a convenience gate, not real security. Everything in this
   folder can be downloaded by anyone, and anyone can edit their own browser
   storage. Do not put private information on these pages. */
(function () {
  "use strict";

  var KEY = "acpStudioUser"; // must match STORAGE_KEY in script.js
  var MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // a login lasts 30 days
  var CLOCK_SKEW_MS = 5 * 60 * 1000; // allow a slightly wrong device clock
  var root = document.documentElement;

  root.classList.add("js");

  // Clickjacking: refuse to show inside another website's frame. GitHub Pages
  // cannot send the X-Frame-Options header, so this is the next best thing.
  if (window.top !== window.self) {
    root.style.display = "none";
    try {
      window.top.location.href = window.location.href;
    } catch (e) {
      /* sandboxed frame: stay hidden */
    }
  }

  // Returns {email, signedInAt} for a valid, recent login, otherwise null.
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
      var age = Date.now() - user.signedInAt;
      if (age < -CLOCK_SKEW_MS || age > MAX_AGE_MS) return null;
      return user;
    } catch (e) {
      return null; // storage blocked or the value is not valid JSON
    }
  }

  window.ACP_STORAGE_KEY = KEY;
  window.acpReadUser = readUser;

  if (root.getAttribute("data-access") === "members" && !readUser()) {
    root.style.visibility = "hidden"; // no flash of the page while redirecting
    location.replace("login.html");
  }
})();
