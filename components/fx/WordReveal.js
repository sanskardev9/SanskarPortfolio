"use client";

// Heading whose words rise in one by one when scrolled into view.
// Pass plain strings; wrap highlighted words in {accent: "..."} objects.
import { motion } from "motion/react";

export default function WordReveal({ parts, as: Tag = "h2", className = "", delay = 0 }) {
  const words = parts.flatMap((p) => (typeof p === "string" ? p.split(" ").filter(Boolean).map((w) => ({ w })) : p.accent.split(" ").map((w) => ({ w, accent: true }))));
  const M = motion[Tag] ?? motion.h2;
  return (
    <M className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -12% 0px" }} transition={{ staggerChildren: 0.055, delayChildren: delay }}>
      {words.map((x, i) => (
        <span key={i}>
          <span className="inline-block overflow-hidden pb-[0.12em] align-top">
            <motion.span
              className={`inline-block ${x.accent ? "text-accent" : ""}`}
              variants={{ hidden: { y: "110%", rotate: 6 }, show: { y: "0%", rotate: 0, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } } }}
            >
              {x.w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </M>
  );
}
