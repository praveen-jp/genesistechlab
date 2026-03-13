// =============================================
// Genesis Tech Lab - Main JS Utilities
// =============================================

// =============================================
// PAGE LOADER
// =============================================
function hideLoader(delay = 1000){
  const loader = document.getElementById("page-loader");

  if(!loader) return;

  setTimeout(()=>{
      loader.style.opacity = "0";
      loader.style.pointerEvents = "none";

      setTimeout(()=>{
        loader.style.display="none";
      },400);

  },delay);
}
// function hideLoader(delay = 1200) {
//   setTimeout(() => {
//     const loader = document.getElementById("page-loader");
//     if (loader) loader.classList.add("hidden");
//   }, delay);
// }
// window.addEventListener("load", () => {
//   const loader = document.getElementById("page-loader");
//   if(loader){
//     setTimeout(()=>{
//       loader.style.opacity = "0";
//       loader.style.pointerEvents = "none";
//       setTimeout(()=> loader.style.display="none",500);
//     },1200);
//   }
// });

// document.addEventListener("DOMContentLoaded", () => {
//   hideLoader(500); 
// });
// =============================================
// MOBILE HAMBURGER MENU
// =============================================
function initMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobile-nav");
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener("click", () => {
    mobileNav.classList.toggle("open");
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove("open");
    }
  });
}

// =============================================
// ACTIVE NAV LINK
// =============================================
// function setActiveNavLink() {
//   const current = window.location.pathname;
//   document.querySelectorAll(".nav-links a, .mobile-nav a").forEach(link => {
//     const href = link.getAttribute("href");
//     if (href && (current.endsWith(href) || (href === "/index.html" && current === "/"))) {
//       link.classList.add("active");
//     } else {
//       link.classList.remove("active");
//     }
//   });
// }
function setActiveNavLink() {
  const page = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a, .mobile-nav a").forEach(link => {
    const href = link.getAttribute("href");

    if (href === page) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// =============================================
// SCROLL ANIMATIONS
// =============================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));
}

// =============================================
// NAVBAR SCROLL EFFECT
// =============================================
function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar.style.background = "rgba(15, 23, 42, 0.97)";
    } else {
      navbar.style.background = "rgba(15, 23, 42, 0.85)";
    }
  });
}

// =============================================
// SMOOTH COUNTER ANIMATION (for stats)
// =============================================
function animateCounter(el, target, duration = 1500) {
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased) + (el.dataset.suffix || "");
    if (progress < 1) requestAnimationFrame(update);
  }
  
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = "true";
        animateCounter(entry.target, parseInt(entry.target.dataset.counter));
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// =============================================
// CONTACT FORM HANDLER
// =============================================
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("[type=submit]");
    const alert = document.getElementById("form-alert");
    
    btn.disabled = true;
    btn.textContent = "Sending...";

    // In production, you'd send this to Firebase or an email service
    // For now, simulate a delay
    await new Promise(r => setTimeout(r, 1200));

    if (alert) {
      alert.className = "alert alert-success";
      alert.innerHTML = "✓ Message sent! We'll get back to you soon.";
      alert.style.display = "flex";
    }
    form.reset();
    btn.disabled = false;
    btn.textContent = "Send Message";
  });
}

// =============================================
// PASSWORD STRENGTH INDICATOR
// =============================================
function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 1) return { level: "weak", color: "#ef4444", label: "Weak" };
  if (score <= 3) return { level: "medium", color: "#f59e0b", label: "Medium" };
  return { level: "strong", color: "#22c55e", label: "Strong" };
}

// =============================================
// INIT ALL
// =============================================
// function initAll() {
//   hideLoader();
//   initMobileMenu();
//   setActiveNavLink();
//   initScrollAnimations();
//   initNavbarScroll();
//   initCounters();
//   initContactForm();
// }

// // Auto-init on DOM ready
// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", initAll);
// } else {
//   initAll();
// }
function initAll() {
  hideLoader();
  initMobileMenu();
  setActiveNavLink();
  initScrollAnimations();
  initNavbarScroll();
  initCounters();
  initContactForm();
}

document.addEventListener("DOMContentLoaded", initAll);

export { hideLoader, initScrollAnimations, checkPasswordStrength, initAll };
