"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  /** 0 = gear down, 1 = fully retracted */
  gear?: MutableRefObject<number>;
  accent?: string;
};

/**
 * Procedural airliner. Nose points toward -Z (three's lookAt convention).
 * Roughly 38 units long, 34 unit wingspan.
 */
export function Plane({ gear, accent = "#2f5bff" }: Props) {
  const gearGroup = useRef<THREE.Group>(null);

  const mats = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.34, metalness: 0.16 }),
      accent: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.4, metalness: 0.2 }),
      dark: new THREE.MeshStandardMaterial({ color: "#121826", roughness: 0.55, metalness: 0.35 }),
      glass: new THREE.MeshStandardMaterial({ color: "#0f1b33", roughness: 0.15, metalness: 0.6 }),
      tire: new THREE.MeshStandardMaterial({ color: "#1b1f27", roughness: 0.85 }),
      metal: new THREE.MeshStandardMaterial({ color: "#c9d0da", roughness: 0.35, metalness: 0.8 }),
      stripe: new THREE.MeshStandardMaterial({ color: "#ffcf3f", roughness: 0.4 }),
    }),
    [accent],
  );

  const windows = useMemo(() => {
    const arr: { x: number; y: number; z: number }[] = [];
    for (let z = -11.5; z <= 12; z += 1.5) {
      const y = 0.62;
      const x = Math.sqrt(Math.max(0, 1.7 * 1.7 - y * y)) + 0.02;
      arr.push({ x, y, z }, { x: -x, y, z });
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (!gearGroup.current || !gear) return;
    const target = gear.current;
    const g = gearGroup.current;
    g.position.y = THREE.MathUtils.lerp(g.position.y, -2.35 + target * 1.85, Math.min(1, dt * 6));
    g.scale.z = THREE.MathUtils.lerp(g.scale.z, 1 - target * 0.55, Math.min(1, dt * 5));
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, target * -1.15, Math.min(1, dt * 5));
    g.visible = target < 0.98;
  });

  return (
    <group>
      {/* fuselage */}
      <mesh material={mats.body} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1.7, 1.7, 30, 40, 1]} />
      </mesh>
      {/* nose */}
      <mesh material={mats.body} position={[0, 0, -17.4]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[1.7, 5.4, 40]} />
      </mesh>
      {/* cockpit glass */}
      <mesh material={mats.glass} position={[0, 0.55, -16.1]} rotation={[-Math.PI / 2.35, 0, 0]}>
        <sphereGeometry args={[1.05, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* tail cone */}
      <mesh material={mats.body} position={[0, 0.35, 17.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[1.68, 5.2, 32]} />
      </mesh>

      {/* brand stripe */}
      <mesh material={mats.stripe} position={[0, -0.45, 0]}>
        <boxGeometry args={[3.46, 0.22, 27]} />
      </mesh>

      {/* wings */}
      {[1, -1].map((s) => (
        <group key={s} rotation={[0, 0, s * 0.06]}>
          <mesh material={mats.body} position={[s * 8.6, -0.75, 0.6]} rotation={[0, s * 0.16, 0]} castShadow>
            <boxGeometry args={[15.2, 0.42, 5.6]} />
          </mesh>
          <mesh material={mats.body} position={[s * 16.1, 0.32, 1.4]} rotation={[0, s * 0.16, s * 0.5]}>
            <boxGeometry args={[1.5, 0.3, 2.2]} />
          </mesh>
          {/* engine */}
          <group position={[s * 7.6, -1.75, -0.4]}>
            <mesh material={mats.accent} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[1.15, 1.0, 4.4, 24]} />
            </mesh>
            <mesh material={mats.dark} position={[0, 0, -2.2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.0, 1.0, 0.25, 24]} />
            </mesh>
            <mesh material={mats.metal} position={[0, -1.1, 0.4]}>
              <boxGeometry args={[0.7, 0.9, 2.2]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* tail fin */}
      <mesh material={mats.accent} position={[0, 3.1, 14.6]} rotation={[-0.28, 0, 0]} castShadow>
        <boxGeometry args={[0.42, 5.6, 4.4]} />
      </mesh>
      <mesh material={mats.stripe} position={[0, 2.2, 14.3]} rotation={[-0.28, 0, 0]}>
        <boxGeometry args={[0.46, 0.5, 4.0]} />
      </mesh>
      {/* stabilisers */}
      <mesh material={mats.body} position={[0, 0.55, 16.4]} castShadow>
        <boxGeometry args={[12.5, 0.3, 3.1]} />
      </mesh>

      {/* cabin windows */}
      {windows.map((w, i) => (
        <mesh key={i} material={mats.glass} position={[w.x, w.y, w.z]}>
          <boxGeometry args={[0.1, 0.3, 0.42]} />
        </mesh>
      ))}

      {/* landing gear */}
      <group ref={gearGroup} position={[0, -2.35, 0]}>
        {[
          [0, -0.4, -13.6],
          [2.2, -0.2, 2.2],
          [-2.2, -0.2, 2.2],
        ].map(([x, , z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh material={mats.metal} position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 1.5, 12]} />
            </mesh>
            <mesh material={mats.tire} position={[0, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.55, 0.24, 12, 24]} />
            </mesh>
            <mesh material={mats.metal} position={[0, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.26, 0.26, 0.3, 12]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
