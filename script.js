const REQUIRE_LOGIN = true;
const STORAGE_KEY = window.ACP_STORAGE_KEY || "acpStudioUser";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

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
    }
  },
};

// Language helper (i18n.js loads first). t("key") returns the text in the current language.
const i18n = window.ACP_I18N;
const t = (key, vars) => (i18n ? i18n.t(key, vars) : key);

const isPublicPage = document.documentElement.dataset.access === "public";
const isLoginPage = document.body.classList.contains("login-page");
const isSoonPage = document.body.classList.contains("soon-page");
const needsLogin = REQUIRE_LOGIN && !isPublicPage;

if (!auth.get()) auth.clear();

if (needsLogin && !auth.get()) {
  window.location.replace("login.html");
}

window.addEventListener("pageshow", (e) => {
  if (e.persisted && needsLogin && !auth.get()) {
    window.location.replace("login.html");
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && needsLogin && !auth.get()) {
    window.location.replace("login.html");
  }
});

window.addEventListener("storage", (e) => {
  if (e.key !== null && e.key !== STORAGE_KEY) return;
  if (needsLogin && !auth.get()) {
    window.location.replace("login.html");
    return;
  }
  renderAuthLink();
  syncIslandLock();
});

const dynamicIsland = document.getElementById("dynamicIsland");
const islandNav = document.getElementById("islandNav");

let isExpanded = false;

function canUseIsland() {
  return !REQUIRE_LOGIN || !!auth.get();
}

function setExpanded(next) {
  if (next && !canUseIsland()) return;
  if (next === isExpanded) return;
  isExpanded = next;
  dynamicIsland.classList.toggle("expanded", isExpanded);
  islandNav.classList.toggle("active", isExpanded);
}

function syncIslandLock() {
  const locked = !canUseIsland();
  dynamicIsland.classList.toggle("is-locked", locked);
  document.documentElement.setAttribute("data-auth", locked ? "out" : "in");
  if (locked) {
    dynamicIsland.removeAttribute("tabindex");
    setExpanded(false);
  } else {
    dynamicIsland.setAttribute("tabindex", "0");
  }
}

syncIslandLock();

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

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isExpanded) {
    setExpanded(false);
  }
});

document.addEventListener("click", (e) => {
  if (isExpanded && !dynamicIsland.contains(e.target)) {
    setExpanded(false);
  }
});

dynamicIsland.addEventListener("click", (e) => {
  e.stopPropagation();
  if (canHover) return;
  if (e.target.closest(".lang-toggle")) return;
  if (!e.target.closest("a")) {
    setExpanded(!isExpanded);
  } else {
    setExpanded(false);
  }
});

const islandSection = document.getElementById("islandSection");

if (islandSection && !isLoginPage && !isSoonPage) {
  const SECTIONS = [
    ["home", "island_home"],
    ["projects", "island_projects"],
    ["studio", "island_studio"],
    ["contact", "island_contact"],
  ];
  let shownKey = SECTIONS[0][1];
  islandSection.textContent = t(shownKey);
  let swapTimer;
  let ticking = false;

  function currentSectionLabel() {
    const line = window.innerHeight * 0.4;
    let label = SECTIONS[0][1];
    for (const [id, name] of SECTIONS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) label = name;
    }
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;
    return atBottom ? SECTIONS[SECTIONS.length - 1][1] : label;
  }

  function updateIslandLabel() {
    ticking = false;
    const next = currentSectionLabel();
    if (next === shownKey) return;
    shownKey = next;
    clearTimeout(swapTimer);
    islandSection.classList.add("is-swapping");
    swapTimer = setTimeout(() => {
      islandSection.textContent = t(next);
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
  document.addEventListener("acp:langchange", () => {
    clearTimeout(swapTimer);
    islandSection.classList.remove("is-swapping");
    islandSection.textContent = t(shownKey);
  });
  updateIslandLabel();
}

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

  document.querySelectorAll(".fade-in-up").forEach((el) => {
    observer.observe(el);
  });
} else {
  document.querySelectorAll(".fade-in-up").forEach((el) => {
    el.classList.add("visible");
  });
}

let scrollFrame = 0;

function cancelSmoothScroll() {
  if (!scrollFrame) return;
  cancelAnimationFrame(scrollFrame);
  scrollFrame = 0;
  document.documentElement.style.scrollBehavior = "";
}

["wheel", "touchstart", "mousedown", "keydown"].forEach((type) =>
  window.addEventListener(type, cancelSmoothScroll, { passive: true }),
);

function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2;
}

