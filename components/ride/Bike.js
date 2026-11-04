"use client";

// Sanskar's own Duke 390 (gen 3) as low-poly: navy-black body, orange trellis frame, orange "390"
// shroud graphics, black wheels, gold underbelly header, split LED headlight, plus his add-ons:
// bar-end mirrors, high front plate, phone mount, red axle sliders + caliper guard, rear luggage stays.
// Built in real metres from side-profile shapes, then scaled. Faces +z, ground at y = 0. No logos.

import { forwardRef, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const BIKE_SCALE = 1;
const RA = [-0.68, 0.32]; // rear axle [z, y]
const FA = [0.68, 0.3]; // front axle

const ORANGE = "#ff5a00";
const BODY = "#515961"; // navy-black shrouds
const BLACK = "#121317";
const DARK = "#272a30";
const RED = "#e3202c";
const GOLD = "#c48a3f";
const STEEL = "#a9afb7";

export const OUTFITS = {
  mountain: { label: "Cream hoodie", top: "#263244", trim: "#d8b877", pants: "#242b30", sleeveStripe: null },
  red: { label: "Red stripes", top: "#e02f3a", trim: "#ffffff", pants: "#1b1c20", sleeveStripe: "#ffffff" },
};

function Mat({ c, r = 0.5, m = 0.15, flat = false }) {
  return <meshPhysicalMaterial color={c} roughness={r} metalness={m} flatShading={flat} clearcoat={c === BODY ? .8 : .15} clearcoatRoughness={.22} />;
}

// Side-profile polygon [[z,y],...] extruded sideways (width along x), centred on x.
function Panel({ pts, w, x = 0, c, r, m, bevel = 0.012, rot }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y)));
    const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3 });
    g.translate(0, 0, -w / 2);
    g.rotateY(-Math.PI / 2);
    return g;
  }, [pts, w, bevel]);
  return (
    <mesh geometry={geo} position={[x, 0, 0]} rotation={rot}>
      <Mat c={c} r={r} m={m} />
    </mesh>
  );
}

// Rod / limb between two points. a,b = [x, y, z]. capsule=true gives rounded ends (limbs).
function Rod({ a, b, r = 0.016, c = ORANGE, m = 0.25, rough = 0.4, capsule = false, flat = false }) {
  const { pos, quat, len } = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const d = B.clone().sub(A);
    return { pos: A.clone().add(B).multiplyScalar(0.5), quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()), len: d.length() };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat}>
      {capsule ? <capsuleGeometry args={[r, Math.max(0.001, len - r * 2), 6, 16]} /> : <cylinderGeometry args={[r, r, len, 16]} />}
      <Mat c={c} m={m} r={rough} flat={flat} />
    </mesh>
  );
}
// frame tube helper in [z,y] + side x
const T = ({ a, b, x = 0, x2, ...rest }) => <Rod a={[x, a[1], a[0]]} b={[x2 ?? x, b[1], b[0]]} {...rest} />;

