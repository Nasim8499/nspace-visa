"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-110m.json";
import { Plane } from "./Plane";

const R = 10;
const toVec = (lon: number, lat: number, alt = 0) => {
  const φ = (lat * Math.PI) / 180;
  const λ = (lon * Math.PI) / 180;
  const r = R + alt;
  return new THREE.Vector3(r * Math.cos(φ) * Math.cos(λ), r * Math.sin(φ), r * Math.cos(φ) * Math.sin(λ));
};

type Topo = { objects: { countries: unknown } };

function Globe({
  from,
  to,
  duration,
}: {
  from: [number, number];
  to: [number, number];
  duration: number;
}) {
  const { camera, size } = useThree();
  const narrow = size.width < size.height;

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = narrow ? 46 : 32;
    cam.updateProjectionMatrix();
  }, [narrow, camera]);
  const plane = useRef<THREE.Group>(null);
  const pin = useRef<THREE.Mesh>(null);
  const start = useRef(0);
  const camLook = useRef(new THREE.Vector3(0, 0, 0));

  /* country borders on the sphere */
  const borders = useMemo(() => {
    const topo = worldTopo as unknown as Topo;
    const m = mesh(
      topo as never,
      topo.objects.countries as never,
      ((a: { id?: string }, b: { id?: string }) => a !== b) as never,
    );
    const pos: number[] = [];
    for (const line of (m as unknown as { coordinates: [number, number][][] }).coordinates) {
      for (let i = 0; i < line.length - 1; i++) {
        const a = toVec(line[i][0], line[i][1], 0.02);
        const b = toVec(line[i + 1][0], line[i + 1][1], 0.02);
        pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  /* land silhouette, slightly darker for a real map feel */
  const landDots = useMemo(() => {
    const topo = worldTopo as unknown as Topo;
    const land = feature(topo as never, topo.objects.countries as never) as unknown as {
      features: { geometry: { type: string; coordinates: unknown } }[];
    };
    const pts: number[] = [];
    const pushRing = (ring: number[][]) => {
      let last: THREE.Vector3 | null = null;
      for (const c of ring) {
        const v = toVec(c[0], c[1], 0.015);
        if (last && last.distanceTo(v) < 0.22) continue;
        pts.push(v.x, v.y, v.z);
        last = v;
      }
    };
    for (const f of land.features) {
      const g = f.geometry;
      if (!g) continue;
      if (g.type === "Polygon") (g.coordinates as number[][][]).forEach(pushRing);
      else if (g.type === "MultiPolygon") (g.coordinates as number[][][][]).forEach((poly) => poly.forEach(pushRing));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, []);

  /* great-circle arc */
  const { curve, samples } = useMemo(() => {
    const a = new THREE.Vector3(...toVec(from[0], from[1]).toArray());
    const b = new THREE.Vector3(...toVec(to[0], to[1]).toArray());
    const angle = a.angleTo(b);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const v = new THREE.Vector3().copy(a).lerp(b, t);
      const s = Math.sin(Math.PI * t);
      v.setLength(R + 0.35 + s * (1.1 + angle * 1.4));
      pts.push(v);
    }
    return { curve: new THREE.CatmullRomCurve3(pts), samples: pts };
  }, [from, to]);

  const routeLine = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(samples);
    const l = new THREE.Line(
      g,
      new THREE.LineDashedMaterial({ color: "#8aa6d6", dashSize: 0.35, gapSize: 0.28, transparent: true, opacity: 0.9 }),
    );
    l.computeLineDistances();
    return l;
  }, [samples]);


  /* one tube built once; the flown part is revealed with drawRange instead of
     rebuilding geometry every 100ms (that rebuild was the main stutter source) */
  const traveledMesh = useMemo(() => {
    const g = new THREE.TubeGeometry(curve, 260, 0.055, 8, false);
    g.setDrawRange(0, 0);
    return new THREE.Mesh(
      g,
      new THREE.MeshStandardMaterial({ color: "#2f5bff", roughness: 0.4, emissive: "#2f5bff", emissiveIntensity: 0.35 }),
    );
  }, [curve]);
  const tubeIndices = useMemo(() => traveledMesh.geometry.getIndex()?.count ?? 0, [traveledMesh]);

  const scratchA = useRef(new THREE.Vector3());
  const scratchB = useRef(new THREE.Vector3());
  const scratchC = useRef(new THREE.Vector3());

  const destVec = useMemo(() => toVec(to[0], to[1], 0.05), [to]);
  const destQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), destVec.clone().normalize());
    return q;
  }, [destVec]);

  useFrame((state, dt) => {
    if (!plane.current) return;
    if (!start.current) start.current = state.clock.elapsedTime;
    const t = Math.min(1, ((state.clock.elapsedTime - start.current) * 1000) / duration);
    const fly = Math.min(1, Math.max(0, (t - 0.06) / 0.82));
    const e = fly < 0.5 ? 2 * fly * fly : 1 - Math.pow(-2 * fly + 2, 2) / 2;

    const p = curve.getPointAt(e, scratchA.current);
    const ahead = curve.getPointAt(Math.min(1, e + 0.008), scratchB.current);
    plane.current.position.copy(p);
    plane.current.lookAt(ahead);
    plane.current.rotateZ(-0.35 * Math.sin(Math.PI * e));
    plane.current.scale.setScalar(0.11);

    traveledMesh.geometry.setDrawRange(0, Math.floor(tubeIndices * e));

    if (pin.current) {
      const k = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.06;
      pin.current.scale.setScalar(k * (0.8 + 0.5 * Math.max(0, e - 0.5)));
      const m = pin.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.35 + 0.5 * Math.max(0, e - 0.4);
    }

    /* camera: follow the plane, easing out to reveal the whole route */
    const dist = (31 - 4 * e + 12 * Math.sin(Math.PI * Math.min(1, t * 1.05))) * (narrow ? 1.5 : 1);
    scratchC.current.copy(p).normalize().multiplyScalar(dist);
    const k = Math.min(1, dt * 2.4);
    camera.position.lerp(scratchC.current, k);
    camLook.current.multiplyScalar(1 - k);
    camera.lookAt(camLook.current);
  });

  return (
    <>
      <hemisphereLight args={["#ffffff", "#dbe4f3", 1.35]} />
      <directionalLight position={[18, 14, 12]} intensity={1.5} />
      <directionalLight position={[-16, -8, -12]} intensity={0.35} color="#b9ccf2" />

      {/* globe */}
      <mesh>
        <sphereGeometry args={[R, 56, 42]} />
        <meshStandardMaterial color="#eef4fe" roughness={0.95} metalness={0} />
      </mesh>
      {/* atmosphere */}
      <mesh scale={1.035}>
        <sphereGeometry args={[R, 48, 36]} />
        <meshBasicMaterial color="#c9dbff" transparent opacity={0.22} side={THREE.BackSide} />
      </mesh>

      <points geometry={landDots}>
        <pointsMaterial color="#a6bad6" size={0.06} sizeAttenuation transparent opacity={0.9} />
      </points>
      <lineSegments geometry={borders}>
        <lineBasicMaterial color="#1f2d45" transparent opacity={0.55} />
      </lineSegments>

      <primitive object={routeLine} />
      <primitive object={traveledMesh} />

      <mesh ref={pin} position={destVec} quaternion={destQuat}>
        <ringGeometry args={[0.18, 0.34, 32]} />
        <meshBasicMaterial color="#2f5bff" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      <group ref={plane}>
        <Plane />
      </group>
    </>
  );
}

export default function GlobeScene({
  from,
  to,
  duration = 7200,
}: {
  from: [number, number];
  to: [number, number];
  duration?: number;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ fov: 32, position: [0, 6, 26], near: 0.5, far: 400 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Globe from={from} to={to} duration={duration} />
    </Canvas>
  );
}
