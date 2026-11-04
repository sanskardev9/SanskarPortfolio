"use client";

import { useEffect, useState } from "react";

// Desktop-only nav in the sticky column; highlights the section in view.
export default function SectionNav({ items }) {
  const [active, setActive] = useState(items[0].id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Sections" className="hidden lg:block">
      <ul className="mt-14 space-y-1">
        {items.map(({ id, label }) => {
          const on = active === id;
          return (
            <li key={id}>
              <a href={`#${id}`} className="group flex items-center gap-4 py-2.5">
                <span className={`h-px transition-all duration-300 ${on ? "w-16 bg-fg" : "w-8 bg-subtle group-hover:w-16 group-hover:bg-fg"}`} />
                <span className={`text-xs font-semibold uppercase tracking-widest transition-colors ${on ? "text-fg" : "text-subtle group-hover:text-fg"}`}>
                  {label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
