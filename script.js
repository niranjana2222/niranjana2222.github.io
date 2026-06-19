// Scroll reveal
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
  { threshold: 0.06 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Mobile hamburger
const ham = document.querySelector('.nav-hamburger');
const navLinks = document.querySelector('.nav-links');
if (ham && navLinks) {
  ham.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    ham.setAttribute('aria-expanded', open);
    ham.textContent = open ? '✕' : '☰';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { navLinks.classList.remove('open'); ham.textContent = '☰'; }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { navLinks.classList.remove('open'); ham.textContent = '☰'; } });
}

// Back to top
const backTop = document.querySelector('.back-top');
if (backTop) {
  window.addEventListener('scroll', () => backTop.classList.toggle('visible', window.scrollY > 400), { passive: true });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ============ Custom Cursor ============
function initCursor() {
  const cursor = document.querySelector('.cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;

  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ============ Text Scramble ============
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';

function initScramble() {
  const heroH1 = document.querySelector('.hero h1');
  if (!heroH1) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const textNodes = [...heroH1.childNodes].filter(n => n.nodeType === 3);
        textNodes.forEach(node => {
          const original = node.textContent.trim();
          if (!original) return;
          let frame = 0;
          const totalFrames = 50;
          const iv = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const resolvedCount = Math.floor(progress * original.length);
            let out = '';
            for (let i = 0; i < original.length; i++) {
              out += i < resolvedCount ? original[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
            }
            node.textContent = out;
            if (frame >= totalFrames) { clearInterval(iv); node.textContent = original; }
          }, 16);
        });
        obs.disconnect();
      }
    });
  }, { threshold: 0.5 });
  obs.observe(heroH1);
}

// ============ Magnetic Buttons ============
function initMagneticButtons() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ============ Page Transitions ============
function initPageTransitions() {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(() => { window.location.href = href; }, 260);
    });
  });
  // Fade in on load
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '';
    });
  });
}

// ============ Init All ============
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScramble();
  initMagneticButtons();
  initPageTransitions();
});
