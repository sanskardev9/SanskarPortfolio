"use client";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";

export function motionIsReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'quiet';
}
export function CVButton({ className = "text-link", children = "CV" }) {
  return <button className={className} onClick={() => window.dispatchEvent(new Event('open-resume'))}>{children}</button>;
}
export default function CVLetter() {
  const dialog = useRef(null), timers = useRef([]);
  const [stage, setStage] = useState('closed');
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const skip = () => { clear(); setStage('ready'); };
  useEffect(() => {
    const show = () => {
      clear(); dialog.current.showModal();
      if (motionIsReduced()) { setStage('ready'); return; }
      setStage('arrival');
      timers.current = [[900,'flap'],[1700,'slide'],[2600,'unfold'],[3700,'ready']].map(([time, value]) => setTimeout(() => setStage(value), time));
    };
    const reduced = () => { if (dialog.current.open && motionIsReduced()) skip(); };
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new MutationObserver(reduced);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    media.addEventListener('change', reduced);
    window.addEventListener('open-resume', show);
    return () => { clear(); observer.disconnect(); media.removeEventListener('change', reduced); window.removeEventListener('open-resume', show); };
  }, []);
  const close = () => { clear(); dialog.current.close(); setStage('closed'); };
  return <dialog ref={dialog} className="letter-dialog" aria-label="Sanskar Singh résumé" data-stage={stage} onCancel={close} onClose={() => { clear(); setStage('closed'); }}>
    <div className="letter-controls"><span>PERSONAL CORRESPONDENCE / RÉSUMÉ</span><div>{stage !== 'ready' && <button onClick={skip}>Skip animation</button>}<button autoFocus onClick={close} aria-label="Close résumé">Close ✕</button></div></div>
    {stage !== 'ready' ? <div className="letter-theatre" aria-hidden="true">
      <div className="envelope-flight"><div className="envelope-back" /><div className="letter-paper"><div className="letter-fold"><span>CURRICULUM VITAE</span><h2>Sanskar Singh</h2><p>Full-Stack Developer</p><div className="letter-lines" /></div><div className="letter-fold lower-fold"><span>EXPERIENCE · PROJECTS · EDUCATION</span><div className="letter-lines" /></div></div><div className="envelope-front"><span>To the next opportunity.</span><i>SS</i></div><div className="envelope-flap" /></div>
      <p className="letter-status">{stage === 'arrival' ? 'A letter for you.' : stage === 'flap' ? 'Breaking the seal…' : stage === 'slide' ? 'Opening the letter…' : 'Unfolding the résumé…'}</p>
    </div> : <div className="resume-reading"><div className="resume-heading"><div><p>CURRICULUM VITAE</p><h2>Sanskar Singh</h2></div><span>Full-Stack Developer</span></div><object data={site.cv} type="application/pdf" aria-label="Original résumé PDF"><p>PDF preview is not supported in this browser. <a href={site.cv} target="_blank" rel="noreferrer">Read the original résumé</a>.</p></object></div>}
    <footer className="letter-footer"><span aria-live="polite">{stage === 'ready' ? 'Original résumé · PDF' : 'Opening résumé'}</span><a href={site.cv} target="_blank" rel="noreferrer">Open PDF ↗</a><a href={site.cv} download>Download ↓</a></footer>
  </dialog>;
}
