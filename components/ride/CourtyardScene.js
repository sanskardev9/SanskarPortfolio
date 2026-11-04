"use client";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import Bike from './Bike';

function pavingTexture() {
  const c=document.createElement('canvas');c.width=512;c.height=512;const g=c.getContext('2d');
  g.fillStyle='#18202a';g.fillRect(0,0,512,512);
  for(let y=0;y<8;y++)for(let x=-1;x<8;x++){
    const shade=42+((x*17+y*29+100)%17);g.fillStyle=`rgb(${shade},${shade+6},${shade+13})`;
    g.fillRect(x*80+(y%2)*40+2,y*64+2,76,60);
    g.strokeStyle='#aab1ba12';g.strokeRect(x*80+(y%2)*40+3,y*64+3,74,58);
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(10,12);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}
function Lantern({ position }) {
  return <group position={position}>
    <mesh position={[0,1.7,0]} castShadow><cylinderGeometry args={[.065,.12,3.4,12]}/><meshStandardMaterial color="#332e29" metalness={.7} roughness={.35}/></mesh>
    <mesh position={[0,3.5,0]}><boxGeometry args={[.32,.6,.32]}/><meshStandardMaterial color="#ffd59a" emissive="#ffac48" emissiveIntensity={2.2} toneMapped={false}/></mesh>
    <mesh position={[0,3.5,0]}><boxGeometry args={[.4,.7,.4]}/><meshStandardMaterial color="#463820" wireframe metalness={.7}/></mesh>
    <mesh position={[0,3.95,0]}><coneGeometry args={[.36,.3,4]}/><meshStandardMaterial color="#503e2a" metalness={.7}/></mesh>
    <pointLight position={[0,3.4,0]} color="#ffbb69" intensity={36} distance={13} decay={2}/>
  </group>;
}
function Courtyard() {
  const paving=useMemo(pavingTexture,[]);
  return <group>
    <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[42,50]}/><meshStandardMaterial map={paving} roughness={.68} metalness={.12}/></mesh>
    {/* Limestone borders keep the riding limits visible. */}
    {[-1,1].map(s=><group key={s}><mesh position={[s*19,.18,0]} receiveShadow castShadow><boxGeometry args={[.7,.36,47]}/><meshStandardMaterial color="#71808d" roughness={.9}/></mesh><mesh position={[0,.18,s*23]} receiveShadow castShadow><boxGeometry args={[38,.36,.7]}/><meshStandardMaterial color="#71808d" roughness={.9}/></mesh></group>)}
    {/* The enclosing colonnade: masonry, recessed timber doors, lit windows. */}
    {[-1,1].map(side=><group key={side} position={[side*20,0,0]}>
      <mesh position={[0,2.6,0]} receiveShadow castShadow><boxGeometry args={[1,5.2,49]}/><meshStandardMaterial color="#283548" roughness={.95}/></mesh>
      {[-19,-11,-3,5,13,21].map(z=><group position={[side*-.6,0,z]} key={z}>
        <mesh position={[0,2.7,0]} castShadow><boxGeometry args={[.4,5.4,.6]}/><meshStandardMaterial color="#4b596b" roughness={.8}/></mesh>
        <mesh position={[side*-.04,3.8,2]}><boxGeometry args={[.1,1.5,.9]}/><meshStandardMaterial color="#ffc47b" emissive="#ff9b40" emissiveIntensity={.7}/></mesh>
        <mesh position={[side*-.12,3.8,2]}><boxGeometry args={[.12,.08,1]}/><meshStandardMaterial color="#32291f"/></mesh>
        <mesh position={[0,5.2,3]}><boxGeometry args={[1.4,.35,7.5]}/><meshStandardMaterial color="#596474"/></mesh>
      </group>)}
    </group>)}
    {[-1,1].map(s=><group key={s} position={[0,0,s*24]}>
      <mesh position={[0,3,0]} castShadow receiveShadow><boxGeometry args={[41,6,1]}/><meshStandardMaterial color="#263247" roughness={.9}/></mesh>
      <mesh position={[0,2,s*-.55]}><boxGeometry args={[4,4,.25]}/><meshStandardMaterial color="#35271f" roughness={.9}/></mesh>
      {[-1,1].map(n=><mesh key={n} position={[n*2.4,2.7,s*-.6]} castShadow><boxGeometry args={[.65,5.4,1]}/><meshStandardMaterial color="#657284"/></mesh>)}
      <mesh position={[0,4.6,s*-.6]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[2.4,.3,8,32,Math.PI]}/><meshStandardMaterial color="#657284"/></mesh>
      {[-14,-8,8,14].map(x=><mesh position={[x,4,s*-.6]} key={x}><boxGeometry args={[1.1,1.5,.1]}/><meshStandardMaterial color="#d5ad6e" emissive="#efa443" emissiveIntensity={.55}/></mesh>)}
    </group>)}
    {[-1,1].flatMap(x=>[-1,1].map(z=><group position={[x*20,0,z*24]} key={`${x}${z}`}><mesh position={[0,4.5,0]} castShadow><cylinderGeometry args={[2,2.3,9,16]}/><meshStandardMaterial color="#354258"/></mesh><mesh position={[0,10.5,0]} castShadow><coneGeometry args={[2.8,4,16]}/><meshStandardMaterial color="#15243b" metalness={.4} roughness={.5}/></mesh></group>))}
    {/* A low central fountain, with real collision in the riding simulation. */}
    <mesh position={[0,.3,0]} castShadow receiveShadow><cylinderGeometry args={[3.1,3.3,.6,64]}/><meshStandardMaterial color="#536175" roughness={.8}/></mesh>
    <mesh position={[0,.62,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[2.8,64]}/><meshPhysicalMaterial color="#163b50" metalness={.3} roughness={.15} clearcoat={1}/></mesh>
    <mesh position={[0,1.1,0]} castShadow><cylinderGeometry args={[.65,1,1.2,32]}/><meshStandardMaterial color="#65788d"/></mesh>
    <mesh position={[0,1.8,0]}><sphereGeometry args={[.42,32,24]}/><meshPhysicalMaterial color="#8cb2c8" roughness={.1} metalness={.6}/></mesh>
    {[[-16,0,-17],[16,0,-17],[-16,0,0],[16,0,0],[-16,0,17],[16,0,17]].map((p,i)=><Lantern key={i} position={p}/>)}
    {[-1,1].map(s=><group key={s} position={[s*14,0,4]}><mesh position={[0,.55,0]} castShadow><boxGeometry args={[1.2,.18,3.5]}/><meshStandardMaterial color="#4e3528" roughness={.7}/></mesh>{[-1,1].map(n=><mesh key={n} position={[0,.25,n*1.2]} castShadow><boxGeometry args={[.8,.5,.16]}/><meshStandardMaterial color="#282b30" metalness={.7}/></mesh>)}</group>)}
  </group>;
}
const TARGETS=[[-12,1.4,-19],[0,1.4,-20],[7,1.4,-20],[12,1.4,-19]];
function Simulation({ controls, paused, cameraMode, onUpdate, onHit, reset }) {
  const {camera,scene}=useThree();
  const bike=useRef(),lean=useRef(),pitch=useRef(),wheels=useRef([]), targets=useRef([]), shots=useRef([]), flash=useRef();
  const state=useRef({x:0,z:14,yaw:Math.PI,v:0,distance:0,cooldown:0,hits:new Set(),bolts:Array.from({length:12},()=>({alive:false,x:0,z:0,dx:0,dz:0,life:0})),time:0,ui:0,shotCount:0});
  const vectors=useMemo(()=>({camera:new THREE.Vector3(),look:new THREE.Vector3(0,1,13),goal:new THREE.Vector3()}),[]);
  useEffect(()=>{scene.traverse(o=>{if(o.isMesh && o.parent!==flash.current){o.castShadow=true;o.receiveShadow=true;}});},[scene]);
  useEffect(()=>{
    state.current={x:0,z:14,yaw:Math.PI,v:0,distance:0,cooldown:0,hits:new Set(),bolts:Array.from({length:12},()=>({alive:false,x:0,z:0,dx:0,dz:0,life:0})),time:0,ui:0,shotCount:0};
    camera.position.set(2.4,3.1,20.5);vectors.look.set(0,1,13);onUpdate({speed:0,hits:0,shots:0,distance:0});
  },[reset,camera,onUpdate,vectors]);
  useFrame((_,delta)=>{
    const dt=Math.min(delta,.04),s=state.current,c=controls.current;
    if(!paused){
      s.time+=dt;
      const acceleration=c.forward?4.5:c.back?-6:0;
      s.v=THREE.MathUtils.clamp(s.v+acceleration*dt,-2.5,9);
      if(!c.forward&&!c.back)s.v=THREE.MathUtils.damp(s.v,0,2,dt);
      const steering=(c.left?1:0)-(c.right?1:0);
      const turn=steering*1.25*Math.min(Math.abs(s.v)/2.5,1)*Math.sign(s.v);
      s.yaw+=turn*dt;
      const nx=s.x+Math.sin(s.yaw)*s.v*dt,nz=s.z+Math.cos(s.yaw)*s.v*dt;
      const fountain=Math.hypot(nx,nz)<4.05;
      const bench=Math.abs(Math.abs(nx)-14)<1.45 && Math.abs(nz-4)<2.5;
      if(Math.abs(nx)>17.7||Math.abs(nz)>21.7||fountain||bench)s.v=0;
      else{s.x=nx;s.z=nz;s.distance+=Math.abs(s.v*dt);}
      wheels.current.forEach(w=>{if(w)w.rotation.x+=s.v*dt/(w === wheels.current[0] ? .30 : .32);});
      lean.current.rotation.z=THREE.MathUtils.damp(lean.current.rotation.z,-steering*Math.min(Math.abs(s.v)/9,1)*.16,8,dt);
      s.cooldown-=dt;
      if(c.shoot&&s.cooldown<=0){
        const b=s.bolts.find(b=>!b.alive);
        if(b){Object.assign(b,{alive:true,x:s.x+Math.sin(s.yaw)*1.2,z:s.z+Math.cos(s.yaw)*1.2,dx:Math.sin(s.yaw),dz:Math.cos(s.yaw),life:1.6});s.cooldown=.22;s.shotCount++;}
      }
      for(let i=0;i<s.bolts.length;i++){
        const b=s.bolts[i];if(!b.alive)continue;
        b.x+=b.dx*30*dt;b.z+=b.dz*30*dt;b.life-=dt;
        TARGETS.forEach(([x,,z],k)=>{if(!s.hits.has(k)&&Math.hypot(b.x-x,b.z-z)<1.05){s.hits.add(k);b.alive=false;onHit(k);}});
        if(b.life<=0||Math.abs(b.x)>19||Math.abs(b.z)>23)b.alive=false;
      }
    }
    bike.current.position.set(s.x,0,s.z);bike.current.rotation.y=s.yaw;pitch.current.rotation.x=0;
    s.bolts.forEach((b,i)=>{const m=shots.current[i];if(m){m.visible=b.alive;m.position.set(b.x,1.35,b.z);}});
    targets.current.forEach((m,i)=>{if(m)m.scale.setScalar(s.hits.has(i) ? .45 : 1);});
    const side=cameraMode==='detail'?4.8:1.4,back=cameraMode==='detail'?2.6:6.4;
    vectors.camera.set(s.x-Math.sin(s.yaw)*back+Math.cos(s.yaw)*side, cameraMode==='detail'?2.2:3.2,s.z-Math.cos(s.yaw)*back-Math.sin(s.yaw)*side);
    vectors.camera.x=THREE.MathUtils.clamp(vectors.camera.x,-18.7,18.7);vectors.camera.z=THREE.MathUtils.clamp(vectors.camera.z,-22.7,22.7);
    camera.position.lerp(vectors.camera,1-Math.exp(-5*dt));
    vectors.goal.set(s.x+Math.sin(s.yaw)*1.1,1.05,s.z+Math.cos(s.yaw)*1.1);
    vectors.look.lerp(vectors.goal,1-Math.exp(-7*dt));camera.lookAt(vectors.look);
    s.ui+=dt;if(s.ui>.1){s.ui=0;onUpdate({speed:Math.abs(s.v)*3.6,hits:s.hits.size,shots:s.shotCount,distance:s.distance});}
  });
  return <>
    <Bike ref={bike} wheelRefs={wheels} leanRef={lean} pitchRef={pitch} playing night outfit="mountain"/>
    {TARGETS.map(([x,y,z],i)=><group key={i} position={[x,y,z]}>
      <mesh position={[0,-.7,0]} castShadow><cylinderGeometry args={[.07,.07,1.4,8]}/><meshStandardMaterial color="#795f3c"/></mesh>
      <group ref={e=>targets.current[i]=e}><mesh castShadow><cylinderGeometry args={[.75,.75,.18,48]} rotation={[Math.PI/2,0,0]}/><meshStandardMaterial color="#302922" roughness={.7}/></mesh>{[.6,.4,.18].map((r,k)=><mesh key={r} position={[0,0,.1+k*.005]}><ringGeometry args={[r-.035,r,48]}/><meshStandardMaterial color="#d3ac65" emissive="#8e5623" emissiveIntensity={.45} side={THREE.DoubleSide}/></mesh>)}</group>
    </group>)}
    {state.current.bolts.map((_,i)=><mesh ref={e=>shots.current[i]=e} key={i} visible={false}><sphereGeometry args={[.075,8,8]}/><meshBasicMaterial color="#ffda93"/></mesh>)}
  </>;
}
function CourtyardScene(props){
  return <Canvas shadows dpr={[1,1.5]} camera={{fov:48,near:.08,far:130,position:[2.4,3.1,20.5]}} gl={{antialias:true,powerPreference:'high-performance',toneMapping:THREE.ACESFilmicToneMapping}}>
    <color attach="background" args={['#080f21']}/><fog attach="fog" args={['#101d34',26,85]}/>
    <hemisphereLight args={['#91a8ce','#18202c',1.4]}/><directionalLight position={[-12,25,10]} intensity={2.4} color="#a8bedf" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-27} shadow-camera-right={27} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-normalBias={.035}/>
    <directionalLight position={[4,8,16]} color="#ffd397" intensity={1.8}/>
    <Courtyard/><Simulation {...props}/>
  </Canvas>;
}

export default memo(CourtyardScene);
