// Phone vibration (Android browsers; iOS Safari has no Vibration API) + a screen shake.
export function buzz(pattern) {
  try {
    if (navigator.vibrate && !matchMedia("(prefers-reduced-motion: reduce)").matches) navigator.vibrate(pattern);
  } catch {}
}

export function shakeScreen(strength = 1, duration = 320) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const s = strength;
  document.documentElement.animate(
    [
      { transform: "translate(0,0)" },
      { transform: `translate(${-7 * s}px,${5 * s}px)` },
      { transform: `translate(${6 * s}px,${-4 * s}px)` },
      { transform: `translate(${-4 * s}px,${2 * s}px)` },
      { transform: `translate(${2 * s}px,${-1 * s}px)` },
      { transform: "translate(0,0)" },
    ],
    { duration, easing: "ease-out" }
  );
}
