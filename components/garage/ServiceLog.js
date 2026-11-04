"use client";

// Experience as a service log: the timeline line draws itself as you scroll.

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { experience, extras } from "@/data/site";
import Reveal from "../Reveal";

export default function ServiceLog() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="experience" aria-label="Experience" className="mx-auto max-w-6xl px-6 pt-28 md:px-12 md:pt-40">
      <p className="font-mono text-xs tracking-widest text-accent">03 · SERVICE LOG</p>
      <h2 className="mt-3 max-w-3xl text-4xl leading-[1.05] font-black tracking-tight text-balance md:text-6xl">Where I build for a living.</h2>

      <div ref={ref} className="relative mt-14 md:grid md:grid-cols-[200px_1fr] md:gap-10">
        {/* line */}
        <div className="absolute top-2 bottom-2 left-[7px] w-px bg-line md:left-[207px]">
          <motion.div style={{ scaleY: line }} className="h-full w-full origin-top bg-accent" />
        </div>
        <div className="hidden md:block" />
        <ol className="space-y-12">
          {experience.map((job, i) => (
            <Reveal as="li" key={job.company} delay={i * 80} className="relative pl-9 md:pl-12">
              <span className={`absolute top-1.5 left-0 size-[15px] rounded-full border-[3px] border-bg ${i === 0 ? "bg-accent shadow-[0_0_0_4px_var(--accent-soft)]" : "bg-subtle"}`} />
              <p className="font-mono text-xs tracking-widest text-subtle md:absolute md:top-1 md:-left-[240px] md:w-[200px] md:text-right">{job.period.toUpperCase()}</p>
              <h3 className="mt-1 text-2xl font-bold tracking-tight md:mt-0">
                {job.role} <span className="text-accent">@ {job.company}</span>
              </h3>
              <p className="text-sm text-muted">{job.place}</p>
              <ul className="mt-4 space-y-2 text-[15px] text-muted">
                {job.points.map((pt) => (
                  <li key={pt} className="flex gap-2.5">
                    <span className="mt-2.5 h-px w-3 shrink-0 bg-accent" />
                    {pt}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
      </div>

      <Reveal className="mt-16 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-6">
          <p className="font-mono text-xs tracking-widest text-subtle">HACKATHON</p>
          <p className="mt-2 text-[15px]">{extras.hackathon}</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-6">
          <p className="font-mono text-xs tracking-widest text-subtle">EDUCATION</p>
          <p className="mt-2 text-[15px]">{extras.education}</p>
        </div>
      </Reveal>
    </section>
  );
}
