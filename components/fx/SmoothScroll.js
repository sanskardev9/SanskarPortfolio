"use client";

// Orange scroll-progress bar across the top (native scrolling, no smoothing).
import { motion, useScroll, useSpring } from "motion/react";

export default function SmoothScroll() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, mass: 0.3 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left bg-gradient-to-r from-[#ff6a00] via-[#ffb36b] to-[#ff6a00]" />;
}
