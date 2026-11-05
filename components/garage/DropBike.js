"use client";

// A Duke 390 (gen 3) style naked bike, drawn as a vector illustration (no logos).
// On load it drops from the top onto a lit ramp: suspension squashes, dust bursts,
// the headlight flickers on and the exhaust idles out smoke.

import { animate, motion, useAnimationControls, useInView, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Particles from "./Particles";
import { buzz, shakeScreen } from "./haptics";
import { revEngine, prepareRev, REV_RATE } from "./revSound";

const O = "#ff6a00";
const NAVY = "#1d2433";
const BLK = "#121317";
const GREY = "#2c2f36";

function Wheel({ cx, cy, front, spin }) {
  const R = 68; // tyre outer
  return (
    <g>
      {/* tyre */}
      <circle cx={cx} cy={cy} r={R - 9} fill="none" stroke="url(#tyre)" strokeWidth="19" />
      <circle cx={cx} cy={cy} r={R - 1} fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="1.5" />
      <motion.g style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }} animate={spin ? { rotate: 360 } : {}} transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}>
        {/* tread blocks */}
        <circle cx={cx} cy={cy} r={R - 3} fill="none" stroke="#2a2b30" strokeWidth="5" strokeDasharray="5 6" />
        {/* rim */}
        <circle cx={cx} cy={cy} r={R - 19} fill="none" stroke="url(#rim)" strokeWidth="6" />
        <circle cx={cx} cy={cy} r={R - 22} fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="1" />
        {/* 5 split spokes */}
        {[0, 72, 144, 216, 288].map((ang) => (
          <g key={ang} transform={`rotate(${ang} ${cx} ${cy})`}>
            <path d={`M${cx - 4} ${cy - 13} C${cx - 8} ${cy - 28} ${cx - 10} ${cy - 38} ${cx - 9} ${cy - 47} L${cx - 3} ${cy - 47} C${cx - 4} ${cy - 36} ${cx - 2} ${cy - 26} ${cx} ${cy - 14} Z`} fill="url(#rim)" />
            <path d={`M${cx + 4} ${cy - 13} C${cx + 8} ${cy - 28} ${cx + 10} ${cy - 38} ${cx + 9} ${cy - 47} L${cx + 3} ${cy - 47} C${cx + 4} ${cy - 36} ${cx + 2} ${cy - 26} ${cx} ${cy - 14} Z`} fill="#c94a00" />
          </g>
        ))}
        {/* drilled brake disc */}
        <circle cx={cx} cy={cy} r={front ? 37 : 26} fill="none" stroke="url(#disc)" strokeWidth={front ? 8 : 6} />
        {Array.from({ length: front ? 14 : 10 }, (_, i) => {
          const t = (i / (front ? 14 : 10)) * Math.PI * 2, rr = front ? 37 : 26;
          return <circle key={i} cx={cx + Math.cos(t) * rr} cy={cy + Math.sin(t) * rr} r="1.4" fill="#2a2b30" />;
        })}
      </motion.g>
      {/* hub */}
      <circle cx={cx} cy={cy} r="12" fill="url(#hub)" stroke="#111" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="4" fill="#1a1b1f" />
      {/* caliper */}
      {front ? (
        <path d={`M${cx + 20} ${cy - 34} q16 10 18 30 l-9 2 q-2 -16 -14 -24 Z`} fill={O} stroke="#a33a00" strokeWidth="1" />
      ) : (
        <path d={`M${cx - 30} ${cy - 10} q-4 12 2 22 l7 -4 q-4 -8 -1 -16 Z`} fill="#3a3c42" />
      )}
    </g>
  );
}

// Rotate an SVG group around a fixed point using the SVG transform attribute
// (CSS transform-origin is unreliable on SVG groups, which detached the arm).
function useSvgRotate(cx, cy) {
  const angle = useMotionValue(0);
  const shift = useMotionValue(0);
  const [t, setT] = useState(`rotate(0 ${cx} ${cy})`);
  const update = () => setT(`translate(${shift.get()} 0) rotate(${angle.get()} ${cx} ${cy})`);
  useMotionValueEvent(angle, "change", update);
  useMotionValueEvent(shift, "change", update);
  return { angle, shift, transform: t };
}

