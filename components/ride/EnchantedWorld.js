"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { roadPose } from "./world";

function Tower({ x, z, h, radius = 4 }) {
  return <group position={[x, 0, z]}>
    <mesh position={[0, h / 2, 0]}><cylinderGeometry args={[radius, radius * 1.12, h, 16]} /><meshStandardMaterial color="#38454b" roughness={.86} /></mesh>
    <mesh position={[0, h + radius * 1.1, 0]}><coneGeometry args={[radius * 1.35, radius * 3, 16]} /><meshStandardMaterial color="#142c32" metalness={.35} roughness={.4} /></mesh>
    {[.35, .6, .85].map((y, i) => <group key={i} position={[0, h * y, 0]}>{[0, 1, 2, 3].map(n => <group key={n} rotation={[0, n * Math.PI / 2, 0]}><mesh position={[0, 0, radius + .04]}><capsuleGeometry args={[.4, 1.2, 4, 8]} /><meshBasicMaterial color="#f0cd86" /></mesh></group>)}</group>)}
    <mesh position={[0, h - .4, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius * 1.06, .22, 6, 24]} /><meshStandardMaterial color="#84908b" /></mesh>
  </group>;
}
export default function EnchantedWorld({ world }) {
  const lights = useRef([]);
  const locations = useMemo(() => Array.from({ length: 32 }, (_, i) => {
    const p = new THREE.Vector3(), t = new THREE.Vector3();
    roadPose(world, i * world.L / 32, (i % 2 ? 1 : -1) * 6, p, t);
    return [p.x, 0, p.z];
  }), [world]);
  useFrame(({ clock }) => lights.current.forEach((m, i) => { if (m) { m.position.y = 4.8 + Math.sin(clock.elapsedTime * 1.5 + i) * .25; m.rotation.y = clock.elapsedTime * .2; } }));
  return <group>
    <mesh position={[-250, 220, -430]}><sphereGeometry args={[27, 48, 32]} /><meshBasicMaterial color="#f4e8bd" fog={false} /></mesh>
    <mesh position={[-250, 220, -431]}><sphereGeometry args={[33, 32, 24]} /><meshBasicMaterial color="#d0dcbc" transparent opacity={.09} fog={false} depthWrite={false} /></mesh>
    <group position={[-35, 0, -35]}>
      {[[-28, 0, 34, 5], [-13, -9, 48, 5], [4, 0, 38, 6], [20, -12, 60, 5], [35, 5, 30, 4], [0, -24, 72, 7]].map(([x, z, h, radius], i) => <Tower key={i} x={x} z={z} h={h} radius={radius} />)}
      <mesh position={[0, 10, -6]}><boxGeometry args={[65, 20, 18]} /><meshStandardMaterial color="#34444a" /></mesh>
      <mesh position={[0, 24, -6]} rotation={[Math.PI / 4, 0, 0]}><boxGeometry args={[64, 18, 18]} /><meshStandardMaterial color="#172c33" /></mesh>
    </group>
    {locations.map((p, i) => <group position={p} key={i}>
      <mesh position={[0, 1.8, 0]}><cylinderGeometry args={[.06, .13, 3.6, 8]} /><meshStandardMaterial color="#8d7750" metalness={.65} roughness={.4} /></mesh>
      <group ref={e => lights.current[i] = e} position={[0, 4.8, 0]}>
        <mesh><boxGeometry args={[.5, .8, .5]} /><meshBasicMaterial color="#efc77c" /></mesh>
        <mesh><boxGeometry args={[.65, .95, .65]} /><meshBasicMaterial color="#e7b95f" wireframe /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.75, .025, 5, 32]} /><meshBasicMaterial color="#c9b57f" transparent opacity={.6} /></mesh>
      </group>
    </group>)}
  </group>;
}

export function WizardCape() {
  const mesh = useRef();
  const geometry = useMemo(() => new THREE.PlaneGeometry(.43, .85, 10, 16), []);
  useFrame(({ clock }) => {
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = .425 - Math.floor(i / 11) * (.85 / 16);
      const t = (.425 - y) / .85;
      const x = (i % 11) / 10 * .43 - .215;
      p.setXYZ(i, x * (1 + t * .8), 1.42 - t * .58 + Math.sin(t * 8 - clock.elapsedTime * 5) * t * .06, -.3 - t * .62 + Math.sin(x * 12 + clock.elapsedTime * 4 + t * 6) * t * .07);
    }
    p.needsUpdate = true;
    geometry.computeVertexNormals();
  });
  return <mesh ref={mesh} geometry={geometry}><meshStandardMaterial color="#692938" side={THREE.DoubleSide} roughness={.75} metalness={.15} /></mesh>;
}