function smoothScrollTo(target) {
  cancelSmoothScroll();
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const startY = window.scrollY;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const endY = Math.min(
    Math.max(target.getBoundingClientRect().top + startY - margin, 0),
    maxY,
  );
  const distance = endY - startY;

  if (prefersReducedMotion || Math.abs(distance) < 2) {
    window.scrollTo(0, endY);
    return;
  }

  const duration = Math.min(1900, Math.max(1000, Math.abs(distance) * 0.75));
  const root = document.documentElement;
  const t0 = performance.now();
  root.style.scrollBehavior = "auto";

  const step = (now) => {
    const p = Math.min((now - t0) / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutQuart(p));
    if (p < 1) {
      scrollFrame = requestAnimationFrame(step);
    } else {
      scrollFrame = 0;
      root.style.scrollBehavior = "";
    }
  };
  scrollFrame = requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href !== "#") {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) smoothScrollTo(target);
    }
  });
});

const authLink = document.getElementById("authLink");

function renderAuthLink() {
  if (!authLink) return;
  const user = auth.get();
  if (user && user.email) {
    authLink.textContent = t("auth_logout");
    authLink.setAttribute("href", "#");
    authLink.title = t("auth_signed_in_as", { email: user.email });
    authLink.removeAttribute("aria-current");
    authLink.classList.add("is-logout");
  } else {
    authLink.textContent = t("auth_login");
    authLink.setAttribute("href", "login.html");
    authLink.removeAttribute("title");
    authLink.classList.remove("is-logout");
  }
}

