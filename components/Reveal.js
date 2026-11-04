"use client";

import { useEffect, useRef } from "react";

// Fades children in as they scroll into view. Content is visible by default (works even if
// JavaScript fails); it is only hidden once JS runs and the element is still below the fold.
export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.95) return; // already on screen: leave it visible
    el.classList.add("pending");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("pending");
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ "--delay": `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