function decal390() {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 256;
  const g = cv.getContext("2d");
  g.transform(1, 0, -0.35, 1, 60, 0); // italic slant
  g.font = "900 210px system-ui, -apple-system, sans-serif";
  g.lineWidth = 16;
  g.strokeStyle = ORANGE;
  g.fillStyle = "rgba(255,90,0,0.18)";
  g.fillText("390", 30, 205);
  g.strokeText("390", 30, 205);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function plateTex() {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 64;
  const g = cv.getContext("2d");
  g.fillStyle = "#f5f5f2";
  g.fillRect(0, 0, 256, 64);
  g.strokeStyle = "#111";
  g.lineWidth = 4;
  g.strokeRect(3, 3, 250, 58);
  g.fillStyle = "#111";
  g.font = "800 40px ui-monospace, Menlo, monospace";
  g.textAlign = "center";
  g.fillText("SANSKAR", 128, 46);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function helmetTex() {
  // navy shell with red / white / yellow race graphics (equirect UVs)
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 256;
  const g = cv.getContext("2d");
  g.fillStyle = "#19342f";
  g.fillRect(0, 0, 512, 256);
  const band = (y, h, col, skew = 0) => {
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(512, y + skew);
    g.lineTo(512, y + skew + h);
    g.lineTo(0, y + h);
    g.fill();
  };
  band(118, 30, "#b69558", -30);
  band(150, 10, "#e3d5b1", -30);
  band(162, 14, "#7d303d", -30);
  band(60, 8, "#ffffff", 20);
  g.fillStyle = "#e3202c";
  for (let i = 0; i < 6; i++) g.fillRect(40 + i * 80, 30, 34, 12);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Wheel({ at, front, wheelRef }) {
  const tyreW = front ? 0.055 : 0.075;
  return (
    <group position={[0, at[1], at[0]]} ref={wheelRef}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.245, tyreW, 16, 64]} />
        <Mat c="#0e0f11" r={0.95} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.212, 0.014, 10, 64]} />
        <Mat c="#24282d" m={0.7} r={0.4} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation={[(i * Math.PI * 2) / 5, 0, 0]}>
          {[-1, 1].map((sg) => (
            <mesh key={sg} position={[0, 0.115, sg * 0.018]} rotation={[sg * 0.16, 0, 0]}>
              <boxGeometry args={[0.022, 0.2, 0.016]} />
              <Mat c="#24282d" m={0.7} r={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, front ? 0.13 : 0.17, 10]} />
        <Mat c={STEEL} m={0.8} r={0.3} />
      </mesh>
      <mesh position={[-0.055, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[front ? 0.16 : 0.115, front ? 0.16 : 0.115, 0.006, 22]} />
        <Mat c="#c4c9cf" m={0.9} r={0.2} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[-.06, Math.cos(i * Math.PI / 6) * .13, Math.sin(i * Math.PI / 6) * .13]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[.009, 8]} /><meshStandardMaterial color="#272b2c" side={THREE.DoubleSide} /></mesh>)}
      <mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[.217, .004, 6, 64]} /><meshStandardMaterial color="#ff650e" emissive="#ff650e" emissiveIntensity={.1} metalness={.7} roughness={.2} /></mesh>
      {/* red axle sliders (his add-on) */}
      {front &&
        [-1, 1].map((sg) => (
          <mesh key={sg} position={[sg * 0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.05, 10]} />
            <Mat c={RED} m={0.5} r={0.3} />
          </mesh>
        ))}
    </group>
  );
}

