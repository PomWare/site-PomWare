// =======================
// CONFIG
// =======================
const GA_MEASUREMENT_ID = "G-05XWMXZNT"; // <-- your GA4 ID
const CONSENT_KEY = "pomware_cookie_consent_v1"; // localStorage key

// =======================
// Google Analytics + Consent Mode
// =======================
function injectGoogleTagOnce() {
  if (!GA_MEASUREMENT_ID) return;

  // Prevent double-injection
  if (document.getElementById("ga-gtag-loader")) return;

  // 1) gtag loader
  const s1 = document.createElement("script");
  s1.id = "ga-gtag-loader";
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(s1);

  // 2) gtag init
  const s2 = document.createElement("script");
  s2.id = "ga-gtag-init";
  s2.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    // Default consent (EEA/GDPR-friendly)
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied'
    });

    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}', {
      // optional: reduce data until consent
      'anonymize_ip': true
    });
  `;
  document.head.appendChild(s2);
}

function updateConsent(granted) {
  if (typeof window.gtag !== "function") return;

  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied" // keep ads denied unless you actually run ads
  });
}

// =======================
// Cookie Banner
// =======================
function ensureCookieBanner() {
  // Already decided?
  const saved = localStorage.getItem(CONSENT_KEY);
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
          We use cookies to understand traffic and improve the website. You can accept or reject analytics cookies.
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

// ---------- Component loader ----------
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

// ---------- Mobile menu toggle ----------
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');

    if (mobileMenuBtn && mainNav) {
        // Avoid double-binding if init is called multiple times
        if (mobileMenuBtn.dataset.bound === "true") return;
        mobileMenuBtn.dataset.bound = "true";

        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuBtn.innerHTML = mainNav.classList.contains('active')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
}

// ---------- Smooth scrolling for same-page anchor links only ----------
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === "#") return;

            const target = document.querySelector(href);
            // Only prevent default if the target exists on this page
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ---------- Contact form handling ----------
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        // Avoid double-binding
        if (contactForm.dataset.bound === "true") return;
        contactForm.dataset.bound = "true";

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            // Here you would typically send the data to a server
            console.log('Form submitted:', data);

            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
}

// ---------- Nav active state (optional but nice) ----------
function setActiveNav() {
    // Example: careers.html -> mark nav link with href="careers.html" as active (if exists)
    const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));

    // Try exact match first
    const exact = document.querySelector(`nav a[href="${current}"]`);
    if (exact) {
        exact.classList.add('active');
        return;
    }

    // Fallback: if you're on index.html and URL has hash, highlight "Home" if present
    if (current === 'index.html') {
        const home = document.querySelector(`nav a[href="index.html"]`);
        if (home) home.classList.add('active');
    }
}

// ---------- Boot ----------
document.addEventListener('DOMContentLoaded', async function () {
    // Load header first so nav elements exist before binding events
    await loadComponent('components/header.html', 'header-placeholder');
    initMobileMenu();
    initSmoothScrolling();
    initContactForm();
    setActiveNav();

    // Footer can load after
    await loadComponent('components/footer.html', 'footer-placeholder');
});
