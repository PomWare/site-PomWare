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
    ad_storage: "denied",
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

  if (saved === "accepted") return updateConsent(true);
  if (saved === "rejected") return updateConsent(false);

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
function redirectTo404IfLikelyNotFound() {
  const path = window.location.pathname || "/";
  const file = path.split("/").pop() || "";

  if (file.includes(".")) return;
  if (path === "/" || path === "/index.html") return;
  if (path.endsWith("/404.html")) return;

  window.location.replace(`/404.html?path=${encodeURIComponent(path)}`);
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

  if (mobileMenuBtn.dataset.bound === "true") return;
  mobileMenuBtn.dataset.bound = "true";

  mobileMenuBtn.addEventListener("click", () => {
    const open = mainNav.classList.toggle("active");
    mobileMenuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    mobileMenuBtn.innerHTML = open ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  // Close menu only when clicking normal links (NOT dropdown toggle)
  mainNav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    // If it's the Technologies toggle, don't close
    if (a.classList.contains("dropdown-toggle")) return;

    // If it's inside dropdown, close after navigation
    mainNav.classList.remove("active");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
  });
}

// =======================
// Technologies dropdown (mobile click)
// =======================
function initTechDropdownMobile() {
  const dropdown = document.querySelector(".has-dropdown");
  const toggle = document.querySelector(".has-dropdown .dropdown-toggle");
  if (!dropdown || !toggle) return;

  const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

  // Avoid double binding
  if (toggle.dataset.bound === "true") return;
  toggle.dataset.bound = "true";

  toggle.addEventListener("click", (e) => {
    if (!isMobile()) return; // desktop uses hover
    e.preventDefault();

    dropdown.classList.toggle("open");
    toggle.setAttribute("aria-expanded", dropdown.classList.contains("open") ? "true" : "false");
  });

  window.addEventListener("resize", () => {
    if (!isMobile()) {
      dropdown.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
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
// Contact form
// =======================
function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  if (contactForm.dataset.bound === "true") return;
  contactForm.dataset.bound = "true";

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    console.log("Form submitted:", data);
    alert("Thank you for your message! We will get back to you soon.");
    contactForm.reset();

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
  if (exact) return exact.classList.add("active");

  if (current === "" || current === "index.html") {
    document.querySelector(`nav a[href="index.html"]`)?.classList.add("active");
  }
}

// =======================
// Boot (ONLY ONCE)
// =======================
document.addEventListener("DOMContentLoaded", async () => {
  redirectTo404IfLikelyNotFound();
  syncConsentFromStorage();

  await loadComponent("components/header.html", "header-placeholder");

  initMobileMenu();
  initTechDropdownMobile();
  initSmoothScrolling();
  initContactForm();
  setActiveNav();

  await loadComponent("components/footer.html", "footer-placeholder");

  ensureCookieBanner();
});
