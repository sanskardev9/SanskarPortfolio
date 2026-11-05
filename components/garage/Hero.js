"use client";

import { openCV } from "@/components/garage/CVThrow";

// Developer-first hero: the garage shutter rolls up on every load, revealing a "workbench" of
// real shipped apps (browser windows + phone + live terminal). No personal photo here.

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import Magnetic from "../fx/Magnetic";
import DropBike from "./DropBike";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";

const LINES = [
  { t: "$ whoami", c: "text-white/90" },
  { t: "sanskar · full-stack developer", c: "text-white/60" },
  { t: "$ ls ~/builds", c: "text-white/90" },
  { t: "fitmate  jobchain  ridemate  realtimerivals  moneymate", c: "text-[#ffb36b]" },
  { t: "$ npm run ship", c: "text-white/90" },
  { t: "✓ 5 apps built end to end", c: "text-emerald-400" },
];

function Terminal() {
  const [shown, setShown] = useState(0);
  const [chars, setChars] = useState(0);
  useEffect(() => {
    if (shown >= LINES.length) return;
    const line = LINES[shown].t;
    const isCmd = line.startsWith("$");
    const id = setTimeout(
      () => {
        if (isCmd && chars < line.length) setChars((c) => c + 1);
        else {
          setShown((s) => s + 1);
          setChars(0);
        }
      },
      shown === 0 && chars === 0 ? 2300 : isCmd ? (chars < line.length ? 45 : 250) : 350
    );
    return () => clearTimeout(id);
  }, [shown, chars]);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0d]/95 font-mono text-[10px] leading-relaxed shadow-2xl backdrop-blur sm:text-xs">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-white/40">~/garage — zsh</span>
      </div>
      <div className="min-h-[124px] p-3">
        {LINES.slice(0, shown).map((l, i) => (
          <p key={i} className={`${l.c} truncate`}>
            {l.t}
          </p>
        ))}
        {shown < LINES.length && (
          <p className="text-white/90">
            {LINES[shown].t.startsWith("$") ? LINES[shown].t.slice(0, chars) : ""}
            <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-[#ff6a00]" />
          </p>
        )}
      </div>
    </div>
  );
}

function Browser({ src, url, className = "", priority }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-white/10 bg-[#0e0e11] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="size-2 rounded-full bg-white/20" />
        <span className="size-2 rounded-full bg-white/20" />
        <span className="size-2 rounded-full bg-white/20" />
        <span className="ml-2 truncate rounded bg-white/5 px-2 py-0.5 font-mono text-[9px] text-white/45">{url}</span>
      </div>
      <Image src={src} alt="" width={1440} height={900} priority={priority} sizes="(min-width: 1024px) 520px, 90vw" className="h-auto w-full" />
    </div>
  );
}

