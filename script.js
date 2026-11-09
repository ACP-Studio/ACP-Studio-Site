// ===== Settings =====
// true = visitors must log in before they can see the site (login.html comes first).
// Set to false to make the login optional again.
const REQUIRE_LOGIN = true;
// Must match the key in boot.js (boot.js is loaded first and provides it)
const STORAGE_KEY = window.ACP_STORAGE_KEY || "acpStudioUser";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// ===== Email-only sign-in (stored in this browser only) =====
// Reading goes through boot.js (acpReadUser), which rejects forged, malformed
// and expired (older than 30 days) values. This is a convenience gate, not
// real security: see the note at the top of boot.js.
const auth = {
  get() {
    return typeof window.acpReadUser === "function" ? window.acpReadUser() : null;
  },
  set(email) {
    try {
      const value = JSON.stringify({ email, signedInAt: Date.now() });
      localStorage.setItem(STORAGE_KEY, value);
      return localStorage.getItem(STORAGE_KEY) === value;
    } catch {
      return false;
    }
  },
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

// "public" pages (login and the legal pages) can be read without logging in,
// so people can read the Privacy Policy before they give their email.
const isPublicPage = document.documentElement.dataset.access === "public";
const isLoginPage = document.body.classList.contains("login-page");
const isSoonPage = document.body.classList.contains("soon-page");
const needsLogin = REQUIRE_LOGIN && !isPublicPage;

// Remove a saved login that is invalid or expired so it can't linger
if (!auth.get()) auth.clear();

if (needsLogin && !auth.get()) {
  window.location.replace("login.html");
}

// Back button after logging out: a cached copy of the page must not show
window.addEventListener("pageshow", (e) => {
  if (e.persisted && needsLogin && !auth.get()) {
    window.location.replace("login.html");
  }
});

// Logging out (or in) in another tab updates this tab too
window.addEventListener("storage", (e) => {
  if (e.key !== null && e.key !== STORAGE_KEY) return;
  if (needsLogin && !auth.get()) {
    window.location.replace("login.html");
    return;
  }
  renderAuthLink();
});

// ===== Dynamic Island =====
const dynamicIsland = document.getElementById("dynamicIsland");
const islandNav = document.getElementById("islandNav");

// Before logging in, the island on the login page stays closed (logo only)
const islandLocked = REQUIRE_LOGIN && isLoginPage && !auth.get();
if (islandLocked) {
  dynamicIsland.classList.add("is-locked");
  dynamicIsland.removeAttribute("tabindex");
}

let isExpanded = false;

function setExpanded(next) {
  if (islandLocked || next === isExpanded) return;
  isExpanded = next;
  dynamicIsland.classList.toggle("expanded", isExpanded);
  islandNav.classList.toggle("active", isExpanded);
}

// Mouse / trackpad: the island opens on hover and closes when the pointer leaves.
// Touch screens have no hover, so tapping the island opens and closes it there.
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
let collapseTimer;

function openIsland() {
  clearTimeout(collapseTimer);
  setExpanded(true);
}

function closeIslandSoon() {
  clearTimeout(collapseTimer);
  collapseTimer = setTimeout(() => setExpanded(false), 350);
}

if (canHover) {
  dynamicIsland.addEventListener("pointerenter", openIsland);
  dynamicIsland.addEventListener("pointerleave", closeIslandSoon);

  // Keyboard users: opens when focus enters, closes when it leaves
  dynamicIsland.addEventListener("focusin", openIsland);
  dynamicIsland.addEventListener("focusout", (e) => {
    if (!dynamicIsland.contains(e.relatedTarget)) closeIslandSoon();
  });
} else {
  dynamicIsland.addEventListener("keydown", (e) => {
    if (e.target === dynamicIsland && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setExpanded(!isExpanded);
    }
  });
}

// Close island when clicking nav links
// document.querySelectorAll(".island-nav a").forEach((link) => {
//   link.addEventListener("click", () => setExpanded(false));
// });

// Close with the Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isExpanded) {
    setExpanded(false);
  }
});


// Close island when clicking outside
document.addEventListener("click", (e) => {
  if (isExpanded && !dynamicIsland.contains(e.target)) {
    setExpanded(false);
  }
});

// Prevent island from closing when clicking inside it.
// On touch screens, tapping the island itself (not a link) opens or closes it.
dynamicIsland.addEventListener("click", (e) => {
  e.stopPropagation();
  if (canHover) return;
  if (!e.target.closest("a")) {
    setExpanded(!isExpanded);
  } else {
    // touch screens: close the island after a link is tapped, so it does not
    // stay open on top of the section you just scrolled to
    setExpanded(false);
  }
});

// ===== Island label: shows the section you are reading =====
const islandSection = document.getElementById("islandSection");

