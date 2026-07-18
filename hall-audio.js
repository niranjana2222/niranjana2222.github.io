/* hall-audio.js — lightweight Web Audio SFX for the recital hall (no external assets, no background music).
   Exposes window.buildHallAudio() => { setEnabled, playChime, playFootstep, dispose } */
(function () {
  function buildHallAudio() {
    let ctx = null, master = null, running = false;
    let stepToggle = 0;

    function ensureCtx() {
      if (ctx) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    }

    function setEnabled(on) {
      ensureCtx();
      if (ctx.state === 'suspended') ctx.resume();
      running = on;
    }

    function playChime(baseFreq) {
      if (!ctx) return;
      const now = ctx.currentTime;
      const f = baseFreq || 523.25;
      [1, 1.5, 2].forEach((mult, i) => {
        const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = f * mult;
        const g = ctx.createGain(); g.gain.value = 0;
        osc.connect(g); g.connect(master);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.09 / (i + 1), now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4 + i * 0.2);
        osc.start(now); osc.stop(now + 1.8);
      });
    }

    function playFootstep() {
      if (!ctx) return;
      const now = ctx.currentTime;
      stepToggle = 1 - stepToggle;
      const osc = ctx.createOscillator(); osc.type = 'triangle';
      osc.frequency.value = 90 + stepToggle * 12;
      const g = ctx.createGain(); g.gain.value = 0;
      const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 400;
      osc.connect(filt); filt.connect(g); g.connect(master);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.05, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc.start(now); osc.stop(now + 0.16);
    }

    return {
      setEnabled,
      playChime,
      playFootstep,
      get isRunning() { return running; },
      dispose() {
        if (ctx) ctx.close();
      },
    };
  }
  window.buildHallAudio = buildHallAudio;
})();