function Letters({ text, className = "", start = 0 }) {
  let n = 0;
  return text.split(" ").map((word, wi, arr) => (
    <span key={wi} className="inline-block whitespace-nowrap">
      {word.split("").map((ch) => {
        const i = n++;
        return (
          <span key={i} className="inline-block pb-[0.08em] align-top">
            <motion.span
              className={`inline-block ${className}`}
              initial={{ y: "60%", rotate: 8, opacity: 0 }}
              animate={{ y: "0%", rotate: 0, opacity: 1 }}
              transition={{ duration: 0.75, delay: start + i * 0.028, ease: [0.2, 0.9, 0.2, 1] }}
            >
              <span className="glyph inline-block" style={{ transformOrigin: "50% 100%" }}>
                {ch}
              </span>
            </motion.span>
          </span>
        );
      })}
      {wi < arr.length - 1 ? "\u00a0" : null}
    </span>
  ));
}

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const backY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const frontY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);


  // pointer drives the 3D workbench + the cursor glow
  const mx = useMotionValue(0.5), my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 70, damping: 18 }), smy = useSpring(my, { stiffness: 70, damping: 18 });
  const benchRY = useTransform(smx, [0, 1], [14, -14]);
  const benchRX = useTransform(smy, [0, 1], [-10, 10]);
  const glowX = useTransform(smx, (v) => `${v * 100}%`), glowY = useTransform(smy, (v) => `${v * 100}%`);
  const glow = useMotionTemplate`radial-gradient(520px circle at ${glowX} ${glowY}, rgba(255,140,50,0.16), transparent 60%)`;
  const gridMask = useMotionTemplate`radial-gradient(380px circle at ${glowX} ${glowY}, black, transparent 70%)`;
  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  // everything enters after the shutter has rolled up (~1.8s)
  const D = 1.6;
  const enter = (d) => ({ initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: D + d, ease: [0.2, 0.8, 0.2, 1] } });

  return (
    <section ref={ref} onPointerMove={onMove} id="top" aria-label="Intro" className="grain relative min-h-[100svh] overflow-hidden bg-bg text-fg">
      {/* cursor glow + bright grid that follows the mouse */}
      <motion.div aria-hidden style={{ background: glow }} className="pointer-events-none absolute inset-0" />
      <motion.div aria-hidden style={{ maskImage: gridMask, WebkitMaskImage: gridMask }} className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,140,50,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,140,50,0.22)_1px,transparent_1px)] bg-[size:56px_56px]" />
      {/* blueprint grid + warm overhead lights */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_60%_40%,black_30%,transparent_75%)]" />
      {[22, 72].map((x, i) => (
        <div key={x} className="absolute top-0 hidden md:block" style={{ left: `${x}%` }}>
          <div className="ceiling-bar -translate-x-1/2" style={{ animationDelay: `${1.7 + i * 0.3}s` }} />
          <div className="ceiling-cone -translate-x-1/2 opacity-60" style={{ animationDelay: `${1.7 + i * 0.3}s` }} />
        </div>
      ))}
      <div className="absolute top-1/3 right-[10%] size-[480px] rounded-full bg-[#ff6a00]/10 blur-[120px]" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-6xl content-center items-center gap-2 px-5 pt-20 pb-10 sm:gap-12 sm:px-6 sm:pt-28 sm:pb-20 md:px-12 lg:grid-cols-[1.15fr_1fr] lg:pt-20">
        {/* copy */}
        <motion.div style={{ y: copyY, opacity: fade }}>
          <motion.div {...enter(0.1)} className="neon-flicker relative mb-4 inline-block sm:mb-6 rounded-lg border border-[#ff8a2a]/70 px-3.5 py-1.5">
            <div className="neon-tube pointer-events-none absolute inset-0 rounded-lg" />
            <p className="neon font-mono text-[11px] font-bold tracking-[0.3em]">SANSKAR&apos;S GARAGE</p>
          </motion.div>
          <div className="relative">
          <h1 aria-label="I build the apps I wish existed." className="text-[2.15rem] leading-[1] font-black tracking-tight sm:text-6xl lg:text-[3.9rem] xl:text-[4.2rem]">
            <span aria-hidden className="block"><Letters text="I build the apps" start={D + 0.15} /></span>
            <span aria-hidden className="block"><Letters text="I wish" start={D + 0.55} />{"\u00a0"}<span className="shimmer-text"><Letters text="existed." start={D + 0.75} /></span></span>
          </h1>
          </div>
          <motion.p {...enter(0.35)} className="mt-3 max-w-md text-[15px] text-muted sm:mt-6 sm:text-lg">
            Hi, I&apos;m Sanskar, a full-stack developer.<span className="hidden sm:inline"> I take ideas from the first screen to the server behind it with React, Next.js and Node.js.</span><span className="sm:hidden"> React, Next.js, Node.js, end to end.</span>
          </motion.p>
          <motion.div {...enter(0.5)} className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-8 sm:gap-3">
            <Magnetic><a href="#builds" className="group inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-6 py-3 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_#ff6a00]">
              See the builds
              <svg viewBox="0 0 24 24" className="size-4 transition group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </a></Magnetic>
            <Magnetic><a href={site.cv} onClick={openCV} className="inline-block rounded-full border border-line bg-card/60 px-6 py-3 text-sm font-semibold transition hover:border-fg">
              View CV
            </a></Magnetic>
            <span className="ml-1 inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              OPEN TO ROLES
            </span>
          </motion.div>
        </motion.div>

        {/* the Duke drops onto the ramp */}
        <div className="relative -mx-4 sm:mx-0" style={{ perspective: 1200 }}>
          <motion.div style={{ rotateX: benchRX, rotateY: benchRY }}>
            <DropBike startDelay={D + 0.1} />
          </motion.div>
        </div>
      </div>

      <div className="hazard absolute inset-x-0 bottom-0 h-1.5 opacity-80" />

      {/* garage shutter: rolls up on every load */}
      <div className="door-light pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/2 bg-gradient-to-t from-[#ffb36b]/40 to-transparent" />
      <div className="garage-door pointer-events-none fixed inset-0 z-[60]" aria-hidden />
    </section>
  );
}
