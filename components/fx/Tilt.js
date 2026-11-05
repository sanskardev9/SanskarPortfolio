"use client";

// 3D tilt toward the cursor with a moving light glare. Mouse only; phones get a flat card.
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

export default function Tilt({ children, max = 6, className = "", glare = true }) {
  const ref = useRef(null);
  const px = useMotionValue(0.5), py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 150, damping: 18 }), sy = useSpring(py, { stiffness: 150, damping: 18 });
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const gx = useTransform(sx, [0, 1], ["0%", "100%"]), gy = useTransform(sy, [0, 1], ["0%", "100%"]);
  const glareBg = useMotionTemplate`radial-gradient(600px circle at ${gx} ${gy}, rgba(255,255,255,0.09), transparent 45%)`;

  const move = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const leave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div style={{ perspective: 1400 }} className={className}>
      <motion.div ref={ref} onPointerMove={move} onPointerLeave={leave} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
        {children}
        {glare && <motion.div aria-hidden style={{ background: glareBg }} className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]" />}
      </motion.div>
    </div>
  );
}
