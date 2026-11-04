"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { buildWorld, roadPose, ds, ROAD_HALF } from "./world";
import Bike from "./Bike";
import EnchantedWorld from "./EnchantedWorld";
import { Atmosphere, Clouds, Rocks, Ponds, Bridge } from "./scenery";

/* ---------------- canvas textures ---------------- */
function canvasTex(w, h, draw) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const FONT = "Georgia, Times New Roman, serif";

function bannerTex(p, i) {
  return canvasTex(1024, 300, (g, w, h) => {
    g.fillStyle = "#ba9c61";
    g.beginPath();
    g.roundRect(0, 0, w, h, 40);
    g.fill();
    g.fillStyle = "#17362f";
    g.beginPath();
    g.roundRect(10, 10, w - 20, h - 20, 32);
    g.fill();
    g.fillStyle = "rgba(0,0,0,0.18)";
    g.fillRect(10, h - 92, w - 20, 82);
    g.fillStyle = "#d8c18c";
    g.font = `500 25px ${FONT}`;
    g.fillText(`PROJECT ${String(i + 1).padStart(2, "0")}  ·  COLLECT THE LETTER · DISCOVER THE STORY`, 48, 66);
    g.fillStyle = "#f0e5c8";
    g.font = `500 105px ${FONT}`;
    g.fillText(p.name, 44, 170, w - 90);
    g.font = `600 36px ${FONT}`;
    g.fillText(p.tagline, 48, h - 38, w - 96);
  });
}
function crateTex(p) {
  return canvasTex(512, 320, (g, w, h) => {
    g.fillStyle = "#e5d4a9"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#aa8c53"; g.lineWidth = 4;
    g.strokeRect(12, 12, w - 24, h - 24);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w / 2, h * .58); g.lineTo(w, 0); g.stroke();
    g.fillStyle = "#78333a"; g.beginPath(); g.arc(w / 2, h * .58, 30, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ecd69e"; g.font = "28px Georgia"; g.textAlign = "center"; g.fillText("S", w / 2, h * .58 + 10);
    g.fillStyle = "#4c402b"; g.font = "600 26px Georgia"; g.fillText(p.name, w / 2, h - 28);
  });
}
function labelTex(text) {
  return canvasTex(320, 80, (g, w, h) => {
    g.fillStyle = "rgba(15,17,21,0.85)";
    g.beginPath();
    g.roundRect(4, 4, w - 8, h - 8, 36);
    g.fill();
    g.fillStyle = "#ffd75e";
    g.textAlign = "center";
    g.font = `700 36px ${FONT}`;
    g.fillText(text, w / 2, 54, w - 30);
  });
}

/* ---------------- static scenery ---------------- */
function Trees({ trees }) {
  const ref = useRef();
  useEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3();
    trees.forEach((t, i) => {
      s.setScalar(t.s);
      v.set(t.x, t.y + 2.2 * t.s, t.z);
      m.compose(v, q, s);
      ref.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [trees]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, trees.length]}>
      <coneGeometry args={[1.5, 5, 6]} />
      <meshStandardMaterial color="#2f5b3b" flatShading roughness={1} />
    </instancedMesh>
  );
}

function Peaks({ peaks }) {
  return peaks.map((p, i) => (
    <group key={i} position={[p.x, 0, p.z]} rotation={[0, p.rot, 0]}>
      <mesh position={[0, p.h / 2, 0]}>
        <coneGeometry args={[p.rad, p.h, 6]} />
        <meshStandardMaterial color="#6f6a66" flatShading roughness={1} />
      </mesh>
      <mesh position={[0, p.h * 0.775, 0]}>
        <coneGeometry args={[p.rad * 0.45, p.h * 0.45 + 0.5, 6]} />
        <meshStandardMaterial color="#f5f7fa" flatShading roughness={1} />
      </mesh>
    </group>
  ));
}

