(function () {
  function hideLoader() {
    window.__tcLoaderStop = true;
    const pctEl = document.getElementById('tc-loader-pct');
    if (pctEl) pctEl.textContent = '100%';
    const loader = document.getElementById('tc-loader');
    if (loader) setTimeout(() => loader.classList.add('tc-loader-hidden'), 180);
  }

  function showError(msg) {
    console.error('[tennis-court]', msg);
    hideLoader();
    const root = document.getElementById('tc-root');
    if (!root) return;
    let banner = document.getElementById('tc-error');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'tc-error';
      banner.className = 'tc-error';
      root.appendChild(banner);
    }
    banner.textContent = 'Tennis court scene failed to start: ' + msg;
  }

  const HIT_PITCH = { about: 523.25, experience: 587.33, research: 659.25, projects: 698.46, journal: 783.99 };
  const NAV_LABELS = { about: 'About', experience: 'Experience', research: 'Research', projects: 'Projects', journal: 'Blog' };

  const DATA = {
    projects: {
      kicker: 'The Bag', title: 'Projects', color: '#3a7a4e',
      blurb: "Pieces I've built and shipped, all packed into one bag — research pipelines, agents, and apps.",
      items: [
        { thumb: true, color: '#3a7a4e', glyph: '01', title: 'Jacobian Lens Misalignment', meta: '2026', text: 'Agentic-misalignment research pipeline — Jacobian lens and causal attribution to localize where a model decides to blackmail.', tag: 'AI Safety', href: 'https://github.com/niranjana2222/alignment_jacobian' },
        { thumb: true, color: '#1a2f66', glyph: '02', title: 'Bias Detection', meta: '2025', text: 'Bias detection with a 9-attack safety prober and a logit-lens approximation rendered as an HTML heatmap.', tag: 'Interpretability', href: 'https://github.com/niranjana2222/alignment' },
        { thumb: true, color: '#2bb0e0', glyph: '03', title: 'RAG Evaluation', meta: '2025', text: 'Hybrid BM25 + TF-IDF RAG pipeline with an LLM-as-judge eval harness — no vector DB required.', tag: 'RAG', href: 'https://github.com/niranjana2222/rag-eval' },
        { thumb: true, color: '#a8843c', glyph: '04', title: 'Self-Evaluating Agent', meta: '2025', text: 'An agent that scores its own runs with an LLM judge and synthesizes new tools when it fails.', tag: 'Agentic AI', href: 'https://github.com/niranjana2222/agent-learner' },
        { thumb: true, color: '#6a4c93', glyph: '05', title: 'Wildfire RAG Chat', meta: '2025', text: 'RAG chat over CAL FIRE, USFS, and NOAA data for wildfire operations.', tag: 'RAG', href: 'https://github.com/niranjana2222/wildfire-doc' },
      ],
      viewAll: 'projects.html',
    },
    journal: {
      kicker: 'Over the Net', title: 'Blog', color: '#2bb0e0',
      blurb: 'Notes volleyed back and forth between projects — mostly interpretability, latent reasoning, and the gap between what models can do and what we can verify they’re doing.',
      items: [
        { title: 'Why Does a Model Blackmail You?', meta: 'Jul 2026', text: 'Localizing the decision with a Jacobian lens — multi-skin results and real causal patching on Qwen2.5-7B.', href: 'blog-alignment-jacobian.html' },
        { title: 'Looking Inside the Black Box', meta: 'Jul 2026', text: 'Logit lens, tuned lens, and depth analysis — how transformers turn guessing into knowing.', href: 'blog-transformer-lenses.html' },
        { title: 'Teaching a Model to Think Without Words', meta: 'Jul 2026', text: 'What QThink actually does with latent chain-of-thought distillation.', href: 'blog-qthink.html' },
        { title: "Does Watching Someone's Lips Help?", meta: 'Jul 2026', text: 'Audio-visual speech recognition for accented English — mostly not, yet.', href: 'blog-avsr-accents.html' },
      ],
      viewAll: 'blog.html',
    },
    about: {
      kicker: "The Umpire's Chair", title: 'About me', color: '#e8b96a',
      blurb: 'A view from up top — who I am, what I care about, and how to reach me.',
      items: [
        { title: 'Education', meta: 'UC Berkeley — EECS', text: 'B.S. EECS, expected May 2029 — 4.0 GPA.<br>Member of SAAS, AWE, and Blueprint.' },
        { title: 'Skills', meta: 'Languages & ML stack', text: 'Python, Java, SQL, JavaScript, React, Scheme.<br>PyTorch, TensorFlow, HuggingFace, LangChain, LangGraph, Scikit-learn, Pandas, OpenCV, Vertex AI.<br>USACO Gold · AIME Qualifier.' },
        { title: 'Beyond the Code', meta: 'Wildfire Awareness Initiative · 2021–2025', text: "Founded and led a 501(c)(3) nonprofit promoting wildfire preparedness — grew to a team of 20+ students, brought curriculum and go-bag supplies to 400+ schools, published a children's storybook, and shipped an iOS app." },
        { title: 'Connect', meta: 'Say hello', text: "Always happy to chat! Email is the fastest way to reach me.", links: [
          { href: 'mailto:niranjana.sankar@berkeley.edu', label: 'email me' },
          { href: 'https://linkedin.com/in/niranjana-sankar-0067852a8/', label: 'linkedin' },
        ] },
      ],
      viewAll: 'about.html',
    },
    experience: {
      kicker: 'The Bench', title: 'Experience', color: '#1a2f66',
      blurb: 'Time on the bench between sets — the roles and teams that shaped how I think about production ML and research engineering.',
      items: [
        { title: 'bright.ai — ML Intern, On-Device Conversational AI', meta: 'Apr 2025 — now', text: 'Shipped a production dialog engine for an industrial wearable, an on-device NLU cascade, and graph-based RAG.' },
        { title: 'Google — Consultant, via SAAS at Berkeley', meta: 'Aug 2025 — Jan 2026', text: 'Five Constitutional AI frameworks for SFT/RL on Gemini 2.5, evaluated on 14k harmful prompts.' },
        { title: 'Entelligence.ai — Software Engineer Intern', meta: '2023 — 2025', text: 'LangChain agent pipelines and Jira/GitHub/Slack integrations in production chatbot workflows.' },
      ],
      viewAll: 'experience.html',
    },
    research: {
      kicker: 'The Racket', title: 'Research', color: '#d8e830',
      blurb: 'Longer, slower swings — four Berkeley labs, one thread: understanding why models behave the way they do, not just whether they work.',
      items: [
        { title: 'Berkeley ICON Lab — VLA Interpretability', meta: 'Jan 2026 — now', text: 'Linear probes on PaliGemma localize where language grounding breaks down in the action expert.', tag: 'VLA' },
        { title: 'Berkeley NLP Group — Multimodal Speech', meta: 'Jan 2026 — now', text: 'Test-time adaptation for AVSR on accented speech across Qwen3-Omni, LLaMA, and Whisper-Flamingo.', tag: 'AVSR' },
        { title: 'Sky Computing Group — LLM Reasoning', meta: 'Dec 2025 — May 2026', text: 'An interpretable GEPA extension with tuned lens, and QThink for latent reasoning.' },
        { title: 'BAIR Speech Group — Interpretability & RL', meta: 'Nov 2025 — Mar 2026', text: 'Tuned-lens interpretability on GPT multilingual prediction; improved ICRL, SOAR, and TRPO.' },
      ],
      viewAll: 'research.html',
    },
  };

  function supportsWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  function linkMeta(href) {
    const isExternal = /^https?:\/\//.test(href);
    const isMail = /^mailto:/.test(href);
    return {
      target: isExternal ? '_blank' : '',
      rel: isExternal ? 'noopener' : '',
      text: isExternal ? 'view on github' : isMail ? 'email me' : 'read more',
    };
  }

  function renderPanel(key) {
    const d = DATA[key];
    if (!d) return;
    document.getElementById('tc-panel-bar').style.background = d.color;
    document.getElementById('tc-panel-kicker').textContent = d.kicker;
    document.getElementById('tc-panel-kicker').style.color = d.color;
    document.getElementById('tc-panel-title').textContent = d.title;
    document.getElementById('tc-panel-blurb').textContent = d.blurb;
    const list = document.getElementById('tc-panel-list');
    list.innerHTML = '';
    d.items.forEach(it => {
      const card = document.createElement('article');
      card.className = 'tc-card';
      let html = '';
      if (it.thumb) {
        html += '<div class="tc-card-thumb" style="background:' + it.color + '">' + it.glyph + '</div>';
      }
      html += '<div class="tc-card-body">';
      html += '<div class="tc-card-top"><h3>' + it.title + '</h3>' + (it.meta ? '<span class="tc-card-meta">' + it.meta + '</span>' : '') + '</div>';
      html += '<p>' + it.text + '</p>';
      if (it.tag) html += '<span class="tc-card-tag">' + it.tag + '</span>';
      if (it.links && it.links.length) {
        html += '<div class="tc-card-links">' + it.links.map(l => {
          const m = linkMeta(l.href);
          return '<a href="' + l.href + '" target="' + m.target + '" rel="' + m.rel + '">' + l.label + ' →</a>';
        }).join('') + '</div>';
      } else if (it.href) {
        const m = linkMeta(it.href);
        html += '<div class="tc-card-links"><a href="' + it.href + '" target="' + m.target + '" rel="' + m.rel + '">' + m.text + ' →</a></div>';
      }
      html += '</div>';
      card.innerHTML = html;
      list.appendChild(card);
    });
    const viewAll = document.getElementById('tc-panel-viewall');
    viewAll.href = d.viewAll;
    viewAll.textContent = 'see all ' + NAV_LABELS[key].toLowerCase() + ' →';
  }

  function boot() {
    const root = document.getElementById('tc-root');
    const mount = document.getElementById('tc-mount');
    if (!root || !mount) return;
    if (!supportsWebGL()) { showError('WebGL not supported in this browser.'); return; }
    if (!window.THREE) { showError('three.js failed to load from CDN.'); return; }

    setTimeout(hideLoader, 8000);

    try {
      let soundEnabled = localStorage.getItem('tc-sound') !== 'off';
      let openTimer = null;
      const audio = window.buildCourtAudio ? window.buildCourtAudio() : null;
      if (audio && soundEnabled) audio.setEnabled(true);

      const soundBtn = document.getElementById('tc-sound');
      function syncSoundBtn() {
        soundBtn.querySelector('.tc-btn-glyph').textContent = soundEnabled ? '♪' : '🔇';
        soundBtn.querySelector('.tc-btn-label').textContent = soundEnabled ? 'Sound on' : 'Sound off';
        soundBtn.setAttribute('aria-pressed', String(soundEnabled));
      }
      syncSoundBtn();
      soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('tc-sound', soundEnabled ? 'on' : 'off');
        syncSoundBtn();
        if (audio) audio.setEnabled(soundEnabled);
        if (tc) tc.setSound(soundEnabled);
      });

      function goToSection(key) {
        if (!DATA[key]) return;
        if (tc) tc.walkTo(key);
        if (hint) hint.classList.add('tc-hint-hidden');
        if (soundEnabled && audio) audio.playBallHit(HIT_PITCH[key]);
        clearTimeout(openTimer);
        openTimer = setTimeout(() => {
          openPanel(key);
        }, 780);
      }

      const tc = window.buildTennisCourt(mount, {
        onError(e) { showError((e && e.message) || String(e)); },
        onFootstep() { if (soundEnabled && audio) audio.playFootstep(); },
        onSignClick(id) { goToSection(id); },
      });

      if (soundEnabled) tc.setSound(true);

      // browsers block Web Audio until a real user gesture — retry applying the
      // current sound state on the first one so playback doesn't stay silently stuck
      function unlockAudio() {
        if (audio) audio.setEnabled(soundEnabled);
        tc.setSound(soundEnabled);
      }
      ['pointerdown', 'keydown', 'touchstart'].forEach(ev => {
        window.addEventListener(ev, unlockAudio, { once: true, passive: true });
      });

      tc.setLightMode(document.documentElement.getAttribute('data-theme') !== 'dark');
      const themeObserver = new MutationObserver(() => {
        tc.setLightMode(document.documentElement.getAttribute('data-theme') !== 'dark');
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      const MIN_LOADER_MS = 2500;
      const elapsed = performance.now() - (window.__tcLoaderStart || performance.now());
      setTimeout(() => {
        root.classList.add('tc-active');
        hideLoader();
      }, Math.max(0, MIN_LOADER_MS - elapsed));

      let openKey = null;
      const scrim = document.getElementById('tc-scrim');
      const panel = document.getElementById('tc-panel');
      const hint = document.getElementById('tc-hint');

      function openPanel(key) {
        openKey = key;
        renderPanel(key);
        panel.classList.add('tc-panel-active');
        scrim.classList.add('tc-scrim-active');
        panel.setAttribute('aria-hidden', 'false');
      }
      function closePanel() {
        openKey = null;
        panel.classList.remove('tc-panel-active');
        scrim.classList.remove('tc-scrim-active');
        panel.setAttribute('aria-hidden', 'true');
      }

      root.querySelectorAll('[data-open]').forEach(btn => {
        btn.addEventListener('click', () => openPanel(btn.getAttribute('data-open')));
      });

      document.getElementById('tc-panel-close').addEventListener('click', closePanel);
      scrim.addEventListener('click', closePanel);
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && openKey) closePanel();
      });

      const resetBtn = document.getElementById('tc-reset');
      resetBtn.addEventListener('click', () => {
        tc.resetToStart();
      });

      window.addEventListener('beforeunload', () => { if (tc) tc.dispose(); if (audio) audio.dispose(); });
    } catch (e) {
      showError((e && e.message) || String(e));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
