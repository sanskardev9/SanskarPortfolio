"use client";

import { useEffect, useRef } from "react";

// Soft glow that follows the cursor on desktop. Hidden on touch screens.
export default function Spotlight() {
  const ref = useRef(null);

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.background = `radial-gradient(600px at ${e.clientX}px ${e.clientY}px, var(--spot), transparent 80%)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden lg:block" />;
}
