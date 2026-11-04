// Tiny SVG icons used instead of text glyphs (▶ ✕ ↗ ★ ●), which phones render as emoji.
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const PlayGlyph = ({ className = "size-3" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
  </svg>
);
export const LeftGlyph = ({ className = "size-6" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M16 18.5v-13a1 1 0 0 0-1.5-.86L4 11.14a1 1 0 0 0 0 1.72l10.5 6.5A1 1 0 0 0 16 18.5z" />
  </svg>
);
export const CloseGlyph = ({ className = "size-4" }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const ExternalGlyph = ({ className = "size-3" }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);
export const StarGlyph = ({ className = "size-3" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9z" />
  </svg>
);
export const DotGlyph = ({ className = "size-2" }) => (
  <svg viewBox="0 0 10 10" className={className} fill="currentColor" aria-hidden>
    <circle cx="5" cy="5" r="5" />
  </svg>
);
