"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { projects } from "@/data/projects";
import { ProjectLinks } from "./ProjectCard";
import { motionIsReduced } from "./CVLetter";

function AnimatedStudy({ project }) {
  const kind = project.slug;
  return <div className={`interface-study study-${kind}`} aria-hidden="true">
    <div className="study-top"><span>{project.name}</span><i /><i /><i /></div>
    {['ridemate','routemate'].includes(kind) ? <div className="study-map"><svg viewBox="0 0 320 210"><path className="map-streets" d="M0 45L320 95M0 120L320 170M50 0L100 210M160 0L180 210M265 0L220 210" /><path className="map-route" d="M35 175 C80 160 80 80 145 95 S225 170 280 40" /><circle className="map-rider rider-one" r="7" fill="#e7bd71" /><circle className="map-rider rider-two" r="5" fill="#7fc5da" /></svg><span className="map-pill">{kind === 'ridemate' ? 'Riders, together on one map' : 'Routes that keep you moving'}</span></div> : kind === 'realtimerivals' ? <div className="study-court"><div className="court-line"/><i className="paddle left"/><i className="paddle right"/><i className="game-ball"/><span>Real-time. Two players. One match.</span></div> : kind === 'jobchain' ? <div className="study-jobs"><small>YOUR NEXT OPPORTUNITY</small>{['Frontend developer','Full-stack engineer','Product engineer'].map((name,i) => <div className="study-job" style={{'--i':i}} key={name}><i>{['F','S','P'][i]}</i><span>{name}<small>Search · review · track</small></span><b>↗</b></div>)}</div> : kind === 'moneymate' ? <div className="study-money"><small>SPENDING AT A GLANCE</small><svg viewBox="0 0 320 150"><path d="M20 130H300M20 80H300M20 30H300" stroke="#ffffff12"/><path className="money-line" d="M20 118L65 100L110 110L155 60L200 80L245 35L300 20" /></svg><div className="study-months">JAN <span>FEB</span><span>MAR</span><span>APR</span></div></div> : <div className="study-fitness"><div className="activity-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="39"/><circle className="ring-progress" cx="50" cy="50" r="39"/></svg><span>KEEP<br/>SHOWING UP</span></div><div className="fitness-bars">{[45,72,52,90,65,100,82].map((h,i)=><i key={i} style={{'--height':`${h}%`,'--i':i}}/>)}</div><small>Your plan. One day at a time.</small></div>}
    <div className="study-caption">ANIMATED INTERFACE STUDY</div>
  </div>;
}
export default function ProjectGallery() {
  const [selected, setSelected] = useState(null), [phase, setPhase] = useState('closed'), [paused,setPaused] = useState(false);
  const dialog=useRef(null), origin=useRef(null), frame=useRef(null), timer=useRef(null), trigger=useRef(null), animation=useRef(null);
  useEffect(() => {
    if (!selected) return;
    dialog.current.showModal();
    if(motionIsReduced()) {setPhase('open');return;}
    const target=frame.current.getBoundingClientRect(), from=origin.current;
    animation.current=frame.current.animate([
      {transform:`translate(${from.x-target.x}px,${from.y-target.y}px) scale(${from.width/target.width},${from.height/target.height}) rotateY(-12deg)`},
      {transform:'translate(0,0) scale(1) rotateY(0deg)'}
    ],{duration:700,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
    timer.current=setTimeout(()=>setPhase('open'),720);
    return()=>{clearTimeout(timer.current);animation.current?.cancel();};
  },[selected]);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const settle=()=>{if(motionIsReduced()){animation.current?.finish();clearTimeout(timer.current);setPhase(p=>p==='closed'?p:'open');}};
    media.addEventListener('change',settle);
    return()=>media.removeEventListener('change',settle);
  },[]);
  const close=()=>{clearTimeout(timer.current);dialog.current.close();setSelected(null);setPhase('closed');trigger.current?.focus();};
  return <div className={`project-gallery ${paused?'studies-paused':''}`}>
    <div className="gallery-intro"><p>Six projects. Different problems. Built end to end.</p><button aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'▶ Play previews':'Ⅱ Pause previews'}</button></div>
    <div className="gallery-wall">{projects.map((p,i)=><div className="gallery-exhibit" key={p.slug}><div className="picture-light"><i/></div><button className="gallery-frame" aria-label={`Open ${p.name} case study`} onClick={e=>{origin.current=e.currentTarget.getBoundingClientRect();trigger.current=e.currentTarget;setPhase('arriving');setSelected(p);}}><AnimatedStudy project={p}/><span className="frame-corner tl"/><span className="frame-corner br"/></button><div className="gallery-plaque"><span>0{i+1}</span><div><h3>{p.name}</h3><p>{p.tagline}</p></div><span>↗</span></div></div>)}</div>
    <p className="gallery-note">Animated interface studies illustrate each project. Original screenshots, full details, and available demos are inside the folios.</p>
    <dialog ref={dialog} className="folio-dialog" aria-label={selected?`${selected.name} case study`:'Project case study'} onCancel={close} data-phase={phase}>
      <div className="folio-toolbar"><span>SELECTED WORK / CASE STUDY</span><button autoFocus onClick={close} aria-label="Close case study">Close ✕</button></div>
      {selected && <div className="folio-book"><div className="folio-visual" ref={frame}><div className="folio-cover"><AnimatedStudy project={selected}/><span className="cover-title">{selected.name}<small>Open the project folio</small></span></div><div className="folio-original">{selected.image ? <Image src={selected.image} alt={`${selected.name} original app screenshot`} width={1200} height={900} sizes="(max-width: 700px) 90vw, 450px"/> : <AnimatedStudy project={selected}/>}<p>{selected.image?'Original application screenshot':'Animated route illustration'}</p><ProjectLinks project={selected}/></div></div><div className="folio-page"><p className="folio-kicker">THE PROBLEM</p><p className="folio-problem">{selected.problem}</p><h2>{selected.name}</h2><p>{selected.summary}</p><h3>What I built</h3><ul>{selected.highlights.map(h=><li key={h}>{h}</li>)}</ul><div className="folio-stack">{selected.stack.map(s=><span key={s}>{s}</span>)}</div><a className="text-link" href={`/projects/${selected.slug}`}>Read the complete case study ↗</a></div></div>}
    </dialog>
  </div>;
}
