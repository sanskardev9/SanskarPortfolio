"use client";
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState } from 'react';
const Scene=dynamic(()=>import('./CourtyardScene'),{ssr:false,loading:()=> <div className="courtyard-loading">Preparing the courtyard…</div>});
const keys={w:'forward',arrowup:'forward',s:'back',arrowdown:'back',a:'left',arrowleft:'left',d:'right',arrowright:'right',f:'shoot',' ':'shoot'};
function Pad({action,label,controls,children}){
  const off=()=>{controls.current[action]=false;};
  return <button aria-label={label} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);controls.current[action]=true;}} onPointerUp={off} onPointerCancel={off} onLostPointerCapture={off}>{children}</button>;
}
export default function CourtyardRide({onClose}){
  const dialog=useRef(null),controls=useRef({forward:false,back:false,left:false,right:false,shoot:false});
  const [available,setAvailable]=useState(null),[started,setStarted]=useState(false),[paused,setPaused]=useState(false),[cameraMode,setCameraMode]=useState('follow'),[reset,setReset]=useState(0),[telemetry,setTelemetry]=useState({speed:0,hits:0,shots:0,distance:0});
  const clear=useCallback(()=>Object.keys(controls.current).forEach(k=>{controls.current[k]=false;}),[]);
  const onHit=useCallback(()=>{},[]);
  useEffect(()=>{
    dialog.current.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    const canvas=document.createElement('canvas');const gl=canvas.getContext('webgl2');setAvailable(!!gl);gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return()=>{clear();document.body.style.overflow=previous;};
  },[clear]);
  useEffect(()=>{
    const down=e=>{if(e.target instanceof HTMLButtonElement && [' ','Enter'].includes(e.key))return;const key=keys[e.key.toLowerCase()];if(key){e.preventDefault();if(started&&!paused)controls.current[key]=true;}if(e.key.toLowerCase()==='p'&&!e.repeat&&started){clear();setPaused(v=>!v);}};
    const up=e=>{const key=keys[e.key.toLowerCase()];if(key)controls.current[key]=false;};
    const blur=()=>{clear();if(started)setPaused(true);};
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
    const hide=()=>{if(document.hidden)blur();};document.addEventListener('visibilitychange',hide);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hide);};
  },[started,paused,clear]);
  return <dialog ref={dialog} className="courtyard-dialog" aria-label="Motorcycle courtyard" onCancel={onClose}>
    <SceneBoundary>{available ? <Scene controls={controls} paused={!started||paused} cameraMode={cameraMode} onUpdate={setTelemetry} onHit={onHit} reset={reset}/> : <div className="courtyard-loading">{available===null?'Checking 3D support…':'WebGL is unavailable in this browser. You can still explore all projects and the résumé.'}</div>}</SceneBoundary>
    <div className="courtyard-top"><div><span>INTERACTIVE STUDY / 01</span><h2>The courtyard</h2></div><div className="courtyard-actions"><button onClick={()=>setCameraMode(m=>m==='follow'?'detail':'follow')}>{cameraMode==='follow'?'Inspect bike':'Follow camera'}</button>{started&&<button onClick={()=>{clear();setPaused(!paused);}}>{paused?'Resume':'Pause'}</button>}<button onClick={onClose} aria-label="Close courtyard">Close ✕</button></div></div>
    {!started&&available&&<div className="courtyard-intro"><p className="eyebrow">RIDE / EXPLORE / TARGET PRACTICE</p><h3>A quieter place<br/>to ride.</h3><p>Explore the lantern-lit courtyard. Four brass targets wait at the far wall.</p><ol><li><kbd>W A S D</kbd> or arrow keys to ride and steer</li><li><kbd>F</kbd> or <kbd>Space</kbd> to shoot</li><li><kbd>P</kbd> to pause · touch controls below</li></ol><button autoFocus className="magic-button" onClick={()=>{setStarted(true);setPaused(false);dialog.current.focus();}}>Start riding ↗</button><p className="model-note">Procedural motorcycle and rider study. No authored 3D model assets are available in this project.</p></div>}
    {started&&<><div className="courtyard-stats"><div><strong data-speed>{Math.round(telemetry.speed)}</strong><span>KM/H</span></div><div><strong data-hits>{telemetry.hits}/4</strong><span>TARGETS</span></div><div><strong data-shots>{telemetry.shots}</strong><span>SHOTS</span></div></div><div className="courtyard-objective" aria-live="polite">{telemetry.hits===4?'All four targets hit. Reset to ride again.':'Find the four brass targets at the far wall.'}</div><div className="courtyard-help">WASD / arrows · F shoot · P pause <button onClick={()=>{clear();setReset(r=>r+1);setPaused(false);}}>Reset ride ↻</button></div>
      <div className="courtyard-pad"><div><Pad controls={controls} action="left" label="Steer left">←</Pad><Pad controls={controls} action="right" label="Steer right">→</Pad></div><div><Pad controls={controls} action="back" label="Brake and reverse">Brake</Pad><Pad controls={controls} action="forward" label="Accelerate">Ride</Pad><Pad controls={controls} action="shoot" label="Shoot">Fire</Pad></div></div></>}
    {paused&&started&&<div className="courtyard-paused"><p className="eyebrow">RIDE PAUSED</p><h3>Take your time.</h3><button className="magic-button" onClick={()=>{setPaused(false);dialog.current.focus();}}>Resume riding</button></div>}
  </dialog>;
}
class SceneBoundary extends Component {
  state={failed:false};static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<div className="courtyard-loading">The 3D scene could not start on this device. Close the courtyard to continue browsing.</div>:this.props.children;}
}
