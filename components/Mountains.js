// Layered low-poly ridges. Used as the hero fallback and the footer horizon.
export const ridges = [
  "M0 150 L90 92 L170 128 L260 60 L340 112 L430 44 L520 104 L600 70 L700 122 L790 52 L880 98 L960 66 L1060 118 L1150 58 L1240 102 L1330 72 L1440 120 L1440 240 L0 240 Z",
  "M0 176 L110 128 L210 162 L300 110 L400 158 L500 104 L610 150 L720 112 L820 160 L930 118 L1030 166 L1140 120 L1250 160 L1350 126 L1440 156 L1440 240 L0 240 Z",
  "M0 206 L130 172 L250 198 L380 164 L500 196 L640 166 L760 200 L900 170 L1030 198 L1170 168 L1300 196 L1440 176 L1440 240 L0 240 Z",
];

export default function Mountains({ className = "", snow = true }) {
  return (
    <svg viewBox="0 0 1440 240" preserveAspectRatio="none" className={className} aria-hidden>
      <path d={ridges[0]} fill="var(--ridge-3)" />
      {snow && (
        <g fill="var(--snow)">
          <path d="M430 44 L452 60 L440 58 L428 66 L418 56 Z" />
          <path d="M790 52 L812 68 L800 66 L788 74 L776 63 Z" />
          <path d="M260 60 L280 74 L268 72 L258 80 L248 70 Z" />
          <path d="M1150 58 L1170 72 L1158 70 L1148 78 L1138 68 Z" />
        </g>
      )}
      <path d={ridges[1]} fill="var(--ridge-2)" />
      <path d={ridges[2]} fill="var(--ridge-1)" />
    </svg>
  );
}
