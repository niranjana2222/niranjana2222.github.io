/* hall-audio.js — lightweight Web Audio ambience + SFX for the recital hall (no external assets).
   Exposes window.buildHallAudio() => { setEnabled, playChime, playFootstep, dispose } */
(function () {
  function buildHallAudio() {
    let ctx = null, master = null, padGain = null, running = false;
    let padNodes = [];
    let stepToggle = 0;
    let phraseTimer = null;

    function ensureCtx() {
      if (ctx) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
      padGain = ctx.createGain(); padGain.gain.value = 0;

      // warm the section down like a hall full of strings, not a synth
      const warmth = ctx.createBiquadFilter(); warmth.type = 'lowpass'; warmth.frequency.value = 2100; warmth.Q.value = 0.4;
      padGain.connect(warmth);

      const delay = ctx.createDelay(2.2); delay.delayTime.value = 1.6;
      const fb = ctx.createGain(); fb.gain.value = 0.28;
      delay.connect(fb); fb.connect(delay); warmth.connect(delay); delay.connect(master);
      warmth.connect(master);

      // a sustained orchestral chord: low celli/bass root + a small detuned "section" per note
      const notes = [
        { f: 65.41, voices: 1, level: 0.06 },   // C2 — cello/bass root
        { f: 130.81, voices: 2, level: 0.082 }, // C3
        { f: 164.81, voices: 2, level: 0.071 }, // E3
        { f: 196.0, voices: 2, level: 0.06 },   // G3
        { f: 261.63, voices: 2, level: 0.05 },  // C4
      ];
      notes.forEach(({ f, voices, level }) => {
        for (let v = 0; v < voices; v++) {
          const osc = ctx.createOscillator();
          osc.type = v % 2 ? 'triangle' : 'sine';
          osc.detune.value = voices > 1 ? (v === 0 ? -5 : 5) : 0;
          osc.frequency.value = f;
          const g = ctx.createGain(); g.gain.value = level / voices;
          const lfo = ctx.createOscillator(); lfo.frequency.value = 0.04 + Math.random() * 0.06;
          const lfoGain = ctx.createGain(); lfoGain.gain.value = 1.5 + Math.random() * 1.5;
          lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
          osc.connect(g); g.connect(padGain);
          osc.start(); lfo.start();
          padNodes.push(osc, lfo);
        }
      });

      // slow swell, like a held chord breathing under a bow
      const swellLfo = ctx.createOscillator(); swellLfo.frequency.value = 0.035;
      const swellGain = ctx.createGain(); swellGain.gain.value = 0.07;
      swellLfo.connect(swellGain); swellGain.connect(padGain.gain);
      swellLfo.start();
      padNodes.push(swellLfo);
    }

    // a lone solo line (violin-ish) drifting over the pad every so often, so it reads
    // as a piece being performed rather than a held drone. Composed phrases, not a random
    // walk — a wandering pitch pattern is what reads as "random notes" rather than music.
    const SOLO_SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33]; // C D E G A C D
    const SOLO_PHRASES = [
      [2, 3, 4, 5, 4, 3, 2],       // rise to a peak, settle back down
      [4, 3, 2, 3, 4, 5, 6],       // dip, then a longer climb
      [3, 4, 3, 2, 1, 2, 3],       // gentle arc around the tonic
      [2, 4, 3, 5, 4, 2],          // a small leaping call-and-answer
    ];
    const SOLO_DURS = [1.0, 0.85, 0.75, 0.85, 1.0, 0.85, 1.1];
    function playSoloPhrase() {
      if (!ctx || !running) return;
      const now = ctx.currentTime;
      const phrase = SOLO_PHRASES[Math.floor(Math.random() * SOLO_PHRASES.length)];

      const osc = ctx.createOscillator(); osc.type = 'sawtooth';
      const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 1600; filt.Q.value = 0.8;
      const vibrato = ctx.createOscillator(); vibrato.frequency.value = 5.4;
      const vibratoGain = ctx.createGain(); vibratoGain.gain.value = 3.2;
      vibrato.connect(vibratoGain); vibratoGain.connect(osc.frequency);
      const g = ctx.createGain(); g.gain.value = 0;
      osc.connect(filt); filt.connect(g); g.connect(master);

      let t = now;
      osc.frequency.setValueAtTime(SOLO_SCALE[phrase[0]], t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.045, t + 0.15);
      for (let i = 1; i < phrase.length; i++) {
        const noteDur = SOLO_DURS[(i - 1) % SOLO_DURS.length];
        t += noteDur;
        osc.frequency.linearRampToValueAtTime(SOLO_SCALE[phrase[i]], t + 0.22); // portamento glide, bowed legato
        g.gain.linearRampToValueAtTime(0.045, t + 0.1);
        g.gain.linearRampToValueAtTime(0.03, t + noteDur * 0.85);
      }
      const endT = t + SOLO_DURS[(phrase.length - 1) % SOLO_DURS.length];
      g.gain.linearRampToValueAtTime(0, endT + 0.7);
      osc.start(now); osc.stop(endT + 0.9);
      vibrato.start(now); vibrato.stop(endT + 0.9);
    }
    function scheduleSoloPhrase() {
      clearTimeout(phraseTimer);
      phraseTimer = setTimeout(() => {
        if (running) playSoloPhrase();
        scheduleSoloPhrase();
      }, (18 + Math.random() * 14) * 1000);
    }

    function setEnabled(on) {
      ensureCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const wasRunning = running;
      running = on;
      const now = ctx.currentTime;
      padGain.gain.cancelScheduledValues(now);
      padGain.gain.linearRampToValueAtTime(on ? 0.55 : 0, now + 1.2);
      if (on && !wasRunning) scheduleSoloPhrase();
      if (!on) clearTimeout(phraseTimer);
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
        clearTimeout(phraseTimer);
        padNodes.forEach(n => { try { n.stop(); } catch (_) {} });
        if (ctx) ctx.close();
      },
    };
  }
  window.buildHallAudio = buildHallAudio;
})();
