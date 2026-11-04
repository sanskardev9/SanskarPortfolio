"use client";

// About + real photos with parallax: who's behind the builds.

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function OffClock() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [120, -40]);
  const rot = useTransform(scrollYProgress, [0, 1], [8, -4]);

  return (
    <section ref={ref} id="about" aria-label="About" className="mx-auto max-w-6xl px-6 pt-28 md:px-12 md:pt-40">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs tracking-widest text-accent">05 · OFF THE CLOCK</p>
          <h2 className="mt-3 text-4xl leading-[1.05] font-black tracking-tight text-balance md:text-6xl">
            I write code, and I ride <span className="text-accent">motorcycles.</span>
          </h2>
          <div className="mt-6 space-y-4 text-lg text-muted">
            <p>
              I&apos;m a full-stack developer who leans frontend. I like owning a feature from start to finish: the screens, the APIs, the database and the background jobs behind it, plus
              the small touches like streaks and reminders that make people come back.
            </p>
            <p>Away from the keyboard I ride my Duke 390, usually somewhere in the Himalayas. That&apos;s where RideMate came from.</p>
            <p>
              I&apos;m looking for a <span className="text-fg">full-stack or frontend-leaning full-stack role</span> where I can own features end to end.
            </p>
          </div>
        </div>

        <div className="relative h-[460px] sm:h-[540px]">
          <motion.div style={{ y: y1 }} className="absolute top-0 right-0 w-[78%] overflow-hidden rounded-3xl border border-line shadow-2xl">
            <Image src="/photos/hero.jpg" alt="Sanskar looking out over snow-capped Himalayan peaks" width={1400} height={790} sizes="(min-width: 1024px) 460px, 80vw" className="aspect-[4/3] w-full object-cover object-[58%_center]" />
          </motion.div>
          <motion.div style={{ y: y2, rotate: rot }} className="absolute bottom-0 left-0 w-[52%] overflow-hidden rounded-3xl border-4 border-bg shadow-2xl">
            <Image src="/photos/selfie.jpg" alt="Sanskar smiling in front of a waterfall" width={900} height={506} sizes="(min-width: 1024px) 300px, 50vw" className="aspect-[4/5] w-full object-cover object-[78%_center]" />
          </motion.div>
          <span className="absolute right-4 bottom-10 rounded-full bg-accent px-3 py-1.5 font-mono text-[11px] font-bold tracking-widest text-black shadow-lg">HIMALAYAS · DUKE 390</span>
        </div>
      </div>
    </section>
  );
}
