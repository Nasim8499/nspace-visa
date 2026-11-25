"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Plane } from "./Plane";
import { clamp01, damp, smoothstep, smootherstep, TAKEOFF_SPEED, LANDING_SPEED } from "./motion";

type Mode = "takeoff" | "landing";

function Runway({ mode }: { mode: Mode }) {
  const dashes = useMemo(() => Array.from({ length: 17 }, (_, i) => -120 + i * 15), []);
  const lights = useMemo(() => Array.from({ length: 22 }, (_, i) => -130 + i * 12.5), []);
  return (
    <group>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial color="#c6d3e6" roughness={0.96} />
      </mesh>
      {/* runway slab */}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[26, 0.16, 300]} />
        <meshStandardMaterial color="#b9c4d6" roughness={0.92} />
      </mesh>
      {/* shoulders */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 15.5, 0.05, 0]} receiveShadow>
          <boxGeometry args={[4, 0.1, 300]} />
          <meshStandardMaterial color="#b9c6da" roughness={0.95} />
        </mesh>
      ))}
      {/* centre line */}
      {dashes.map((z, i) => (
        <mesh key={i} position={[0, 0.17, z]}>
          <boxGeometry args={[0.9, 0.02, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
      ))}
      {/* edge lights */}
      {lights.map((z, i) =>
        [1, -1].map((s) => (
          <mesh key={`${i}-${s}`} position={[s * 12.2, 0.4, z]}>
            <sphereGeometry args={[0.22, 8, 8]} />
            <meshStandardMaterial color={s > 0 ? "#ffd98a" : "#bfd4ff"} emissive={s > 0 ? "#ffb020" : "#2f5bff"} emissiveIntensity={1.6} />
          </mesh>
        )),
      )}
      {/* threshold bars */}
      {Array.from({ length: 7 }).map((_, i) =>
        [1, -1].map((s) => (
          <mesh key={`t-${i}-${s}`} position={[s * (2.2 + i * 1.5), 0.17, mode === "takeoff" ? -136 : 136]}>
            <boxGeometry args={[0.8, 0.02, 8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.6} />
          </mesh>
        )),
      )}
      {/* terminal */}
      <group position={[-46, 0, -40]}>
        <mesh position={[0, 7, 0]} castShadow receiveShadow>
          <boxGeometry args={[26, 14, 62]} />
          <meshStandardMaterial color="#eef3fb" roughness={0.65} />
        </mesh>
        <mesh position={[13.2, 6, 0]}>
          <boxGeometry args={[0.6, 9, 56]} />
          <meshStandardMaterial color="#8fb6f0" roughness={0.15} metalness={0.5} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 15.4, 0]} castShadow>
          <boxGeometry args={[28, 1.4, 64]} />
          <meshStandardMaterial color="#f4f7fd" roughness={0.5} />
        </mesh>
      </group>
      {/* tower */}
      <group position={[-34, 0, 54]}>
        <mesh position={[0, 11, 0]} castShadow>
          <cylinderGeometry args={[1.5, 2, 22, 16]} />
          <meshStandardMaterial color="#f4f7fd" roughness={0.5} />
        </mesh>
        <mesh position={[0, 23.5, 0]} castShadow>
          <cylinderGeometry args={[4.4, 3.6, 3.4, 16]} />
          <meshStandardMaterial color="#dfe7f5" roughness={0.2} metalness={0.4} transparent opacity={0.85} />
        </mesh>
      </group>
    </group>
  );
}