if (islandSection && !isLoginPage && !isSoonPage) {
  const SECTIONS = [
    ["home", "Home"],
    ["projects", "C++ Projects"],
    ["studio", "YouTube Studio"],
    ["contact", "Contact"],
  ];
  let shownLabel = islandSection.textContent;
  let swapTimer;
  let ticking = false;

  function currentSectionLabel() {
    // a section counts as "current" once its top passes 40% of the screen height
    const line = window.innerHeight * 0.4;
    let label = SECTIONS[0][1];
    for (const [id, name] of SECTIONS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) label = name;
    }
    // at the very bottom of the page, always say Contact
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;
    return atBottom ? SECTIONS[SECTIONS.length - 1][1] : label;
  }

  function updateIslandLabel() {
    ticking = false;
    const next = currentSectionLabel();
    if (next === shownLabel) return;
    shownLabel = next;
    clearTimeout(swapTimer);
    islandSection.classList.add("is-swapping");
    swapTimer = setTimeout(() => {
      islandSection.textContent = next;
      islandSection.classList.remove("is-swapping");
    }, prefersReducedMotion ? 0 : 220);
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateIslandLabel);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", updateIslandLabel);
  updateIslandLabel();
}

// ===== Intersection Observer for fade-in animations =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all fade-in elements
  document.querySelectorAll(".fade-in-up").forEach((el) => {
    observer.observe(el);
  });
} else {
  // very old browsers: just show everything
  document.querySelectorAll(".fade-in-up").forEach((el) => {
    el.classList.add("visible");
  });
}

// ===== Smooth scroll behavior for navigation =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href !== "#") {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  });
});

// ===== Log in / Log out link in the island =====
const authLink = document.getElementById("authLink");

function renderAuthLink() {
  if (!authLink) return;
  const user = auth.get();
  if (user && user.email) {
    authLink.textContent = "Log out";
    authLink.setAttribute("href", "#");
    authLink.title = `Signed in as ${user.email}`;
    authLink.removeAttribute("aria-current");
    authLink.classList.add("is-logout");
  } else {
    authLink.textContent = "Log in";
    authLink.setAttribute("href", "login.html");
    authLink.removeAttribute("title");
    authLink.classList.remove("is-logout");
  }
}

// Asks "Are you sure?" in a glass dialog. Resolves true only if the visitor
// presses the Yes button; Cancel, Escape and clicking outside all resolve false.
function confirmLogout(email) {
  if (document.querySelector(".confirm-overlay")) return Promise.resolve(false);

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <div class="confirm-card" role="alertdialog" aria-modal="true"
           aria-labelledby="confirmTitle" aria-describedby="confirmText">
        <h2 id="confirmTitle">Log out?</h2>
        <p id="confirmText"></p>
        <div class="confirm-actions">
          <button type="button" class="btn btn-glass" data-answer="no">No, stay</button>
          <button type="button" class="btn btn-danger" data-answer="yes">Yes, log out</button>
        </div>
      </div>`;
    // textContent, not innerHTML, so the email is always shown as plain text
    overlay.querySelector("#confirmText").textContent =
      `You're signed in as ${email}. Do you really want to log out?`;

    const noBtn = overlay.querySelector('[data-answer="no"]');
    const yesBtn = overlay.querySelector('[data-answer="yes"]');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.appendChild(overlay);

    function close(answer) {
      document.removeEventListener("keydown", onKeydown);
      document.body.style.overflow = previousOverflow;
      overlay.classList.remove("open");
      setTimeout(() => overlay.remove(), 900);
      resolve(answer);
    }

    function onKeydown(e) {
      if (e.key === "Escape") {
        close(false);
      } else if (e.key === "Tab") {
        // keep keyboard focus inside the dialog
        const first = noBtn;
        const last = yesBtn;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    noBtn.addEventListener("click", () => close(false));
    yesBtn.addEventListener("click", () => close(true));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(false);
    });
    document.addEventListener("keydown", onKeydown);

    // two frames so the opening transition always plays
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        overlay.classList.add("open");
        noBtn.focus(); // the safe choice is focused by default
      }),
    );
  });
}

function performLogout() {
  auth.clear();
  renderAuthLink();
  setExpanded(false);
  window.location.href = "login.html";
}

if (authLink) {
  authLink.addEventListener("click", async (e) => {
    const user = auth.get();
    if (user && user.email) {
      e.preventDefault();
      setExpanded(false);
      if (await confirmLogout(user.email)) performLogout();
    }
  });
  renderAuthLink();
}

// ===== Supabase (stores the emails) =====
// Use the PUBLISHABLE key only. Never put the secret / service_role key in this file,
// because everything in script.js can be read by anyone who visits the site.
const SUPABASE_URL = "https://ppvncqbwfkubqmuehsfl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gasiCPaJ54I4G-2phqTlXg_5JL65S1j";

