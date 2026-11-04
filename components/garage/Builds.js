"use client";

// Projects as "build sheets" that stack on top of each other while scrolling (sticky cards),
// each card slightly shrinking as the next one slides over it.

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { projects } from "@/data/projects";

function Shot({ p }) {
  if (!p.image) {
    return <div className="aspect-[16/10] rounded-2xl" style={{ background: `radial-gradient(120% 90% at 0% 0%, ${p.accent}55, transparent 60%), var(--bg)` }} />;
  }
  if (p.device === "phone") {
    return (
      <div className="relative flex aspect-[16/11] items-center justify-center overflow-hidden rounded-2xl" style={{ background: `radial-gradient(100% 80% at 30% 20%, ${p.accent}50, transparent 65%), #0e0e11` }}>
        <div className="relative w-[44%] max-w-[250px] overflow-hidden rounded-[1.9rem] border-[7px] border-[#0a0a0a] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] transition duration-700 group-hover:-translate-y-2 group-hover:rotate-[-1.5deg]">
          <Image src={p.image} alt={`${p.name} on a phone`} width={600} height={1100} sizes="250px" className="h-auto w-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e11] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        {p.live && <span className="ml-3 truncate font-mono text-[10px] text-white/45">{p.live.replace("https://", "")}</span>}
      </div>
      <Image src={p.image} alt={`${p.name} screenshot`} width={1440} height={900} sizes="(min-width: 1024px) 600px, 100vw" className="h-auto w-full transition duration-700 group-hover:scale-[1.03]" />
    </div>
  );
}

function Spec({ k, children }) {
  return (
    <div className="flex gap-4 border-t border-line py-2.5 text-sm">
      <dt className="w-20 shrink-0 font-mono text-[11px] tracking-widest text-subtle uppercase">{k}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function BuildCard({ p, i, total, progress }) {
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - i) * 0.035]);
  const links = [p.live && { label: "Live app", url: p.live, solid: true }, p.demo && { label: "Demo video", url: p.demo }, ...p.repos.map((r) => ({ label: r.label === "Code" ? "Source" : `${r.label} source`, url: r.url }))].filter(Boolean);

  return (
    <div className="sticky" style={{ top: `calc(5.5rem + ${i * 18}px)` }}>
      <motion.article style={{ scale }} className="group relative origin-top overflow-hidden rounded-[2rem] border border-line bg-card p-5 shadow-[0_-20px_60px_-30px_rgba(0,0,0,0.5)] sm:p-8 lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:p-10">
        <span className="absolute top-0 left-0 h-1 w-full" style={{ background: p.accent }} />
        <Shot p={p} />
        <div className="mt-6 flex flex-col lg:mt-0">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs tracking-widest text-subtle">BUILD {String(i + 1).padStart(2, "0")}</span>
            <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] tracking-wider ${p.status ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" : p.live ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-line text-muted"}`}>
              {p.status ? p.status.toUpperCase() : p.live ? "LIVE" : "PRIVATE"}
            </span>
          </div>
          <h3 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl" style={{ color: p.accent }}>
            {p.name}
          </h3>
          <p className="mt-2 text-lg text-muted">{p.tagline}</p>
          <ul className="mt-5 space-y-2 text-[15px]">
            {p.highlights.map((h) => (
              <li key={h} className="flex gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: p.accent }} />
                {h}
              </li>
            ))}
          </ul>
          <dl className="mt-6">
            <Spec k="Stack">{p.stack.join(" · ")}</Spec>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className={`rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${l.solid ? "bg-fg text-bg" : "border border-line hover:border-fg"}`}>
                {l.label} ↗
              </a>
            ))}
            <Link href={`/projects/${p.slug}`} className="rounded-full px-4 py-2 text-sm font-semibold text-accent hover:underline">
              Full build sheet →
            </Link>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export default function Builds() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section id="builds" aria-label="Projects" className="mx-auto max-w-6xl px-4 pt-28 sm:px-6 md:px-12 md:pt-36">
      <div className="px-2 sm:px-0">
        <p className="font-mono text-xs tracking-widest text-accent">02 · IN THE GARAGE</p>
        <h2 className="mt-3 max-w-3xl text-4xl leading-[1.05] font-black tracking-tight text-balance md:text-6xl">Things I&apos;ve built, end to end.</h2>
        <p className="mt-4 max-w-xl text-lg text-muted">Scroll through the build sheets. Each one has the problem, what I built, and the stack behind it.</p>
      </div>
      <div ref={ref} className="relative mt-14 space-y-[12vh] pb-[8vh]">
        {projects.map((p, i) => (
          <BuildCard key={p.slug} p={p} i={i} total={projects.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
