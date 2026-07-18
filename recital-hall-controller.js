(function () {
  function showError(msg) {
    console.error('[recital-hall]', msg);
    const root = document.getElementById('rh-root');
    if (!root) return;
    let banner = document.getElementById('rh-error');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'rh-error';
      banner.className = 'rh-error';
      root.appendChild(banner);
    }
    banner.textContent = 'Recital hall scene failed to start: ' + msg;
  }

  const CHIME_FREQ = { projects: 523.25, blog: 587.33, about: 659.25, experience: 698.46, research: 783.99 };
  const NAV_LABELS = { projects: 'Projects', blog: 'Journal', about: 'About', experience: 'Experience', research: 'Research' };

  const DATA = {
    projects: {
      kicker: 'The Repertoire', title: 'Projects', color: '#c98f4e',
      blurb: "Pieces I've composed and performed — research pipelines, agents, and apps, each one a score worked out at the stand.",
      items: [
        { thumb: true, color: '#c98f4e', glyph: '01', title: 'alignment-jacobian', meta: '2026', text: 'Agentic-misalignment research pipeline — Jacobian lens, activation patching, and causal attribution to localize where a model decides to blackmail.', tag: 'AI Safety', href: 'https://github.com/niranjana2222/alignment_jacobian' },
        { thumb: true, color: '#b8253f', glyph: '02', title: 'alignment', meta: '2025', text: 'Bias detection, a 9-attack safety prober, and a logit-lens approximation rendered as an HTML heatmap.', tag: 'Interpretability', href: 'https://github.com/niranjana2222/alignment' },
        { thumb: true, color: '#a8713a', glyph: '03', title: 'rag-eval', meta: '2025', text: 'Hybrid BM25 + TF-IDF RAG pipeline with an LLM-as-judge eval harness — no vector DB required.', tag: 'RAG', href: 'https://github.com/niranjana2222/rag-eval' },
        { thumb: true, color: '#5b8a96', glyph: '04', title: 'agent-learner', meta: '2025', text: 'An agent that scores its own runs with an LLM judge and synthesizes new tools when it fails.', tag: 'Agentic AI', href: 'https://github.com/niranjana2222/agent-learner' },
        { thumb: true, color: '#8a4a2e', glyph: '05', title: 'wildfire-doc', meta: '2025', text: 'RAG chat over CAL FIRE, USFS, and NOAA data for wildfire operations.', tag: 'RAG', href: 'https://github.com/niranjana2222/wildfire-doc' },
      ],
      viewAll: 'projects.html',
    },
    blog: {
      kicker: 'The Score', title: 'Journal', color: '#d81e3f',
      blurb: 'Loose notes from the composer’s desk — mostly interpretability, latent reasoning, and the gap between what models can do and what we can verify they’re doing.',
      items: [
        { title: 'Why Does a Model Blackmail You?', meta: 'Jul 2026', text: 'Localizing the decision with a Jacobian lens — multi-skin results and real causal patching on Qwen2.5-7B.', href: 'blog-alignment-jacobian.html' },
        { title: 'Looking Inside the Black Box', meta: 'Jul 2026', text: 'Logit lens, tuned lens, and depth analysis — how transformers turn guessing into knowing.', href: 'blog-transformer-lenses.html' },
        { title: 'Teaching a Model to Think Without Words', meta: 'Jul 2026', text: 'What QThink actually does with latent chain-of-thought distillation.', href: 'blog-qthink.html' },
        { title: "Does Watching Someone's Lips Help?", meta: 'Jul 2026', text: 'Audio-visual speech recognition for accented English — mostly not, yet.', href: 'blog-avsr-accents.html' },
      ],
      viewAll: 'blog.html',
    },
    about: {
      kicker: 'The Performer', title: 'About', color: '#e8b96a',
      blurb: 'A small plaque on a quiet table — who I am, what I care about, and how to reach me.',
      items: [
        { title: 'Education', meta: 'UC Berkeley — EECS', text: 'B.S. EECS, expected May 2029 — 4.0 GPA. Member of SAAS ML, AWE, Blueprint, and Berkeley NLP.', tag: 'Education' },
        { title: 'Skills', meta: 'Languages & ML stack', text: 'Python, Java, SQL, JavaScript, React, Scheme. PyTorch, TensorFlow, HuggingFace, LangChain, LangGraph, Scikit-learn, Pandas, OpenCV, Vertex AI. USACO Gold · AIME Qualifier.', tag: 'Skills' },
        { title: 'Beyond the Code', meta: 'Wildfire Awareness Initiative · 2021–2025', text: "Founded and led a 501(c)(3) nonprofit promoting wildfire preparedness — grew to a team of 20+ students, brought curriculum and go-bag supplies to 400+ schools, published a children's storybook, and shipped an iOS app.", tag: 'Nonprofit' },
        { title: 'Connect', meta: 'Say hello', text: "Always happy to talk interpretability, internships, or a hard ML problem you can't put down. Email is the fastest way to reach me.", tag: 'Get in touch', links: [
          { href: 'mailto:niranjana.sankar@berkeley.edu', label: 'email me' },
          { href: 'https://linkedin.com/in/niranjana-sankar-0067852a8/', label: 'linkedin' },
        ] },
      ],
      viewAll: 'about.html',
    },
    experience: {
      kicker: 'The Bookshelf', title: 'Experience', color: '#5b8a96',
      blurb: 'A stack of scores from past performances — production ML systems, AI safety consulting, and full-stack engineering.',
      items: [
        { title: 'bright.ai — ML Intern, On-Device Conversational AI', meta: 'Apr 2025 — now', text: 'Shipped a production dialog engine for an industrial wearable, an on-device NLU cascade, and graph-based RAG.' },
        { title: 'Google — Consultant, via SAAS ML at Berkeley', meta: 'Aug 2025 — Jan 2026', text: 'Five Constitutional AI frameworks for SFT/RL on Gemini 2.5, evaluated on 14k harmful prompts.' },
        { title: 'Entelligence.ai — Software Engineer Intern', meta: '2023 — 2025', text: 'LangChain agent pipelines and Jira/GitHub/Slack integrations in production chatbot workflows.' },
      ],
      viewAll: 'experience.html',
    },
    research: {
      kicker: 'Under the Lid', title: 'Research', color: '#a8713a',
      blurb: 'Longer, slower work — four Berkeley labs, one thread: understanding why models behave the way they do, not just whether they work.',
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
    document.getElementById('rh-panel-bar').style.background = d.color;
    document.getElementById('rh-panel-kicker').textContent = d.kicker;
    document.getElementById('rh-panel-kicker').style.color = d.color;
    document.getElementById('rh-panel-title').textContent = d.title;
    document.getElementById('rh-panel-blurb').textContent = d.blurb;
    const list = document.getElementById('rh-panel-list');
    list.innerHTML = '';
    d.items.forEach(it => {
      const card = document.createElement('article');
      card.className = 'rh-card';
      let html = '';
      if (it.thumb) {
        html += '<div class="rh-card-thumb" style="background:' + it.color + '">' + it.glyph + '</div>';
      }
      html += '<div class="rh-card-body">';
      html += '<div class="rh-card-top"><h3>' + it.title + '</h3>' + (it.meta ? '<span class="rh-card-meta">' + it.meta + '</span>' : '') + '</div>';
      html += '<p>' + it.text + '</p>';
      if (it.tag) html += '<span class="rh-card-tag">' + it.tag + '</span>';
      if (it.links && it.links.length) {
        html += '<div class="rh-card-links">' + it.links.map(l => {
          const m = linkMeta(l.href);
          return '<a href="' + l.href + '" target="' + m.target + '" rel="' + m.rel + '">' + l.label + ' →</a>';
        }).join('') + '</div>';
      } else if (it.href) {
        const m = linkMeta(it.href);
        html += '<div class="rh-card-links"><a href="' + it.href + '" target="' + m.target + '" rel="' + m.rel + '">' + m.text + ' →</a></div>';
      }
      html += '</div>';
      card.innerHTML = html;
      list.appendChild(card);
    });
    const viewAll = document.getElementById('rh-panel-viewall');
    viewAll.href = d.viewAll;
    viewAll.textContent = 'see all ' + NAV_LABELS[key].toLowerCase() + ' →';
  }

  function boot() {
    const root = document.getElementById('rh-root');
    const mount = document.getElementById('rh-mount');
    if (!root || !mount) return;
    if (!supportsWebGL()) { showError('WebGL not supported in this browser.'); return; }
    if (!window.THREE) { showError('three.js failed to load from CDN.'); return; }

    try {
      const markerEls = {};
      root.querySelectorAll('[data-marker]').forEach(el => { markerEls[el.getAttribute('data-marker')] = el; });

      let soundEnabled = localStorage.getItem('rh-sound') !== 'off';
      let overview = false;
      const audio = window.buildHallAudio ? window.buildHallAudio() : null;
      if (audio && soundEnabled) audio.setEnabled(true);

      const soundBtn = document.getElementById('rh-sound');
      function syncSoundBtn() {
        soundBtn.querySelector('.rh-btn-glyph').textContent = soundEnabled ? '♪' : '🔇';
        soundBtn.querySelector('.rh-btn-label').textContent = soundEnabled ? 'Sound on' : 'Sound off';
        soundBtn.setAttribute('aria-pressed', String(soundEnabled));
      }
      syncSoundBtn();
      soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('rh-sound', soundEnabled ? 'on' : 'off');
        syncSoundBtn();
        if (audio) audio.setEnabled(soundEnabled);
      });

      const rh = window.buildRecitalHall(mount, {
        onError(e) { showError((e && e.message) || String(e)); },
        onFootstep() { if (soundEnabled && audio) audio.playFootstep(); },
        onAnchors(list) {
          for (const a of list) {
            const el = markerEls[a.id];
            if (!el) continue;
            const inNav = a.x > root.clientWidth - 260 && a.y < 150;
            const show = a.visible && !inNav;
            el.style.transform = 'translate(-50%,-120%) translate(' + a.x + 'px,' + a.y + 'px)';
            el.style.opacity = show ? '1' : '0';
            el.style.pointerEvents = show ? 'auto' : 'none';
          }
        },
      });

      rh.setLightMode(document.documentElement.getAttribute('data-theme') !== 'dark');
      const themeObserver = new MutationObserver(() => {
        rh.setLightMode(document.documentElement.getAttribute('data-theme') !== 'dark');
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      root.classList.add('rh-active');

      let openKey = null;
      let openTimer = null;
      const scrim = document.getElementById('rh-scrim');
      const panel = document.getElementById('rh-panel');
      const hint = document.getElementById('rh-hint');

      function openPanel(key) {
        openKey = key;
        renderPanel(key);
        panel.classList.add('rh-panel-active');
        scrim.classList.add('rh-scrim-active');
        panel.setAttribute('aria-hidden', 'false');
      }
      function closePanel() {
        openKey = null;
        panel.classList.remove('rh-panel-active');
        scrim.classList.remove('rh-scrim-active');
        panel.setAttribute('aria-hidden', 'true');
      }

      root.querySelectorAll('[data-marker]').forEach(btn => {
        const key = btn.getAttribute('data-marker');
        btn.addEventListener('click', () => {
          rh.walkTo(key);
          if (hint) hint.classList.add('rh-hint-hidden');
          clearTimeout(openTimer);
          openTimer = setTimeout(() => {
            openPanel(key);
            if (soundEnabled && audio) audio.playChime(CHIME_FREQ[key]);
          }, 780);
        });
      });

      root.querySelectorAll('[data-open]').forEach(btn => {
        btn.addEventListener('click', () => openPanel(btn.getAttribute('data-open')));
      });

      document.getElementById('rh-panel-close').addEventListener('click', closePanel);
      scrim.addEventListener('click', closePanel);
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && openKey) closePanel();
      });

      const resetBtn = document.getElementById('rh-reset');
      resetBtn.addEventListener('click', () => {
        rh.resetToStart();
        overview = false;
        syncZoomBtn();
      });

      const zoomBtn = document.getElementById('rh-zoom');
      function syncZoomBtn() {
        zoomBtn.querySelector('.rh-btn-glyph').textContent = overview ? '⤢' : '⤡';
        zoomBtn.querySelector('.rh-btn-label').textContent = overview ? 'Back to stage' : 'Zoom out';
      }
      syncZoomBtn();
      zoomBtn.addEventListener('click', () => {
        overview = rh.toggleOverview();
        syncZoomBtn();
      });

      window.addEventListener('beforeunload', () => { if (rh) rh.dispose(); if (audio) audio.dispose(); });
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