function RearSpring() {
  const geo = useMemo(() => {
    const pts = Array.from({length:161},(_,i)=> { const t=i/160; return new THREE.Vector3(.12+Math.cos(t*Math.PI*16)*.037,.44+t*.25,-.35+t*.15+Math.sin(t*Math.PI*16)*.037); });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),160,.008,6,false);
  }, []);
  return <mesh geometry={geo}><Mat c="#e7e5dc" m={.5} r={.35}/></mesh>;
}
function HeadlightTrace({side}) {
  const geo=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(side*.095,1.01,.60),new THREE.Vector3(side*.135,.91,.69),new THREE.Vector3(side*.10,.78,.715),new THREE.Vector3(side*.035,.72,.69)]),24,.008,8,false),[side]);
  return <mesh geometry={geo}><meshStandardMaterial color="#eff6ff" emissive="#e2edff" emissiveIntensity={2.5}/></mesh>;
}
const Bike = forwardRef(function Bike({ wheelRefs, pitchRef, leanRef, night, outfit = "mountain", playing = false, withRider = true }, ref) {
  const d390 = useMemo(decal390, []);
  const plate = useMemo(plateTex, []);
  return (
    <group ref={ref}>
      <group ref={leanRef}>
        <group position={[0, 0, RA[0] * BIKE_SCALE]} ref={pitchRef}>
          <group position={[0, 0, -RA[0] * BIKE_SCALE]} scale={BIKE_SCALE}>
            <Wheel at={FA} front wheelRef={(el) => (wheelRefs.current[0] = el)} />
            <Wheel at={RA} wheelRef={(el) => (wheelRefs.current[1] = el)} />

            {/* USD fork (black), clamps, front mudguard, red caliper guard */}
            {[-0.085, 0.085].map((x) => (
              <group key={x}>
                <T a={FA} b={[0.585, 0.53]} x={x} r={0.021} c="#2a2c31" m={0.6} />
                <T a={[0.585, 0.53]} b={[0.48, 0.92]} x={x} r={0.03} c="#191d23" m={0.75} />
              </group>
            ))}
            <Panel pts={[[0.5, 0.86], [0.46, 0.94], [0.42, 0.94], [0.45, 0.86]]} w={0.24} c={DARK} m={0.5} />
            <Panel pts={[[0.5, 0.6], [0.8, 0.57], [0.84, 0.5], [0.58, 0.55]]} w={0.12} c={BLACK} />
            <Panel pts={[[0.62, 0.42], [0.72, 0.42], [0.74, 0.3], [0.63, 0.32]]} w={0.02} x={0.11} c={RED} bevel={0.004} />

            {/* Split-LED headlight in a tinted housing */}
            <Panel pts={[[0.53, 0.99], [0.62, 0.97], [0.67, 0.84], [0.63, 0.73], [0.54, 0.74]]} w={0.18} c={BLACK} r={0.3} />
            <mesh position={[0, 0.85, 0.66]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.13, 0.17, 0.02]} />
              <meshStandardMaterial color="#2b3440" metalness={0.8} roughness={0.1} />
            </mesh>
            {[-1, 1].map((sg) => (
              <mesh key={sg} position={[sg * 0.065, 0.86, 0.66]} rotation={[0.3, sg * 0.25, sg * 0.2]}>
                <boxGeometry args={[0.02, 0.2, 0.02]} />
                <meshStandardMaterial color="#fff" emissive="#e8f4ff" emissiveIntensity={night ? 5 : 1.8} toneMapped={false} />
              </mesh>
            ))}
            <mesh position={[0, 0.82, 0.672]} rotation={[Math.PI / 2 - 0.3, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
              <meshStandardMaterial color="#fff" emissive="#fff3d6" emissiveIntensity={night ? 6 : 1.2} toneMapped={false} />
            </mesh>
            <Panel pts={[[0.6, 0.98], [0.53, 1.06], [0.5, 1.05], [0.55, 0.98]]} w={0.16} c="#222831" bevel={0.004} />
            {/* indicators */}
            {[-1, 1].map((sg) => (
              <group key={sg}>
                <T a={[0.5, 0.86]} b={[0.53, 0.86]} x={sg * 0.1} x2={sg * 0.2} r={0.008} c={BLACK} />
                <mesh position={[sg * 0.21, 0.86, 0.53]}>
                  <boxGeometry args={[0.04, 0.02, 0.05]} />
                  <meshStandardMaterial color="#ffb020" emissive="#ff9a00" emissiveIntensity={0.5} />
                </mesh>
              </group>
            ))}

            {/* Wide bar, bar-end mirrors */}
            <T a={[0.4, 1.02]} b={[0.4, 1.02]} x={-0.4} x2={0.4} r={0.012} c={BLACK} />
            {[-1, 1].map((sg) => (
              <group key={sg}>
                <T a={[0.46, 0.94]} b={[0.42, 1.02]} x={sg * 0.06} r={0.014} c={BLACK} />
                <T a={[0.4, 1.02]} b={[0.4, 1.02]} x={sg * 0.31} x2={sg * 0.42} r={0.02} c="#0b0b0c" m={0} />
                <T a={[0.4, 1.02]} b={[0.42, 1.12]} x={sg * 0.43} x2={sg * 0.5} r={0.008} c={BLACK} />
                <mesh position={[sg * 0.53, 1.14, 0.42]} rotation={[0, sg * 0.2, sg * -0.25]}>
                  <boxGeometry args={[0.13, 0.075, 0.02]} />
                  <Mat c={BLACK} m={0.5} r={0.3} />
                </mesh>
              </group>
            ))}

            {/* Orange trellis frame */}
            {[-0.13, 0.13].map((x) => (
              <group key={x}>
                <T a={[0.47, 0.86]} b={[0.06, 0.66]} x={x * 0.6} x2={x} c={ORANGE} />
                <T a={[0.47, 0.8]} b={[0.17, 0.52]} x={x * 0.6} x2={x} c={ORANGE} />
                <T a={[0.17, 0.52]} b={[0.06, 0.66]} x={x} c={ORANGE} />
                <T a={[0.06, 0.66]} b={[-0.14, 0.5]} x={x} c={ORANGE} />
                <T a={[0.06, 0.66]} b={[-0.2, 0.74]} x={x} c={ORANGE} />
                <T a={[-0.14, 0.5]} b={[-0.2, 0.74]} x={x} c={ORANGE} />
                <T a={[-0.2, 0.74]} b={[-0.6, 0.86]} x={x * 0.85} x2={x * 0.6} r={0.013} c={BLACK} />
                <T a={[-0.14, 0.5]} b={[-0.55, 0.8]} x={x * 0.85} x2={x * 0.6} r={0.013} c={BLACK} />
              </group>
            ))}

            {/* Swingarm (dark), offset shock, chain */}
            {[-0.11, 0.11].map((x) => (
              <Panel key={x} pts={[[-0.1, 0.53], [-0.4, 0.45], [-0.69, 0.335], [-0.7, 0.27], [-0.4, 0.36], [-0.12, 0.42]]} w={0.035} x={x} c="#2f3238" m={0.6} r={0.35} />
            ))}
            <T a={[-0.36, 0.42]} b={[-0.18, 0.72]} x={0.09} r={0.03} c={ORANGE} />
            <T a={[-0.36, 0.42]} b={[-0.18, 0.72]} x={0.09} r={0.013} c={STEEL} m={0.8} />
            <T a={[0.05, 0.36]} b={[-0.68, 0.35]} x={0.13} r={0.012} c="#3a3a3a" m={0.6} />

            {/* Engine, radiator, bash plate */}
            <Panel pts={[[0.3, 0.62], [0.37, 0.42], [0.3, 0.19], [-0.04, 0.17], [-0.17, 0.3], [-0.12, 0.54], [0.06, 0.66]]} w={0.26} c={DARK} m={0.55} r={0.4} />
            <Panel pts={[[0.27, 0.66], [0.33, 0.6], [0.18, 0.55], [0.12, 0.66]]} w={0.2} c="#45494f" m={0.6} />
            <mesh position={[-0.135, 0.33, 0.08]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.02, 14]} />
              <Mat c="#34373d" m={0.6} />
            </mesh>
            <Panel pts={[[0.44, 0.78], [0.47, 0.5], [0.42, 0.49], [0.39, 0.77]]} w={0.3} c="#101113" />
            <Panel pts={[[0.32, 0.2], [0.33, 0.14], [-0.06, 0.13], [-0.08, 0.18]]} w={0.24} c={BLACK} />

            {/* Gold underbelly header + short side silencer */}
            <T a={[0.35, 0.42]} b={[0.3, 0.13]} x={-0.04} x2={-0.06} r={0.022} c={GOLD} m={0.85} rough={0.3} />
            <T a={[0.3, 0.13]} b={[0.0, 0.12]} x={-0.06} x2={-0.12} r={0.024} c={GOLD} m={0.85} rough={0.3} />
            <Panel pts={[[0.02, 0.24], [0.04, 0.13], [-0.3, 0.2], [-0.32, 0.3]]} w={0.12} x={-0.19} c={BLACK} m={0.4} r={0.35} />

            {/* Tank (carbon-black) + navy shrouds with orange 390 graphics */}
            <Panel pts={[[0.43, 0.97], [0.12, 0.97], [-0.04, 0.89], [-0.04, 0.74], [0.38, 0.74]]} w={0.36} c={BODY} m={0.65} r={0.28} />
            {[-1, 1].map((sg) => (
              <group key={sg}>
                <Panel
                  pts={[[0.37, 0.96], [0.6, 0.86], [0.66, 0.76], [0.5, 0.64], [0.26, 0.55], [0.1, 0.59], [0.03, 0.74], [0.05, 0.9]]}
                  w={0.03}
                  x={sg * 0.21}
                  c={BODY}
                  r={0.3}
                  m={0.25}
                  rot={[0, sg * -0.1, 0]}
                />
                <mesh position={[sg * 0.237, 0.75, 0.36]} rotation={[0, sg * (Math.PI / 2) - sg * 0.1, 0]}>
                  <planeGeometry args={[0.4, 0.2]} />
                  <meshStandardMaterial map={d390} transparent toneMapped={false} polygonOffset polygonOffsetFactor={-2} />
                </mesh>
              </group>
            ))}

            <mesh position={[0, .988, .18]}><cylinderGeometry args={[.052,.052,.012,24]} /><Mat c="#9aa0a6" r={.25} m={.9}/></mesh>
            {Array.from({length:7},(_,i)=><mesh key={i} position={[0,.44+i*.025,.23]}><boxGeometry args={[.29,.009,.15]}/><Mat c="#4f555a" m={.75}/></mesh>)}
            {Array.from({length:12},(_,i)=><mesh key={i} position={[-.14+i*.025,.66,.445]}><boxGeometry args={[.008,.21,.014]}/><Mat c="#4e555a" m={.6}/></mesh>)}
            <RearSpring />
            {[-1,1].map(sg=><group key={sg}><HeadlightTrace side={sg}/><mesh position={[sg*.15,.35,.08]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.024,.024,.014,6]}/><Mat c={STEEL} m={.9}/></mesh></group>)}
            {/* Split seat + stubby tail */}
            <Panel pts={[[-0.03, 0.88], [-0.4, 0.84], [-0.43, 0.8], [-0.04, 0.8]]} w={0.25} c="#0d0d0f" r={0.9} m={0} />
            <Panel pts={[[-0.42, 0.88], [-0.66, 0.95], [-0.68, 0.91], [-0.43, 0.84]]} w={0.18} c={BLACK} r={0.9} m={0} />
            {[-1, 1].map((sg) => (
              <group key={sg}>
                <Panel pts={[[-0.22, 0.8], [-0.7, 0.93], [-0.82, 0.96], [-0.76, 0.88], [-0.45, 0.72], [-0.24, 0.7]]} w={0.04} x={sg * 0.1} c={BODY} r={0.35} />
                <Panel pts={[[-0.3, 0.76], [-0.62, 0.86], [-0.6, 0.84], [-0.3, 0.74]]} w={0.008} x={sg * 0.123} c={ORANGE} bevel={0.002} />
              </group>
            ))}
            <mesh position={[0, 0.925, -0.8]} rotation={[0.25, 0, 0]}>
              <boxGeometry args={[0.13, 0.025, 0.02]} />
              <meshStandardMaterial color="#ff2a2a" emissive="#ff1a1a" emissiveIntensity={night ? 5 : 1.8} toneMapped={false} />
            </mesh>
            <T a={[-0.7, 0.8]} b={[-0.86, 0.6]} x={0} r={0.012} c={BLACK} />
            <mesh position={[0, 0.56, -0.87]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[0.18, 0.11, 0.008]} />
              <Mat c="#f2f2f0" />
            </mesh>
            {[-1, 1].map((sg) => (
              <mesh key={sg} position={[sg * 0.11, 0.66, -0.84]}>
                <boxGeometry args={[0.05, 0.02, 0.03]} />
                <meshStandardMaterial color="#ffb020" emissive="#ff9a00" emissiveIntensity={0.5} />
              </mesh>
            ))}

            {/* pegs */}
            {[-1, 1].map((sg) => (
              <group key={sg}>
                <T a={[-0.1, 0.36]} b={[-0.1, 0.36]} x={sg * 0.14} x2={sg * 0.22} r={0.01} c={STEEL} m={0.8} />
                <T a={[-0.4, 0.5]} b={[-0.4, 0.5]} x={sg * 0.13} x2={sg * 0.2} r={0.009} c={STEEL} m={0.8} />
              </group>
            ))}

            {withRider && <Rider outfit={OUTFITS[outfit] || OUTFITS.mountain} playing={playing} />}
          </group>
        </group>
      </group>
      {night && <pointLight position={[0, 1.5, 4]} intensity={50} distance={30} color="#eaf3ff" />}
      {night && <pointLight position={[0, 1.6, -1.8]} intensity={2.5} distance={4} color="#ff2a2a" />}
    </group>
  );
});

