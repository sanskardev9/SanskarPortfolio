"use client";

// "Why I build": pinned section that scrolls sideways through problem -> app panels.
// On phones it falls back to a normal vertical stack (no scroll hijacking).

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { story, getProject } from "@/data/projects";

function Panel({ p, i }) {
  return (
    <article className="relative flex h-full w-[min(78vw,560px)] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-line bg-card p-8 md:p-10">
      <span className="absolute -top-24 -right-24 size-72 rounded-full opacity-25 blur-3xl" style={{ background: p.accent }} />
      <div>
        <p className="font-mono text-xs tracking-widest text-subtle">PROBLEM {String(i + 1).padStart(2, "0")}</p>
        <p className="mt-4 text-2xl leading-snug font-semibold tracking-tight text-muted md:text-3xl">“{p.problem}”</p>
      </div>
      <div className="mt-10">
        <p className="font-mono text-xs tracking-widest text-subtle">SO I BUILT</p>
        <a href={`/projects/${p.slug}`} className="group mt-2 flex items-center gap-3">
          <span className="text-5xl font-black tracking-tight md:text-6xl" style={{ color: p.accent }}>
            {p.name}
          </span>
          <svg viewBox="0 0 24 24" className="size-7 text-subtle transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-fg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </a>
        <p className="mt-2 text-muted">{p.tagline}</p>
      </div>
    </article>
  );
}

export default function Story() {
  const ref = useRef(null);
  const items = story.map(getProject).filter(Boolean);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], ["0%", `-${(items.length - 1) * 21}%`]);
  const bar = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  const intro = (
    <div className="shrink-0 md:w-[min(70vw,460px)]">
      <p className="font-mono text-xs tracking-widest text-accent">01 · WHY I BUILD</p>
      <h2 className="mt-3 text-4xl leading-[1.05] font-black tracking-tight text-balance md:text-6xl">
        Every app starts with a problem from <span className="text-accent">my own life.</span>
      </h2>
      <p className="mt-5 max-w-md text-lg text-muted">If something bugs me twice, I build a fix for it, from the screens down to the servers and the database.</p>
    </div>
  );

  return (
    <section id="story" aria-label="Why I build">
      {/* phones: vertical stack */}
      <div className="space-y-5 px-6 py-24 md:hidden">
        {intro}
        <div className="space-y-4 pt-6">
          {items.map((p, i) => (
            <div key={p.slug} className="h-[340px]">
              <Panel p={p} i={i} />
            </div>
          ))}
        </div>
      </div>

      {/* desktop: pinned horizontal ride */}
      <div ref={ref} className="relative hidden h-[300vh] md:block">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <motion.div style={{ x }} className="flex items-stretch gap-8 pr-[20vw] pl-[max(3rem,calc((100vw-72rem)/2+3rem))]">
            <div className="flex items-center">{intro}</div>
            {items.map((p, i) => (
              <div key={p.slug} className="h-[62vh] max-h-[520px] min-h-[380px]">
                <Panel p={p} i={i} />
              </div>
            ))}
          </motion.div>
          <div className="mx-auto mt-10 h-1 w-full max-w-6xl px-12">
            <div className="h-full overflow-hidden rounded-full bg-line">
              <motion.div style={{ scaleX: bar }} className="h-full origin-left rounded-full bg-accent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