function Driver({ mode, duration }: { mode: Mode; duration: number }) {
  const plane = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const gear = useRef(0);
  const { camera, size } = useThree();
  const narrow = size.width < size.height;

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = narrow ? 48 : 33;
    cam.updateProjectionMatrix();
  }, [narrow, camera]);
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const start = useRef(0);

  const camPos = useRef(new THREE.Vector3());
  const camLook = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    if (!plane.current) return;
    if (!start.current) start.current = state.clock.elapsedTime;
    const t = Math.min(1, ((state.clock.elapsedTime - start.current) * 1000) / duration);
    const p = plane.current;

    if (mode === "takeoff") {
      /* distance comes from an integrated speed profile, so the aircraft
         accelerates through rotation instead of stalling at each keyframe */
      const travel = (TAKEOFF_SPEED.at(t) / TAKEOFF_SPEED.total) * 172;
      const z = -78 + travel;
      const rotate = smoothstep(0.6, 0.68, t);
      const climb = smootherstep(clamp01((t - 0.64) / 0.36));
      const rumble = t < 0.66 ? 0.022 * Math.sin(t * 150) * clamp01(t * 4) : 0;
      const y = climb * 84 + rumble;
      const pitch = 0.012 + rotate * 0.19 - climb * 0.07;
      const roll = -0.05 * smootherstep(clamp01((t - 0.72) / 0.28));
      gear.current = clamp01((t - 0.74) / 0.12);

      p.position.set(0, y, z);
      p.rotation.set(pitch, Math.PI, roll);

      if (shadow.current) {
        shadow.current.position.set(0, 0.19, z + 1);
        const k = Math.max(0.22, 1 - y / 60);
        shadow.current.scale.set(1 + y / 90, 1, 1 + y / 90);
        (shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.22 * k;
      }

      const camK = smootherstep(clamp01(t / 0.8));
      const wide = narrow ? 1.55 : 1;
      camPos.current.set((28 - 15 * camK) * (narrow ? 0.72 : 1), 7.5 + 9 * camK + y * 0.8, z + 24 * wide - 5 * camK);
      camera.position.lerp(camPos.current, damp(dt, 3.4));
      camLook.current.set(0, y * 0.95 + 1, z - 4);
      look.current.lerp(camLook.current, damp(dt, 4));
      camera.lookAt(look.current);
    } else {
      /* landing: constant sink, then a flare that bleeds the sink rate to zero
         exactly at touchdown, then braking */
      const travel = (LANDING_SPEED.at(t) / LANDING_SPEED.total) * 212;
      const z = -150 + travel;
      const descend = t < 0.55 ? (t / 0.55) * 0.86 : 0.86 + 0.14 * smootherstep((t - 0.55) / 0.15);
      const y = 80 * (1 - descend);
      const pitch =
        t < 0.6
          ? THREE.MathUtils.lerp(-0.1, 0.055, smootherstep(t / 0.6))
          : t < 0.72
            ? THREE.MathUtils.lerp(0.055, 0.012, smoothstep(0.6, 0.72, t))
            : 0.012;
      gear.current = 0;

      p.position.set(0, y, z);
      p.rotation.set(pitch, Math.PI, 0);

      if (shadow.current) {
        shadow.current.position.set(0, 0.19, z + 1);
        const k = Math.max(0.22, 1 - y / 60);
        shadow.current.scale.set(1 + y / 90, 1, 1 + y / 90);
        (shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.22 * k;
      }

      const camK = smootherstep(clamp01(t / 0.85));
      camPos.current.set(
        (narrow ? 15 : 25) - 8 * camK,
        6 + y * 0.9 + 2 * camK,
        z + (narrow ? 40 : 26) - 6 * camK,
      );
      camera.position.lerp(camPos.current, damp(dt, 3));
      camLook.current.set(0, Math.max(1.5, y * 0.95), z - 3);
      look.current.lerp(camLook.current, damp(dt, 4));
      camera.lookAt(look.current);
    }
  });

  return (
    <>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.19, mode === "takeoff" ? -78 : -150]}>
        <circleGeometry args={[9, 32]} />
        <meshBasicMaterial color="#2b3a55" transparent opacity={0.2} />
      </mesh>
      <group ref={plane} position={[0, 0, mode === "takeoff" ? -78 : -150]}>
        <Plane gear={gear} />
      </group>
    </>
  );
}

export default function AirportScene({ mode = "takeoff", duration = 5600 }: { mode?: Mode; duration?: number }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.7]}
      camera={{ fov: 33, position: [28, 7.5, -54], near: 1, far: 900 }}
      gl={{ antialias: true }}
      onCreated={({ scene, gl }) => {
        scene.background = new THREE.Color("#cfdff7");
        scene.fog = new THREE.Fog("#cfdff7", 320, 760);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.02;
      }}
    >
      <hemisphereLight args={["#ffffff", "#c9d5e8", 0.8]} />
      <directionalLight
        position={[60, 90, 40]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-140}
        shadow-camera-right={140}
        shadow-camera-top={140}
        shadow-camera-bottom={-140}
        shadow-camera-far={400}
      />
      <directionalLight position={[-80, 40, -60]} intensity={0.3} color="#cfe0ff" />
      <ambientLight intensity={0.25} />
      <Runway mode={mode} />
      <Driver mode={mode} duration={duration} />
    </Canvas>
  );
}
