"use client";

// "View CV": the developer on the bike tosses a sheet of paper that spins across the screen
// and unfolds into a garage-styled CV viewer. Trigger with openCV(event) from any button.

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { site } from "@/data/site";

export function openCV(e) {
  e?.preventDefault?.();
  const r = e?.currentTarget?.getBoundingClientRect?.();
  window.dispatchEvent(new CustomEvent("garage:cv", { detail: r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null }));
}

function bikeHand() {
  const hand = document.querySelector("[data-cv-hand]");
  if (!hand) return null;
  const r = hand.getBoundingClientRect();
  return r.bottom > 0 && r.top < innerHeight && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
}

import { buzz, shakeScreen } from "./haptics";
function shake() {
  shakeScreen(1.2, 340);
  buzz([45, 35, 70]); // thud-thud on phones
}

export default function CVThrow() {
  const [flight, setFlight] = useState(null);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(true); // viewer visible (false while the paper is still flying)
  const [target, setTarget] = useState(null); // where the CV page sits inside the viewer
  const pageRef = useRef(null);
  const [impact, setImpact] = useState(null);
  const [settled, setSettled] = useState(true); // the flying sheet has reached its slot // {x,y,w,id} while the hit plays

  useEffect(() => {
    let waiting = false;
    const startFlight = (f) => {
      setSettled(false);
      setTarget(null);
      setShown(false);
      setOpen(true); // mount the viewer invisibly to measure it
      setFlight({ ...f, id: Date.now() });
    };
    const on = () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setOpen(true);
      const hand = bikeHand();
      if (hand) {
        // the rider throws it; flight starts at the release
        waiting = true;
        window.dispatchEvent(new Event("garage:throw"));
        setTimeout(() => waiting && ((waiting = false), startFlight({ mode: "throw", ...hand })), 1500);
      } else {
        // bike off screen: the CV hurtles in from the distance and slams onto the glass
        startFlight({ mode: "slam", x: innerWidth / 2, y: innerHeight / 2 });
      }
    };
    const release = (ev) => {
      if (!waiting) return;
      waiting = false;
      startFlight({ mode: "throw", ...(ev.detail || bikeHand() || { x: innerWidth / 2, y: innerHeight / 2 }) });
    };
    window.addEventListener("garage:release", release);
    window.addEventListener("garage:cv", on);
    return () => {
      window.removeEventListener("garage:cv", on);
      window.removeEventListener("garage:release", release);
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = "/cv-preview.jpg";
    img.decode?.().catch(() => {});
  }, []);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  // measure the CV page in the (still hidden) viewer: the paper flies to exactly this rect
  useLayoutEffect(() => {
    if (!flight || target) return;
    let tries = 0, raf;
    const measure = () => {
      const r = pageRef.current?.getBoundingClientRect();
      if (r && r.width > 20) return setTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width });
      if (++tries < 12) raf = requestAnimationFrame(measure);
      else setTarget({ x: innerWidth / 2, y: innerHeight / 2, w: Math.min(innerWidth - 48, 520) }); // fallback
    };
    measure();
    return () => cancelAnimationFrame(raf);
  }, [flight, target, open]);

  // safety: never leave the viewer hidden
  useEffect(() => {
    if (shown || !open) return;
    const t = setTimeout(() => {
      setShown(true);
      setFlight(null);
    }, 2500);
    return () => clearTimeout(t);
  }, [shown, open]);

  const cx = typeof window !== "undefined" ? innerWidth / 2 : 0, cy = typeof window !== "undefined" ? innerHeight / 2 : 0;
  const tx = target?.x ?? cx, ty = target?.y ?? cy, end = target ? target.w / 84 : 6;

  return (
    <>
      {/* the paper in flight */}
      <AnimatePresence>
        {flight && target && (
          <motion.div
            key={flight.id}
            className="pointer-events-none fixed top-0 left-0 z-[95] aspect-[1836/2376] overflow-hidden rounded-md bg-white shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            style={{ width: target.w, x: "-50%", y: "-50%" }}
            initial={
              flight.mode === "slam"
                ? { left: cx, top: cy, scale: 0.04, rotate: -150, opacity: 0 }
                : { left: flight.x, top: flight.y, scale: 16 / target.w, rotate: -12, opacity: 1 }
            }
            animate={
              flight.mode === "slam"
                ? {
                    left: [cx, cx, cx, cx, cx, tx],
                    top: [cy, cy, cy, cy, cy, ty],
                    scale: [0.04, 0.5, 1.14, 0.96, 1, 1],
                    rotate: [-150, -30, 0, 0, 0, 0],
                    opacity: [0, 1, 1, 1, 1, 1],
                  }
                : {
                    left: [flight.x, (flight.x + cx) / 2, cx, cx, cx, tx],
                    top: [flight.y, Math.min(flight.y, cy) - 100, cy, cy, cy, ty],
                    scale: [16 / target.w, 0.5, 1.14, 0.96, 1, 1],
                    rotate: [-12, 220, 360, 360, 360, 360],
                    opacity: 1,
                  }
            }
            transition={{
              duration: flight.mode === "slam" ? 0.72 : 0.8,
              times: [0, 0.32, 0.46, 0.54, 0.74, 1],
              ease: ["easeIn", "easeIn", "easeOut", "easeOut", [0.6, 0, 0.2, 1]],
            }}
            onUpdate={(v) => {
              // impact: shake exactly when the sheet hits the glass (largest scale)
              if (!flight.hit && typeof v.scale === "number" && v.scale >= 1.1) {
                flight.hit = true;
                shake();
                setImpact({ x: cx, y: cy, w: target.w, id: Date.now() });
                // viewer frame starts appearing as the sheet slides into its slot
                setTimeout(() => setShown(true), (flight.mode === "slam" ? 0.72 : 0.8) * 280);
              }
            }}
            onAnimationComplete={() => {
              // hold the hit for a beat, then the viewer fades in around the sheet
              // hand-off: the viewer's own page appears in the exact frame the sheet disappears
              setShown(true);
              setSettled(true);
              setFlight(null);
            }}
          >
            <img src="/cv-preview.jpg" alt="" className="h-full w-full object-cover" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* impact: white flash + shockwave ring */}
      <AnimatePresence>
        {impact && (
          <motion.div key={impact.id} className="pointer-events-none fixed inset-0 z-[96]" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.5, delay: 0.1 }} onAnimationComplete={() => setImpact(null)}>
            <motion.div className="absolute inset-0 bg-white" initial={{ opacity: 0.55 }} animate={{ opacity: 0 }} transition={{ duration: 0.18 }} />
            <motion.div
              className="absolute rounded-[50%] border-[6px] border-[#ff8a33]"
              style={{ left: impact.x, top: impact.y, width: impact.w, height: impact.w, x: "-50%", y: "-50%" }}
              initial={{ scale: 0.6, opacity: 1 }}
              animate={{ scale: 2.4, opacity: 0, borderWidth: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* the viewer */}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[90] grid place-items-center p-3 sm:p-8" style={{ pointerEvents: shown ? "auto" : "none" }} initial={{ opacity: 0 }} animate={{ opacity: shown ? 1 : 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            <div className="absolute inset-0 bg-black/80" onClick={() => setOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Sanskar Singh's CV"
              className="grain grime-panel relative grid max-h-[94dvh] w-full max-w-5xl grid-rows-[auto_1fr] overflow-hidden rounded-[1.75rem] border border-white/10 text-white shadow-[0_40px_140px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,138,51,0.08)] md:grid-cols-[1fr_270px] md:grid-rows-1"
              initial={{ scale: 1 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9, opacity: 0, y: 30, rotate: -2 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {/* oil drips running down from the top edge */}
              {[12, 47, 81].map((left, i) => (
                <span key={left} aria-hidden className="oil-drip" style={{ left: `${left}%`, animationDelay: `${0.6 + i * 1.7}s`, height: `${28 + i * 14}px` }} />
              ))}
              <div className="hazard relative z-10 h-1.5 md:col-span-2" />

              {/* close */}
              <button onClick={() => setOpen(false)} aria-label="Close CV" className="absolute top-4 right-3 z-20 grid size-10 place-items-center rounded-full border border-white/15 bg-black/50 backdrop-blur transition hover:rotate-90 hover:border-white/60 md:right-4">
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

              {/* clipboard with the CV */}
              <div className="relative min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain p-4 pt-10 sm:p-7 sm:pt-12">
                <div className="relative mx-auto w-fit" style={{ opacity: settled ? 1 : 0 }}>
                  {/* metal clip */}
                  <div className="absolute -top-6 left-1/2 z-10 h-9 w-32 -translate-x-1/2 rounded-t-xl rounded-b-md border border-white/20 bg-[linear-gradient(180deg,#c9ced5,#7c828b)] shadow-[0_6px_14px_rgba(0,0,0,0.5)]">
                    <div className="mx-auto mt-2 h-2 w-16 rounded-full bg-black/30" />
                  </div>
                  <a href={site.cv} target="_blank" rel="noreferrer" aria-label="Open the CV full size" className="block">
                    <img
                      ref={pageRef}
                      width={1836}
                      height={2376}
                      style={{ maxHeight: "calc(94dvh - 6.5rem)" }}
                      src="/cv-preview.jpg"
                      alt="Sanskar Singh's CV: experience at Redcliffe Labs, Avaronn and EPVI, projects, skills and education"
                      className="h-auto w-auto max-w-full rounded-md bg-white shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
                    />
                  </a>
                  {/* rubber stamp slams on after the hit */}

                </div>
                <p className="mt-3 text-center text-xs text-white/45 md:hidden">Tap the CV to open it full size</p>
              </div>

              {/* spec sheet */}
              <motion.aside
                className="relative flex flex-col gap-5 border-t border-white/10 bg-black/30 p-5 md:border-t-0 md:border-l md:p-6 md:pt-16"
                initial={{ opacity: 0, x: 24 }}
                animate={ shown ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 } }
                transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
              >
                <div>
                  <p className="font-mono text-[10px] tracking-[0.3em] text-[#ff8a33]">WORK ORDER · CV</p>
                  <p className="mt-1 text-2xl font-black tracking-tight">{site.name}</p>
                  <p className="text-sm text-white/60">Full-stack developer · React, Next.js, Node.js</p>
                </div>
                <dl className="hidden space-y-3 text-sm md:block">
                  <div>
                    <dt className="font-mono text-[10px] tracking-widest text-white/40">NOW</dt>
                    <dd>Front End Developer, Redcliffe Labs</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-widest text-white/40">BASED IN</dt>
                    <dd>Faridabad, India</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] tracking-widest text-white/40">STATUS</dt>
                    <dd className="flex items-center gap-2">
                      <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" /><span className="relative inline-flex size-2 rounded-full bg-emerald-400" /></span>
                      Open to full-stack roles
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto grid grid-cols-3 gap-2 md:grid-cols-1">
                  <a href={site.cv} download className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6a00] px-4 py-2.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_#ff6a00]">
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg><span>Download</span>
                  </a>
                  <a href={site.cv} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold transition hover:border-white/60">
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 17L17 7M9 7h8v8" /></svg><span>Open</span>
                  </a>
                  <a href={`mailto:${site.email}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold transition hover:border-white/60">
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg><span>Email</span>
                  </a>
                </div>
                <p className="hidden font-mono text-[10px] tracking-widest text-white/35 md:block">PRESS ESC TO CLOSE</p>
              </motion.aside>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
