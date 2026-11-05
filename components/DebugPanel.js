"use client";
// Open any page with ?debug=1 on a phone to see why animations might not run.
import { useEffect, useState } from "react";

export default function DebugPanel() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    if (!new URLSearchParams(location.search).has("debug")) return;
    const errors = [];
    const push = (m) => {
      errors.push(String(m).slice(0, 160));
      setInfo((i) => ({ ...i, errors: [...errors] }));
    };
    window.addEventListener("error", (e) => push(e.message));
    window.addEventListener("unhandledrejection", (e) => push(e.reason));
    setInfo({
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      pointer: matchMedia("(pointer: coarse)").matches ? "touch" : "mouse",
      size: `${innerWidth}x${innerHeight} @${devicePixelRatio}`,
      ua: navigator.userAgent,
      vibrate: "vibrate" in navigator,
      errors,
    });
  }, []);
  if (!info) return null;
  return (
    <div className="fixed inset-x-2 bottom-2 z-[999] rounded-xl bg-black/90 p-3 font-mono text-[11px] leading-relaxed text-white">
      <p>reduced motion: <b className={info.reducedMotion ? "text-red-400" : "text-green-400"}>{String(info.reducedMotion)}</b></p>
      <p>input: {info.pointer} · screen: {info.size} · vibrate: {String(info.vibrate)}</p>
      <p className="break-all opacity-70">{info.ua}</p>
      <p>errors: {info.errors.length ? info.errors.join(" | ") : "none"}</p>
    </div>
  );
}