/* ---------- Sanskar as a chibi clay character: curly hair, dot eyes, blush, hoodie, jeans, sneakers ----------
   Helmet off (waving) in the showroom, navy race helmet with rainbow visor while riding. */
const SKIN = "#cf946c";
const HAIR = "#2b1d16";
function HelmetMesh({ tex }) {
  const R = 0.17;
  return (
    <group>
      <mesh scale={[1.08, 1.06, 1.12]} rotation={[0, -Math.PI / 2, 0]}>
        <sphereGeometry args={[R, 32, 24]} />
        <meshPhysicalMaterial map={tex} roughness={0.2} metalness={0.35} clearcoat={1} clearcoatRoughness={.1} />
      </mesh>
      <mesh scale={[1.1, 1.08, 1.15]}>
        <sphereGeometry args={[R, 28, 12, Math.PI / 2 - 0.95, 1.9, 1.2, 0.6]} />
        <meshPhysicalMaterial color="#697b73" metalness={0.85} roughness={0.08} iridescence={1} iridescenceIOR={1.6} iridescenceThicknessRange={[200, 900]} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.145, -0.145]} rotation={[-0.6, 0, 0]}>
        <boxGeometry args={[0.13, 0.025, 0.07]} />
        <meshStandardMaterial color="#1b2b72" />
      </mesh>
    </group>
  );
}
function Clay({ c, r = 0.75 }) {
  return <meshStandardMaterial color={c} roughness={r} metalness={0} />;
}
// curly hair: a cap plus a cloud of curls (deterministic)
const CURLS = Array.from({ length: 40 }, (_, i) => {
  const th = (i * 2.399963) % (Math.PI * 2); // golden angle around
  const front = Math.cos(th); // +1 = forehead side, -1 = back of head
  const ph = 0.05 + ((i * 0.618) % 1) * (front > 0 ? 0.85 : 0.55); // stays on top, never hangs at the back
  return { th, ph, r: 0.05 + ((i * 37) % 10) * 0.0028 };
}).filter((c) => !(Math.cos(c.th) < -0.3 && c.ph > 0.45));