function confirmLogout(email) {
  if (document.querySelector(".confirm-overlay.open")) return Promise.resolve(false);

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <div class="confirm-card" role="alertdialog" aria-modal="true"
           aria-labelledby="confirmTitle" aria-describedby="confirmText">
        <h2 id="confirmTitle">${t("confirm_title")}</h2>
        <p id="confirmText"></p>
        <div class="confirm-actions">
          <button type="button" class="btn btn-glass" data-answer="no">${t("confirm_no")}</button>
          <button type="button" class="btn btn-danger" data-answer="yes">${t("confirm_yes")}</button>
        </div>
      </div>`;
    overlay.querySelector("#confirmText").textContent =
      t("confirm_text", { email });

    const noBtn = overlay.querySelector('[data-answer="no"]');
    const yesBtn = overlay.querySelector('[data-answer="yes"]');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.appendChild(overlay);

    function close(answer) {
      document.removeEventListener("keydown", onKeydown);
      document.body.style.overflow = previousOverflow;
      overlay.classList.remove("open");
      setTimeout(() => overlay.remove(), 1000);
      resolve(answer);
    }

    function onKeydown(e) {
      if (e.key === "Escape") {
        close(false);
      } else if (e.key === "Tab") {
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

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        overlay.classList.add("open");
        noBtn.focus();
      }),
    );
  });
}

function performLogout() {
  const user = auth.get();
  if (user && user.accessToken) {
    authFetch("logout", { token: user.accessToken });
  }
  auth.clear();
  renderAuthLink();
  syncIslandLock();
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
  document.addEventListener("acp:langchange", renderAuthLink);
}

const SUPABASE_URL = "https://ppvncqbwfkubqmuehsfl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gasiCPaJ54I4G-2phqTlXg_5JL65S1j";
const TURNSTILE_SITE_KEY = "0x4AAAAAAF_IHt-c_RQfEGZW";
const captchaEnabled = TURNSTILE_SITE_KEY !== "";
const REQUEST_TIMEOUT_MS = 10000;

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
    try { data = await res.json(); } catch {  }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  } finally {
    clearTimeout(timer);
  }
}

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

async function checkLoginCode(email, code) {
  const r = await authFetch("verify", { body: { type: "email", email, token: code } });
  if (r.ok && r.data && r.data.access_token && r.data.refresh_token) {
    return { ok: true, session: sessionFromResponse(r.data, email, Date.now()) };
  }
  if (r.status === 429) return { ok: false, reason: "rate_limited" };
  if (r.status === 0 || r.status >= 500) return { ok: false, reason: "unavailable" };
  return { ok: false, reason: "invalid_code" };
}

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

const EMAIL_LOCAL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const EMAIL_DOMAIN =
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const EMAIL_TLD = /\.(?:[a-z]{2,}|xn--[a-z0-9-]{2,})$/;

function isValidEmail(email) {
  if (typeof email !== "string" || email.length < 6 || email.length > 254) {
    return false;
  }
  const at = email.lastIndexOf("@");
  if (at < 1 || at > 64) return false;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return false;
  }
  return EMAIL_LOCAL.test(local) && EMAIL_DOMAIN.test(domain) && EMAIL_TLD.test(domain);
}

// Arabic keyboards can type ٠١٢٣٤٥٦٧٨٩ (or ۰۱۲۳۴۵۶۷۸۹); turn them into 0-9 for the code check.
function normalizeDigits(text) {
  return text
    .replace(/[\u0660-\u0669]/g, (d) => d.charCodeAt(0) - 0x0660)
    .replace(/[\u06F0-\u06F9]/g, (d) => d.charCodeAt(0) - 0x06F0);
}

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
  // message keys (the texts are in i18n.js)
  const SEND_ERRORS = {
    captcha_failed: "err_captcha_failed",
    invalid_email: "err_invalid_email",
    rate_limited: "err_rate_limited",
    unavailable: "err_unavailable_send",
  };
  const CODE_ERRORS = {
    invalid_code: "err_invalid_code",
    rate_limited: "err_rate_limited",
    unavailable: "err_unavailable_code",
  };

  let step = "email";
  let submitting = false;
  let pendingEmail = "";
  let captchaToken = "";
  let captchaWidgetId = null;
  let captchaLang = "en";
  let submitKey = "login_submit";

  function setSubmitLabel(key) {
    submitKey = key;
    submitBtn.textContent = t(key);
  }

  function renderLead() {
    if (!leadEl) return;
    leadEl.textContent =
      step === "code" ? t("login_lead_code", { email: pendingEmail }) : t("login_lead_email");
  }

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
    field.classList.remove("has-error");
    void field.offsetWidth;
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
    captchaToken = "";
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
    setSubmitLabel(isCode ? "login_verify" : "login_submit");
    renderLead();
    if (isCode) {
      codeInput.value = "";
      codeInput.focus();
    } else {
      if (captchaWidgetId !== null && i18n && captchaLang !== i18n.lang()) renderCaptcha();
      else resetCaptcha();
      emailInput.focus();
    }
    updateSubmit();
  }

  function loadTurnstile() {
    return new Promise((resolve, reject) => {
      if (window.turnstile) return resolve();
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.onload = () =>
        window.turnstile ? resolve() : reject(new Error("Turnstile did not load"));
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  renderLead();
  setSubmitLabel("login_submit");

  // (Re)draws the Cloudflare check, in the page language.
  function renderCaptcha() {
    if (!window.turnstile) return;
    if (captchaWidgetId !== null) {
      try {
        window.turnstile.remove(captchaWidgetId);
      } catch {
      }
      captchaWidgetId = null;
    }
    captchaToken = "";
    captchaLang = i18n ? i18n.lang() : "en";
    captchaWidgetId = window.turnstile.render(captchaBox, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "light",
      language: captchaLang === "ar" ? "ar-eg" : "en",
      size: captchaBox.clientWidth < 300 ? "compact" : "normal",
      callback: (token) => { captchaToken = token; updateSubmit(); },
      "expired-callback": () => { captchaToken = ""; updateSubmit(); },
      "error-callback": () => {
        captchaToken = "";
        updateSubmit();
        if (step === "email") showError(t("err_captcha_run"));
      },
    });
    updateSubmit();
  }

  if (captchaEnabled && captchaBox) {
    captchaBox.hidden = false;
    loadTurnstile()
      .then(renderCaptcha)
      .catch(() => {
        showError(t("err_captcha_load"));
      });
  }

  document.addEventListener("acp:langchange", () => {
    clearError();
    renderLead();
    submitBtn.textContent = t(submitKey);
    if (captchaWidgetId !== null && step === "email") renderCaptcha();
  });
  updateSubmit();

  changeEmail.addEventListener("click", (e) => {
    e.preventDefault();
    if (!submitting) setStep("email");
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (step === "email") {
      const email = emailInput.value.trim().toLowerCase();
      if (!email) return showError(t("err_enter_email"));
      if (!isValidEmail(email)) return showError(t("err_invalid_email"));
      if (captchaEnabled && !captchaToken) return showError(t("err_captcha_first"));
      if (!storageWorks()) return showError(t("err_blocked"));

      clearError();
      submitting = true;
      updateSubmit();
      setSubmitLabel("login_sending");
      const result = await sendLoginCode(email, captchaToken);
      submitting = false;
      if (result === "ok") {
        pendingEmail = email;
        setStep("code");
        return;
      }
      setSubmitLabel("login_submit");
      resetCaptcha();
      showError(t(SEND_ERRORS[result] || SEND_ERRORS.unavailable));
      return;
    }

    const code = normalizeDigits(codeInput.value).replace(/\s/g, "");
    if (!/^\d{6,10}$/.test(code)) return showError(t("err_code_format"));

    clearError();
    submitting = true;
    updateSubmit();
    setSubmitLabel("login_checking");
    const result = await checkLoginCode(pendingEmail, code);
    submitting = false;
    setSubmitLabel("login_verify");
    updateSubmit();
    if (!result.ok) return showError(t(CODE_ERRORS[result.reason] || CODE_ERRORS.unavailable));

    if (!auth.set(result.session)) return showError(t("err_blocked"));

    loginCard.classList.add("is-success");
    renderAuthLink();
    setTimeout(() => {
      window.location.href = "closing.html";
    }, prefersReducedMotion ? 0 : 700);
  });
}
