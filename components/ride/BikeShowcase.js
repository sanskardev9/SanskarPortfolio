"use client";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import Bike from './Bike';
function Studio({view}) {
  const wheels=useRef([]),lean=useRef(),pitch=useRef(),model=useRef();const {camera,scene}=useThree();
  const goal=useMemo(()=>new THREE.Vector3(),[]);
  useEffect(()=>{scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});camera.lookAt(0,.65,0);},[scene,camera]);
  useFrame((_,dt)=>{const poses={side:[3.4,1.5,.6],front:[2.7,1.55,3.1],rear:[-2.8,1.5,-2.4]};goal.set(...poses[view]);camera.position.lerp(goal,1-Math.exp(-dt*5));camera.lookAt(0,.64,0);});
  return <>
    <hemisphereLight args={['#c8daee','#25282f',2]}/><directionalLight position={[3,5,2]} intensity={4} color="#f0f3ff" castShadow shadow-mapSize={[1024,1024]} shadow-normalBias={.025}/><directionalLight position={[-3,3,-2]} intensity={3} color="#829fc2"/><pointLight position={[0,2,-2]} intensity={12} color="#ff762b"/>
    <Bike ref={model} wheelRefs={wheels} leanRef={lean} pitchRef={pitch} withRider={false}/>
    <mesh position={[0,-.09,0]} receiveShadow><cylinderGeometry args={[1.65,1.68,.18,96]}/><meshStandardMaterial color="#151f2b" metalness={.35} roughness={.4}/></mesh>
    <mesh position={[0,-.015,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.57,1.58,96]}/><meshBasicMaterial color="#ff762b"/></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.19,0]} receiveShadow><planeGeometry args={[100,100]}/><meshStandardMaterial color="#101722" roughness={.9}/></mesh>
  </>;
}
export default function BikeShowcase(){
  const [view,setView]=useState('front');
  return <div className="bike-showcase"><div className="showcase-top"><span><i/> PERSONAL GARAGE / 001</span><span>3D STUDY</span></div><Boundary><Canvas shadows dpr={[1,1.5]} camera={{fov:38,near:.05,far:120,position:[2.7,1.55,3.1]}} gl={{antialias:true,alpha:true,toneMapping:THREE.ACESFilmicToneMapping}}><Studio view={view}/></Canvas></Boundary><div className="showcase-bottom"><div><strong>390 DUKE</strong><span>GEN 3 · GUNMETAL GREY</span></div><div className="view-buttons">{['front','side','rear'].map(v=><button key={v} onClick={()=>setView(v)} aria-pressed={v===view} aria-label={`${v} view of motorcycle`}>{v}</button>)}</div></div></div>;
}
class Boundary extends Component{state={failed:false};static getDerivedStateFromError(){return{failed:true};}render(){return this.state.failed?<div className="showcase-fallback">390 DUKE<br/><small>3D preview unavailable on this device</small></div>:this.props.children;}}
