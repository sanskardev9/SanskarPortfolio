"use client";

// Canvas particle system for exhaust smoke and landing dust.
// Soft pre-rendered sprites, turbulence, drag, growth and fade — not flat circles.
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

function sprite(r, g, b) {
  const s = 128, c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d");
  // a few overlapping soft blobs so each puff has an irregular, billowy edge
  for (let i = 0; i < 6; i++) {
    const ox = s / 2 + (Math.random() - 0.5) * 34, oy = s / 2 + (Math.random() - 0.5) * 34, rr = 26 + Math.random() * 24;
    const gr = x.createRadialGradient(ox, oy, 0, ox, oy, rr);
    gr.addColorStop(0, `rgba(${r},${g},${b},0.42)`);
    gr.addColorStop(0.55, `rgba(${r},${g},${b},0.16)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr;
    x.fillRect(0, 0, s, s);
  }
  return c;
}

const Particles = forwardRef(function Particles({ className = "" }, ref) {
  const canvas = useRef(null);
  const state = useRef({ list: [], idle: false, emitters: {}, sprites: null });

  useImperativeHandle(ref, () => ({
    // positions are fractions of the canvas box
    setIdle: (on, at) => {
      state.current.idle = on;
      state.current.emitters.exhaust = at;
    },
    smoke: (at, count = 26, power = 1) => {
      for (let i = 0; i < count; i++) add("smoke", at, power, i / count);
    },
    dust: (points) => {
      for (const at of points) for (let i = 0; i < 46; i++) add("dust", at, 1, i);
    },
  }));

  function add(kind, at, power, k) {
    const c = canvas.current;
    if (!c) return;
    const box = c.parentElement.getBoundingClientRect(), cr = c.getBoundingClientRect();
    const W = box.width, H = box.height, ox = box.left - cr.left, oy = box.top - cr.top;
    const scale = W / 640;
    at = { x: (ox + at.x * W) / W, y: (oy + at.y * H) / H };
    if (kind === "smoke") {
      state.current.list.push({
        kind, x: at.x * W, y: at.y * H,
        vx: (-120 - Math.random() * 160 * power) * scale, vy: (-4 - Math.random() * 22 * power) * scale,
        size: (5 + Math.random() * 5) * scale, grow: (26 + Math.random() * 26) * scale,
        life: 0, max: 3.6 + Math.random() * 2.4, rot: Math.random() * 6.28, spin: (Math.random() - 0.5) * 0.6,
        alpha: (0.13 + Math.random() * 0.12) * (power > 1.5 ? 1 : 1.4), delay: k * 0.5,
      });
    } else {
      const dir = Math.random() < 0.5 ? -1 : 1;
      state.current.list.push({
        kind, x: at.x * W + (Math.random() - 0.5) * 30 * scale, y: at.y * H,
        vx: dir * (80 + Math.random() * 260) * scale, vy: (-10 - Math.random() * 60) * scale,
        size: (6 + Math.random() * 10) * scale, grow: (40 + Math.random() * 50) * scale,
        life: 0, max: 1.1 + Math.random() * 1.0, rot: Math.random() * 6.28, spin: (Math.random() - 0.5) * 1.2,
        alpha: 0.45 + Math.random() * 0.3, delay: Math.random() * 0.08,
      });
    }
  }

  useEffect(() => {
    const c = canvas.current, ctx = c.getContext("2d");
    const st = state.current;
    st.sprites = { smoke: [sprite(92, 88, 84), sprite(70, 68, 66), sprite(118, 112, 104), sprite(56, 54, 52)], dust: [sprite(176, 154, 124), sprite(150, 128, 100)] };
    let raf, last = performance.now(), acc = 0;
    const fit = () => {
      const d = matchMedia("(pointer: coarse)").matches ? 1 : Math.min(devicePixelRatio || 1, 2); // lighter on phones
      c.width = c.clientWidth * d;
      c.height = c.clientHeight * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // gentle idle exhaust
      if (st.idle && st.emitters.exhaust) {
        acc += dt;
        while (acc > 0.16) {
          acc -= 0.16;
          add("smoke", st.emitters.exhaust, 0.35, 0);
          st.list[st.list.length - 1].delay = 0;
          st.list[st.list.length - 1].alpha *= 0.55;
        }
      }
      ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);
      const t = now / 1000;
      st.list = st.list.filter((p) => {
        if (p.delay > 0) {
          p.delay -= dt;
          return true;
        }
        p.life += dt;
        if (p.life > p.max) return false;
        const k = p.life / p.max;
        const drag = p.kind === "dust" ? Math.pow(0.12, dt) : Math.pow(0.7, dt);
        p.vx *= drag;
        p.vy = p.vy * drag + (p.kind === "smoke" ? -14 : -4) * dt; // smoke rises, dust lingers low
        // turbulence
        p.vx += Math.sin(t * 2.1 + p.rot * 3) * 12 * dt;
        p.vy += Math.cos(t * 1.7 + p.rot * 5) * 8 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
        const s = p.size + p.grow * Math.sqrt(k) * (p.kind === "dust" ? 1.3 : 2.2);
        const a = p.alpha * (k < 0.12 ? k / 0.12 : 1 - (k - 0.12) / 0.88);
        const arr = st.sprites[p.kind];
        const spr = arr[(p.si ??= Math.floor(Math.random() * arr.length))];
        ctx.save();
        ctx.globalAlpha = Math.max(0, a);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.kind === "dust") ctx.scale(1.6, 0.7); // dust spreads flat along the floor
        ctx.drawImage(spr, -s, -s, s * 2, s * 2);
        ctx.restore();
        return true;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className={`pointer-events-none absolute -top-[30%] right-0 h-[150%] w-[260%] ${className}`} />;
});

export default Particles;
