"use client";
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {useState} from 'react';
import {CVButton} from './CVLetter';
const BikeShowcase=dynamic(()=>import('./ride/BikeShowcase'),{ssr:false,loading:()=> <div className="showcase-fallback">Opening the garage…</div>});
const Ride=dynamic(()=>import('./ride/CourtyardRide'),{ssr:false});
export default function PhotoHero(){const[open,setOpen]=useState(false);return <>
  <section className="garage-hero" aria-label="Sanskar Singh, full-stack developer"><div className="garage-grid" aria-hidden="true"/><div className="garage-intro"><p className="garage-eyebrow"><span/> OPEN TO FULL-STACK OPPORTUNITIES</p><p className="garage-name">Hey, I’m Sanskar Singh.</p><h1>Built with intent.<br/>Driven by <span>curiosity.</span></h1><p className="garage-description">I build the apps I wish existed—from the first interaction to the systems behind it. Usually with a mountain ride somewhere in between.</p><div className="garage-cta"><a href="#projects" className="garage-primary">Explore my work <span>↗</span></a><CVButton className="garage-secondary">View résumé ↗</CVButton></div><div className="garage-stack"><span>React</span><i/>Next.js<i/><span>Node.js</span><i/><span>Python</span></div></div><div className="garage-object"><BikeShowcase/><div className="garage-object-note"><span>Off the clock. On two wheels.</span><button onClick={()=>setOpen(true)}>Take it for a ride ↗</button></div></div><div className="garage-footer"><span>SCROLL TO THE WORKBENCH ↓</span><span>Thoughtful interfaces. Useful products.</span><a href="#about" className="garage-avatar"><Image src="/sanskar.jpg" width={28} height={28} alt="Sanskar Singh"/> A little about me ↗</a></div></section>
  {open&&<Ride onClose={()=>setOpen(false)}/>}
</>;}
