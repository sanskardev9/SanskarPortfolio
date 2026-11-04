// World generation in code: Himalayan terrain (barren scree + green pine valleys), snow peaks,
// glacial ponds, a river with a prayer-flag bridge, the road loop, rocks, trees and clouds.
// Everything on the road lives in "road space": s = distance along the road, lat = offset to the rider's left.

import * as THREE from "three";

const hash = (x, z) => {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z);
  const xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, z) {
  let f = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < 5; i++) {
    f += amp * vnoise(x * freq, z * freq);
    freq *= 2;
    amp *= 0.5;
  }
  return f;
}
const smoothstep = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

export const ROAD_HALF = 3.6;
// 0 = barren high-altitude scree (Spiti/Ladakh), 1 = green pine valley (Himachal)
export const greenAt = (x, z) => smoothstep(0.42, 0.62, vnoise(x * 0.005 + 11, z * 0.005 + 4));

export function buildWorld({ projectCount, skillNames }) {
  // Closed, winding road loop
  const pts = [];
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 175 + Math.sin(a * 3) * 42 + Math.cos(a * 2) * 22;
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.5);
  curve.arcLengthDivisions = 2000;
  const L = curve.getLength();
  const samples = curve.getSpacedPoints(420);
  const leftOf = (tan) => new THREE.Vector3(tan.z, 0, -tan.x).normalize();
  const at = (s) => {
    const t = (((s % L) + L) % L) / L;
    return { p: curve.getPointAt(t), tan: curve.getTangentAt(t) };
  };

  // Checkpoints first (the river and ramps are placed between them)
  const start = 0.04 * L, span = 0.9 * L;
  const checkpoints = Array.from({ length: projectCount }, (_, i) => ({
    s: start + 70 + (i * span) / projectCount,
    lat: [0.8, -1.2, 1.4, -0.6, 0, 1.1, -1.3][i % 7],
  }));
  const gapAfter = (i) => (i + 1 < projectCount ? checkpoints[i + 1].s : checkpoints[0].s + L) - checkpoints[i].s;

  // River crossing (bridge) between checkpoint 2 and 3
  const bi = Math.min(1, projectCount - 1);
  const bridgeS = checkpoints[bi].s + gapAfter(bi) * 0.28;
  const B = at(bridgeS);
  const riverAlong = (x, z) => Math.abs((x - B.p.x) * B.tan.x + (z - B.p.z) * B.tan.z); // distance from river centreline
  const riverAcross = (x, z) => Math.abs((x - B.p.x) * B.tan.z - (z - B.p.z) * B.tan.x); // distance along the river

  // Glacial ponds beside the road
  const ponds = [0.17, 0.43, 0.68, 0.9].map((f, i) => {
    const { p, tan } = at(f * L);
    const side = leftOf(tan).multiplyScalar(i % 2 ? -34 : 30);
    return { x: p.x + side.x, z: p.z + side.z, r: 9 + (i % 3) * 3 };
  });

  const distToRoad = (x, z) => {
    let m = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const dx = samples[i].x - x, dz = samples[i].z - z;
      const d = dx * dx + dz * dz;
      if (d < m) m = d;
    }
    return Math.sqrt(m);
  };
  const heightAt = (x, z, d = distToRoad(x, z)) => {
    const m = smoothstep(ROAD_HALF + 5, 80, d);
    const n = fbm(x * 0.011 + 3.1, z * 0.011 + 7.7);
    const ridge = 1 - Math.abs(vnoise(x * 0.02, z * 0.02) * 2 - 1);
    let h = m * (n * 64 + ridge * 16) - 0.35;
    // river gorge (fades out far from the bridge so it never meets the loop again)
    const ra = riverAlong(x, z), rc = riverAcross(x, z);
    const reach = 1 - smoothstep(110, 150, rc);
    if (reach > 0) h = lerp(h, Math.min(h, -4.2), (1 - smoothstep(8, 18, ra)) * reach);
    for (const pd of ponds) {
      const dd = Math.hypot(x - pd.x, z - pd.z);
      h = lerp(-1.6, h, smoothstep(pd.r * 0.8, pd.r * 2, dd));
    }
    return h;
  };

  // Terrain (flat-shaded, coloured by height + green/barren mask)
  const plane = new THREE.PlaneGeometry(1150, 1150, 170, 170);
  plane.rotateX(-Math.PI / 2);
  const p = plane.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)));
  const terrain = plane.toNonIndexed();
  terrain.computeVertexNormals();
  const tp = terrain.attributes.position;
  const colors = new Float32Array(tp.count * 3);
  const c = new THREE.Color(), g2 = new THREE.Color();
  const C = {
    dust: new THREE.Color("#b9a98f"), scree: new THREE.Color("#998d7e"), rock: new THREE.Color("#7b726a"), dark: new THREE.Color("#5f5853"),
    meadow: new THREE.Color("#86b05e"), forest: new THREE.Color("#4e7b45"), snow: new THREE.Color("#f4f6f8"), bank: new THREE.Color("#8f8a80"),
  };
  for (let i = 0; i < tp.count; i += 3) {
    const x = (tp.getX(i) + tp.getX(i + 1) + tp.getX(i + 2)) / 3, z = (tp.getZ(i) + tp.getZ(i + 1) + tp.getZ(i + 2)) / 3;
    const y = (tp.getY(i) + tp.getY(i + 1) + tp.getY(i + 2)) / 3;
    if (y > 33) c.copy(C.snow);
    else if (y < -0.8) c.copy(C.bank);
    else {
      // barren palette
      if (y < 2) c.copy(C.dust);
      else if (y < 14) c.copy(C.dust).lerp(C.scree, (y - 2) / 12);
      else if (y < 26) c.copy(C.scree).lerp(C.rock, (y - 14) / 12);
      else c.copy(C.rock).lerp(C.dark, (y - 26) / 7);
      // green palette
      if (y < 2) g2.copy(C.meadow);
      else if (y < 20) g2.copy(C.meadow).lerp(C.forest, (y - 2) / 18);
      else g2.copy(C.forest).lerp(C.rock, smoothstep(20, 30, y));
      c.lerp(g2, greenAt(x, z));
      if (y > 29) c.lerp(C.snow, smoothstep(29, 33, y) * 0.8);
    }
    c.multiplyScalar(0.9 + hash(x, z) * 0.16);
    for (let k = 0; k < 3; k++) colors.set([c.r, c.g, c.b], (i + k) * 3);
  }
  terrain.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // Road ribbon, kerbs and centre dashes
  const ribbon = (segs, from, to, y, step = 1, dashLen = 0) => {
    const pos = [], idx = [];
    for (let i = 0; i <= segs; i += step) {
      const ts = dashLen ? [i / segs, (i + dashLen) / segs] : [i / segs];
      for (const t of ts) {
        const pt = curve.getPointAt(t % 1), side = leftOf(curve.getTangentAt(t % 1));
        pos.push(pt.x + side.x * from, y, pt.z + side.z * from, pt.x + side.x * to, y, pt.z + side.z * to);
      }
    }
    const verts = pos.length / 3;
    if (dashLen) for (let a = 0; a < verts; a += 4) idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    else for (let a = 0; a < verts - 2; a += 2) idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };
  const road = ribbon(1200, ROAD_HALF, -ROAD_HALF, 0.03);
  const kerbL = ribbon(1200, ROAD_HALF + 0.35, ROAD_HALF, 0.05, 2, 1);
  const kerbR = ribbon(1200, -ROAD_HALF, -ROAD_HALF - 0.35, 0.05, 2, 1);
  const dashes = ribbon(1200, 0.12, -0.12, 0.06, 6, 2.6);

  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  // Pines only in the green valleys
  const trees = [];
  for (let tries = 0; trees.length < 700 && tries < 20000; tries++) {
    const x = (rnd() - 0.5) * 840, z = (rnd() - 0.5) * 840;
    if (greenAt(x, z) < 0.55) continue;
    const d = distToRoad(x, z);
    if (d < ROAD_HALF + 6 || d > 160) continue;
    const y = heightAt(x, z, d);
    if (y > 24 || y < -0.5) continue;
    trees.push({ x, y, z, s: 0.7 + rnd() * 1.0 });
  }

  // Boulders on the barren slopes
  const rocks = [];
  for (let tries = 0; rocks.length < 320 && tries < 20000; tries++) {
    const x = (rnd() - 0.5) * 700, z = (rnd() - 0.5) * 700;
    const d = distToRoad(x, z);
    if (d < ROAD_HALF + 2.5 || d > 120 || greenAt(x, z) > 0.6) continue;
    const y = heightAt(x, z, d);
    if (y < -0.5) continue;
    rocks.push({ x, y, z, s: 0.3 + rnd() * rnd() * 2.6, r: rnd() * 6 });
  }

  // Big Himalayan peaks
  const peaks = [];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + rnd() * 0.2;
    const r = 470 + rnd() * 90;
    peaks.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, h: 160 + rnd() * 150, rad: 75 + rnd() * 55, rot: rnd() * Math.PI });
  }

  // Puffy clouds
  const clouds = Array.from({ length: 16 }, () => {
    const a = rnd() * Math.PI * 2, r = 220 + rnd() * 380;
    return {
      x: Math.cos(a) * r, y: 150 + rnd() * 90, z: Math.sin(a) * r,
      puffs: Array.from({ length: 4 + Math.floor(rnd() * 4) }, (_, k) => ({ x: (k - 2) * 14 + rnd() * 8, y: rnd() * 6, z: rnd() * 10, r: 9 + rnd() * 10 })),
    };
  });

  // Skill coins in weaving lines between checkpoints
  const coins = [];
  skillNames.forEach((name, k) => {
    const seg = k % projectCount;
    const a = checkpoints[seg].s;
    const slot = Math.floor(k / projectCount);
    const s = a + 30 + slot * 18;
    if (s > a + gapAfter(seg) - 20) return;
    if (Math.abs(((s - bridgeS + L * 1.5) % L) - L * 0.5) < 22) return; // keep the bridge clear
    coins.push({ name, s: s % L, lat: Math.sin(k * 1.3) * 2.3 });
  });

  // Jump ramps
  const ramps = checkpoints.map((cp, i) => ({ s: (cp.s + gapAfter(i) * 0.6) % L, len: 7, half: ROAD_HALF, h: 1.2 }));

  // Bridge + prayer flags
  const bridge = { s: bridgeS, len: 34 };
  const flags = [];
  for (let s = bridgeS - 32; s <= bridgeS + 32; s += 6.5) for (const side of [1, -1]) flags.push({ s, lat: side * (ROAD_HALF + 1.1) });

  return { curve, L, terrain, road, kerbL, kerbR, dashes, trees, rocks, peaks, clouds, ponds, checkpoints, coins, ramps, bridge, flags, startS: checkpoints[0].s - 55 };
}

// Road-space -> world position (+ tangent)
export function roadPose(world, s, lat, outPos, outTan) {
  const t = (((s % world.L) + world.L) % world.L) / world.L;
  world.curve.getPointAt(t, outPos);
  world.curve.getTangentAt(t, outTan);
  outPos.x += outTan.z * lat;
  outPos.z += -outTan.x * lat;
  return outPos;
}

// Signed shortest distance along the loop
export const ds = (a, b, L) => ((((a - b) % L) + L * 1.5) % L) - L * 0.5;
