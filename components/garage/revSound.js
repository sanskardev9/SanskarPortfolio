// Rev sound: Kawasaki Ninja H2 recording supplied by Sanskar (the slow two-rev section, 3.95s-7.5s).
// The file is fetched + decoded ahead of time with an OfflineAudioContext (no user gesture
// needed, never "suspended"); the real AudioContext is only created inside the click.

const SOURCES = ["/sfx/rev.m4a"];
let ctx, buffer, loading, current;
export const REV_RATE = 1; // < 1 = slower and slightly deeper

function load() {
  if (buffer) return Promise.resolve(buffer);
  if (!loading) {
    loading = (async () => {
      for (const u of SOURCES) {
        const r = await fetch(u).catch(() => null);
        if (!r || !r.ok) continue;
        const data = await r.arrayBuffer();
        const Off = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        const dec = new Off(1, 1, 44100);
        buffer = await dec.decodeAudioData(data);
        return buffer;
      }
      return null;
    })().catch(() => null);
  }
  return loading;
}

export function prepareRev() {
  try {
    load();
  } catch {}
}

// returns the duration in seconds (0 if it couldn't play)
export async function revEngine() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return 0;
    if (!ctx) ctx = new AC(); // created inside the click -> allowed to play
    if (ctx.state !== "running") await ctx.resume().catch(() => {});
    const buf = await load();
    if (!buf) return 0;
    if (current) {
      try { current.stop(); } catch {}
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = REV_RATE;
    const low = ctx.createBiquadFilter();
    low.type = "lowshelf";
    low.frequency.value = 160;
    low.gain.value = 4;
    const g = ctx.createGain();
    // quick fade-in; the recording itself carries a long smooth fade-out (no extra cut here)
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.8, t + 0.04);
    src.connect(low).connect(g).connect(ctx.destination);
    src.start();
    current = src;
    src.onended = () => current === src && (current = null);
    return buf.duration / REV_RATE;
  } catch {
    return 0;
  }
}