// The email is saved by a database function (created by supabase-hardening.sql)
// so the public key never needs direct access to the table, and nobody can use
// the site to find out whether a given email is already in the list.
const SAVE_FUNCTION = "register_email";

// Until that SQL has been run, fall back to inserting straight into the table
// (the old behaviour). Set this to false once the SQL is live and tested.
const FALLBACK_TO_DIRECT_INSERT = true;
const EMAILS_TABLE = "Emails";
const EMAILS_COLUMN = "Email";

// If Supabase doesn't answer in this time, the visitor continues anyway.
const SAVE_TIMEOUT_MS = 8000;

const supabaseIsConfigured =
  !SUPABASE_URL.includes("YOUR_PROJECT_ID") &&
  !SUPABASE_PUBLISHABLE_KEY.endsWith("...");

// The email is sent with one plain request to Supabase's REST address, so no
// library has to be downloaded. The publishable key goes in the "apikey" header.
async function postToSupabase(path, body, signal, extraHeaders) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
    credentials: "omit",
    cache: "no-store",
    signal,
  });
  if (res.ok) return null;

  const error = { status: res.status, code: "", message: `HTTP ${res.status}` };
  try {
    const info = await res.json();
    error.code = info.code || "";
    error.message = info.message || error.message;
  } catch {
    /* the answer was not JSON */
  }
  return error;
}

function isMissingFunction(error) {
  return (
    error &&
    (error.code === "PGRST202" ||
      error.code === "42883" ||
      /could not find the function/i.test(error.message || ""))
  );
}

// Sends the email to Supabase. Never throws: a database problem should not
// block the visitor, so problems are only written to the browser console.
async function saveEmailToSupabase(email) {
  if (!supabaseIsConfigured) {
    console.warn("Supabase is not set up, so this email was not saved online.");
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SAVE_TIMEOUT_MS);

  try {
    let error = await postToSupabase(
      `rpc/${SAVE_FUNCTION}`,
      { p_email: email },
      controller.signal,
    );

    if (error && FALLBACK_TO_DIRECT_INSERT && isMissingFunction(error)) {
      error = await postToSupabase(
        EMAILS_TABLE,
        { [EMAILS_COLUMN]: email },
        controller.signal,
        { Prefer: "return=minimal" },
      );
      // Code 23505 means this email is already in the table, which is fine.
      if (error && error.code === "23505") error = null;
    }

    if (error) console.error("Supabase error:", error.message);
  } catch (err) {
    console.error("Could not reach Supabase:", err);
  } finally {
    clearTimeout(timer);
  }
}

// ===== Email check (same rules the database enforces) =====
// Lower-case only: the address is lower-cased before it is checked.
const EMAIL_LOCAL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const EMAIL_DOMAIN =
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const EMAIL_TLD = /\.(?:[a-z]{2,}|xn--[a-z0-9-]{2,})$/;

function isValidEmail(email) {
  if (typeof email !== "string" || email.length < 6 || email.length > 254) {
    return false;
  }
  const at = email.lastIndexOf("@");
  if (at < 1 || at > 64) return false; // local part must be 1 to 64 characters
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return false;
  }
  return EMAIL_LOCAL.test(local) && EMAIL_DOMAIN.test(domain) && EMAIL_TLD.test(domain);
}

// ===== Login form (email only) =====
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const loginCard = document.getElementById("loginCard");
  const emailInput = document.getElementById("loginEmail");
  const emailField = document.getElementById("loginField");
  const errorEl = document.getElementById("loginError");
  const submitBtn = document.getElementById("loginSubmit");

  const saved = auth.get();
  if (saved && saved.email) {
    emailInput.value = saved.email;
    // already logged in: offer a way into the site
    const continueEl = document.getElementById("loginContinue");
    if (continueEl) continueEl.hidden = false;
  }

  function showError(message) {
    errorEl.textContent = message;
    emailField.classList.add("has-error");
    emailInput.setAttribute("aria-invalid", "true");
    emailInput.focus();
  }

  function clearError() {
    errorEl.textContent = "";
    emailField.classList.remove("has-error");
    emailInput.removeAttribute("aria-invalid");
  }

  emailInput.addEventListener("input", clearError);

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();

    if (!email) {
      showError("Enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      showError("That email doesn't look right. Check it and try again.");
      return;
    }
    if (!auth.set(email)) {
      showError(
        "Your browser is blocking site data, so we can't keep you logged in. Allow site data and try again.",
      );
      return;
    }

    clearError();
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in…";

    await saveEmailToSupabase(email);

    loginCard.classList.add("is-success");
    renderAuthLink();
    setTimeout(() => {
      window.location.href = "index.html";
    }, prefersReducedMotion ? 0 : 700);
  });
}