"use client";

import { openCV } from "@/components/garage/CVThrow";
import { site, skills } from "@/data/site";
import Reveal from "../Reveal";

const words = skills.flatMap((g) => g.items.map((i) => i.name)).slice(0, 16);

export default function Contact() {
  return (
    <section id="contact" aria-label="Contact" className="pt-28 md:pt-40">
      {/* skill marquee */}
      <div className="overflow-hidden border-y border-line py-5" aria-hidden>
        <div className="marquee gap-10 pr-10 text-4xl font-black tracking-tight whitespace-nowrap md:text-6xl">
          {[...words, ...words].map((w, i) => (
            <span key={i} className={i % 2 ? "text-stroke" : ""}>
              {w} <svg viewBox="0 0 24 24" className="inline size-[0.55em] -translate-y-[0.1em] text-accent" fill="currentColor" aria-hidden><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" /></svg>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-24 md:px-12">
        <Reveal className="relative overflow-hidden rounded-[1.5rem] border border-line bg-card p-6 sm:rounded-[2rem] sm:p-14">
          <div className="hazard absolute inset-x-0 top-0 h-2" />
          <p className="font-mono text-xs tracking-widest text-accent">06 · WORK ORDER</p>
          <h2 className="mt-4 max-w-3xl text-4xl leading-[0.98] font-black tracking-tight text-balance sm:text-5xl md:text-7xl">Got something to build?</h2>
          <p className="mt-5 max-w-lg text-lg text-muted">Hiring for a full-stack or frontend role, or have an idea you want built? Bring it to the garage.</p>
          <div className="mt-8 grid gap-3 sm:mt-9 sm:flex sm:flex-wrap">
            <a href={`mailto:${site.email}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_var(--accent)]">
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
              <span className="truncate">{site.email}</span>
            </a>
            <div className="grid grid-cols-3 gap-3 sm:flex">
              <a href={site.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-3 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-fg sm:gap-2 sm:px-5 sm:py-3.5">
                LinkedIn <svg viewBox="0 0 24 24" className="hidden size-3.5 sm:block" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 17L17 7M9 7h8v8" /></svg>
              </a>
              <a href={site.github} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-3 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-fg sm:gap-2 sm:px-5 sm:py-3.5">
                GitHub <svg viewBox="0 0 24 24" className="hidden size-3.5 sm:block" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 17L17 7M9 7h8v8" /></svg>
              </a>
              <a href={site.cv} onClick={openCV} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-3 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-fg sm:gap-2 sm:px-5 sm:py-3.5">
                CV <svg viewBox="0 0 24 24" className="hidden size-3.5 sm:block" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 17L17 7M9 7h8v8" /></svg>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
