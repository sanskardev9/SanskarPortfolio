"use client";

// Garage hero: the door rolls up on first visit, the neon sign flickers on, spotlights sweep
// over Sanskar's Duke. Real photo, no 3D.

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";

export default function Hero() {
  const ref = useRef(null);
  const [skip, setSkip] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Door animation plays once per visit
  useEffect(() => {
    try {
      if (sessionStorage.getItem("door")) setSkip(true);
      sessionStorage.setItem("door", "1");
    } catch {}
  }, []);

  return (
    <section ref={ref} id="top" aria-label="Intro" className={`grain relative h-[100svh] min-h-[640px] overflow-hidden bg-[#0c0c0e] text-white ${skip ? "door-skip" : ""}`}>
      {/* photo */}
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
        <Image src="/photos/duke.jpg" alt="Sanskar on his Duke 390 on a bridge lined with prayer flags" fill priority quality={90} sizes="100vw" className="object-cover object-[38%_center] md:object-[30%_center]" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/35 to-[#0c0c0e]/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0e]/80 via-transparent to-transparent" />

      {/* spotlights */}
      <div className="spot-beam spot-a" />
      <div className="spot-beam spot-b" />

      {/* neon sign */}
      <div className="absolute top-24 right-6 left-6 flex justify-center md:top-28 md:right-12 md:left-auto">
        <div className="neon-flicker relative rounded-xl border-2 border-[#ff8a2a]/70 px-5 py-2.5 md:px-7 md:py-3">
          <div className="neon-tube pointer-events-none absolute inset-0 rounded-xl" />
          <p className="neon font-mono text-sm font-bold tracking-[0.35em] md:text-base">SANSKAR&apos;S GARAGE</p>
        </div>
      </div>

      {/* copy */}
      <motion.div style={{ y: copyY, opacity: fade }} className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-20 md:px-12 md:pb-24">
        <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 font-mono text-[11px] tracking-widest text-white/80 backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff6a00] opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-[#ff6a00]" />
          </span>
          OPEN TO FULL-STACK ROLES
        </p>
        <h1 className="max-w-4xl text-[2.7rem] leading-[0.98] font-black tracking-tight text-balance sm:text-7xl lg:text-8xl">
          I build the apps
          <br />I wish <span className="text-[#ff6a00]">existed.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/75">
          {site.name} · {site.role}. React, Next.js and Node.js, end to end, from the first screen to the server behind it.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#builds" className="group inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-6 py-3 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_#ff6a00]">
            See the builds
            <svg viewBox="0 0 24 24" className="size-4 transition group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </a>
          <a href={site.cv} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:border-white/60">
            View CV
          </a>
        </div>
      </motion.div>

      {/* hazard strip at the threshold */}
      <div className="hazard absolute inset-x-0 bottom-0 h-1.5 opacity-80" />

      {/* the roll-up door + warm light spill */}
      <div className="door-light pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/2 bg-gradient-to-t from-[#ffb36b]/50 to-transparent" />
      <div className="garage-door pointer-events-none absolute inset-0 z-30" aria-hidden />
    </section>
  );
}
