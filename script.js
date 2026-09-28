// Scroll reveal
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
  { threshold: 0, rootMargin: '0px 0px 240px 0px' }
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
  const reveal = () => { document.body.style.opacity = ''; };
  requestAnimationFrame(() => requestAnimationFrame(reveal));
  // rAF never fires while the tab loads backgrounded/hidden, which would leave
  // the page stuck invisible — fall back to a timer and to visibility regaining.
  document.addEventListener('visibilitychange', reveal, { once: true });
  setTimeout(reveal, 400);
}

// ============ Scroll Progress Bar ============
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
  }, { passive: true });
}

// ============ Dark Mode Toggle ============
function initThemeToggle() {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    btn.textContent = saved === 'dark' ? '☀' : '☾';
  }
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    btn.textContent = next === 'dark' ? '☀' : '☾';
  });
}

// ============ Copy Email + Toast ============
function initEmailCopy() {
  const toast = document.querySelector('.toast');
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
      const email = link.getAttribute('href').replace('mailto:', '');
      navigator.clipboard.writeText(email).then(() => {
        if (!toast) return;
        toast.textContent = 'email copied ✓';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
      }).catch(() => {});
    });
  });
}

// ============ Stat Counter Animation ============
function initStatCounters() {
  const stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const hasPlus = raw.endsWith('+');
      const isDecimal = raw.includes('.');
      const target = parseFloat(raw.replace('+', ''));
      let start = null;
      const duration = 1200;
      function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = (isDecimal ? (ease * target).toFixed(1) : Math.floor(ease * target)) + (hasPlus ? '+' : '');
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = raw;
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  stats.forEach(el => obs.observe(el));
}

// ============ Tag Filtering (projects page) ============
function initTagFilter() {
  const entries = document.querySelectorAll('.project-entry');
  if (!entries.length) return;
  const allTags = document.querySelectorAll('.project-entry .tag');
  let active = null;
  allTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const label = tag.textContent.trim();
      if (active === label) {
        active = null;
        allTags.forEach(t => t.classList.remove('tag-active'));
        entries.forEach(e => e.classList.remove('tag-dimmed'));
        return;
      }
      active = label;
      allTags.forEach(t => t.classList.toggle('tag-active', t.textContent.trim() === label));
      entries.forEach(entry => {
        const has = [...entry.querySelectorAll('.tag')].some(t => t.textContent.trim() === label);
        entry.classList.toggle('tag-dimmed', !has);
      });
    });
  });
}

// ============ Console Easter Egg ============
function initConsoleEgg() {
  console.log('%cP(you opened devtools) ≈ 1.00', 'color:#2E6F40; font-weight:700; font-size:14px;');
  console.log('%chi, I\'m Niranjana. Say hello: niranjana.sankar@berkeley.edu', 'color:#3d6878; font-size:12px;');
}

// ============ Boot Terminal (about page) ============
function initBootTerminal() {
  const el = document.getElementById('about-term');
  const labelEl = document.getElementById('about-term-label');
  const nextBtn = document.getElementById('about-term-next');
  if (!el) return;

  function dotted(label, value, width) {
    const dots = '.'.repeat(Math.max(3, width - label.length));
    return '  ' + label + ' ' + dots + ' ' + value;
  }

  const SCREENS = ['education', 'skills', 'session'];

  const LINES = {
    session: [
      { text: '$ boot --profile niranjana', cls: 'term-cmd' },
      { text: '  interpretability ........ ok' },
      { text: '  multimodal ml ........... ok' },
      { text: '  production systems ...... ok' },
      { text: '  research ................ ok' },
      { text: '→ ready to serve', cls: 'term-final' },
    ],
    education: [
      { text: '$ cat education.log', cls: 'term-cmd' },
      { text: dotted('school', 'UC Berkeley', 20) },
      { text: dotted('degree', 'B.S. EECS', 20) },
      { text: dotted('expected', 'May 2029', 20) },
      { text: dotted('gpa', '4.0', 20) },
      { text: dotted('orgs', 'SAAS, AWE, Blueprint, Berkeley NLP', 20), cls: 'term-final' },
    ],
    skills: [
      { text: '$ cat skills.log', cls: 'term-cmd' },
      { text: dotted('languages', 'Python, Java, SQL, JavaScript, React, Scheme', 20) },
      { text: dotted('ml stack', 'PyTorch, TensorFlow, HuggingFace, LangChain, LangGraph, Scikit-learn, Pandas, OpenCV, Vertex AI', 20) },
      { text: dotted('achievements', 'USACO Gold, AIME Qualifier', 20), cls: 'term-final' },
    ],
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let screenIdx = 0;
  let cycleToken = 0;

  function cursorEl() {
    const s = document.createElement('span');
    s.className = 'term-cursor';
    return s;
  }

  function renderStatic(screen) {
    el.textContent = '';
    LINES[screen].forEach(line => {
      const row = document.createElement('div');
      if (line.cls) row.className = line.cls;
      row.textContent = line.text;
      el.appendChild(row);
    });
  }

  function typeScreen(screen, token) {
    const lines = LINES[screen];
    let li = 0, ci = 0;
    function step() {
      if (token !== cycleToken) return;
      if (li >= lines.length) {
        if (screen !== 'session') return;
        setTimeout(() => {
          if (token !== cycleToken) return;
          el.textContent = ''; li = 0; ci = 0; step();
        }, 2400);
        return;
      }
      const line = lines[li];
      if (ci === 0) {
        const row = document.createElement('div');
        if (line.cls) row.className = line.cls;
        el.appendChild(row);
      }
      const row = el.lastElementChild;
      ci++;
      const done = ci >= line.text.length;
      row.textContent = line.text.slice(0, ci);
      if (!done) row.appendChild(cursorEl());
      if (!done) {
        setTimeout(step, 14 + Math.random() * 22);
      } else {
        li++; ci = 0;
        setTimeout(step, li === 1 ? 260 : 140);
      }
    }
    step();
  }

  function showScreen(screen) {
    cycleToken++;
    const token = cycleToken;
    if (labelEl) labelEl.textContent = screen;
    el.textContent = '';
    if (reduceMotion) {
      renderStatic(screen);
      return;
    }
    typeScreen(screen, token);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      screenIdx = (screenIdx + 1) % SCREENS.length;
      showScreen(SCREENS[screenIdx]);
    });
  }

  showScreen(SCREENS[screenIdx]);
}

// ============ Init All ============
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScramble();
  initMagneticButtons();
  initPageTransitions();
  initScrollProgress();
  initThemeToggle();
  initEmailCopy();
  initStatCounters();
  initTagFilter();
  initConsoleEgg();
  initBootTerminal();
});