function Rider({ outfit, playing }) {
  const helmet = useMemo(helmetTex, []);
  const waveArm = useRef(), head = useRef(), eyes = useRef([]);
  const top = outfit.top, pants = outfit.pants;
  const L = (a, b, r, c) => <Rod a={a} b={b} r={r} c={c} m={0} rough={0.75} capsule flat={false} />;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (waveArm.current) waveArm.current.rotation.z = 0.18 + Math.sin(t * 7) * 0.22;
    if (head.current) {
      head.current.rotation.z = playing ? 0 : Math.sin(t * 1.3) * 0.04;
      head.current.rotation.y = playing ? 0 : Math.sin(t * 0.7) * 0.18;
    }
    const blink = t % 3.6 < 0.12 ? 0.1 : 1;
    eyes.current.forEach((e) => e && (e.scale.y = blink));
  });

  const HY = 1.59, HZ = 0.015, HR = 0.16; // head centre + radius
  return (
    <group>
      {/* hips */}
      <mesh position={[0, 0.94, -0.24]} scale={[1.25, 0.75, 1.05]}>
        <sphereGeometry args={[0.13, 20, 14]} />
        <Clay c={pants} />
      </mesh>
      {/* torso */}
      <group position={[0, 1.2, -0.19]} rotation={[0.22, 0, 0]}>
        <mesh scale={[1.2, 1, 0.85]}>
          <capsuleGeometry args={[0.13, 0.16, 8, 20]} />
          <Clay c={top} />
        </mesh>
        {outfit.sleeveStripe && (
          <mesh position={[0, -0.02, 0.105]} scale={[1, 1, 0.3]}>
            <boxGeometry args={[0.03, 0.2, 0.02]} />
            <Clay c={outfit.sleeveStripe} />
          </mesh>
        )}
        {/* rolled hoodie neck */}
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.085, 0.045, 12, 24]} />
          <Clay c={top} />
        </mesh>
        {/* backpack with yellow straps */}
        <mesh position={[0, 0.02, -0.16]}>
          <capsuleGeometry args={[0.1, 0.12, 6, 14]} />
          <Clay c="#1d1e22" r={0.6} />
        </mesh>
        {[-1, 1].map((sg) => (
          <mesh key={sg} position={[sg * 0.09, 0.08, 0.0]}>
            <boxGeometry args={[0.035, 0.28, 0.25]} />
            <Clay c="#c9a76a" />
          </mesh>
        ))}
      </group>

      {/* arms */}
      {[-1, 1].map((sg) => {
        const waving = !playing && sg === -1; // right hand waves in the showroom
        if (waving)
          return (
            <group key={sg} position={[sg * 0.17, 1.33, -0.15]}>
              <group ref={waveArm}>
                {L([0, 0, 0], [-0.24, 0.17, 0.05], 0.05, top)}
                <mesh position={[-0.29, 0.22, 0.06]}>
                  <sphereGeometry args={[0.05, 16, 12]} />
                  <Clay c={SKIN} />
                </mesh>
              </group>
            </group>
          );
        return (
          <group key={sg}>
            {L([sg * 0.17, 1.33, -0.15], [sg * 0.29, 1.15, 0.12], 0.052, top)}
            {L([sg * 0.29, 1.15, 0.12], [sg * 0.36, 1.03, 0.39], 0.047, top)}
            <mesh position={[sg * 0.37, 1.03, 0.4]}>
              <sphereGeometry args={[0.05, 16, 12]} />
              <Clay c={playing ? "#141a22" : SKIN} />
            </mesh>
          </group>
        );
      })}

      {/* legs: chunky jeans + rounded sneakers on the pegs */}
      {[-1, 1].map((sg) => (
        <group key={sg}>
          {L([sg * 0.1, 0.95, -0.22], [sg * 0.19, 0.82, 0.12], 0.08, pants)}
          {L([sg * 0.19, 0.82, 0.12], [sg * 0.19, 0.47, -0.06], 0.072, pants)}
          <group position={[sg * 0.19, 0.415, -0.03]}>
            <mesh scale={[1, 0.75, 1.5]}>
              <sphereGeometry args={[0.075, 18, 12]} />
              <Clay c="#342b28" r={0.6} />
            </mesh>
            <mesh position={[0, -0.04, 0]} scale={[1.05, 0.35, 1.55]}>
              <sphereGeometry args={[0.075, 18, 12]} />
              <Clay c="#161b1b" />
            </mesh>
          </group>
        </group>
      ))}

      {/* helmet resting on the tank while parked */}
      {!playing && (
        <group position={[0, 1.2, 0.3]} rotation={[-0.2, 0.5, 0]} scale={0.95}>
          <HelmetMesh tex={helmet} />
        </group>
      )}
      {/* head */}
      <group ref={head} position={[0, HY, HZ]}>
        <mesh>
          <sphereGeometry args={[HR, 32, 24]} />
          <Clay c={SKIN} r={0.65} />
        </mesh>
        {/* ears */}
        {[-1, 1].map((sg) => (
          <mesh key={sg} position={[sg * HR * 0.97, -0.01, 0]} scale={[0.6, 1, 0.8]}>
            <sphereGeometry args={[0.045, 14, 10]} />
            <Clay c={SKIN} r={0.65} />
          </mesh>
        ))}
        {playing ? (
          <HelmetMesh tex={helmet} />
        ) : (
          <>
            {/* dot eyes with a shine */}
            {[-1, 1].map((sg) => (
              <group key={sg} position={[sg * 0.068, 0.02, HR * 0.94]}>
                <mesh ref={(el) => (eyes.current[sg > 0 ? 1 : 0] = el)} scale={[1, 1.15, 0.5]}>
                  <sphereGeometry args={[0.026, 16, 12]} />
                  <meshStandardMaterial color="#141016" roughness={0.3} />
                </mesh>
                <mesh position={[0.009, 0.011, 0.012]}>
                  <sphereGeometry args={[0.007, 8, 6]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            ))}
            {/* rosy cheeks */}
            {[-1, 1].map((sg) => (
              <mesh key={sg} position={[sg * 0.115, -0.045, HR * 0.84]} scale={[1, 0.7, 0.35]}>
                <sphereGeometry args={[0.035, 14, 10]} />
                <meshStandardMaterial color="#ee8b8b" roughness={0.9} transparent opacity={0.3} />
              </mesh>
            ))}
            {/* thick eyebrows */}
            {[-1, 1].map((sg) => (
              <mesh key={sg} position={[sg * 0.07, 0.075, HR * 0.93]} rotation={[0.25, 0, Math.PI / 2 + sg * 0.12]}>
                <capsuleGeometry args={[0.012, 0.045, 4, 8]} />
                <Clay c={HAIR} r={0.9} />
              </mesh>
            ))}
            {/* light stubble on the jaw */}
            <mesh position={[0, -0.005, 0]} scale={[1.012, 1.012, 1.012]}>
              <sphereGeometry args={[HR, 32, 16, Math.PI / 2 - 1.1, 2.2, 1.95, 0.85]} />
              <meshStandardMaterial color="#5a3a2a" roughness={1} transparent opacity={0.28} />
            </mesh>
            {/* mustache */}
            {[-1, 1].map((sg) => (
              <mesh key={sg} position={[sg * 0.026, -0.022, HR * 0.975]} rotation={[0, 0, Math.PI / 2 + sg * 0.25]}>
                <capsuleGeometry args={[0.01, 0.028, 4, 8]} />
                <Clay c={HAIR} r={0.9} />
              </mesh>
            ))}
            {/* little smile */}
            <mesh position={[0, -0.058, HR * 0.955]} rotation={[0.2, 0, Math.PI]}>
              <torusGeometry args={[0.028, 0.0075, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#3a1d18" />
            </mesh>
            {/* curly hair: cap + curls + a fringe falling forward */}
            <mesh position={[0, 0.02, -0.01]} scale={[1.035, 1.0, 1.035]}>
              <sphereGeometry args={[HR, 28, 18, 0, Math.PI * 2, 0, 1.5]} />
              <Clay c={HAIR} r={0.9} />
            </mesh>
            {CURLS.map((c, i) => {
              const rr = HR * 1.02;
              const x = Math.sin(c.ph) * Math.sin(c.th) * rr, y = Math.cos(c.ph) * rr + 0.02, z = Math.sin(c.ph) * Math.cos(c.th) * rr - 0.02;
              if (z > 0.08 && y < 0.1) return null; // keep the face clear
              return (
                <mesh key={i} position={[x, y, z]}>
                  <sphereGeometry args={[c.r, 12, 10]} />
                  <Clay c={HAIR} r={0.9} />
                </mesh>
              );
            })}
            {[-0.09, -0.03, 0.04, 0.1].map((x, i) => (
              <mesh key={x} position={[x, 0.13 - (i % 2) * 0.02, HR * 0.8]} rotation={[0.6, 0, x * 3]} scale={[1, 1.4, 0.8]}>
                <sphereGeometry args={[0.045, 12, 10]} />
                <Clay c={HAIR} r={0.9} />
              </mesh>
            ))}
          </>
        )}
      </group>
    </group>
  );
}

export default Bike;
