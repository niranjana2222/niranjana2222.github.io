// Item 5: Keyboard / reduced-motion accessibility — reveal immediately if motion is reduced
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion) {
  document.querySelectorAll(".reveal").forEach((el) => {
    el.classList.add("visible");
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}

// Whimsy 4: Section-label number counting animation helper
function animateSectionNumber(el) {
  const raw = el.getAttribute("data-n") || "";
  const target = parseInt(raw, 10);
  if (isNaN(target)) return;
  const pad = raw.length; // e.g. "01" has length 2
  const steps = 5;
  const stepMs = 40;
  let current = 0;
  el.setAttribute("data-n", "0".padStart(pad, "0"));
  const tick = setInterval(() => {
    current += Math.ceil(target / steps);
    if (current >= target) {
      current = target;
      clearInterval(tick);
    }
    el.setAttribute("data-n", String(current).padStart(pad, "0"));
  }, stepMs);
}

// Scroll-reveal animation (also triggers section-label counter)
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Whimsy 4: animate section-label numbers when they scroll in
        if (!prefersReducedMotion && entry.target.classList.contains("section-label")) {
          animateSectionNumber(entry.target);
        }
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
// Also observe section labels (they are not .reveal elements themselves)
document.querySelectorAll(".section-label[data-n]").forEach((el) => observer.observe(el));

// Whimsy 1: Cursor glow — skip on touch devices
(function () {
  if (window.matchMedia("(hover: none)").matches) return; // touch device
  const glow = document.querySelector(".cursor-glow");
  if (!glow) return;

  let mouseX = -999, mouseY = -999;
  let glowX = -999, glowY = -999;
  let raf;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.opacity = "1";
  }, { passive: true });

  document.addEventListener("mouseleave", () => {
    glow.style.opacity = "0";
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function frame() {
    glowX = lerp(glowX, mouseX, 0.1);
    glowY = lerp(glowY, mouseY, 0.1);
    glow.style.left = glowX + "px";
    glow.style.top  = glowY + "px";
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
})();

// Whimsy 2: Card tilt effect on mousemove — skipped if reduced motion
(function () {
  if (prefersReducedMotion) return;

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const maxRot = 4; // degrees
      const rotY =  (dx / (rect.width  / 2)) * maxRot;
      const rotX = -(dy / (rect.height / 2)) * maxRot;
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-3px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();

// Mobile hamburger menu
(function () {
  const btn = document.querySelector(".nav-hamburger");
  const links = document.querySelector(".nav-links");
  if (!btn || !links) return;

  btn.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen);
    btn.textContent = isOpen ? "✕" : "☰";
  });

  // Close menu when a nav link is tapped
  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "☰";
    });
  });

  // Close menu on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && links.classList.contains("open")) {
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "☰";
      btn.focus();
    }
  });
})();

// Item 3: Smooth page exit transition on internal nav clicks
(function () {
  const mainEl = document.querySelector("main");
  if (!mainEl) return;

  // Determine current origin for same-origin check
  const origin = window.location.origin;

  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    // Only internal links: relative paths or same origin, exclude mailto/tel/hash-only
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return;

    let isInternal = false;
    try {
      const url = new URL(href, window.location.href);
      isInternal = url.origin === origin;
    } catch (_) { /* ignore */ }

    if (!isInternal) return;

    a.addEventListener("click", (e) => {
      // Skip if modifier key held (open in new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const target = a.href;
      // Skip if reduced motion is preferred
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.location.href = target;
        return;
      }
      mainEl.classList.add("page-exit");
      setTimeout(() => { window.location.href = target; }, 250);
    });
  });
})();

// Item 4: Back-to-top button
(function () {
  const btn = document.querySelector(".back-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
