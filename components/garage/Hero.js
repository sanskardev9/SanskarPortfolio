"use client";

// Developer-first hero: the garage shutter rolls up on every load, revealing a "workbench" of
// real shipped apps (browser windows + phone + live terminal). No personal photo here.

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";

const LINES = [
  { t: "$ whoami", c: "text-white/90" },
  { t: "sanskar · full-stack developer", c: "text-white/60" },
  { t: "$ ls ~/builds", c: "text-white/90" },
  { t: "fitmate  jobchain  ridemate  routemate  realtimerivals  moneymate", c: "text-[#ffb36b]" },
  { t: "$ npm run ship", c: "text-white/90" },
  { t: "✓ 6 apps built end to end", c: "text-emerald-400" },
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

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const backY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const frontY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // everything enters after the shutter has rolled up (~1.8s)
  const D = 1.6;
  const enter = (d) => ({ initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: D + d, ease: [0.2, 0.8, 0.2, 1] } });

  return (
    <section ref={ref} id="top" aria-label="Intro" className="grain relative min-h-[100svh] overflow-hidden bg-[#0c0c0e] text-white">
      {/* blueprint grid + warm overhead lights */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_60%_40%,black_30%,transparent_75%)]" />
      {[22, 72].map((x, i) => (
        <div key={x} className="absolute top-0 hidden md:block" style={{ left: `${x}%` }}>
          <div className="ceiling-bar -translate-x-1/2" style={{ animationDelay: `${1.7 + i * 0.3}s` }} />
          <div className="ceiling-cone -translate-x-1/2 opacity-60" style={{ animationDelay: `${1.7 + i * 0.3}s` }} />
        </div>
      ))}
      <div className="absolute top-1/3 right-[10%] size-[480px] rounded-full bg-[#ff6a00]/10 blur-[120px]" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-12 px-6 pt-28 pb-20 md:px-12 lg:grid-cols-[1fr_1.05fr] lg:pt-20">
        {/* copy */}
        <motion.div style={{ y: copyY, opacity: fade }}>
          <motion.div {...enter(0.1)} className="neon-flicker relative mb-6 inline-block rounded-lg border border-[#ff8a2a]/70 px-3.5 py-1.5">
            <div className="neon-tube pointer-events-none absolute inset-0 rounded-lg" />
            <p className="neon font-mono text-[11px] font-bold tracking-[0.3em]">SANSKAR&apos;S GARAGE</p>
          </motion.div>
          <motion.h1 {...enter(0.2)} className="text-[2.7rem] leading-[0.98] font-black tracking-tight text-balance sm:text-6xl lg:text-[4.4rem]">
            I build the apps I wish <span className="text-[#ff6a00]">existed.</span>
          </motion.h1>
          <motion.p {...enter(0.35)} className="mt-6 max-w-md text-lg text-white/70">
            Hi, I&apos;m Sanskar, a full-stack developer. I take ideas from the first screen to the server behind it with React, Next.js and Node.js.
          </motion.p>
          <motion.div {...enter(0.5)} className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#builds" className="group inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-6 py-3 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_#ff6a00]">
              See the builds
              <svg viewBox="0 0 24 24" className="size-4 transition group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </a>
            <a href={site.cv} target="_blank" rel="noreferrer" className="rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-white/60">
              View CV
            </a>
            <span className="ml-1 inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-white/55">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              OPEN TO ROLES
            </span>
          </motion.div>
        </motion.div>

        {/* workbench of real apps */}
        <div className="relative mx-auto h-[360px] w-full max-w-[560px] sm:h-[460px] lg:h-[520px]">
          <motion.div style={{ y: backY }} className="absolute top-0 right-0 w-[78%]">
            <motion.div {...enter(0.4)}>
              <Browser src="/photos/jobchain.jpg" url="job-chain.vercel.app" className="opacity-80" />
            </motion.div>
          </motion.div>
          <motion.div style={{ y: frontY }} className="absolute top-[22%] left-0 w-[78%]">
            <motion.div {...enter(0.55)}>
              <Browser src="/photos/fitmate.jpg" url="fitmateapp.vercel.app" priority />
            </motion.div>
          </motion.div>
          <motion.div style={{ y: phoneY }} className="absolute right-[2%] bottom-[2%] w-[27%]">
            <motion.div {...enter(0.7)} className="float-slow overflow-hidden rounded-[1.4rem] border-[5px] border-[#0a0a0a] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)]">
              <Image src="/photos/ridemate-map.jpg" alt="" width={600} height={816} sizes="160px" className="h-auto w-full" />
            </motion.div>
          </motion.div>
          <motion.div {...enter(0.85)} className="absolute bottom-0 left-[4%] w-[66%] sm:left-[6%]">
            <Terminal />
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
