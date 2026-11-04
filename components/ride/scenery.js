"use client";

// Himalayan scenery + an animated day/night cycle (sky, fog, sun/moon, stars and clouds all
// blend smoothly when the theme changes).

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { roadPose, ROAD_HALF } from "./world";

const DAY = { top: new THREE.Color("#2f7fe0"), horizon: new THREE.Color("#c3dcf2"), hemiSky: new THREE.Color("#e6f3ff"), hemiGround: new THREE.Color("#8a7a62"), sun: new THREE.Color("#fff3dc"), cloud: new THREE.Color("#ffffff") };
const NIGHT = { top: new THREE.Color("#061717"), horizon: new THREE.Color("#294547"), hemiSky: new THREE.Color("#8ca7b0"), hemiGround: new THREE.Color("#121a2a"), sun: new THREE.Color("#b4c8ff"), cloud: new THREE.Color("#3c5656") };

export function Atmosphere({ night }) {
  const { scene } = useThree();
  const hemi = useRef(), sun = useRef(), skyMat = useRef(), stars = useRef();
  const k = useRef(night ? 1 : 0);
  const tmp = useMemo(() => ({ a: new THREE.Color(), b: new THREE.Color() }), []);
  const skyUniforms = useMemo(() => ({ top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() } }), []);
  useEffect(() => {
    scene.fog = new THREE.Fog("#c3dcf2", 90, 800);
  }, [scene]);

  useFrame((_, dt) => {
    k.current += ((night ? 1 : 0) - k.current) * Math.min(1, dt * 2.2);
    const t = k.current;
    skyUniforms.top.value.copy(DAY.top).lerp(NIGHT.top, t);
    skyUniforms.horizon.value.copy(DAY.horizon).lerp(NIGHT.horizon, t);
    scene.fog.color.copy(skyUniforms.horizon.value);
    scene.fog.far = 800 - t * 220;
    hemi.current.color.copy(DAY.hemiSky).lerp(NIGHT.hemiSky, t);
    hemi.current.groundColor.copy(DAY.hemiGround).lerp(NIGHT.hemiGround, t);
    hemi.current.intensity = 1.7 - t * 0.45;
    sun.current.color.copy(DAY.sun).lerp(NIGHT.sun, t);
    sun.current.intensity = 2.6 - t * 1.75;
    stars.current.material.opacity = t;
    stars.current.visible = t > 0.02;
    scene.userData.night = t;
  });

  const starGeo = useMemo(() => {
    const n = 1100, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI * 0.45;
      arr.set([Math.cos(th) * Math.sin(ph) * 900, Math.cos(ph) * 900, Math.sin(th) * Math.sin(ph) * 900], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  return (
    <>
      <mesh scale={1500} frustumCulled={false}>
        <sphereGeometry args={[1, 24, 16]} />
        <shaderMaterial
          ref={skyMat}
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          uniforms={skyUniforms}
          vertexShader={`varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={`uniform vec3 top; uniform vec3 horizon; varying float h; void main(){ gl_FragColor = vec4(mix(horizon, top, pow(clamp(h,0.0,1.0),0.55)),1.0); }`}
        />
      </mesh>
      <hemisphereLight ref={hemi} />
      <directionalLight ref={sun} position={[140, 180, 60]} />
      <points ref={stars} geometry={starGeo}>
        <pointsMaterial color="#ffffff" size={1.6} sizeAttenuation={false} fog={false} transparent />
      </points>
    </>
  );
}

export function Clouds({ clouds }) {
  const { scene } = useThree();
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", flatShading: true, roughness: 1, fog: false, emissive: "#ffffff", emissiveIntensity: 0.3 }), []);
  useFrame(() => {
    const t = scene.userData.night ?? 0;
    mat.color.copy(DAY.cloud).lerp(NIGHT.cloud, t);
    mat.emissiveIntensity = 0.3 * (1 - t);
  });
  return clouds.map((c, i) => (
    <group key={i} position={[c.x, c.y, c.z]}>
      {c.puffs.map((p, k) => (
        <mesh key={k} geometry={geo} material={mat} position={[p.x, p.y, p.z]} scale={[p.r * 1.3, p.r * 0.8, p.r]} />
      ))}
    </group>
  ));
}

export function Rocks({ rocks }) {
  const ref = useRef();
  useEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), e = new THREE.Euler();
    rocks.forEach((r, i) => {
      e.set(r.r, r.r * 1.7, r.r * 0.5);
      q.setFromEuler(e);
      s.set(r.s * 1.3, r.s * 0.8, r.s);
      v.set(r.x, r.y + r.s * 0.3, r.z);
      m.compose(v, q, s);
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [rocks]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, rocks.length]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8a8178" flatShading roughness={1} />
    </instancedMesh>
  );
}

const WATER = "#3cc1c9";
export function Ponds({ ponds }) {
  return ponds.map((p, i) => (
    <mesh key={i} position={[p.x, -0.5, p.z]} rotation={[-Math.PI / 2, 0, i]}>
      <circleGeometry args={[p.r * 1.25, 9]} />
      <meshStandardMaterial color={WATER} roughness={0.15} metalness={0.2} transparent opacity={0.9} />
    </mesh>
  ));
}

function flagTex() {
  const cv = document.createElement("canvas");
  cv.width = 64;
  cv.height = 320;
  const g = cv.getContext("2d");
  ["#2f4fd6", "#f4f4f0", "#e2242c", "#2f9b45", "#f2c51d"].forEach((c, i) => {
    g.fillStyle = c;
    g.fillRect(0, i * 64, 64, 64);
  });
  g.fillStyle = "rgba(0,0,0,0.25)";
  for (let i = 0; i < 5; i++) {
    g.beginPath();
    g.arc(32, i * 64 + 32, 9, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Bridge deck + hazard-striped kerbs, river below, tall prayer flags swaying in the wind
export function Bridge({ world }) {
  const tex = useMemo(flagTex, []);
  const flagRefs = useRef([]);
  const items = useMemo(() => {
    const p = new THREE.Vector3(), t = new THREE.Vector3();
    roadPose(world, world.bridge.s, 0, p, t);
    const centre = { x: p.x, z: p.z, yaw: Math.atan2(t.x, t.z) };
    const flags = world.flags.map((f) => {
      const fp = new THREE.Vector3(), ft = new THREE.Vector3();
      roadPose(world, f.s, f.lat, fp, ft);
      return { x: fp.x, z: fp.z, yaw: Math.atan2(ft.x, ft.z), side: Math.sign(f.lat) };
    });
    return { centre, flags };
  }, [world]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    flagRefs.current.forEach((f, i) => f && (f.rotation.y = Math.sin(t * 1.6 + i * 0.7) * 0.35));
  });
  const { centre } = items;
  const W = ROAD_HALF * 2 + 1.2;
  return (
    <>
      {/* river */}
      <mesh position={[centre.x, -3.4, centre.z]} rotation={[-Math.PI / 2, 0, centre.yaw]}>
        <planeGeometry args={[300, 16]} />
        <meshStandardMaterial color={WATER} roughness={0.12} metalness={0.25} />
      </mesh>
      <group position={[centre.x, 0, centre.z]} rotation={[0, centre.yaw, 0]}>
        {/* deck + girders */}
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[W, 0.8, world.bridge.len]} />
          <meshStandardMaterial color="#9a958c" flatShading />
        </mesh>
        {[-1, 1].map((sg) => (
          <group key={sg} position={[sg * (W / 2 - 0.15), 0, 0]}>
            {/* yellow/black hazard kerb */}
            {Array.from({ length: 17 }, (_, i) => (
              <mesh key={i} position={[0, 0.2, -world.bridge.len / 2 + 1 + i * 2]}>
                <boxGeometry args={[0.3, 0.4, 1]} />
                <meshStandardMaterial color={i % 2 ? "#151515" : "#f2c51d"} />
              </mesh>
            ))}
            {/* railing */}
            <mesh position={[0, 1.05, 0]}>
              <boxGeometry args={[0.08, 0.08, world.bridge.len]} />
              <meshStandardMaterial color="#d8d8d2" />
            </mesh>
            {Array.from({ length: 12 }, (_, i) => (
              <mesh key={i} position={[0, 0.7, -world.bridge.len / 2 + 1.5 + i * 2.8]}>
                <boxGeometry args={[0.07, 0.7, 0.07]} />
                <meshStandardMaterial color="#d8d8d2" />
              </mesh>
            ))}
          </group>
        ))}
        {/* piers */}
        {[-1, 1].map((sg) => (
          <mesh key={sg} position={[0, -2.4, sg * 8]}>
            <boxGeometry args={[W - 1.5, 3.4, 1.4]} />
            <meshStandardMaterial color="#8a857c" flatShading />
          </mesh>
        ))}
      </group>
      {/* prayer flags */}
      {items.flags.map((f, i) => (
        <group key={i} position={[f.x, 0, f.z]} rotation={[0, f.yaw, 0]}>
          <mesh position={[0, 3.6, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 7.2, 6]} />
            <meshStandardMaterial color="#5a4a3a" />
          </mesh>
          <group position={[0, 6.9, 0]} ref={(el) => (flagRefs.current[i] = el)}>
            <mesh position={[0, -2.6, f.side * -0.55]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[1.05, 5.2]} />
              <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.9} />
            </mesh>
          </group>
        </group>
      ))}
    </>
  );
}
