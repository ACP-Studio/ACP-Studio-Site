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
  set(data) {
    try {
      const value = JSON.stringify({
        email: data.email,
        signedInAt: data.signedInAt || Date.now(),
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      });
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

// A tab left open past the 30 days (or a login removed meanwhile): check again
// when the person comes back to the tab
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && needsLogin && !auth.get()) {
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
  if (document.querySelector(".confirm-overlay.open")) return Promise.resolve(false);

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
  const user = auth.get();
  if (user && user.accessToken) {
    authFetch("logout", { token: user.accessToken }); // ends the session on the server too
  }
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

// ===== Supabase Auth: real login with an emailed code =====
// Supabase checks the Turnstile CAPTCHA itself (Dashboard > Authentication >
// Attack Protection), so it cannot be skipped. Use the PUBLISHABLE key only.
const SUPABASE_URL = "https://ppvncqbwfkubqmuehsfl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gasiCPaJ54I4G-2phqTlXg_5JL65S1j";
const TURNSTILE_SITE_KEY = "0x4AAAAAAF_IHt-c_RQfEGZW"; // public; the SECRET key lives only in the Supabase dashboard
const captchaEnabled = TURNSTILE_SITE_KEY !== "";
const REQUEST_TIMEOUT_MS = 10000;

// One small helper for every Supabase Auth call. Never throws: status 0 = no connection.
async function authFetch(path, { method = "POST", body, token } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const headers = { apikey: SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "omit",
      cache: "no-store",
      keepalive: true,
      signal: controller.signal,
    });
    let data = null;
    try { data = await res.json(); } catch { /* empty or not JSON */ }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  } finally {
    clearTimeout(timer);
  }
}

// Step 1: Supabase checks the CAPTCHA, then emails a code. Returns a result word.
async function sendLoginCode(email, captchaToken) {
  const r = await authFetch("otp", {
    body: { email, create_user: true, gotrue_meta_security: { captcha_token: captchaToken } },
  });
  if (r.ok) return "ok";
  const code = (r.data && r.data.error_code) || "";
  const msg = (r.data && (r.data.msg || r.data.message)) || "";
  if (code === "captcha_failed" || /captcha/i.test(msg)) return "captcha_failed";
  if (r.status === 429 || /rate_limit/.test(code)) return "rate_limited";
  if (code === "validation_failed" || code === "email_address_invalid") return "invalid_email";
  console.error("Could not send the code:", r.status, code, msg);
  return "unavailable";
}

function sessionFromResponse(d, email, signedInAt) {
  return {
    email: String((d.user && d.user.email) || email).toLowerCase(),
    signedInAt,
    accessToken: d.access_token,
    refreshToken: d.refresh_token,
    expiresAt: d.expires_at ? d.expires_at * 1000 : Date.now() + (d.expires_in || 3600) * 1000,
  };
}

// Step 2: Supabase checks the code and returns a real session.
async function checkLoginCode(email, code) {
  const r = await authFetch("verify", { body: { type: "email", email, token: code } });
  if (r.ok && r.data && r.data.access_token && r.data.refresh_token) {
    return { ok: true, session: sessionFromResponse(r.data, email, Date.now()) };
  }
  if (r.status === 429) return { ok: false, reason: "rate_limited" };
  if (r.status === 0 || r.status >= 500) return { ok: false, reason: "unavailable" };
  return { ok: false, reason: "invalid_code" };
}

// Asks Supabase whether the saved login is real. true / false / "offline".
// A forged value in localStorage fails here because the server rejects its token.
async function verifySession() {
  const user = auth.get();
  if (!user) return false;
  let token = user.accessToken;
  if (!user.expiresAt || user.expiresAt - Date.now() < 60000) {
    const r = await authFetch("token?grant_type=refresh_token", {
      body: { refresh_token: user.refreshToken },
    });
    if (r.status === 0) return "offline";
    if (!(r.ok && r.data && r.data.access_token)) return false;
    const next = sessionFromResponse(r.data, user.email, user.signedInAt);
    auth.set(next);
    token = next.accessToken;
  }
  const me = await authFetch("user", { method: "GET", token });
  if (me.status === 0) return "offline";
  return me.ok;
}

