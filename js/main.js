// =======================
// CONFIG
// =======================
const CONSENT_KEY = "pomware_cookie_consent_v1";

// =======================
// GA Consent helpers (GA tag must be in <head> of each page)
// =======================
function updateConsent(granted) {
  if (typeof window.gtag !== "function") return;

  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied"
  });
}

function syncConsentFromStorage() {
  const saved = localStorage.getItem(CONSENT_KEY);
  if (saved === "accepted") updateConsent(true);
  if (saved === "rejected") updateConsent(false);
}

// =======================
// Cookie Banner
// =======================
function ensureCookieBanner() {
  const saved = localStorage.getItem(CONSENT_KEY);

  // If user already decided, just apply consent and exit
  if (saved === "accepted") {
    updateConsent(true);
    return;
  }
  if (saved === "rejected") {
    updateConsent(false);
    return;
  }

  // Prevent duplicates
  if (document.getElementById("cookie-banner")) return;

  const banner = document.createElement("div");
  banner.id = "cookie-banner";
  banner.className = "cookie-banner";
  banner.innerHTML = `
    <div class="cookie-banner__content">
      <div class="cookie-banner__text">
        <strong>Cookies</strong>
        <span>
          We use analytics cookies to understand traffic and improve the website.
          You can accept or reject analytics cookies.
        </span>
      </div>
      <div class="cookie-banner__actions">
        <button class="outline-button cookie-btn" id="cookie-reject" type="button">Reject</button>
        <button class="cta-button cookie-btn" id="cookie-accept" type="button">Accept</button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById("cookie-accept")?.addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    updateConsent(true);
    banner.remove();
  });

  document.getElementById("cookie-reject")?.addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    updateConsent(false);
    banner.remove();
  });
}

// =======================
// 404 redirect helper (static hosting)
// =======================
// If a user lands on a "pretty URL" folder like /services (no .html),
// redirect them to /404.html and pass the attempted path.
function redirectTo404IfLikelyNotFound() {
  const path = window.location.pathname || "/";
  const file = path.split("/").pop() || "";

  // If it already looks like a file (/something.html, /file.css, etc.), do nothing
  if (file.includes(".")) return;

  // If root, do nothing
  if (path === "/" || path === "/index.html") return;

  // If we're already on 404, do nothing
  if (path.endsWith("/404.html")) return;

  // Redirect
  const target = `/404.html?path=${encodeURIComponent(path)}`;
  window.location.replace(target);
}

// =======================
// Component loader
// =======================
async function loadComponent(url, placeholderId) {
  const el = document.getElementById(placeholderId);
  if (!el) return false;

  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      console.warn(`Failed to load ${url}: ${res.status}`);
      return false;
    }
    el.innerHTML = await res.text();
    return true;
  } catch (err) {
    console.warn(`Error loading ${url}`, err);
    return false;
  }
}

// =======================
// Mobile menu toggle
// =======================
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mainNav = document.getElementById("mainNav");

  if (!mobileMenuBtn || !mainNav) return;

  // Avoid double-binding
  if (mobileMenuBtn.dataset.bound === "true") return;
  mobileMenuBtn.dataset.bound = "true";

  mobileMenuBtn.addEventListener("click", () => {
    mainNav.classList.toggle("active");
    mobileMenuBtn.innerHTML = mainNav.classList.contains("active")
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  // Close mobile menu when clicking on a link
  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("active");
      mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
}

// =======================
// Smooth scrolling (same-page anchors only)
// =======================
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// =======================
// Contact form handling
// =======================
function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  // Avoid double-binding
  if (contactForm.dataset.bound === "true") return;
  contactForm.dataset.bound = "true";

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    console.log("Form submitted:", data);
    alert("Thank you for your message! We will get back to you soon.");
    contactForm.reset();

    // Optional GA event (only if consent accepted)
    if (localStorage.getItem(CONSENT_KEY) === "accepted" && typeof window.gtag === "function") {
      window.gtag("event", "contact_form_submit", { page_path: location.pathname });
    }
  });
}

// =======================
// Nav active state
// =======================
function setActiveNav() {
  const current = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("nav a").forEach((a) => a.classList.remove("active"));

  const exact = document.querySelector(`nav a[href="${current}"]`);
  if (exact) {
    exact.classList.add("active");
    return;
  }

  // For root
  if (current === "" || current === "index.html") {
    const home = document.querySelector(`nav a[href="index.html"]`);
    if (home) home.classList.add("active");
  }
}

// =======================
// Boot
// =======================
document.addEventListener("DOMContentLoaded", async () => {
  // If user hit a "folder URL" that doesn't exist on static hosting, push to 404
  redirectTo404IfLikelyNotFound();

  // Apply stored consent (if user already decided previously)
  syncConsentFromStorage();

  // Load header first so nav exists before bindings
  await loadComponent("components/header.html", "header-placeholder");

  initMobileMenu();
  initSmoothScrolling();
  initContactForm();
  setActiveNav();

  // Load footer after
  await loadComponent("components/footer.html", "footer-placeholder");

  // Show cookie banner if needed
  ensureCookieBanner();
});
