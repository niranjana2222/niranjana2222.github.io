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

  const SCREENS = ['session', 'education', 'skills'];

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

// ============ Project / Publication Detail Modal ============
function initDetailModals() {
  const scrim = document.getElementById('detail-scrim');
  const modal = document.getElementById('detail-modal');
  const body = document.getElementById('detail-body');
  const countEl = document.getElementById('detail-count');
  const prevBtn = document.getElementById('detail-prev');
  const nextBtn = document.getElementById('detail-next');
  const closeBtn = document.getElementById('detail-close');
  if (!scrim || !modal || !body) return;

  function collect(group) {
    if (group === 'publications') {
      const grid = document.querySelector('.card-grid[data-group="publications"]');
      if (!grid) return [];
      return [...grid.querySelectorAll('.card-pub')].map(card => ({
        kind: (card.querySelector('.card-kind') || {}).textContent?.trim() || '',
        title: (card.querySelector('.entry-open') || {}).textContent?.trim() || '',
        text: (card.querySelector('p') || {}).innerHTML?.trim() || '',
        tags: [...card.querySelectorAll('.tags .tag')].map(t => t.textContent.trim()),
      }));
    }
    const list = document.querySelector('.project-list[data-group="' + group + '"]');
    if (!list) return [];
    return [...list.querySelectorAll('.project-entry')].map(entry => {
      const linkEl = entry.querySelector('.card-link');
      return {
        meta: (entry.querySelector('.project-meta') || {}).textContent?.trim() || '',
        title: (entry.querySelector('.entry-open') || {}).textContent?.trim() || '',
        items: [...entry.querySelectorAll('.project-desc li')].map(li => li.innerHTML.trim()),
        tags: [...entry.querySelectorAll('.tags .tag')].map(t => t.textContent.trim()),
        link: linkEl ? { href: linkEl.getAttribute('href'), text: linkEl.textContent.trim() } : null,
      };
    });
  }

  const DATA = {
    personal: collect('personal'),
    nonprofit: collect('nonprofit'),
    publications: collect('publications'),
  };

  const state = { group: null, index: 0, typeToken: 0 };

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function renderScreen(item) {
    body.innerHTML = '';
    if (item.meta) body.appendChild(el('div', 'detail-kicker', item.meta));
    body.appendChild(el('h2', 'detail-title', item.title));
    if (item.items.length) {
      const ul = el('ul', 'detail-list');
      item.items.forEach(html => ul.appendChild(el('li', null, html)));
      body.appendChild(ul);
    }
    if (item.tags.length) {
      const tagsEl = el('div', 'detail-tags tags');
      item.tags.forEach(t => tagsEl.appendChild(el('span', 'tag', t)));
      body.appendChild(tagsEl);
    }
    if (item.link) {
      const a = el('a', 'card-link', item.link.text);
      a.href = item.link.href;
      a.target = '_blank';
      a.rel = 'noopener';
      body.appendChild(a);
    }
  }

  function renderPaper(item, token) {
    body.innerHTML = '';
    body.appendChild(el('div', 'detail-kicker', item.kind));
    body.appendChild(el('h2', 'detail-title', item.title));
    const p = el('p', 'detail-text');
    body.appendChild(p);
    const tagsEl = el('div', 'detail-tags tags');
    item.tags.forEach(t => tagsEl.appendChild(el('span', 'tag', t)));
    body.appendChild(tagsEl);

    const plain = item.text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      p.textContent = plain;
      return;
    }
    let ci = 0;
    function step() {
      if (token !== state.typeToken) return;
      ci++;
      const done = ci >= plain.length;
      p.textContent = plain.slice(0, ci);
      if (!done) {
        p.appendChild(el('span', 'pen-cursor', '&#9998;'));
        setTimeout(step, 10 + Math.random() * 18);
      }
    }
    step();
  }

  function render() {
    const list = DATA[state.group] || [];
    const item = list[state.index];
    if (!item) return;
    countEl.textContent = (state.index + 1) + ' / ' + list.length;
    modal.classList.toggle('detail-modal--paper', state.group === 'publications');
    state.typeToken++;
    if (state.group === 'publications') renderPaper(item, state.typeToken);
    else renderScreen(item);
  }

  function open(group, index) {
    state.group = group;
    state.index = index;
    render();
    scrim.classList.add('detail-open');
    modal.classList.add('detail-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    state.typeToken++;
    scrim.classList.remove('detail-open');
    modal.classList.remove('detail-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function step(delta) {
    const list = DATA[state.group] || [];
    if (!list.length) return;
    state.index = (state.index + delta + list.length) % list.length;
    render();
  }

  document.querySelectorAll('.project-list[data-group], .card-grid[data-group="publications"]').forEach(container => {
    const group = container.getAttribute('data-group');
    container.querySelectorAll('.entry-open').forEach((btn, i) => {
      btn.addEventListener('click', () => open(group, i));
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', () => step(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => step(1));
  if (closeBtn) closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (modal.getAttribute('aria-hidden') === 'true') return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
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
  initDetailModals();
});