// Members-only pages stay hidden (boot.js) until the server confirms the login.
if (needsLogin && auth.get()) {
  verifySession().then((state) => {
    if (state === true) {
      document.documentElement.style.visibility = "";
      return;
    }
    if (state === false) auth.clear();
    window.location.replace("login.html");
  });
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

// Some browsers (private mode, strict settings) refuse to store anything
function storageWorks() {
  try {
    const probe = STORAGE_KEY + "_test";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const loginCard = document.getElementById("loginCard");
  const emailInput = document.getElementById("loginEmail");
  const emailField = document.getElementById("loginField");
  const codeStep = document.getElementById("codeStep");
  const codeInput = document.getElementById("loginCode");
  const codeField = document.getElementById("codeField");
  const codeActions = document.getElementById("codeActions");
  const changeEmail = document.getElementById("changeEmail");
  const leadEl = document.querySelector(".login-lead");
  const errorEl = document.getElementById("loginError");
  const submitBtn = document.getElementById("loginSubmit");
  const captchaBox = document.getElementById("captchaBox");
  const BLOCKED_MESSAGE =
    "Your browser is blocking site data, so we can't keep you logged in. Allow site data and try again.";
  const SEND_ERRORS = {
    captcha_failed: "The security check failed. Please try again.",
    invalid_email: "That email doesn't look right. Check it and try again.",
    rate_limited: "Too many tries. Please wait a few minutes and try again.",
    unavailable: "We couldn't send the code right now. Please try again in a minute.",
  };
  const CODE_ERRORS = {
    invalid_code: "That code is wrong or has expired. Check it, or use a different email to get a new one.",
    rate_limited: "Too many tries. Please wait a few minutes and try again.",
    unavailable: "We couldn't check the code right now. Please try again in a minute.",
  };

  let step = "email"; // "email" then "code"
  let submitting = false;
  let pendingEmail = "";
  let captchaToken = "";
  let captchaWidgetId = null;

  // Already logged in? Only offer the shortcut if the server confirms it.
  const saved = auth.get();
  if (saved && saved.email) {
    emailInput.value = saved.email;
    verifySession().then((state) => {
      const continueEl = document.getElementById("loginContinue");
      if (state === true && continueEl) continueEl.hidden = false;
    });
  }

  function showError(message) {
    const field = step === "code" ? codeField : emailField;
    const input = step === "code" ? codeInput : emailInput;
    errorEl.textContent = message;
    field.classList.add("has-error");
    input.setAttribute("aria-invalid", "true");
    input.focus();
  }

  function clearError() {
    errorEl.textContent = "";
    [[emailField, emailInput], [codeField, codeInput]].forEach(([f, i]) => {
      f.classList.remove("has-error");
      i.removeAttribute("aria-invalid");
    });
  }

  emailInput.addEventListener("input", clearError);
  codeInput.addEventListener("input", clearError);

  function updateSubmit() {
    submitBtn.disabled = submitting || (step === "email" && captchaEnabled && !captchaToken);
  }

  function resetCaptcha() {
    captchaToken = ""; // a token works once, so every new attempt needs a fresh one
    if (captchaWidgetId !== null && window.turnstile) window.turnstile.reset(captchaWidgetId);
    updateSubmit();
  }

  function setStep(next) {
    step = next;
    clearError();
    const isCode = next === "code";
    emailInput.readOnly = isCode;
    codeStep.hidden = !isCode;
    codeActions.hidden = !isCode;
    if (captchaBox) captchaBox.hidden = isCode || !captchaEnabled;
    submitBtn.textContent = isCode ? "Verify code" : "Log in";
    if (leadEl) {
      leadEl.textContent = isCode
        ? `We sent a code to ${pendingEmail}. Enter it below.`
        : "Enter your email and we'll send you a login code.";
    }
    if (isCode) {
      codeInput.value = "";
      codeInput.focus();
    } else {
      resetCaptcha();
      emailInput.focus();
    }
    updateSubmit();
  }

  // ----- CAPTCHA (Cloudflare Turnstile) -----
  function loadTurnstile() {
    return new Promise((resolve, reject) => {
      if (window.turnstile) return resolve();
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      // Do not call turnstile.ready() here: it throws for scripts added with async,
      // and scripts created by code are async by default.
      script.onload = () =>
        window.turnstile ? resolve() : reject(new Error("Turnstile did not load"));
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  if (leadEl) leadEl.textContent = "Enter your email and we'll send you a login code.";
  if (captchaEnabled && captchaBox) {
    captchaBox.hidden = false;
    loadTurnstile()
      .then(() => {
        captchaWidgetId = window.turnstile.render(captchaBox, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "light",
          size: captchaBox.clientWidth < 300 ? "compact" : "normal",
          callback: (token) => { captchaToken = token; updateSubmit(); },
          "expired-callback": () => { captchaToken = ""; updateSubmit(); },
          "error-callback": () => {
            captchaToken = "";
            updateSubmit();
            if (step === "email") showError("The security check could not run. Refresh the page and try again.");
          },
        });
      })
      .catch(() => {
        showError("The security check could not load. Check your connection and refresh the page.");
      });
  }
  updateSubmit();

  changeEmail.addEventListener("click", (e) => {
    e.preventDefault();
    if (!submitting) setStep("email");
  });

  // ----- sending the form -----
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (step === "email") {
      const email = emailInput.value.trim().toLowerCase();
      if (!email) return showError("Enter your email address.");
      if (!isValidEmail(email)) return showError("That email doesn't look right. Check it and try again.");
      if (captchaEnabled && !captchaToken) return showError("Please complete the security check first.");
      if (!storageWorks()) return showError(BLOCKED_MESSAGE);

      clearError();
      submitting = true;
      updateSubmit();
      submitBtn.textContent = "Sending code…";
      const result = await sendLoginCode(email, captchaToken);
      submitting = false;
      if (result === "ok") {
        pendingEmail = email;
        setStep("code");
        return;
      }
      submitBtn.textContent = "Log in";
      resetCaptcha();
      showError(SEND_ERRORS[result] || SEND_ERRORS.unavailable);
      return;
    }

    // step "code": the login is saved only if Supabase accepts the code
    const code = codeInput.value.replace(/\s/g, "");
    if (!/^\d{6,10}$/.test(code)) return showError("Enter the code from your email (numbers only).");

    clearError();
    submitting = true;
    updateSubmit();
    submitBtn.textContent = "Checking…";
    const result = await checkLoginCode(pendingEmail, code);
    submitting = false;
    submitBtn.textContent = "Verify code";
    updateSubmit();
    if (!result.ok) return showError(CODE_ERRORS[result.reason] || CODE_ERRORS.unavailable);

    if (!auth.set(result.session)) return showError(BLOCKED_MESSAGE);

    loginCard.classList.add("is-success");
    renderAuthLink();
    setTimeout(() => {
      window.location.href = "index.html";
    }, prefersReducedMotion ? 0 : 250);
  });
}
