// Tiny synthesized sound kit (no audio files): engine hum + blips.
export function createSound() {
  let ctx, master, o1, o2, filt, eng;
  let muted = false;

  const init = () => {
    if (ctx) return ctx.resume();
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
    o1 = ctx.createOscillator();
    o1.type = "sawtooth";
    o2 = ctx.createOscillator();
    o2.type = "square";
    filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = 300;
    eng = ctx.createGain();
    eng.gain.value = 0;
    o1.connect(filt);
    o2.connect(filt);
    filt.connect(eng);
    eng.connect(master);
    o1.start();
    o2.start();
  };

  const blip = (freq = 880, dur = 0.08, type = "square", vol = 0.06, slide = 0.5) => {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  };

  return {
    init,
    get muted() {
      return muted;
    },
    setMuted(m) {
      muted = m;
      if (master) master.gain.value = m ? 0 : 0.5;
    },
    engine(speed01, on) {
      if (!ctx) return;
      const t = ctx.currentTime, f = 42 + speed01 * 120;
      o1.frequency.setTargetAtTime(f, t, 0.06);
      o2.frequency.setTargetAtTime(f * 0.5, t, 0.06);
      filt.frequency.setTargetAtTime(260 + speed01 * 1500, t, 0.1);
      eng.gain.setTargetAtTime(on ? 0.05 : 0, t, 0.15);
    },
    fire: () => blip(1400, 0.07, "square", 0.035, 0.35),
    coin: () => {
      blip(1320, 0.07, "sine", 0.08, 1);
      setTimeout(() => blip(1760, 0.12, "sine", 0.08, 1), 70);
    },
    unlock: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.22, "triangle", 0.09, 1), i * 85)),
    win: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => blip(f, 0.3, "triangle", 0.09, 1), i * 110)),
    suspend: () => ctx?.suspend(),
    dispose: () => { if (ctx && ctx.state !== "closed") { ctx.close(); ctx = null; } },
  };
}
