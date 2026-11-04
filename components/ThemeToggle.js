"use client";

// Theme switch with a circular "sunrise / nightfall" reveal that grows from the button
// (View Transitions API), and a sun <-> moon icon morph. Falls back to an instant switch.
export default function ThemeToggle({ className = "" }) {
  const toggle = (e) => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    const apply = () => {
      root.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch {}
    };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) return apply();

    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark mode"
      className={`theme-toggle relative grid size-10 place-items-center overflow-hidden rounded-full border border-line text-muted transition hover:border-accent hover:text-accent ${className}`}
    >
      {/* moon (shown in light mode) */}
      <svg viewBox="0 0 24 24" className="tt-moon absolute size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      {/* sun (shown in dark mode) */}
      <svg viewBox="0 0 24 24" className="tt-sun absolute size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
