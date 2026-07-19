/* court-audio.js — lightweight Web Audio SFX for the tennis court (no external assets, no background music).
   Exposes window.buildCourtAudio() => { setEnabled, playBallHit, playFootstep, dispose } */
(function () {
  function buildCourtAudio() {
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

    function playBallHit(basePitch) {
      if (!ctx) return;
      const now = ctx.currentTime;
      const pitch = basePitch ? basePitch / 523.25 : 1;

      // felt-on-strings impact: a short burst of filtered noise
      const bufLen = Math.floor(ctx.sampleRate * 0.09);
      const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
      const noise = ctx.createBufferSource(); noise.buffer = buffer;
      const noiseFilt = ctx.createBiquadFilter(); noiseFilt.type = 'bandpass';
      noiseFilt.frequency.value = 1300 * pitch; noiseFilt.Q.value = 0.7;
      const noiseGain = ctx.createGain(); noiseGain.gain.value = 0;
      noise.connect(noiseFilt); noiseFilt.connect(noiseGain); noiseGain.connect(master);
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.32, now + 0.004);
      noiseGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.09);
      noise.start(now); noise.stop(now + 0.1);

      // low body "thock" — a quick downward pitch drop gives the hit its thump
      const osc = ctx.createOscillator(); osc.type = 'sine';
      osc.frequency.setValueAtTime(240 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(85 * pitch, now + 0.1);
      const oscGain = ctx.createGain(); oscGain.gain.value = 0;
      osc.connect(oscGain); oscGain.connect(master);
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.26, now + 0.006);
      oscGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.13);
      osc.start(now); osc.stop(now + 0.14);
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
      playBallHit,
      playFootstep,
      get isRunning() { return running; },
      dispose() {
        if (ctx) ctx.close();
      },
    };
  }
  window.buildCourtAudio = buildCourtAudio;
})();