export default function DropBike({ startDelay: initialDelay = 1.7 }) {
  // start the drop only once the bike is actually on screen (on phones it sits below the fold)
  const stage = useRef(null);
  const inView = useInView(stage, { once: true, amount: 0.75 });
  const [startDelay, setStartDelay] = useState(null);
  useEffect(() => {
    if (!inView || startDelay !== null) return;
    // CSS starts the shutter before this client component hydrates. Use the page-load
    // clock so hydration time is not added to the bike and lightning sequence.
    // If the bike enters the viewport later, the minimum delay keeps the drop snappy.
    const since = performance.now() / 1000;
    const frame = requestAnimationFrame(() => setStartDelay(Math.max(0.15, initialDelay - since)));
    return () => cancelAnimationFrame(frame);
  }, [inView, startDelay, initialDelay]);
  const go = startDelay !== null;
  const body = useAnimationControls();
  const [landed, setLanded] = useState(false);
  const [lights, setLights] = useState(false);
  const [revs, setRevs] = useState(0);
  const [strike, setStrike] = useState(0); // lightning hit counter
  const fx = useRef(null);
  const rider = useSvgRotate(290, 150);
  const arm = useSvgRotate(304, 102);
  const [look, setLook] = useState(false);
  const forearm = useSvgRotate(339, 114);
  const [holding, setHolding] = useState(false);
  useEffect(() => {
    const t = async () => {
      // 1) look at you  2) lift the CV from the keyboard to face height  3) flick it toward you
      setLook(true);
      await new Promise((r) => setTimeout(r, 80));
      setHolding(true);
      const go = (part, a, opts) => animate(part.angle, a, opts);
      // lift the CV from the keyboard up to face height (arm up, elbow bent up)
      animate(rider.shift, -2, { duration: 0.18, ease: "easeOut" });
      go(rider, -3, { duration: 0.18, ease: "easeOut" });
      go(arm, -55, { duration: 0.18, ease: "easeOut" });
      await go(forearm, -45, { duration: 0.18, ease: "easeOut" });
      await new Promise((r) => setTimeout(r, 50));
      // flick toward the viewer
      animate(rider.shift, 3, { duration: 0.09, ease: "easeIn" });
      go(rider, 2, { duration: 0.09, ease: "easeIn" });
      go(arm, -15, { duration: 0.09, ease: "easeIn" });
      await go(forearm, 10, { duration: 0.09, ease: "easeIn" });
      const hand = document.querySelector("[data-cv-hand]")?.getBoundingClientRect();
      setHolding(false);
      window.dispatchEvent(new CustomEvent("garage:release", { detail: hand ? { x: hand.left + hand.width / 2, y: hand.top + hand.height / 2 } : null }));
      const settle = { type: "spring", stiffness: 180, damping: 16 };
      animate(rider.shift, 0, settle);
      go(rider, 0, settle);
      go(arm, 0, settle);
      go(forearm, 0, settle);
      setTimeout(() => setLook(false), 650);
    };
    window.addEventListener("garage:throw", t);
    return () => window.removeEventListener("garage:throw", t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const EXHAUST = { x: 186 / 640, y: 312 / 430 };
  const TYRES = [{ x: 150 / 640, y: 372 / 430 }, { x: 488 / 640, y: 372 / 430 }];

  const [revving, setRevving] = useState(false);
  const revLock = useRef(false);
  const rev = () => {
    if (revLock.current) return; // one rev at a time: no stacking sound, smoke or letter waves
    revLock.current = true;
    setRevving(true);
    revEngine().then((dur) => {
      setTimeout(() => {
        revLock.current = false;
        setRevving(false);
      }, Math.max(2200, (dur || 0) * 1000));
    });
    setRevs((r) => r + 1);
    // two revs, synced to the recording (~0.95s and ~2.15s in)
    const blip = (power, big) => {
      buzz(big ? [90, 40, 60] : [50]);
      shakeScreen(big ? 0.6 : 0.35, big ? 420 : 300);
      fx.current?.smoke(EXHAUST, big ? 26 : 16, power);
      body.start({ rotate: [0, big ? -2 : -1.2, 0.6, 0], y: [0, big ? -7 : -4, 2, 0], transition: { duration: 0.55, ease: "easeOut" } });
    };
    setTimeout(() => blip(1.8, false), 250 / REV_RATE); // rev 1
    setTimeout(() => blip(2.6, true), 1450 / REV_RATE); // rev 2
  };

  useEffect(() => {
    prepareRev();
  }, []);

  useEffect(() => {
    if (!go) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const frame = requestAnimationFrame(() => {
        setLanded(true);
        setLights(true);
      });
      return () => cancelAnimationFrame(frame);
    }
    const t1 = setTimeout(() => {
      setLanded(true);
      setStrike((n) => n + 1);
      shakeScreen(1.1, 380);
      buzz([30, 20, 80]);
      body.start({ y: [0, 14, -4, 0], transition: { duration: 0.55, times: [0, 0.3, 0.65, 1], ease: "easeOut" } });
    }, (startDelay + 0.8) * 1000);
    const t2 = setTimeout(() => {
      setLights(true);
      revEngine(); // plays only if the browser already allows sound
    }, (startDelay + 1.5) * 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [body, startDelay, go]);

  return (
    <div ref={stage} className="relative mx-auto w-full max-w-[640px]">
      <svg viewBox="0 0 640 430" className="relative w-full overflow-visible" role="img" aria-label="Illustration of a developer with a laptop riding a Duke 390, landing on a ramp">
        <defs>
          <radialGradient id="smoke">
            <stop offset="0%" stopColor="#d9d4cc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d9d4cc" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ramp" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2a2a30" />
            <stop offset="100%" stopColor="#141417" />
          </linearGradient>
          <linearGradient id="tank" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2b3447" />
            <stop offset="100%" stopColor={NAVY} />
          </linearGradient>
          <linearGradient id="wing" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff8a33" />
            <stop offset="100%" stopColor="#e65200" />
          </linearGradient>
          <linearGradient id="tyre" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2a2b30" />
            <stop offset="50%" stopColor="#111214" />
            <stop offset="100%" stopColor="#0a0a0b" />
          </linearGradient>
          <linearGradient id="rim" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffa155" />
            <stop offset="55%" stopColor="#ff6a00" />
            <stop offset="100%" stopColor="#c44a00" />
          </linearGradient>
          <linearGradient id="disc" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#e7eaee" />
            <stop offset="100%" stopColor="#8b9098" />
          </linearGradient>
          <radialGradient id="hub" cx="0.35" cy="0.35">
            <stop offset="0%" stopColor="#c9ced5" />
            <stop offset="100%" stopColor="#5b6068" />
          </radialGradient>
          <linearGradient id="alu" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#9aa0a8" />
            <stop offset="45%" stopColor="#5d636c" />
            <stop offset="100%" stopColor="#2f3238" />
          </linearGradient>
          <linearGradient id="engine" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#4a4e57" />
            <stop offset="100%" stopColor="#1f2126" />
          </linearGradient>
          <linearGradient id="bodyDark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3a4152" />
            <stop offset="40%" stopColor="#1f2430" />
            <stop offset="100%" stopColor="#12151c" />
          </linearGradient>
          <linearGradient id="orangeBody" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffa45c" />
            <stop offset="35%" stopColor="#ff6a00" />
            <stop offset="100%" stopColor="#c94800" />
          </linearGradient>
          <linearGradient id="fork" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#a33a00" />
            <stop offset="45%" stopColor="#ff8a33" />
            <stop offset="100%" stopColor="#b84400" />
          </linearGradient>
          <linearGradient id="goldLeg" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#8a6322" />
            <stop offset="50%" stopColor="#e6bb62" />
            <stop offset="100%" stopColor="#8a6322" />
          </linearGradient>
          <linearGradient id="pipe" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e2c48a" />
            <stop offset="100%" stopColor="#8f6a2e" />
          </linearGradient>
          <linearGradient id="beam" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#fff6e3" stopOpacity="0.75" />
            <stop offset="45%" stopColor="#fff1d6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#fff1d6" stopOpacity="0" />
          </linearGradient>
          <filter id="beamBlur" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <radialGradient id="screenGlow">
            <stop offset="0%" stopColor="#7fc7ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7fc7ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="screenSheen" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#6fb8ff" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#6fb8ff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="lamp">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="60%" stopColor="#dff0ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#dff0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── ramp / showroom stage ── */}
        <g>
          <ellipse cx="320" cy="384" rx="300" ry="30" fill="rgba(255,106,0,0.12)" />
          <path d="M30 372 L610 372 L640 398 L0 398 Z" fill="url(#ramp)" />
          <path d="M30 372 L610 372" stroke={O} strokeWidth="2.5" opacity="0.85" />
          <path d="M0 398 L640 398 L640 408 L0 408 Z" fill="#0d0d0f" />
          {Array.from({ length: 20 }, (_, i) => (
            <path key={i} d={`M${i * 33} 408 l14 0 l-8 8 l-14 0 Z`} fill={O} opacity="0.7" />
          ))}
          {/* landing shadow grows on impact */}
          <motion.ellipse cx="320" cy="372" rx="230" ry="12" fill="#000" initial={{ opacity: 0.1, scaleX: 0.3 }} animate={go ? { opacity: 0.7, scaleX: 1 } : { opacity: 0.1, scaleX: 0.3 }} transition={{ duration: 0.75, delay: startDelay ?? 0, ease: "easeIn" }} style={{ transformBox: "view-box", transformOrigin: "320px 372px" }} />
        </g>


        {/* ── lightning strike on touchdown ── */}
        {strike > 0 && (
          <g key={strike} pointerEvents="none">
            {[
              "M332 -700 L300 -520 L346 -470 L296 -300 L352 -250 L304 -90 L344 -40 L318 120 L338 160 L320 372",
              "M346 -470 L392 -420 L380 -360",
              "M296 -300 L248 -250 L262 -200",
              "M304 -90 L262 -40",
            ].map((d, i) => (
              <g key={i}>
                <motion.path d={d} fill="none" stroke="#9fd8ff" strokeWidth={i ? 7 : 16} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "blur(6px)" }} initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 1, 0.2, 1, 0] }} transition={{ pathLength: { duration: 0.09, delay: i * 0.03 }, opacity: { duration: 0.55, times: [0, 0.35, 0.45, 0.6, 1] } }} />
                <motion.path d={d} fill="none" stroke="#ffffff" strokeWidth={i ? 2 : 4.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 1, 0.2, 1, 0] }} transition={{ pathLength: { duration: 0.09, delay: i * 0.03 }, opacity: { duration: 0.55, times: [0, 0.35, 0.45, 0.6, 1] } }} />
              </g>
            ))}
            {/* scorch glow on the ramp */}
            <motion.ellipse cx="320" cy="372" rx="160" ry="22" fill="#9fd8ff" style={{ filter: "blur(10px)" }} initial={{ opacity: 0.9, scale: 0.4 }} animate={{ opacity: 0, scale: 1.6 }} transition={{ duration: 0.7, ease: "easeOut" }} />
            {/* sparks */}
            {Array.from({ length: 14 }, (_, i) => {
              const a = (-Math.PI * (0.08 + (i / 13) * 0.84));
              const d = 90 + (i % 4) * 30;
              return (
                <motion.line key={i} x1="320" y1="368" x2="320" y2="368" stroke={i % 3 ? "#fff6c8" : "#9fd8ff"} strokeWidth="2.5" strokeLinecap="round"
                  initial={{ opacity: 1 }}
                  animate={{ x1: [320, 320 + Math.cos(a) * d * 0.6], y1: [368, 368 + Math.sin(a) * d * 0.6], x2: [320, 320 + Math.cos(a) * d], y2: [368, 368 + Math.sin(a) * d + 18], opacity: [1, 1, 0] }}
                  transition={{ duration: 0.55, ease: "easeOut", times: [0, 0.6, 1] }} />
              );
            })}
          </g>
        )}

        {/* ── the bike drops in ── */}
        <motion.g
          initial={{ y: -1400, rotate: -7, opacity: 0 }}
          animate={go ? { y: 0, rotate: 0, opacity: 1 } : { y: -1400, rotate: -7, opacity: 0 }}
          transition={{ y: { duration: 0.8, delay: startDelay ?? 0, ease: [0.55, 0, 1, 0.45] }, rotate: { duration: 0.8, delay: startDelay ?? 0, ease: "easeIn" }, opacity: { duration: 0.01, delay: startDelay ?? 0 } }}
          style={{ transformBox: "view-box", transformOrigin: "320px 300px" }}
        >
          <Wheel cx={150} cy={302} spin={landed} />
          <Wheel cx={488} cy={302} front spin={landed} />

          <motion.g animate={body} style={{ transformBox: "view-box", transformOrigin: "320px 300px", cursor: "pointer" }} onClick={rev}>
            {/* idle engine shiver once running */}
            <motion.g animate={lights ? { y: [0, -0.8, 0, 0.6, 0] } : {}} transition={{ duration: 0.18, repeat: Infinity }}>
              {/* ── chain + rear sprocket ── */}
              <circle cx="150" cy="302" r="20" fill="none" stroke="#3b3d43" strokeWidth="4" strokeDasharray="3 2" />
              <path d="M150 282 L302 270 M150 322 L300 296" stroke="#45474d" strokeWidth="3" strokeDasharray="4 2" />
              <circle cx="300" cy="284" r="9" fill="#2c2e33" />

              {/* ── cast aluminium swingarm ── */}
              <path d="M140 296 L296 262 C304 260 310 266 308 274 L304 290 L150 314 C140 316 134 300 140 296 Z" fill="url(#alu)" stroke="#1a1b1f" strokeWidth="1.5" />
              <path d="M160 300 L290 272" stroke="#c7ccd2" strokeWidth="1.5" opacity="0.7" />
              <path d="M180 300 L250 286 L246 296 L184 308 Z" fill="#2a2d33" opacity="0.6" />

              {/* ── rear shock: orange spring ── */}
              <path d="M262 214 L236 270" stroke="#2a2c31" strokeWidth="11" strokeLinecap="round" />
              {Array.from({ length: 8 }, (_, i) => (
                <path key={i} d={`M${258 - i * 3.1} ${222 + i * 6} l-9 3`} stroke={O} strokeWidth="4" strokeLinecap="round" />
              ))}

              {/* ── engine ── */}
              <path d="M266 226 L350 218 C362 217 372 226 376 238 L384 266 C388 282 378 300 362 308 L322 318 C300 322 276 314 266 298 L258 270 C254 252 256 232 266 226 Z" fill="url(#engine)" stroke="#121317" strokeWidth="2" />
              {/* cylinder fins */}
              {Array.from({ length: 5 }, (_, i) => (
                <path key={i} d={`M${340 + i * 2} ${224 + i * 7} L${376 + i * 1.5} ${232 + i * 7}`} stroke="#626772" strokeWidth="2" />
              ))}
              {/* clutch / stator cover */}
              <ellipse cx="306" cy="276" rx="30" ry="26" fill="#3b3f47" stroke="#1a1b1f" strokeWidth="2" />
              <ellipse cx="306" cy="276" rx="21" ry="18" fill="#2b2e34" />
              <path d="M290 264 A20 18 0 0 1 320 262" stroke="#8b919a" strokeWidth="2" fill="none" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <circle key={i} cx={306 + Math.cos(i * 1.047) * 25} cy={276 + Math.sin(i * 1.047) * 22} r="1.8" fill="#a9afb7" />
              ))}
              {/* sump guard */}
              <path d="M282 312 L360 306 L372 318 L290 326 Z" fill="#17181c" />

              {/* ── radiator with grille + shroud ── */}
              <path d="M374 192 L408 186 L416 262 L386 268 Z" fill="#121317" />
              <g stroke="#2c2f36" strokeWidth="1.2">
                {Array.from({ length: 9 }, (_, i) => (
                  <path key={i} d={`M${376 + i * 0.3} ${198 + i * 7.4} L${410 + i * 0.6} ${193 + i * 7.6}`} />
                ))}
              </g>

              {/* ── exhaust: gold header + short underslung silencer ── */}
              <path d="M396 250 C400 296 380 318 344 326 L282 334" stroke="url(#pipe)" strokeWidth="10" fill="none" strokeLinecap="round" />
              <path d="M396 250 C400 296 380 318 344 326 L282 334" stroke="#f6e3b8" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
              <path d="M286 320 L210 312 C200 311 194 318 194 326 C194 334 200 340 210 340 L284 344 Z" fill="#1d1f24" stroke="#0d0d0f" strokeWidth="2" />
              <path d="M280 324 L214 318" stroke="#4d515a" strokeWidth="2" />
              <ellipse cx="196" cy="327" rx="5" ry="10" fill="#8f949b" stroke="#2a2c31" strokeWidth="2" />

              {/* ── orange trellis frame with depth ── */}
              <g strokeLinecap="round" fill="none">
                <g stroke="#a33a00" strokeWidth="9">
                  <path d="M432 150 L304 228" />
                  <path d="M430 168 L346 234" />
                  <path d="M346 234 L304 228 L268 224" />
                  <path d="M372 196 L346 234" />
                  <path d="M304 228 L290 268" />
                  <path d="M338 210 L304 228" />
                </g>
                <g stroke="url(#rim)" strokeWidth="6">
                  <path d="M432 150 L304 228" />
                  <path d="M430 168 L346 234" />
                  <path d="M346 234 L304 228 L268 224" />
                  <path d="M372 196 L346 234" />
                  <path d="M304 228 L290 268" />
                  <path d="M338 210 L304 228" />
                </g>
                <g stroke="#ffd0a8" strokeWidth="1.5" opacity="0.8">
                  <path d="M430 149 L304 226" />
                  <path d="M428 167 L346 232" />
                </g>
              </g>
              {/* subframe */}
              <path d="M288 222 L168 160" stroke="#1d1f24" strokeWidth="7" strokeLinecap="round" />
              <path d="M276 214 L172 162" stroke="#3a3d45" strokeWidth="2" strokeLinecap="round" />

              {/* ── USD fork: orange uppers, gold lowers, triple clamp ── */}
              <path d="M444 132 L466 214" stroke="url(#fork)" strokeWidth="17" strokeLinecap="round" />
              <path d="M466 210 L489 300" stroke="url(#goldLeg)" strokeWidth="12" strokeLinecap="round" />
              <path d="M448 136 L468 212" stroke="#ffd0a8" strokeWidth="2" opacity="0.7" />
              <rect x="430" y="128" width="30" height="12" rx="4" fill="#1d1f24" transform="rotate(15 445 134)" />
              {/* front mudguard */}
              <path d="M446 250 C462 232 504 230 528 250 L520 256 C500 242 470 244 456 258 Z" fill="url(#bodyDark)" stroke="#0d0d0f" strokeWidth="1.5" />

              {/* ── knife-edge tail + LED tail light + seats ── */}
              <path d="M136 146 L178 142 L266 160 L286 184 L250 192 L172 170 L132 156 Z" fill="url(#bodyDark)" stroke="#0d0e12" strokeWidth="1.5" />
              <path d="M140 150 L250 170" stroke={O} strokeWidth="3" strokeLinecap="round" />
              <path d="M150 156 L236 176" stroke="#f2f2f0" strokeWidth="1.5" opacity="0.7" />
              <path d="M128 150 L140 146 L142 154 L130 158 Z" fill="#ff2a2a" />
              <circle cx="132" cy="152" r="7" fill="#ff2a2a" opacity="0.35" />
              {/* rider seat + pillion */}
              <path d="M222 150 C260 146 300 150 332 158 L328 174 C292 170 258 168 220 166 Z" fill="#0b0b0d" stroke="#1d1e22" strokeWidth="1" />
              <path d="M178 140 L232 148 L230 160 L176 152 Z" fill="#141518" />
              <path d="M226 152 C262 149 298 152 330 160" stroke="#2c2e34" strokeWidth="1.5" fill="none" />
              {/* plate hugger */}
              <path d="M160 168 L130 214" stroke="#1d1f24" strokeWidth="5" strokeLinecap="round" />
              <rect x="110" y="208" width="36" height="22" rx="3" fill="#ecebe6" stroke="#1d1f24" strokeWidth="2" transform="rotate(8 128 219)" />
              <rect x="104" y="196" width="10" height="5" rx="2" fill={O} />
              <rect x="146" y="200" width="10" height="5" rx="2" fill={O} />

              {/* ── faceted tank ── */}
              <path d="M316 152 C324 126 372 114 412 118 C424 119 434 126 436 136 L432 178 L362 192 L320 184 Z" fill="url(#bodyDark)" stroke="#0d0e12" strokeWidth="2" />
              <path d="M330 140 C350 126 390 120 424 126" stroke="#6b7590" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
              <path d="M326 168 L372 158 L430 160" stroke="#0a0b0e" strokeWidth="2" fill="none" opacity="0.7" />
              <path d="M344 130 L352 150 L398 146 L404 122" fill="#ffffff" opacity="0.05" />

              {/* ── sharp orange shroud + graphics ── */}
              <path d="M370 150 L452 158 L504 190 L488 208 L436 218 L398 228 L366 210 Z" fill="url(#orangeBody)" stroke="#a33a00" strokeWidth="1.5" />
              <path d="M374 152 L450 160 L496 188" stroke="#ffd0a8" strokeWidth="1.5" fill="none" opacity="0.8" />
              <path d="M396 174 L474 184 L458 200 L388 196 Z" fill="#1d2433" />
              <path d="M410 214 L478 204 L466 214 L404 224 Z" fill="#f4f4f2" />
              <text x="404" y="194" fontFamily="system-ui, sans-serif" fontWeight="900" fontStyle="italic" fontSize="20" fill="none" stroke={O} strokeWidth="1.6" transform="skewX(-12)" style={{ transformBox: "fill-box" }}>
                390
              </text>

              {/* ── headlight beam, anchored to the lens ── */}
              <motion.path
                d="M503 168 L900 92 L900 300 L503 184 Z"
                fill="url(#beam)"
                filter="url(#beamBlur)"
                initial={{ opacity: 0 }}
                animate={lights ? { opacity: [0, 0.9, 0.2, 1, 0.85] } : {}}
                transition={{ duration: 0.9, times: [0, 0.2, 0.35, 0.55, 1] }}
                style={{ pointerEvents: "none" }}
              />
              {/* ── headlight: angular housing, split LED, visor ── */}
              <path d="M468 136 L502 144 L520 172 L508 200 L484 204 L470 190 Z" fill="#141518" stroke="#000" strokeWidth="1.5" />
              <path d="M482 150 L504 156 L514 174 L504 194 L488 196 L480 186 Z" fill="#232a35" />
              <motion.g initial={{ opacity: 0.2 }} animate={lights ? { opacity: [0.2, 1, 0.35, 1] } : {}} transition={{ duration: 0.7, times: [0, 0.3, 0.5, 1] }}>
                <path d="M486 154 L506 160 L509 167 L488 161 Z" fill="#f4fbff" />
                <path d="M488 194 L506 186 L508 193 L490 200 Z" fill="#f4fbff" />
                <circle cx="502" cy="176" r="24" fill="url(#lamp)" />
                <circle cx="503" cy="176" r="6" fill="#fff" />
              </motion.g>
              <path d="M466 138 L484 106 L494 110 L480 142 Z" fill="#2b3340" opacity="0.85" />
              <path d="M470 136 L486 108" stroke="#8fa3c0" strokeWidth="1" opacity="0.6" />

              {/* ── bars + mirror + lever ── */}
              <path d="M428 124 L464 116" stroke="#121317" strokeWidth="6" strokeLinecap="round" />
              <path d="M458 118 L470 124" stroke="#2c2e34" strokeWidth="3" strokeLinecap="round" />
              <path d="M446 118 L438 92" stroke="#121317" strokeWidth="3" />
              <path d="M424 84 L454 82 L456 96 L426 98 Z" fill="#141518" stroke="#000" strokeWidth="1" />
              <path d="M428 87 L452 85" stroke="#56606f" strokeWidth="1" />

              {/* ── the developer: hoodie, jeans, headphones, laptop open on the tank ── */}
              <g transform={rider.transform}>
                <ellipse cx="392" cy="96" rx="80" ry="56" fill="url(#screenGlow)" />
                {/* leg: jeans thigh + shin, red sneaker on the peg */}
                <path d="M258 146 C292 140 328 152 350 174 L358 188 L340 198 L320 180 C300 168 278 166 258 166 Z" fill="#3e5d8f" />
                <path d="M342 186 C338 222 320 254 306 282 L292 282 C300 252 314 220 322 188 Z" fill="#35517d" />
                <path d="M284 276 L314 276 L318 290 L280 290 Z" fill="#e3202c" />
                <path d="M280 288 L318 288 L318 293 L280 293 Z" fill="#f2f2f0" />
                {/* torso: charcoal hoodie leaning to the keyboard */}
                <path d="M254 154 C248 122 262 94 294 84 C312 80 328 88 334 102 L320 124 C304 132 288 146 280 162 Z" fill="#3a3d48" />
                <path d="M262 110 C258 126 258 140 262 152" stroke="#2c2e36" strokeWidth="3" fill="none" />
                {/* backpack with yellow strap */}
                <path d="M258 98 C246 108 242 132 250 150 L266 148 C262 130 264 114 274 102 Z" fill="#17181c" />
                <path d="M286 90 C282 110 284 130 290 146" stroke="#e1c21f" strokeWidth="4" fill="none" />
                {/* arm reaching to the keyboard */}
                {/* two-part arm: upper arm (shoulder joint) -> forearm (elbow joint) -> hand */}
                <g transform={arm.transform}>
                  {/* upper arm: shoulder (304,102) -> elbow (339,114) */}
                  <path d="M304 102 L339 114" stroke="#454856" strokeWidth="13" strokeLinecap="round" />
                  <g transform={forearm.transform}>
                    {/* forearm: elbow -> wrist (370,121) */}
                    <path d="M339 114 L369 121" stroke="#4c4f5d" strokeWidth="11" strokeLinecap="round" />
                    <circle cx="374" cy="121" r="6.5" fill="#c98f68" data-cv-hand="" />
                    {/* the CV in hand during the wind-up */}
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: holding ? 1 : 0 }} transition={{ duration: 0.1 }}>
                      <rect x="370" y="104" width="16" height="21" rx="1.5" fill="#f4f1ea" stroke="#d8d2c4" strokeWidth="0.8" transform="rotate(-12 378 114)" />
                      <rect x="372" y="107" width="8" height="2" fill={O} transform="rotate(-12 378 114)" />
                    </motion.g>
                  </g>
                  {/* elbow joint */}
                  <circle cx="339" cy="114" r="6.5" fill="#4a4d5a" />
                </g>
                {/* shoulder cap keeps the joint closed at any angle */}
                <circle cx="303" cy="102" r="9" fill="#3a3d48" />
                {/* head: side profile (looking at the laptop) <-> front (looking at you) */}
                <motion.g animate={look ? { opacity: 0, scaleX: 0.2 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.18 }} style={{ transformBox: "view-box", transformOrigin: "322px 66px" }}>
                <path d="M300 84 C298 70 306 58 318 56 L322 84 Z" fill="#3a3d48" />
                <circle cx="322" cy="66" r="15" fill="#c98f68" />
                <path d="M307 64 C306 50 322 44 334 50 C338 54 338 58 336 60 C328 54 316 56 310 66 Z" fill="#20160f" />
                <circle cx="331" cy="66" r="2" fill="#20160f" />
                <path d="M306 66 C304 50 330 44 338 58" stroke="#f2f2f0" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <rect x="303" y="62" width="8" height="13" rx="3.5" fill={O} />
                {/* screen light on the face */}
                <path d="M334 62 C338 66 339 72 336 77 L331 76 Z" fill="#9fd6ff" opacity="0.6" />
                </motion.g>
                <motion.g initial={{ opacity: 0 }} animate={look ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.2 }} transition={{ duration: 0.18 }} style={{ transformBox: "view-box", transformOrigin: "322px 66px" }}>
                  <path d="M300 84 C298 72 306 60 318 58 L326 84 Z" fill="#3a3d48" />
                  <circle cx="322" cy="66" r="15" fill="#c98f68" />
                  {/* hair */}
                  <path d="M307 62 C306 48 338 46 337 62 C332 56 314 55 307 62 Z" fill="#20160f" />
                  {/* eyes, brows, smile */}
                  <circle cx="317" cy="67" r="1.9" fill="#20160f" />
                  <circle cx="327" cy="67" r="1.9" fill="#20160f" />
                  <path d="M314 63 L319 62.5 M325 62.5 L330 63" stroke="#20160f" strokeWidth="1.3" strokeLinecap="round" />
                  <path d="M317 73 Q322 77 327 73" stroke="#7a3b2a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                  {/* headphones, both cups */}
                  <path d="M306 66 C305 48 339 48 338 66" stroke="#f2f2f0" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  <rect x="302" y="62" width="7" height="12" rx="3.5" fill={O} />
                  <rect x="335" y="62" width="7" height="12" rx="3.5" fill={O} />
                </motion.g>
                {/* strong rim light so he reads against the dark bike */}
                <path d="M254 154 C248 122 262 94 294 84 C300 82 302 76 306 70" stroke="#ff9a4d" strokeWidth="2" fill="none" />
                {/* laptop, angled toward the viewer so the screen reads */}
                <path d="M346 126 L424 118 L428 124 L350 133 Z" fill="#b8bec6" />
                <path d="M346 126 L424 118" stroke="#e4e7eb" strokeWidth="1" />
                <path d="M362 122 L424 117 L432 62 L370 66 Z" fill="#c9ced5" />
                <path d="M366 119 L421 115 L428 67 L373 70 Z" fill="#0b1018" />
                <path d="M366 119 L421 115 L428 67 L373 70 Z" fill="url(#screenSheen)" />
                {/* code typing on screen */}
                <g>
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.path
                      key={i}
                      d={`M${377 - i * 0.6 + (i % 3 === 1 ? 5 : 0)} ${76 + i * 6} l${[24, 16, 28, 12, 20, 26, 14][i]} -${[1.5, 1, 1.8, 0.8, 1.3, 1.7, 0.9][i]}`}
                      stroke={["#7fe0c4", "#ffb36b", "#9fd6ff", "#ffb36b", "#7fe0c4", "#c7a6ff", "#9fd6ff"][i]}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={lights ? { pathLength: [0, 1, 1, 0] } : { pathLength: 0.6 }}
                      transition={{ duration: 3, delay: i * 0.3, repeat: Infinity, times: [0, 0.3, 0.85, 1] }}
                    />
                  ))}
                </g>
              </g>
              {/* footpeg */}
              <path d="M286 286 L306 286" stroke="#a9afb7" strokeWidth="5" strokeLinecap="round" />
            </motion.g>
          </motion.g>

        </motion.g>

      </svg>
      <Particles ref={fx} />
      {strike > 0 && typeof document !== "undefined" && createPortal(
        <motion.div key={`flash-${strike}`} aria-hidden className="pointer-events-none fixed inset-0 z-[70] bg-[#e8f6ff]" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.75, 0, 0.5, 0] }} transition={{ duration: 0.45, times: [0, 0.08, 0.3, 0.42, 1] }} />,
        document.body
      )}
      <motion.button
        type="button"
        onClick={rev}
        disabled={revving}
        initial={{ opacity: 0, y: 10 }}
        animate={lights ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="group absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#ff6a00]/60 bg-card/85 px-4 py-2 font-mono text-[11px] font-bold tracking-widest text-[#e65c00] shadow-lg backdrop-blur transition hover:border-[#ff6a00] hover:bg-[#ff6a00] hover:text-black dark:bg-black/60 dark:text-[#ffb36b]"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
        {revving ? "REVVING…" : "REV IT"}
      </motion.button>
    </div>
  );
}