function Stars() {
  const geo = useMemo(() => {
    const n = 1000, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI * 0.45;
      arr.set([Math.cos(th) * Math.sin(ph) * 900, Math.cos(ph) * 900, Math.sin(th) * Math.sin(ph) * 900], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={1.6} sizeAttenuation={false} fog={false} />
    </points>
  );
}

function Arch({ world, cp, project, index }) {
  const ref = useRef();
  const tex = useMemo(() => bannerTex(project, index), [project, index]);
  useEffect(() => {
    const pos = new THREE.Vector3(), tan = new THREE.Vector3();
    roadPose(world, cp.s + 5, 0, pos, tan);
    ref.current.position.copy(pos);
    ref.current.lookAt(pos.x - tan.x, 0, pos.z - tan.z);
  }, [world, cp]);
  const px = ROAD_HALF + 1.1;
  return (
    <group ref={ref}>
      {[-px, px].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[.55, .75, 8, 12]} />
            <meshStandardMaterial color="#52615b" roughness={.85} />
          </mesh>
          <mesh position={[0, 8.9, 0]}><coneGeometry args={[.95, 2, 12]} /><meshStandardMaterial color="#1b3734" metalness={.3} roughness={.5} /></mesh>
          <mesh position={[0, 4, .56]}>
            <boxGeometry args={[0.12, 7.6, 0.02]} />
            <meshStandardMaterial color="#d7b978" emissive="#d7b978" emissiveIntensity={0.6} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 7.2, -0.08]}>
        <boxGeometry args={[px * 2 + 0.6, 3.7, 0.2]} />
        <meshStandardMaterial color="#111317" />
      </mesh>
      <mesh position={[0, 7.2, 0.04]}>
        <planeGeometry args={[px * 2 + 0.3, (px * 2 + 0.3) * (300 / 1024)]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------------- dynamic things ---------------- */
const MAX_BOLTS = 24;
const MAX_PARTS = 360;

function Ramp({ world, r }) {
  const ref = useRef();
  const geo = useMemo(() => {
    // wedge: sloped top facing the rider, vertical lip at the far end
    const s = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(r.len, r.h), new THREE.Vector2(r.len, 0)]);
    const g = new THREE.ExtrudeGeometry(s, { depth: r.half * 2, bevelEnabled: false });
    g.translate(0, 0, -r.half);
    g.rotateY(-Math.PI / 2);
    return g;
  }, [r]);
  useEffect(() => {
    const p = new THREE.Vector3(), t = new THREE.Vector3();
    roadPose(world, r.s, 0, p, t);
    ref.current.position.copy(p);
    ref.current.lookAt(p.x + t.x, 0, p.z + t.z);
  }, [world, r]);
  return (
    <group ref={ref}>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#f2b134" flatShading roughness={0.7} />
      </mesh>
      {[-1, 1].map((sg) => (
        <mesh key={sg} position={[sg * (r.half + 0.05), r.h / 2, r.len * 0.5]} rotation={[-Math.atan2(r.h, r.len), 0, 0]}>
          <boxGeometry args={[0.1, 0.12, Math.hypot(r.h, r.len)]} />
          <meshStandardMaterial color="#16171a" />
        </mesh>
      ))}
    </group>
  );
}

function Game({ world, projects, skillNames, controls, events, playing, night, camMode, outfit }) {
  const { camera, size } = useThree();
  const bike = useRef(), lean = useRef(), pitch = useRef(), wheels = useRef([]);
  const crates = useRef([]), coins = useRef([]), bolts = useRef([]), parts = useRef();
  const crateTexs = useMemo(() => projects.map(crateTex), [projects]);
  const coinLabels = useMemo(() => world.coins.map((c) => labelTex(c.name)), [world]);

  const g = useRef({
    s: world.startS, lat: 1.2, latVel: 0, v: 0, pitch: 0, lean: 0, yaw: 0,
    nitro: 1, boosting: false, fireCd: 0, wheelie: 0, score: 0, time: 0, y: 0, vy: 0, air: 0, prevRamp: false,
    bolts: Array.from({ length: MAX_BOLTS }, () => ({ alive: false, s: 0, lat: 0, life: 0 })),
    unlocked: new Set(), collected: new Set(), done: false,
  });
  const P = useMemo(() => ({
    pos: new Float32Array(MAX_PARTS * 3), vel: new Float32Array(MAX_PARTS * 3), life: new Float32Array(MAX_PARTS), next: 0,
  }), []);
  const v3 = useMemo(() => ({ a: new THREE.Vector3(), t: new THREE.Vector3(), b: new THREE.Vector3(), t2: new THREE.Vector3(), cam: new THREE.Vector3(), m: new THREE.Matrix4(), q: new THREE.Quaternion(), sc: new THREE.Vector3(), c: new THREE.Color(), e: new THREE.Euler() }), []);

  // Particles need per-instance colours
  useEffect(() => {
    const im = parts.current;
    for (let i = 0; i < MAX_PARTS; i++) {
      im.setColorAt(i, v3.c.set("#ffffff"));
      v3.m.makeScale(0, 0, 0);
      im.setMatrixAt(i, v3.m);
    }
    im.instanceColor.needsUpdate = true;
  }, [v3]);

  const burst = (x, y, z, color, n = 40, power = 9) => {
    const im = parts.current;
    v3.c.set(color);
    for (let k = 0; k < n; k++) {
      const i = P.next;
      P.next = (P.next + 1) % MAX_PARTS;
      P.pos.set([x, y, z], i * 3);
      const th = Math.random() * Math.PI * 2, up = Math.random();
      P.vel.set([Math.cos(th) * power * (0.3 + Math.random()), (0.4 + up) * power, Math.sin(th) * power * (0.3 + Math.random())], i * 3);
      P.life[i] = 1;
      im.setColorAt(i, v3.c);
    }
    im.instanceColor.needsUpdate = true;
  };

  // Frame the attract-mode ride away from the headline
  useEffect(() => {
    const { width: w, height: h } = size;
    if (!playing && w >= 1024) camera.setViewOffset(w, h, -w * 0.2, 0, w, h);
    else if (!playing && h > w) camera.setViewOffset(w, h, 0, -h * 0.24, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }, [size, camera, playing]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const st = g.current;
    const c = controls.current;
    if (c.paused) return; // reading a project card: freeze the ride
    st.time += dt;
    const MAX = 36, BOOST = 47;
    const offroad = !c.flight && Math.abs(st.lat) > ROAD_HALF + 0.3;

    /* ---- input / autopilot ---- */
    let throttle = false, brake = false, steer = 0;
    if (playing) {
      throttle = c.up;
      brake = c.down;
      steer = (c.left ? 1 : 0) - (c.right ? 1 : 0);
    } else {
      steer = THREE.MathUtils.clamp((Math.sin(st.time * 0.22) * 1.6 - st.lat) * 0.6, -1, 1);
    }
    st.boosting = playing && c.boost && throttle && st.nitro > 0.02;
    st.nitro = THREE.MathUtils.clamp(st.nitro + (st.boosting ? -0.35 : 0.08) * dt, 0, 1);

    const top = offroad ? 15 : st.boosting ? BOOST : MAX;
    if (!playing) {
      st.v += (7 - st.v) * Math.min(1, dt * 1.5);
    } else if (brake) {
      st.v -= 32 * dt;
    } else if (throttle && st.v < top) {
      st.v = Math.min(top, st.v + (st.boosting ? 26 : 13) * dt);
    } else if (!throttle) {
      st.v -= 5 * dt;
    }
    // over the limit (e.g. rolled onto grass at speed): bleed speed off quickly
    if (st.v > top) st.v = Math.max(top, st.v - (offroad ? 40 : 20) * dt);
    st.v = THREE.MathUtils.clamp(st.v, 0, BOOST);
    if (!Number.isFinite(st.v) || !Number.isFinite(st.s) || !Number.isFinite(st.lat)) {
      st.v = 0;
      st.s = world.startS;
      st.lat = 0;
      st.latVel = 0;
    }

    const steerRate = 3 + st.v * 0.16;
    st.latVel += (steer * steerRate - st.latVel) * Math.min(1, dt * 6);
    st.lat = THREE.MathUtils.clamp(st.lat + st.latVel * dt * (st.v > 0.5 ? 1 : 0), -(ROAD_HALF + 5), ROAD_HALF + 5);
    st.s = (st.s + st.v * dt) % world.L;

    // jump ramps: ride up the wedge, launch when crossing the lip, land with gravity
    let rampY = 0;
    st.rampD = st.rampD || [];
    world.ramps.forEach((r, i) => {
      const d = ds(st.s, r.s, world.L);
      const prev = st.rampD[i];
      st.rampD[i] = d;
      const onIt = Math.abs(st.lat) < r.half + 0.3;
      if (st.y <= 0 && onIt && d >= 0 && d < r.len) rampY = (d / r.len) * r.h;
      if (playing && st.y <= 0 && onIt && prev !== undefined && prev < r.len && d >= r.len && d - prev < 5 && st.v > 5) {
        st.vy = Math.max(6, st.v * 0.32);
        st.y = r.h;
        st.air = 0;
      }
    });
    if (st.y > 0 || st.vy > 0) {
      st.vy -= 22 * dt;
      st.y += st.vy * dt;
      st.air += dt;
      if (st.y <= 0) {
        st.y = 0;
        st.vy = 0;
        if (st.air > 0.3) {
          st.score += Math.round(st.air * 40);
          events.current.air?.(st.air);
        }
        st.air = 0;
      }
    }
    st.flightHeight = THREE.MathUtils.damp(st.flightHeight || 0, c.flight ? 4.5 : 0, 2.2, dt);
    const lift = Math.max(st.y, rampY) + st.flightHeight;
    if (c.flight && st.v > 2 && Math.floor(st.time * 25) % 2 === 0) {
      burst(bike.current.position.x, bike.current.position.y + .5, bike.current.position.z, "#dcc27c", 1, 1.5);
    }
    const airborne = st.y > 0 || st.flightHeight > .5;

    // wheelie (or nose-up while flying)
    const wantWheelie = playing && c.wheelie && st.v > 6 && !airborne;
    const pitchTarget = airborne ? -0.18 + Math.min(0.35, st.air * 0.25) : rampY > 0 ? -0.18 : wantWheelie ? -0.55 : 0;
    st.pitch += (pitchTarget - st.pitch) * Math.min(1, dt * (wantWheelie ? 3 : 6));
    if (st.pitch < -0.3 && !airborne) {
      st.wheelie += dt;
      st.score += dt * 8;
    }

    /* ---- bike pose ---- */
    roadPose(world, st.s, st.lat, v3.a, v3.t);
    world.curve.getTangentAt((((st.s + 12) % world.L) / world.L), v3.t2);
    const turnLeft = v3.t2.x * v3.t.z - v3.t2.z * v3.t.x;
    const sf = Math.min(1, st.v / MAX);
    const targetLean = THREE.MathUtils.clamp(-turnLeft * 6 * sf - steer * 0.45 * (0.25 + sf), -0.6, 0.6);
    st.lean += (targetLean - st.lean) * Math.min(1, dt * 5);
    st.yaw += (Math.atan2(st.latVel, Math.max(st.v, 4)) - st.yaw) * Math.min(1, dt * 8);

    const b = bike.current;
    b.position.copy(v3.a);
    b.position.y += lift;
    if (offroad && st.v > 2 && !airborne) {
      b.position.y += Math.sin(st.time * 38) * 0.035;
      st.dustT = (st.dustT || 0) - dt;
      if (st.dustT <= 0) {
        st.dustT = 0.05;
        burst(v3.a.x - v3.t.x * 1.2, 0.3, v3.a.z - v3.t.z * 1.2, "#9b8463", 2, 2 + st.v * 0.1);
      }
    }
    b.lookAt(v3.a.x + v3.t.x, b.position.y, v3.a.z + v3.t.z);
    b.rotateY(st.yaw);
    lean.current.rotation.z = st.lean;
    pitch.current.rotation.x = st.pitch;
    wheels.current.forEach((w) => w && (w.rotation.x += (st.v * dt) / 0.55));

    /* ---- shooting ---- */
    st.fireCd -= dt;
    if (playing && c.fire && st.fireCd <= 0) {
      st.fireCd = 0.16;
      const bo = st.bolts.find((x) => !x.alive);
      if (bo) {
        bo.alive = true;
        bo.s = st.s + 1.4;
        bo.lat = st.lat;
        bo.life = 1.4;
        events.current.fire?.();
      }
    }
    st.bolts.forEach((bo, i) => {
      const mesh = bolts.current[i];
      if (!bo.alive) {
        if (mesh) mesh.visible = false;
        return;
      }
      bo.s += (st.v + 90) * dt;
      bo.life -= dt;
      if (bo.life <= 0) bo.alive = false;
      roadPose(world, bo.s, bo.lat, v3.b, v3.t2);
      mesh.visible = bo.alive;
      mesh.position.set(v3.b.x, 1.45, v3.b.z);
      mesh.lookAt(v3.b.x + v3.t2.x, 1.45, v3.b.z + v3.t2.z);
    });

    /* ---- project crates ---- */
    world.checkpoints.forEach((cp, i) => {
      const mesh = crates.current[i];
      if (!mesh) return;
      const open = st.unlocked.has(i);
      mesh.visible = !open;
      if (open) return;
      roadPose(world, cp.s, cp.lat, v3.b, v3.t2);
      mesh.position.set(v3.b.x, 2.1 + Math.sin(st.time * 2 + i) * 0.25, v3.b.z);
      mesh.rotation.y += dt * .4;
      mesh.rotation.x = Math.sin(st.time + i) * 0.2;
      if (!playing) return;
      let hit = Math.abs(ds(st.s, cp.s, world.L)) < 2.4 && Math.abs(st.lat - cp.lat) < 2.2;
      for (const bo of st.bolts) {
        if (bo.alive && Math.abs(ds(bo.s, cp.s, world.L)) < 1.6 && Math.abs(bo.lat - cp.lat) < 1.4) {
          bo.alive = false;
          hit = true;
        }
      }
      if (hit) {
        st.unlocked.add(i);
        st.score += 100;
        burst(mesh.position.x, mesh.position.y, mesh.position.z, projects[i].accent, 70, 11);
        burst(mesh.position.x, mesh.position.y, mesh.position.z, "#ffffff", 20, 7);
        events.current.unlock?.(i);
        if (st.unlocked.size === projects.length && !st.done) {
          st.done = true;
          setTimeout(() => events.current.done?.(), 1600);
        }
      }
    });

    /* ---- skill coins ---- */
    world.coins.forEach((cn, k) => {
      const grp = coins.current[k];
      if (!grp) return;
      const got = st.collected.has(k);
      grp.visible = !got;
      if (got) return;
      grp.children[0].rotation.y += dt * 3;
      if (playing && Math.abs(ds(st.s, cn.s, world.L)) < 1.2 && Math.abs(st.lat - cn.lat) < 1.3) {
        st.collected.add(k);
        st.score += 10;
        burst(grp.position.x, 1.4, grp.position.z, "#ffd75e", 18, 6);
        events.current.collect?.(cn.name);
      }
    });

    /* ---- particles ---- */
    const im = parts.current;
    for (let i = 0; i < MAX_PARTS; i++) {
      if (P.life[i] <= 0) continue;
      P.life[i] -= dt * 0.9;
      P.vel[i * 3 + 1] -= 22 * dt;
      for (let a = 0; a < 3; a++) P.pos[i * 3 + a] += P.vel[i * 3 + a] * dt;
      if (P.pos[i * 3 + 1] < 0.1) {
        P.pos[i * 3 + 1] = 0.1;
        P.vel[i * 3 + 1] *= -0.35;
      }
      const s = Math.max(0, P.life[i]);
      v3.sc.setScalar(s);
      v3.b.set(P.pos[i * 3], P.pos[i * 3 + 1], P.pos[i * 3 + 2]);
      v3.e.set(P.life[i] * 6, P.life[i] * 4, 0);
      v3.q.setFromEuler(v3.e);
      v3.m.compose(v3.b, v3.q, v3.sc);
      im.setMatrixAt(i, v3.m);
    }
    im.instanceMatrix.needsUpdate = true;

    /* ---- camera ---- */
    if (!st.cameraReady) {
      camera.position.set(b.position.x - v3.t.x * 7, b.position.y + 4, b.position.z - v3.t.z * 7);
      st.cameraReady = true;
    }
    const fwdX = v3.t.x * Math.cos(st.yaw * 0.6) + v3.t.z * Math.sin(st.yaw * 0.6);
    const fwdZ = v3.t.z * Math.cos(st.yaw * 0.6) - v3.t.x * Math.sin(st.yaw * 0.6);
    const portrait = size.width < size.height;
    const sideX = -fwdZ, sideZ = fwdX; // rider's left
    if (!playing) {
      // showroom turntable: slow orbit around the bike
      const a = st.time * 0.22;
      const r = portrait ? 10.5 : 8.6;
      const ox = Math.cos(a) * sideX + Math.sin(a) * fwdX, oz = Math.cos(a) * sideZ + Math.sin(a) * fwdZ;
      v3.cam.set(b.position.x + ox * r, 2.5, b.position.z + oz * r);
      camera.position.lerp(v3.cam, 1 - Math.exp(-dt * 3));
      camera.lookAt(b.position.x, 1.25, b.position.z);
    } else if (camMode === "side") {
      // cinematic low side tracking shot
      v3.cam.set(b.position.x + sideX * 6.5 - fwdX * 2, 1.4 + lift * 0.5, b.position.z + sideZ * 6.5 - fwdZ * 2);
      camera.position.lerp(v3.cam, 1 - Math.exp(-dt * 6));
      camera.lookAt(b.position.x + fwdX * 1.5, 1.2 + lift, b.position.z + fwdZ * 1.5);
    } else {
      const back = (portrait ? 8.5 : 6.2) + st.v * 0.045;
      const up = (portrait ? 3.8 : 2.8) + lift * 0.6;
      v3.cam.set(b.position.x - fwdX * back, up, b.position.z - fwdZ * back);
      camera.position.lerp(v3.cam, 1 - Math.exp(-dt * 5));
      if (offroad && st.v > 2) camera.position.y += (Math.random() - 0.5) * 0.06;
      camera.lookAt(b.position.x + fwdX * 4, 1.7 + lift * 0.7, b.position.z + fwdZ * 4);
    }
    const fov = 55 + (playing ? (st.v / BOOST) * 14 + (st.boosting ? 6 : 0) : 0);
    if (Math.abs(camera.fov - fov) > 0.05) {
      camera.fov += (fov - camera.fov) * Math.min(1, dt * 4);
      camera.updateProjectionMatrix();
    }

    const nextIndex = world.checkpoints.findIndex((_, i) => !st.unlocked.has(i));
    st.nextName = nextIndex < 0 ? "All stories discovered" : projects[nextIndex].name;
    st.nextDistance = nextIndex < 0 ? 0 : Math.round((world.checkpoints[nextIndex].s - st.s + world.L) % world.L);
    events.current.tick?.(st);
  });

  return (
    <>
      <Bike ref={bike} leanRef={lean} pitchRef={pitch} wheelRefs={wheels} night={night} outfit={outfit} playing={playing} />
      {world.ramps.map((r, i) => (
        <Ramp key={i} world={world} r={r} />
      ))}

      {world.checkpoints.map((cp, i) => (
        <Arch key={i} world={world} cp={cp} project={projects[i]} index={i} />
      ))}

      {projects.map((p, i) => (
        <group key={p.slug} ref={(el) => (crates.current[i] = el)}>
          <mesh>
            <boxGeometry args={[2.2, 1.4, .14]} />
            <meshStandardMaterial map={crateTexs[i]} emissive="#d5b779" emissiveIntensity={.15} roughness={.8} />
          </mesh>
          <mesh scale={1.18}>
            <boxGeometry args={[2.2, 1.4, .14]} />
            <meshBasicMaterial color={p.accent} wireframe transparent opacity={0.5} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {world.coins.map((cn, k) => (
        <CoinGroup key={k} world={world} coin={cn} label={coinLabels[k]} refFn={(el) => (coins.current[k] = el)} />
      ))}

      {Array.from({ length: MAX_BOLTS }, (_, i) => (
        <group key={i} ref={(el) => (bolts.current[i] = el)} visible={false}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.1, 1.4, 4, 8]} />
            <meshBasicMaterial color="#ffb347" toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[2.4, 1.1, 2.4]}>
            <capsuleGeometry args={[0.1, 1.4, 4, 8]} />
            <meshBasicMaterial color="#ff6a00" transparent opacity={0.35} toneMapped={false} />
          </mesh>
        </group>
      ))}

      <instancedMesh ref={parts} args={[undefined, undefined, MAX_PARTS]} frustumCulled={false}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshStandardMaterial toneMapped={false} />
      </instancedMesh>
    </>
  );
}

function CoinGroup({ world, coin, label, refFn }) {
  const ref = useRef();
  useEffect(() => {
    const p = new THREE.Vector3(), t = new THREE.Vector3();
    roadPose(world, coin.s, coin.lat, p, t);
    ref.current.position.set(p.x, 0, p.z);
    refFn(ref.current);
  }, [world, coin, refFn]);
  return (
    <group ref={ref}>
      <group position={[0, 1.3, 0]}>
        <mesh>
          <torusGeometry args={[0.5, 0.13, 8, 20]} />
          <meshStandardMaterial color="#ffcc33" emissive="#ffb300" emissiveIntensity={0.5} metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
      <sprite position={[0, 2.45, 0]} scale={[2.6, 0.65, 1]}>
        <spriteMaterial map={label} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}

export default function RideScene({ projects, skillNames, controls, events, playing, night, active, camMode = "chase", outfit = "mountain" }) {
  const world = useMemo(() => buildWorld({ projectCount: projects.length, skillNames }), [projects.length, skillNames]);

  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.6]} camera={{ fov: 55, near: 0.3, far: 3200, position: [0, 6, 0] }} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <Atmosphere night={night} />
      <EnchantedWorld world={world} />
      <directionalLight position={[-30, 35, -20]} color="#ffdc9e" intensity={1.7} />
      <Clouds clouds={world.clouds} />

      <mesh geometry={world.terrain}>
        <meshStandardMaterial vertexColors flatShading roughness={1} />
      </mesh>
      <mesh geometry={world.road}>
        <meshStandardMaterial color="#263b3e" roughness={0.4} metalness={.25} side={THREE.DoubleSide} />
      </mesh>
      {[world.kerbL, world.kerbR].map((k, i) => (
        <mesh key={i} geometry={k}>
          <meshStandardMaterial color="#b39b68" side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh geometry={world.dashes}>
        <meshStandardMaterial color="#f4f1e6" side={THREE.DoubleSide} />
      </mesh>
      <Trees trees={world.trees} />
      <Rocks rocks={world.rocks} />
      <Ponds ponds={world.ponds} />
      <Bridge world={world} />
      <Peaks peaks={world.peaks} />

      <Game world={world} projects={projects} skillNames={skillNames} controls={controls} events={events} playing={playing} night={night} camMode={camMode} outfit={outfit} />
    </Canvas>
  );
}
