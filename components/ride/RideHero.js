"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { projects } from "@/data/projects";
import { site, skills } from "@/data/site";
import Mountains from "../Mountains";
import { createSound } from "./sound";
import { PlayGlyph, LeftGlyph, CloseGlyph, ExternalGlyph, StarGlyph, DotGlyph } from "../Glyphs";

function Fallback() {
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--sky-top), var(--sky-bottom))" }}>
      <Mountains className="absolute inset-x-0 bottom-0 h-[55%] w-full" />
    </div>
  );
}

const RideScene = dynamic(() => import("./RideScene"), { ssr: false, loading: Fallback });

const SKILL_NAMES = skills.flatMap((g) => g.items.map((i) => i.name));

function useNight() {
  const [night, setNight] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setNight(root.dataset.theme === "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return night;
}

function canUse3D() {
  
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const KEYMAP = {
  arrowup: "up", w: "up",
  arrowdown: "down", s: "down",
  arrowleft: "left", a: "left",
  arrowright: "right", d: "right",
  " ": "wheelie",
  shift: "boost",
  f: "fire", j: "fire", enter: "fire",
};

/* ---------- small UI pieces ---------- */
function Key({ children }) {
  return <kbd className="inline-grid min-w-6 place-items-center rounded-md border border-white/25 bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white">{children}</kbd>;
}

function ProjectCard({ p, index, onClose }) {
  return (
    <div className="card-in pointer-events-auto w-full overflow-hidden rounded-t-3xl border border-white/10 sm:rounded-2xl bg-[#17231c]/95 text-white shadow-2xl backdrop-blur-md">
      <div className="h-1.5" style={{ background: p.accent }} />
      <div className="max-h-[62svh] overflow-y-auto overscroll-contain p-5 pb-8 sm:max-h-none sm:pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: p.accent }}>
              Letter {String(index + 1).padStart(2, "0")} · A project story
            </p>
            <h3 className="mt-1 text-3xl font-serif tracking-tight">{p.name}</h3>
            <p className="text-sm text-white/70">{p.tagline}</p>
          </div>
          <button onClick={onClose} aria-label="Close project card" className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20">
            <CloseGlyph />
          </button>
        </div>
        {p.problem && <p className="mt-4 text-sm text-white/60 italic">“{p.problem}”</p>}
        <p className="mt-3 text-sm leading-relaxed text-white/85">{p.summary}</p>
        <ul className="mt-3 space-y-1.5 text-sm text-white/85">
          {p.highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: p.accent }} />
              {h}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.stack.map((s) => (
            <span key={s} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/80">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {p.live && (
            <a href={p.live} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black hover:opacity-85">
              Live app <ExternalGlyph className="inline size-3" />
            </a>
          )}
          {p.demo && (
            <a href={p.demo} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black hover:opacity-85">
              Watch demo <ExternalGlyph className="inline size-3" />
            </a>
          )}
          {p.repos.map((r) => (
            <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/25 px-4 py-1.5 text-xs font-semibold hover:bg-white/10">
              {r.label} <ExternalGlyph className="inline size-3" />
            </a>
          ))}
          <Link href={`/projects/${p.slug}`} className="rounded-full border border-white/25 px-4 py-1.5 text-xs font-semibold hover:bg-white/10">
            Full details
          </Link>
        </div>
      </div>
    </div>
  );
}

function PadButton({ label, ctrl, set, className = "", children }) {
  const on = () => set(ctrl, true), off = () => set(ctrl, false);
  return (
    <button
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        on();
      }}
      onPointerUp={off}
      onPointerCancel={off}
      onLostPointerCapture={off}
      onContextMenu={(e) => e.preventDefault()}
      className={`pointer-events-auto grid touch-none place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md select-none active:scale-95 active:bg-white/25 ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------- main ---------- */
export default function RideHero({ open = false, onClose } = {}) {
  const night = true;
  const [ok3d, setOk3d] = useState(null);
  const [intro, setIntro] = useState(true);
  const [paused, setPaused] = useState(false);
  const [flight, setFlight] = useState(false);
  const [run, setRun] = useState(0);
  const [active, setActive] = useState(true);
  const [touch, setTouch] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [found, setFound] = useState([]);
  const [card, setCard] = useState(null);
  const [sheet, setSheet] = useState(false); // full project card open (phones)
  const toastTimer = useRef(0);
  const [feed, setFeed] = useState([]);
  const [done, setDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [coinsGot, setCoinsGot] = useState(0);
  const [camMode, setCamMode] = useState("chase");
  const [air, setAir] = useState(null);
  const [outfit, setOutfit] = useState("mountain");

  const controls = useRef({ up: false, down: false, left: false, right: false, fire: false, wheelie: false, boost: false });
  const events = useRef({});
  const wrap = useRef(null);
  const sound = useMemo(() => (typeof window === "undefined" ? null : createSound()), []);
  const nextObjective = useRef(null);
  const hud = { speed: useRef(null), score: useRef(null), nitro: useRef(null), wheelie: useRef(null) };
  const playingRef = useRef(false);
  playingRef.current = playing;

  useEffect(() => {
    setOk3d(canUse3D());
    setTouch(matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (!wrap.current) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.02 });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, [playing]);

  const setCtrl = useCallback((k, v) => {
    controls.current[k] = v;
  }, []);

  const start = () => {
    sound?.init();
    setPlaying(true);
  };
  const stop = useCallback(() => {
    Object.keys(controls.current).forEach((k) => (controls.current[k] = false));
    sound?.engine(0, false);
    sound?.suspend();
    setPlaying(false);
    setDone(false);
    onClose?.();
  }, [sound, onClose]);

  // opened from the hero's Play button: go straight into the ride
  useEffect(() => {
    if (open) {
      setPlaying(true);
    }
  }, [open, sound]);

  // lock page scroll while riding
  useEffect(() => {
    document.documentElement.style.overflow = playing ? "hidden" : "";
    return () => (document.documentElement.style.overflow = "");
  }, [playing]);

  // keyboard
  useEffect(() => {
    if (!playing) return;
    const handle = (e, v) => {
      if (e.key === "Escape" && v) return stop();
      if (e.key.toLowerCase() === "g" && v && !e.repeat) return setFlight(f => !f);
      if (e.key.toLowerCase() === "p" && v && !e.repeat) return setPaused(p => !p);
      if (e.key.toLowerCase() === "c" && v && !e.repeat) return setCamMode((m) => (m === "chase" ? "side" : "chase"));
      if (e.key.toLowerCase() === "o" && v && !e.repeat) return setOutfit((o) => (o === "mountain" ? "red" : "mountain"));
      const k = KEYMAP[e.key.toLowerCase()];
      if (!k) return;
      e.preventDefault();
      controls.current[k] = v;
    };
    const down = (e) => handle(e, true), up = (e) => handle(e, false);
    const blur = () => { Object.values(KEYMAP).forEach(k => { controls.current[k] = false; }); setPaused(true); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [playing, stop]);

  // game -> UI events
  useEffect(() => {
    let feedId = 0;
    events.current = {
      unlock: (i) => {
        setFound((f) => (f.includes(i) ? f : [...f, i]));
        setCard(i);
        setSheet(false);
        clearTimeout(toastTimer.current);
        // phones: the toast fades on its own so the ride is never blocked
        toastTimer.current = setTimeout(() => setCard((c) => (c === i && !matchMedia("(min-width: 640px)").matches ? null : c)), 5000);
        sound?.unlock();
      },
      collect: (name) => {
        setCoinsGot((n) => n + 1);
        const id = ++feedId;
        setFeed((f) => [...f.slice(-3), { id, text: `+ ${name}` }]);
        setTimeout(() => setFeed((f) => f.filter((x) => x.id !== id)), 1600);
        sound?.coin();
      },
      fire: () => sound?.fire(),
      air: (sec) => {
        setAir({ id: Date.now(), sec });
        sound?.coin();
      },
      done: () => {
        setDone(true);
        sound?.win();
      },
      tick: (st) => {
        if (!playingRef.current) return;
        if (nextObjective.current) nextObjective.current.textContent = `${st.nextName} · ${st.nextDistance} m ahead`;
        if (hud.speed.current) hud.speed.current.textContent = String(Math.round(st.v * 3.6));
        if (hud.score.current) hud.score.current.textContent = String(Math.round(st.score));
        if (hud.nitro.current) hud.nitro.current.style.transform = `scaleX(${st.nitro})`;
        if (hud.wheelie.current) hud.wheelie.current.style.opacity = st.pitch < -0.3 ? "1" : "0";
        sound?.engine(Math.min(1, st.v / 47), !controls.current.paused);
      },
    };
  }, [sound]); // eslint-disable-line react-hooks/exhaustive-deps

  // pause the ride while reading a project card or the finish screen
  useEffect(() => {
    controls.current.paused = intro || paused || (touch ? sheet : card !== null) || done;
    if (controls.current.paused) sound?.engine(0, false);
  }, [intro, paused, touch, sheet, card, done, sound]);
  useEffect(() => { controls.current.flight = flight; }, [flight]);
  useEffect(() => {
    const hide = () => { if (document.hidden) { setPaused(true); Object.values(KEYMAP).forEach(k => { controls.current[k] = false; }); } };
    document.addEventListener('visibilitychange', hide);
    return () => { document.removeEventListener('visibilitychange', hide); sound?.dispose(); clearTimeout(toastTimer.current); };
  }, [sound]);
  useEffect(() => {
    if (!playing) return;
    const previous = document.activeElement;
    wrap.current?.focus();
    const trap = e => {
      if (e.key !== 'Tab') return;
      const scope = wrap.current?.querySelector('.ride-onboarding, .ride-pause, .ride-unavailable') || wrap.current;
      const items = Array.from(scope?.querySelectorAll('button, a[href]') || []).filter(el => el.getClientRects().length);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === wrap.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', trap);
    return () => { window.removeEventListener('keydown', trap); previous?.focus(); };
  }, [playing]);

  // pointer on the scene = fire while riding (desktop)
  const scenePointer = (v) => {
    if (playing && !touch && !controls.current.paused) controls.current.fire = v;
  };

  if (!playing) return null;

  const p = card !== null ? projects[card] : null;

  return (
    <section
      ref={wrap}
      role="dialog" aria-modal="true" aria-label="The enchanted ride" tabIndex={-1}
      className={playing ? "fixed inset-0 z-[60] bg-black" : "relative h-[100svh] min-h-[620px] w-full overflow-hidden"}
    >
      {/* scene */}
      <div className="absolute inset-0 select-none" onPointerDown={() => scenePointer(true)} onPointerUp={() => scenePointer(false)} onPointerLeave={() => scenePointer(false)}>
        {ok3d ? (
          <SceneBoundary onExit={stop}><RideScene key={run} projects={projects} skillNames={SKILL_NAMES} controls={controls} events={events} playing={playing} night={night} active={active || playing} camMode={camMode} outfit={outfit} /></SceneBoundary>
        ) : (
          <><Fallback /><div className="ride-unavailable"><h2>{ok3d === null ? 'Preparing your journey…' : 'This journey needs WebGL'}</h2><p>{ok3d === null ? 'Lighting the lanterns and unfolding the map.' : 'Your browser cannot start the 3D scene. All projects and stories are available in the portfolio.'}</p><button onClick={stop} className="magic-button">Return to the portfolio</button></div></>
        )}
      </div>

      {/* ---------- game HUD ---------- */}
      {playing && (
        <div className="pointer-events-none absolute inset-0 z-10 text-white">
          <div className="ride-chapter"><span>✦ THE ENCHANTED RIDE</span><p ref={nextObjective}>Collect the letters. Discover the work.</p></div>
          {/* top bar */}
          <div className="flex items-start justify-between gap-3 p-3 sm:p-5">
            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/15 bg-black/45 px-3 py-2 whitespace-nowrap backdrop-blur-md sm:gap-4 sm:px-4 sm:py-2.5">
              <div className="flex items-center gap-1 sm:gap-1.5" aria-label={`${found.length} of ${projects.length} projects`}>
                {projects.map((pr, i) => (
                  <span key={pr.slug} className={`size-2 rounded-full transition-all duration-500 sm:size-2.5 ${found.includes(i) ? "scale-110" : "bg-white/20"}`} style={found.includes(i) ? { background: pr.accent, boxShadow: `0 0 10px ${pr.accent}` } : undefined} />
                ))}
                <span className="ml-0.5 font-mono text-[11px] sm:text-xs">{found.length}/{projects.length}</span>
              </div>
              <span className="hidden h-4 w-px bg-white/20 sm:block" />
              <span className="font-mono text-[11px] sm:text-xs" aria-label="Skills collected"><DotGlyph className="inline size-2 text-[#ffd75e]" /> {coinsGot}</span>
              <span className="hidden h-4 w-px bg-white/20 sm:block" />
              <span className="font-mono text-[11px] sm:text-xs" aria-label="Score"><StarGlyph className="mr-0.5 inline size-3 -translate-y-px text-[#ffd75e]" /><span ref={hud.score}>0</span></span>
            </div>
            <div className="pointer-events-auto flex shrink-0 gap-1.5 sm:gap-2">
              <button className="ride-tool" aria-pressed={flight} onClick={() => setFlight(f => !f)}>{flight ? '↓ Land' : '✧ Fly'}</button>
              <button className="ride-tool" aria-label={paused ? 'Resume ride' : 'Pause ride'} onClick={() => setPaused(p => !p)}>{paused ? '▶' : 'Ⅱ'}</button>
              <button
                onClick={() => setOutfit((o) => (o === "mountain" ? "red" : "mountain"))}
                aria-label="Change outfit"
                className="hidden size-9 items-center justify-center gap-2 rounded-full border border-white/15 bg-black/45 text-sm backdrop-blur-md hover:bg-white/15 sm:flex sm:h-10 sm:w-auto sm:px-3.5"
              >
                <span className="size-3.5 rounded-full border border-white/40" style={{ background: outfit === "mountain" ? "#ece6d8" : "#e02f3a" }} />
                <span className="hidden sm:inline">Outfit</span>
              </button>
              <button
                onClick={() => setCamMode((m) => (m === "chase" ? "side" : "chase"))}
                aria-label="Switch camera"
                className="grid size-9 place-items-center rounded-full border border-white/15 bg-black/45 text-sm backdrop-blur-md hover:bg-white/15 sm:h-10 sm:w-auto sm:px-3.5"
              >
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" />
                  </svg>
                  <span className="hidden sm:inline">{camMode === "chase" ? "Chase" : "Cinematic"}</span>
                </span>
              </button>
              <button
                onClick={() => {
                  sound?.setMuted(!muted);
                  setMuted(!muted);
                }}
                aria-label={muted ? "Unmute" : "Mute"}
                className="grid size-9 place-items-center rounded-full border border-white/15 bg-black/45 backdrop-blur-md hover:bg-white/15 sm:size-10"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
                  {muted ? <path d="m22 9-6 6M16 9l6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />}
                </svg>
              </button>
              <button onClick={stop} aria-label="Exit the ride" className="grid size-9 place-items-center rounded-full border border-white/15 bg-black/45 text-sm font-medium backdrop-blur-md hover:bg-white/15 sm:h-10 sm:w-auto sm:px-4">
                <span className="sm:hidden"><CloseGlyph /></span>
                <span className="hidden sm:inline">
                  Exit <span className="text-white/50">(Esc)</span>
                </span>
              </button>
            </div>
          </div>

          {/* wheelie + skill feed */}
          <div ref={hud.wheelie} className="absolute top-[22%] left-1/2 -translate-x-1/2 text-3xl font-black tracking-tight italic opacity-0 transition-opacity duration-200 sm:text-5xl" style={{ textShadow: "0 4px 20px #ff6a00", color: "#ffb347" }}>
            WHEELIE!
          </div>
          {air && (
            <div key={air.id} className="feed-in absolute top-[16%] left-1/2 -translate-x-1/2 text-center text-3xl font-black italic sm:text-5xl" style={{ color: "#7dd3fc", textShadow: "0 4px 20px #0284c7" }}>
              AIR {air.sec.toFixed(1)}s
            </div>
          )}
          <div className="absolute top-[30%] left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
            {feed.map((f) => (
              <span key={f.id} className="feed-in rounded-full bg-black/50 px-3 py-1 font-mono text-sm text-[#ffd75e] backdrop-blur">
                {f.text}
              </span>
            ))}
          </div>

          {/* project card */}
          {/* desktop: full card in the side panel (doesn't block the road) */}
          {!touch && p && (
            <div className="pointer-events-auto absolute top-24 right-5 w-[380px]">
              <ProjectCard key={card} p={p} index={card} onClose={() => setCard(null)} />
            </div>
          )}
          {/* phones: small toast that never blocks the ride; "Details" opens the full sheet and pauses */}
          {touch && p && !sheet && (
            <div key={card} className="card-in pointer-events-auto absolute inset-x-3 top-16 flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1318]/90 py-2.5 pr-2.5 pl-3 shadow-2xl backdrop-blur-md">
              <span className="h-10 w-1 shrink-0 rounded-full" style={{ background: p.accent }} />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: p.accent }}>
                  Project {String(card + 1).padStart(2, "0")} unlocked
                </p>
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="truncate text-xs text-white/60">{p.tagline}</p>
              </div>
              <button onClick={() => setSheet(true)} className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-black">
                Details
              </button>
            </div>
          )}
          {touch && p && sheet && (
            <div className="pointer-events-auto absolute inset-x-0 bottom-0">
              <ProjectCard
                key={card}
                p={p}
                index={card}
                onClose={() => {
                  setSheet(false);
                  setCard(null);
                }}
              />
            </div>
          )}

          {/* speedo + nitro (desktop; phones show speed in the top pill) */}
          {!touch && (<div className={`absolute bottom-5 left-5 rounded-2xl border border-white/15 bg-black/45 px-4 py-2.5 backdrop-blur-md`}>
            <div className="flex items-baseline gap-1.5">
              <span ref={hud.speed} className="font-mono text-3xl font-bold tabular-nums">0</span>
              <span className="text-xs text-white/60">km/h</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-widest text-white/60 uppercase">Magic</span>
              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/15">
                <span ref={hud.nitro} className="block h-full origin-left rounded-full bg-gradient-to-r from-[#ff6a00] to-[#ffd75e]" />
              </span>
            </div>
          </div>)}

          {/* desktop help */}
          {!touch && (
            <div className="absolute right-5 bottom-5 flex max-w-md flex-wrap items-center justify-end gap-x-3 gap-y-1.5 rounded-2xl border border-white/15 bg-black/45 px-4 py-2.5 text-xs text-white/80 backdrop-blur-md">
              <span><Key>↑</Key> gas</span>
              <span><Key>↓</Key> brake</span>
              <span><Key>←</Key><Key>→</Key> steer</span>
              <span><Key>F</Key> cast spell</span>
              <span><Key>Space</Key> wheelie</span>
              <span><Key>Shift</Key> boost</span>
              <span><Key>C</Key> camera</span>
              <span><Key>G</Key> fly / land</span>
            </div>
          )}

          {/* phone speed badge, between the steering and action buttons */}
          {touch && !sheet && (
            <div className="absolute bottom-9 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 font-mono text-xs whitespace-nowrap backdrop-blur-md">
              <span ref={hud.speed} className="text-sm font-bold">0</span> <span className="text-white/50">km/h</span>
            </div>
          )}
          {/* touch controls (hidden while a project card is open) */}
          {touch && !sheet && (
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 pb-6">
              <div className="flex gap-3">
                <PadButton label="Steer left" ctrl="left" set={setCtrl} className="size-16"><LeftGlyph /></PadButton>
                <PadButton label="Steer right" ctrl="right" set={setCtrl} className="size-16"><PlayGlyph className="size-6" /></PadButton>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <PadButton label="Wheelie" ctrl="wheelie" set={setCtrl} className="size-12 text-[10px] font-bold">WHEEL</PadButton>
                <PadButton label="Cast spell" ctrl="fire" set={setCtrl} className="size-12 border-[#ff6a00]/60 text-[10px] font-bold text-[#ffb347]">SPELL</PadButton>
                <PadButton label="Brake" ctrl="down" set={setCtrl} className="size-14 text-xs font-bold">BRAKE</PadButton>
                <PadButton label="Throttle" ctrl="up" set={setCtrl} className="size-14 border-[#2dd4bf]/60 bg-[#2dd4bf]/25 text-xs font-bold">GAS</PadButton>
              </div>
            </div>
          )}

          {paused && !intro && !done && <div className="ride-pause pointer-events-auto"><p className="eyebrow">A MOMENT BETWEEN CHAPTERS</p><h2>Take a breath.</h2><button className="magic-button" onClick={() => setPaused(false)}>Continue the journey</button><button className="text-link" onClick={() => { setRun(r => r + 1); setFound([]); setCard(null); setCoinsGot(0); setFlight(false); setSheet(false); setDone(false); setFeed([]); setAir(null); Object.values(KEYMAP).forEach(k => { controls.current[k] = false; }); setPaused(false); }}>Start a fresh journey ↻</button></div>}
          {intro && ok3d && <div className="ride-onboarding pointer-events-auto"><div className="ride-intro-card"><span className="intro-crest">✦</span><p className="eyebrow">A PORTFOLIO YOU CAN RIDE THROUGH</p><h2>The midnight<br /><em>express.</em></h2><p>A Duke. A moonlit castle. A satchel full of stories.<br />Ride through my world and discover the apps I build.</p><div className="intro-steps"><span><b>01</b>Follow the lanterns</span><span><b>02</b>Collect project letters</span><span><b>03</b>Read the story inside</span></div><p className="intro-controls">{touch ? 'Hold GAS to ride. Use the arrows to steer. Tap Fly to take to the sky.' : 'W / ↑ to ride · A D / ← → to steer · G to fly · F to cast · P to pause'}</p><button className="magic-button" onClick={() => { sound?.init(); setPaused(false); setIntro(false); }}>Let the adventure begin ↗</button><button className="text-link" onClick={stop}>Back to the portfolio</button></div></div>}
          {/* finish */}
          {done && (
            <div className="pointer-events-auto absolute inset-0 grid place-items-center bg-black/55 p-6 backdrop-blur-sm">
              <div className="card-in w-full max-w-md rounded-3xl border border-white/10 bg-[#0f1318] p-8 text-center shadow-2xl">
                <p className="text-xs font-semibold tracking-widest text-[#ffb347] uppercase">Ride complete</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">You unlocked all {projects.length} projects</p>
                <p className="mt-3 text-white/70">
                  Thanks for riding along. If you&apos;d like someone who builds things end to end on your team, let&apos;s talk.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <a href={`mailto:${site.email}`} className="rounded-full bg-[#ff6a00] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                    Email me
                  </a>
                  <button
                    onClick={() => {
                      stop();
                      setTimeout(() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }), 50);
                    }}
                    className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
                  >
                    Explore the portfolio
                  </button>
                  <button onClick={() => setDone(false)} className="rounded-full px-4 py-2.5 text-sm text-white/70 hover:text-white">
                    Keep riding
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="ride-unavailable"><h2>The magic needs a moment.</h2><p>The 3D scene could not start on this device. You can still explore every project below.</p><button onClick={this.props.onExit} className="magic-button">Return to portfolio</button></div>;
    return this.props.children;
  }
}
